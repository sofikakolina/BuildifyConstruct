import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");
    const taskId = searchParams.get("taskId");
    
    if (!projectId || !taskId){
      return NextResponse.json(
        { error: "Требуется id проекта или id задачи" },
        { status: 400 }
      )
    }
    if (taskId){
      const documents = await prisma.document.findMany({
        where: {
          taskId: taskId 
        },
      });
      return NextResponse.json({documents});
    }

    const documents = await prisma.document.findMany({
      where: {
        projectId: projectId 
      },
    });
    return NextResponse.json({documents});
    // Получаем все проекты из базы данных
    

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
    const taskId = formData.get("taskId") as string;
    const name = formData.get("name") as string;
    const title = formData.get("title") as string;
    console.log(name, title, projectId)
    if (!file || !projectId || !name) {
      return NextResponse.json(
        { error: "File and projectId are required" },
        { status: 400 }
      );
    }

    // Check if an IFC file already exists for this project
    // const existingIFC = await prisma.document.findMany({
    //   where: {
    //     projectId: projectId,
    //   },
    // });

    // if (existingIFC) {
    //   // Option 1: Delete the existing file and replace it
    //   const uploadDir = path.join(process.cwd(), "public/uploads");
    //   const existingFilePath = path.join(uploadDir, existingIFC.name);

    //   // Delete the existing file from the server
    //   if (fs.existsSync(existingFilePath)) {
    //     fs.unlinkSync(existingFilePath);
    //   }

    //   // Delete the existing record from the database
    //   await prisma.iFC.delete({
    //     where: {
    //       id: existingIFC.id,
    //     },
    //   });

      // Option 2: Reject the upload and notify the user
      // return NextResponse.json(
      //   { error: "An IFC file already exists for this project" },
      //   { status: 400 }
      // );
    // }

    // Save the new file to the server
    const uploadDir = path.join(process.cwd(), "public/uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, file.name);
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(filePath, buffer);

    // Save the new file metadata to the database
    const document = await prisma.document.create({
      data: {
        name: name,
        title: title, // You can customize this
        path: `/uploads/${file.name}`,
        projectId: projectId,
        taskId: taskId,
      },
    });

    return NextResponse.json({ document }, { status: 200 });
  } catch (error) {
    console.error("Error uploading document file:", error);
    return NextResponse.json(
      { error: "Failed to upload document file" },
      { status: 500 }
    );
  }
}