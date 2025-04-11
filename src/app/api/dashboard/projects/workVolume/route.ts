import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, Role } from "@prisma/client";
const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");
    // Получаем всех работников из базы данных
    if (!projectId){
      return NextResponse.json(
        { error: "Требуется id проекта" },
        { status: 400 }
      );
    }
    const workVolume = []
    const slabs = await prisma.slabElement.findMany({
      where: {
        projectId: projectId
      },
    });

    return NextResponse.json(slabs);
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}

