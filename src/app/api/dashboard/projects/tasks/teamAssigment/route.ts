// app/api/projects/addUser/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient, Role } from '@prisma/client';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/auth.config";

const prisma = new PrismaClient();

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    try {
        if (!session || session?.user.role != "Admin"){
            return NextResponse.json("У вас нет доступа!", { status: 403 });
        }

        const { userId, taskId } = await request.json();
        
        if (!userId || !taskId) {
            return NextResponse.json(
                { error: 'userId и taskId обязательны' },
                { status: 400 }
            );
        }
        
        // Находим пользователя и проект
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });
        
        const project = await prisma.task.findUnique({
            where: { id: taskId },
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
        const team = user.role == "Client"? [Role.Client] : [Role.Executer]
        // Обновляем проект, добавляя пользователя
        const updatedProject = await prisma.task.update({
            where: { id: taskId },
            data: {
                assignedStaff: {
                    connect: { id: userId }, // Связываем пользователя с проектом
                },
            },
            include: {
                assignedStaff: {
                    where: {
                        role: {
                            in: team
                        }
                    }
                }, // Включаем пользователей в ответ
                
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

  export async function DELETE(request: Request) {
    const session = await getServerSession(authOptions);
    try {
        if (!session || session?.user.role != "Admin"){
            return NextResponse.json("У вас нет доступа!", { status: 403 });
        }
        
        const { searchParams } = new URL(request.url);
        const taskId = searchParams.get("taskId");
        const userId = searchParams.get("userId");
                
        if (!userId || !taskId) {
            return NextResponse.json(
                { error: 'userId и taskId обязательны' },
                { status: 400 }
            );
        }
        
        // Находим пользователя и проект
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });
        
        const project = await prisma.task.findUnique({
            where: { id: taskId },
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
        const updatedProject = await prisma.task.update({
            where: { id: taskId },
            data: {
                assignedStaff: {
                    disconnect: { id: userId }, // Связываем пользователя с проектом
                },
            },
            include: {
                assignedStaff: true, // Включаем пользователей в ответ
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