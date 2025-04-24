// app/api/dashboard/projects/procurements/[procurementId]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
// import { ProcurementStatus } from "@prisma/client";

const prisma = new PrismaClient();

// Тип для отношений закупки
type ProcurementRelations = {
  documents: { id: string }[];
  designDocuments: { id: string }[];
  procurementDocumentation: { id: string }[];
  deliveryDocumentation: { id: string }[];
  assignedStaff: { id: string }[];
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const procurementId = searchParams.get("procurementId");
    
    if (!procurementId) {
      return NextResponse.json(
        { error: "Необходим ID закупки" },
        { status: 400 }
      );
    }

    const procurement = await prisma.procurement.findUnique({
      where: { id: procurementId },
      include: {
        assignedStaff: true,
        documents: true,
        designDocuments: true,
        procurementDocumentation: true,
        deliveryDocumentation: true,
        accountingDocuments: true,
        ifc: true
      }
    });

    if (!procurement) {
      return NextResponse.json(
        { error: "Закупка не найдена" },
        { status: 404 }
      );
    }

    return NextResponse.json(procurement);
  } catch (error) {
    console.error("Error fetching procurement:", error);
    return NextResponse.json(
      { error: "Ошибка при получении данных о закупке" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const procurementId = request.nextUrl.pathname.split('/').pop();
    const {
      name,
      description,
      details,
      status,
      assignedStaff = [],
      documents = [],
      designDocuments = [],
      procurementDocumentation = [],
      deliveryDocumentation = []
    } = await request.json();

    if (!name || !status || !procurementId) {
      return NextResponse.json(
        { error: "Название, статус и ID закупки обязательны" },
        { status: 400 }
      );
    }

    // Получаем текущую закупку для проверки
    const currentProcurement = await prisma.procurement.findUnique({
      where: { id: procurementId },
      include: {
        assignedStaff: { select: { id: true } },
        documents: { select: { id: true } },
        designDocuments: { select: { id: true } },
        procurementDocumentation: { select: { id: true } },
        deliveryDocumentation: { select: { id: true } }
      }
    });

    if (!currentProcurement) {
      return NextResponse.json(
        { error: "Закупка не найдена" },
        { status: 404 }
      );
    }

    // Функция для обновления связей с типизацией
    const updateRelations = <T extends keyof ProcurementRelations>(
      relation: T,
      newIds: string[]
    ) => {
      const currentItems = currentProcurement[relation] as { id: string }[];
      const currentIds = currentItems.map(item => item.id);
      
      const toConnect = newIds.filter(id => !currentIds.includes(id));
      const toDisconnect = currentIds.filter(id => !newIds.includes(id));

      return {
        connect: toConnect.map(id => ({ id })),
        disconnect: toDisconnect.map(id => ({ id }))
      };
    };

    const updatedProcurement = await prisma.procurement.update({
      where: { id: procurementId },
      data: {
        name,
        description,
        details,
        status,
        assignedStaff: updateRelations('assignedStaff', assignedStaff),
        documents: updateRelations('documents', documents),
        designDocuments: updateRelations('designDocuments', designDocuments),
        procurementDocumentation: updateRelations('procurementDocumentation', procurementDocumentation),
        deliveryDocumentation: updateRelations('deliveryDocumentation', deliveryDocumentation)
      },
      include: {
        assignedStaff: true,
        documents: true,
        designDocuments: true,
        procurementDocumentation: true,
        deliveryDocumentation: true
      }
    });

    return NextResponse.json(updatedProcurement);
  } catch (error) {
    console.error("Error updating procurement:", error);
    return NextResponse.json(
      { error: "Ошибка при обновлении закупки" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const procurementId = request.nextUrl.pathname.split('/').pop();

    if (!procurementId) {
      return NextResponse.json(
        { error: "Необходим ID закупки" },
        { status: 400 }
      );
    }

    await prisma.procurement.delete({
      where: { id: procurementId }
    });

    return NextResponse.json(
      { message: "Закупка успешно удалена" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting procurement:", error);
    return NextResponse.json(
      { error: "Ошибка при удалении закупки" },
      { status: 500 }
    );
  }
}