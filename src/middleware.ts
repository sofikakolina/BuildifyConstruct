import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Role } from '@prisma/client';

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const currentPath = request.nextUrl.pathname;
  const session = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  if (!token || !session?.role) {
    console.log("No token, redirecting to /auth/signin"); // Логируем редирект
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }
  

  switch (session?.role) {
    case Role.Admin:
        if (!currentPath.startsWith("/dashboard")) {
            return NextResponse.redirect(new URL("/dashboard", request.url));
        }
        break;
    case Role.Client:
        if (!currentPath.startsWith("/client")) {
            return NextResponse.redirect(new URL("/client", request.url));
        }
        break;
    case Role.Executer:
        if (!currentPath.startsWith("/worker")) {
            return NextResponse.redirect(new URL("/worker", request.url));
        }
        break;
    
    default:
        if (!currentPath.startsWith("/auth/signin")) {
            return NextResponse.redirect(new URL("/auth/signin", request.url));
        }
}


  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/client/:path*", "/worker/:path*", "/"], // Защищенные маршруты
};
