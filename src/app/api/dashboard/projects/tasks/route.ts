import { NextResponse, NextRequest } from "next/server"
import { prisma } from "@/utils/prisma"
import { TaskStatus, Role } from "@prisma/client"
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/auth.config";

const include = {
    assignedStaff:true,
}
interface StaffMember {
    id: string;
    name: string | null; // Может быть null
    role: string;
}
  

interface Task {
    id: string;
    userId: string | null; // Может быть null
    projectId: string | null; // Может быть null
    status: string;
    priority: string;
    name: string | null; // Может быть null
    details: string | null; // Может быть null
    image: string | null; // Может быть null
    comment: string | null; // Может быть null
    createdAt: string; // Изменено на string
    updatedAt: string; // Изменено на string
    assignedStaff: StaffMember[];
    startDate: string; // Изменено на string
    targetEnd: string | null; // Может быть null
}

type Tasks = {
    todo: Task[];
    pause: Task[];
    inProgress: Task[];
    wait: Task[];
    done: Task[];
  };



  export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");

    if (!session || session.user.role == Role.Client)
        return NextResponse.json({ error: "Not authorized for action" }, { status: 401 });

    const tasks: Tasks = {
        todo: [],
        pause: [],
        inProgress: [],
        wait: [],
        done: [],
    };

    const results = await Promise.all(
        session.user.role == Role.Admin
            ? [
                prisma.task.findMany({ where: { status: TaskStatus.Todo, projectId }, include }),
                prisma.task.findMany({ where: { status: TaskStatus.Pause, projectId }, include }),
                prisma.task.findMany({ where: { status: TaskStatus.InProgress, projectId }, include }),
                prisma.task.findMany({ where: { status: TaskStatus.Wait, projectId }, include }),
                prisma.task.findMany({
                    where: { status: TaskStatus.Done, projectId },
                    orderBy: { updatedAt: "desc" },
                    take: 10,
                    include,
                }),
            ]
            : [
                prisma.task.findMany({
                    where: {
                        status: TaskStatus.Todo,
                        assignedStaff: {
                            some: {
                                id: session.user.id,
                            },
                        },
                        projectId,
                    },
                    include,
                }),
                prisma.task.findMany({
                    where: {
                        status: TaskStatus.Pause,
                        assignedStaff: {
                            some: {
                                id: session.user.id,
                            },
                        },
                        projectId,
                    },
                    include,
                }),
                prisma.task.findMany({
                    where: {
                        status: TaskStatus.InProgress,
                        assignedStaff: {
                            some: {
                                id: session.user.id,
                            },
                        },
                        projectId,
                    },
                    include,
                }),
                prisma.task.findMany({
                    where: {
                        status: TaskStatus.Wait,
                        assignedStaff: {
                            some: {
                                id: session.user.id,
                            },
                        },
                        projectId,
                    },
                    include,
                }),
                prisma.task.findMany({
                    where: {
                        status: TaskStatus.Done,
                        assignedStaff: {
                            some: {
                                id: session.user.id,
                            },
                        },
                        projectId,
                    },
                    orderBy: { updatedAt: "desc" },
                    take: 10,
                    include,
                }),
            ]
    );

    results.forEach((result, index) => {
        const formattedResult = result.map(task => ({
            ...task,
            createdAt: task.createdAt.toISOString(), // Преобразуем Date в строку
            updatedAt: task.updatedAt.toISOString(), // Преобразуем Date в строку
            startDate: task.startDate.toISOString(), // Преобразуем Date в строку
            targetEnd: task.targetEnd ? task.targetEnd.toISOString() : null, // Преобразуем Date в строку (если не null)
        }));

        switch (index) {
            case 0:
                tasks.todo = formattedResult;
                break;
            case 1:
                tasks.pause = formattedResult;
                break;
            case 2:
                tasks.inProgress = formattedResult;
                break;
            case 3:
                tasks.wait = formattedResult;
                break;
            case 4:
                tasks.done = formattedResult;
                break;
        }
    });

    return NextResponse.json({ tasks });
}