import { NextResponse } from "next/server";
import { PrismaClient, Role } from "@prisma/client";
const prisma = new PrismaClient();

export async function GET() {
  try {
    // Получаем все проекты из базы данных
    const team = await prisma.user.findMany({
      where: {
        role: {
          in: [Role.Client]
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



export async function POST(request: Request) {
  try {
    const { idCurrentProject } = await request.json();
    console.log(idCurrentProject)
    // Проверяем, что пользователь с adminId существует и имеет роль "Admin"
    const adminUser = await prisma.user.findFirst({
      where: {
        role: "Admin", // Проверяем, что роль пользователя — "Admin"
      },
    });
    console.log(adminUser)
    if (!adminUser) {
      return NextResponse.json(
        { error: "User with the provided ID is not an admin" },
        { status: 400 }
      );
    }

    // Создаем проект в базе данных
    const clients = await prisma.user.findMany({
      where: {
        project: {
          some: {
            id: idCurrentProject, // Ищем пользователей, у которых есть проект с указанным id
          },
        },
        role: Role.Client, // Фильтруем только клиентов
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
      },
    });

    return NextResponse.json(clients, { status: 201 });
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}