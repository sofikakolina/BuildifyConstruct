import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request:NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");

    const doors = await prisma.door.findFirstOrThrow({
      where: {
        projectId:projectId
      },
      include:{
        doors: true
      }
    });
  
    return NextResponse.json({
      success: true,
      doors,
    });

  } catch (error) {
    console.error("Error processing slabs:", error);
    return NextResponse.json(
      { 
        error: "Failed to process slabs",
        details: error,
        suggestion: "Check file paths and Python environment"
      },
      { status: 500 }
    );
  }
}