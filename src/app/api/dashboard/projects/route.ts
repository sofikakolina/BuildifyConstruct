import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId");
  try {
    if (projectId){
      const project = await prisma.project.findUnique({
        where:{
          id: projectId
        },
        select: {
          id: true,
          name: true,
          description: true,
          adminId: true,
          createdAt: true,
          ifc: true,
        },
      });
  
      return NextResponse.json(project);
    }
    // Получаем все проекты из базы данных
    const projects = await prisma.project.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        adminId: true,
        createdAt: true,
        ifc: true,
      },
    });

    return NextResponse.json(projects);
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
    const { name, description, adminId } = await request.json();

    // Проверяем, что пользователь с adminId существует и имеет роль "Admin"
    const adminUser = await prisma.user.findFirst({
      where: {
        role: "Admin", // Проверяем, что роль пользователя — "Admin"
      },
    });
    if (!adminUser) {
      return NextResponse.json(
        { error: "User with the provided ID is not an admin" },
        { status: 400 }
      );
    }

    // Создаем проект в базе данных
    const project = await prisma.project.create({
      data: {
        name,
        description,
        adminId,
      },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}