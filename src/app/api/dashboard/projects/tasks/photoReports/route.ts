// app/api/dashboard/projects/photo-reports/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");
    const taskId = searchParams.get("taskId");

    if (!taskId && !projectId) {
      return NextResponse.json(
        { error: "Требуется id проекта или задачи" },
        { status: 400 }
      );
    }

    const where: any = {};
    if (projectId) where.projectId = projectId;
    if (taskId) where.taskId = taskId;

    const photoReports = await prisma.photoReport.findMany({
      where,
      include: {
        images: true,
      },
    });

    return NextResponse.json({ photoReports });
  } catch (error) {
    console.error("Error fetching photo reports:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];
    const projectId = formData.get("projectId") as string;
    const taskId = formData.get("taskId") as string | null;
    const name = formData.get("name") as string;
    const title = formData.get("title") as string;

    if (!files || files.length === 0 || !projectId || !name) {
      return NextResponse.json(
        { error: "Файлы, projectId и name обязательны" },
        { status: 400 }
      );
    }

    const uploadDir = path.join(process.cwd(), "public/uploads/photo-reports");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const imageData = [];
    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const uniqueName = `${uuidv4()}-${file.name}`;
      const filePath = path.join(uploadDir, uniqueName);
      fs.writeFileSync(filePath, buffer);
      imageData.push({ src: `/uploads/photo-reports/${uniqueName}` });
    }

    const photoReport = await prisma.photoReport.create({
      data: {
        name,
        title,
        projectId,
        taskId,
        images: {
          create: imageData,
        },
      },
      include: {
        images: true,
      },
    });

    return NextResponse.json({ photoReport });
  } catch (error) {
    console.error("Error uploading photo report:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const photoReportId = searchParams.get("photoReportId");

    if (!photoReportId) {
      return NextResponse.json({ error: "ID фотоотчета обязателен" }, { status: 400 });
    }

    const photoReport = await prisma.photoReport.findUnique({
      where: { id: photoReportId },
      include: { images: true },
    });

    if (!photoReport) {
      return NextResponse.json({ error: "Фотоотчет не найден" }, { status: 404 });
    }

    for (const image of photoReport.images) {
      const fullPath = path.join(process.cwd(), "public", image.src);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    }

    await prisma.photoReport.delete({ where: { id: photoReportId } });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting photo report:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
