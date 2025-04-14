import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");
    
    if (!projectId) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      );
    }

    const gasn = await prisma.gasn.findMany({
    //   where: { projectId }
    });

    return NextResponse.json({ gasn });
  } catch (error) {
    console.error("Error fetching GASN:", error);
    return NextResponse.json(
      { error: "Failed to fetch GASN" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, ...gasnData } = body;

    if (!projectId) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      );
    }

    const gasn = await prisma.gasn.create({
      data: {
        ...gasnData,
        projectId
      }
    });

    return NextResponse.json({ gasn });
  } catch (error) {
    console.error("Error creating GASN:", error);
    return NextResponse.json(
      { error: "Failed to create GASN" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const gasnId = searchParams.get("gasnId");
    
    if (!gasnId) {
      return NextResponse.json(
        { error: "GASN ID is required" },
        { status: 400 }
      );
    }

    await prisma.gasn.delete({
      where: { id: gasnId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting GASN:", error);
    return NextResponse.json(
      { error: "Failed to delete GASN" },
      { status: 500 }
    );
  }
}