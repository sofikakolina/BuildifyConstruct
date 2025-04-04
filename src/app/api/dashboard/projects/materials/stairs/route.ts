import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request:NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");

    const stairs = await prisma.stair.findFirstOrThrow({
      where: {
        projectId:projectId
      },
      include:{
        stairs: true
      }
    });
  
    return NextResponse.json({
      success: true,
      stairs,
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