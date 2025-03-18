import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");
    
    if (!projectId){
      return NextResponse.json(
        { error: "Требуется id проекта" },
        { status: 400 }
      )
    }
    // Получаем все проекты из базы данных
    const ifc = await prisma.iFC.findUnique({
      where: {
        projectId: projectId 
      },
    });

    return NextResponse.json({ifc});
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
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const projectId = formData.get("projectId") as string;

    if (!file || !projectId) {
      return NextResponse.json(
        { error: "File and projectId are required" },
        { status: 400 }
      );
    }

    // Check if an IFC file already exists for this project
    const existingIFC = await prisma.iFC.findUnique({
      where: {
        projectId: projectId,
      },
    });

    if (existingIFC) {
      // Option 1: Delete the existing file and replace it
      const uploadDir = path.join(process.cwd(), "public/uploads");
      const existingFilePath = path.join(uploadDir, existingIFC.name);

      // Delete the existing file from the server
      if (fs.existsSync(existingFilePath)) {
        fs.unlinkSync(existingFilePath);
      }

      // Delete the existing record from the database
      await prisma.iFC.delete({
        where: {
          id: existingIFC.id,
        },
      });

      // Option 2: Reject the upload and notify the user
      // return NextResponse.json(
      //   { error: "An IFC file already exists for this project" },
      //   { status: 400 }
      // );
    }

    // Save the new file to the server
    const uploadDir = path.join(process.cwd(), "public/uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, file.name);
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(filePath, buffer);

    // Save the new file metadata to the database
    const ifc = await prisma.iFC.create({
      data: {
        name: file.name,
        title: file.name, // You can customize this
        path: `/uploads/${file.name}`,
        projectId: projectId,
      },
    });

    return NextResponse.json({ ifc }, { status: 200 });
  } catch (error) {
    console.error("Error uploading IFC file:", error);
    return NextResponse.json(
      { error: "Failed to upload IFC file" },
      { status: 500 }
    );
  }
}