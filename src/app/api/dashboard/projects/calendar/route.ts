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
        { error: "Failed требуется id проекта или задачи" },
        { status: 400 }
      );
    }
    
    const calendar = await prisma.calendar.findUnique({
      where: {
        projectId: projectId 
      },
    });
    return NextResponse.json({calendar});
    

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
    const name = formData.get("name") as string;
    // const title = formData.get("title") as string;
    if (!file || !projectId || !name) {
      return NextResponse.json(
        { error: "File and projectId are required" },
        { status: 400 }
      );
    }
    // Save the new file to the server
    const uploadDir = path.join(process.cwd(), "public/uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, file.name);
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(filePath, buffer);
    await prisma.calendar.deleteMany({
      where:{
        projectId:projectId
      }
    })
    const calendar = await prisma.calendar.create({
      data: {
        name: name,
        path: `/uploads/${file.name}`,
        projectId: projectId,
      },
    });

    return NextResponse.json({ calendar }, { status: 200 });
  } catch (error) {
    console.error("Error uploading calendar file:", error);
    return NextResponse.json(
      { error: "Failed to upload calendar file" },
      { status: 500 }
    );
  }
}


export async function DELETE(request: Request) {
    // const session = await getServerSession(authOptions);
    try {
        // if (!session || session?.user.role != "Admin"){
        //     return NextResponse.json("У вас нет доступа!", { status: 403 });
        // }
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("projectId");

                
        if (!id) {
            return NextResponse.json(
                { error: 'ID документа обязателен' },
                { status: 400 }
            );
        }
        
        // Находим пользователя и проект
        const calendar = await prisma.calendar.findUnique({
            where: { projectId: id },
        });
  
        // Проверяем, что пользователь и проект существуют
        if (!calendar) {
            return NextResponse.json(
                { error: 'Документ не найден' },
                { status: 404 }
            );
        }
        
        // Обновляем проект, добавляя пользователя
        const updatedProject = await prisma.calendar.delete({
            where: { projectId: id },
        });
        
        // Возвращаем обновлённый проект
        return NextResponse.json(updatedProject, { status: 200 });
    } catch (error) {
        console.error('Ошибка при добавлении пользователя в проект:', error);
        return NextResponse.json(
            { error: 'Ошибка сервера' },
            { status: 500 }
        );
    }
} 