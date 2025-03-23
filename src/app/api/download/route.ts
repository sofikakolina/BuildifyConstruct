import { NextResponse, NextRequest } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const fileName = searchParams.get("fileName");

  if (!fileName) {
    return NextResponse.json({ error: "File name is required" }, { status: 400 });
  }

  // Путь к файлу на сервере
  const filePath = path.join(process.cwd(), "public", fileName);

  try {
    // Проверяем, существует ли файл
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Читаем файл
    const fileBuffer = fs.readFileSync(filePath);
    const fileStats = fs.statSync(filePath);

    // Устанавливаем заголовки для скачивания
    const headers = new Headers();
    const encodedFileName = encodeURIComponent(fileName); // Кодируем имя файла
    headers.set(
      "Content-Disposition",
      `attachment; filename*=UTF-8''${encodedFileName}`
    );
    headers.set("Content-Length", fileStats.size.toString());

    // Возвращаем файл как ответ
    return new NextResponse(fileBuffer, { headers });
  } catch (error) {
    console.error("Error fetching file:", error);
    return NextResponse.json(
      { error: "Failed to download file" },
      { status: 500 }
    );
  }
}