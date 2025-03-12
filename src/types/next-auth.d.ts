import "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    role?: string;
  }

  interface Session {
    user: {
      id: string;
      email?: string;
      firstName?: string;
      lastName?: string;
      role?: string;
    };
  }

  interface JWT {
    id: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    role?: string;
  }
}