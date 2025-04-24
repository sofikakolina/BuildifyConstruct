import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { ProcurementStatus } from "@prisma/client";
const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");
    const procurementId = searchParams.get("procurementId");
    if (!projectId) {
      return NextResponse.json(
        { error: "Нужен id проекта" },
        { status: 400 }
      );
    }

    if (procurementId) {
      const procurement = await prisma.procurement.findUnique({
        where:{
          id: procurementId
        },
        include:{
          assignedStaff: true,
          documents: true,
          designDocuments: true,
          procurementDocumentation: true,
          deliveryDocumentation: true,
          accountingDocuments: true,
          ifc: true
        }
      })
      return NextResponse.json(procurement);
    }
    const procurements = await prisma.procurement.findMany({
      where: {
        projectId: projectId,
        OR: [
          {
            status: {
              notIn: [ProcurementStatus.Cancelled, ProcurementStatus.Complete]
            }
          },
          {
            status: ProcurementStatus.Complete
          }
        ]
      },
      include: {
        assignedStaff: true,
        documents: true,
        designDocuments: true,
        procurementDocumentation: true,
        deliveryDocumentation: true,
        accountingDocuments: true,
      },
      orderBy: [
        {
          status: 'asc'
        },
        {
          updatedAt: 'desc'
        }
      ],
      take: undefined 
    });

    const activeProcurements = procurements.filter(p => p.status !== ProcurementStatus.Complete);
    const recentCompleted = procurements
      .filter(p => p.status === ProcurementStatus.Complete)
      .slice(0, 10);

    const result = [...activeProcurements, ...recentCompleted];

    return NextResponse.json(result);
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
    const { assignedStaff, deliveryDocumentation, description, designDocuments, details, documents, name, procurementDocumentation, projectId, status } = await request.json();
    // Проверяем, что пользователь с adminId существует и имеет роль "Admin"
    console.log(assignedStaff, deliveryDocumentation, description, designDocuments, details, documents, name, procurementDocumentation, projectId, status)
    if (!name && !projectId && !status && (!assignedStaff || !deliveryDocumentation || !designDocuments || !documents || !procurementDocumentation)){
      return NextResponse.json(
        { error: "Требует хот бы один из прикрепленных документов" },
        { status: 400 }
      );
    }
    const procurement = await prisma.procurement.create({
      data:{
        name,
        details,
        description,
        projectId,
        status,
        assignedStaff: {
          connect: (assignedStaff as string[]).map(id => ({id}))
        },
        deliveryDocumentation: {
          connect: (deliveryDocumentation as string[]).map(id => ({id}))
        },
        designDocuments: {
          connect: (designDocuments as string[]).map(id => ({id}))
        },
        documents: {
          connect: (documents as string[]).map(id => ({id}))
        },
        procurementDocumentation: {
          connect: (procurementDocumentation as string[]).map(id => ({id}))
        },
      }
    })

    return NextResponse.json(procurement, { status: 201 });
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}