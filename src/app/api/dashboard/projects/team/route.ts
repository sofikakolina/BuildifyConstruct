import { NextResponse } from "next/server";
import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Получаем все проекты из базы данных
    const team = await prisma.user.findMany({
      where: {
        role: {
          notIn: [Role.Client, Role.Admin]
        }
      },
    });

    return NextResponse.json(team);
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}

// export async function POST(request: Request) {
//   try {
//     const { name, description, adminId } = await request.json();

//     // Проверяем, что пользователь с adminId существует и имеет роль "Admin"
//     const adminUser = await prisma.user.findFirst({
//       where: {
//         role: "Admin", // Проверяем, что роль пользователя — "Admin"
//       },
//     });
//     console.log(adminUser)
//     if (!adminUser) {
//       return NextResponse.json(
//         { error: "User with the provided ID is not an admin" },
//         { status: 400 }
//       );
//     }

//     // Создаем проект в базе данных
//     const project = await prisma.project.create({
//       data: {
//         name,
//         description,
//         adminId,
//       },
//     });

//     return NextResponse.json(project, { status: 201 });
//   } catch (error) {
//     console.error("Error creating project:", error);
//     return NextResponse.json(
//       { error: "Failed to create project" },
//       { status: 500 }
//     );
//   }
// }