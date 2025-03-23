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
      const paymentDocuments = await prisma.paymentDocument.findMany({
        where: {
          taskId: taskId 
        },
      });
      return NextResponse.json({paymentDocuments});
    }

    const paymentDocuments = await prisma.paymentDocument.findMany({
      where: {
        projectId: projectId 
      },
    });
    return NextResponse.json({paymentDocuments});
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
    const costString = formData.get("cost") as string;
    const cost = parseInt(costString)
    const name = formData.get("name") as string;
    const title = formData.get("title") as string;
    console.log(name, title, projectId)
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

    // Save the new file metadata to the database
    const paymentDocument = await prisma.paymentDocument.create({
      data: {
        name: name,
        cost: cost,
        title: title, // You can customize this
        path: `/uploads/${file.name}`,
        projectId: projectId,
        taskId: taskId,
      },
    });

    return NextResponse.json({ paymentDocument }, { status: 200 });
  } catch (error) {
    console.error("Error uploading document file:", error);
    return NextResponse.json(
      { error: "Failed to upload document file" },
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
        const id = searchParams.get("documentId");

                
        if (!id) {
            return NextResponse.json(
                { error: 'ID документа обязателен' },
                { status: 400 }
            );
        }
        
        // Находим пользователя и проект
        const paymentDocument = await prisma.paymentDocument.findUnique({
            where: { id: id },
        });
  
        // Проверяем, что пользователь и проект существуют
        if (!paymentDocument) {
            return NextResponse.json(
                { error: 'Документ не найден' },
                { status: 404 }
            );
        }
        
        // Обновляем проект, добавляя пользователя
        const updatedProject = await prisma.paymentDocument.delete({
            where: { id: id },
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