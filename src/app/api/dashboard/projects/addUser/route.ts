// app/api/projects/addUser/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { userId, projectId } = await request.json();

    if (!userId || !projectId) {
      return NextResponse.json(
        { error: 'userId и projectId обязательны' },
        { status: 400 }
      );
    }

    // Находим пользователя и проект
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    // Проверяем, что пользователь и проект существуют
    if (!user) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      );
    }

    if (!project) {
      return NextResponse.json(
        { error: 'Проект не найден' },
        { status: 404 }
      );
    }

    // Обновляем проект, добавляя пользователя
    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        users: {
          connect: { id: userId }, // Связываем пользователя с проектом
        },
      },
      include: {
        users: true, // Включаем пользователей в ответ
      },
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