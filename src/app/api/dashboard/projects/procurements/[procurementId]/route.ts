// app/api/dashboard/projects/procurements/[procurementId]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { ProcurementStatus } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");
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
      assignedStaff,
      documents,
      designDocuments,
      procurementDocumentation,
      deliveryDocumentation
    } = await request.json();

    if (!name || !status) {
      return NextResponse.json(
        { error: "Название и статус обязательны" },
        { status: 400 }
      );
    }

    // Получаем текущую закупку для проверки
    const currentProcurement = await prisma.procurement.findUnique({
      where: { id: procurementId },
      include: {
        assignedStaff: true,
        documents: true,
        designDocuments: true,
        procurementDocumentation: true,
        deliveryDocumentation: true
      }
    });

    if (!currentProcurement) {
      return NextResponse.json(
        { error: "Закупка не найдена" },
        { status: 404 }
      );
    }

    // Определяем какие связи нужно добавить/удалить
    const staffToConnect = assignedStaff.filter((id: string) => 
      !currentProcurement.assignedStaff.some(staff => staff.id === id)
    );
    const staffToDisconnect = currentProcurement.assignedStaff
      .filter(staff => !assignedStaff.includes(staff.id))
      .map(staff => staff.id);

    // Аналогично для документов (можно вынести в отдельную функцию)
    const updateRelations = async (relation: string, newIds: string[]) => {
      const currentItems = currentProcurement[relation];
      const toConnect = newIds.filter(id => 
        !currentItems.some((item: {id: string}) => item.id === id)
      );
      const toDisconnect = currentItems
        .filter((item: {id: string}) => !newIds.includes(item.id))
        .map((item: {id: string}) => item.id);

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
        assignedStaff: {
          connect: staffToConnect.map(id => ({ id })),
          disconnect: staffToDisconnect.map(id => ({ id }))
        },
        documents: await updateRelations('documents', documents),
        designDocuments: await updateRelations('designDocuments', designDocuments),
        procurementDocumentation: await updateRelations('procurementDocumentation', procurementDocumentation),
        deliveryDocumentation: await updateRelations('deliveryDocumentation', deliveryDocumentation)
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