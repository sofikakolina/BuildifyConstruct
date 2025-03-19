import { NextResponse, NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"
import { prisma } from "@/utils/prisma"
import { TaskStatus, Role } from "@prisma/client"
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/auth.config";

const include = {
    // id:true,              
    // userId:true,
    // projectId: true,
    // status: true,
    // priority:true,
    // name:true,
    // details:true,
    // image:true,
    // comment:true,
    // createdAt:true,
    // updatedAt:true,
    // dueDate:true,
    assignedStaff:true,
}

type Tasks = {
    todo: any[];
    pause: any[];
    inProgress: any[];
    wait: any[];
    done: any[];
  };

export async function GET(req:NextRequest) {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");	
    
    if (!session || session.user.role == Role.Client)
		return NextResponse.json({ error: "Not authorized for action" }, { status: 401 })
    const tasks: Tasks = {
        todo: [],
        pause: [],
        inProgress: [],
        wait: [],
        done: []
    };	
	
    // const staffAssignments = { some: { employeeId: session.user.id } };
	(await Promise.all(session.user.role == Role.Admin ? [
		prisma.task.findMany({ where: { status: TaskStatus.Todo, projectId: projectId }, include }),
		prisma.task.findMany({ where: { status: TaskStatus.Pause, projectId: projectId }, include }),
		prisma.task.findMany({ where: { status: TaskStatus.InProgress, projectId: projectId }, include }),
		prisma.task.findMany({ where: { status: TaskStatus.Wait, projectId: projectId }, include }),
		prisma.task.findMany({
			where: { status: TaskStatus.Done, projectId: projectId },
			orderBy: { updatedAt: 'desc' },
			take: 10,
			include,
		}),
	] : [
		prisma.task.findMany(
            { 
                where: { 
                    status: TaskStatus.Todo, 
                    assignedStaff: {
                        some: {
                            id: session.user.id
                        }
                    } 
                }, 
                include 
            }
        ),
		prisma.task.findMany(
            { 
                where: { 
                    status: TaskStatus.Pause, 
                    assignedStaff: {
                        some: {
                            id: session.user.id
                        }
                    } 
                }, 
                include 
            }
        ),
        prisma.task.findMany(
            { 
                where: { 
                    status: TaskStatus.InProgress, 
                    assignedStaff: {
                        some: {
                            id: session.user.id
                        }
                    } 
                }, 
                include 
            }
        ),
        prisma.task.findMany(
            { 
                where: { 
                    status: TaskStatus.Wait, 
                    assignedStaff: {
                        some: {
                            id: session.user.id
                        }
                    } 
                }, 
                include 
            }
        ),
		prisma.task.findMany({
			where: { status: TaskStatus.Done,
                assignedStaff: {
                    some: {
                        id: session.user.id
                    }
                } 
             },
			orderBy: { updatedAt: 'desc' },
			take: 10,
			include,
		}),
	])).forEach((result, index) => {
		switch (index) {
			case 0: tasks.todo = result; break
			case 1: tasks.pause = result; break
			case 2: tasks.inProgress = result; break
			case 3: tasks.wait = result; break
			case 4: tasks.done = result; break
		}
	})
	return NextResponse.json({ tasks })
}