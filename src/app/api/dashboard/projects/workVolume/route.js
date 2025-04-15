import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");

    if (!projectId) {
      return NextResponse.json(
        { error: "Требуется id проекта" },
        { status: 400 }
      );
    }

    const workVolumes = await prisma.workVolume.findMany({
      where:{
        projectId: projectId
      },
      include:{
        gasn: true
      }
    })

    return NextResponse.json(workVolumes);
  } catch (error) {
    console.error("Error processing work volume:", error);
    return NextResponse.json(
      { error: "Failed to process work volume" },
      { status: 500 }
    );
  }
}


export async function POST(request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");

    // Очищаем старые данные
    await prisma.workVolume.deleteMany({ where: { projectId } });

    if (!projectId) {
      return NextResponse.json(
        { error: "Требуется id проекта" },
        { status: 400 }
      );
    }

    // Загружаем все элементы и материалы проекта
    const [
      columns,
      slabs,
      stairs,
      railings,
      beams,
      doors,
      windows,
      wallMaterials,
      roofMaterials
    ] = await Promise.all([
      prisma.columnElement.findMany({ where: { projectId } }),
      prisma.slabElement.findMany({ where: { projectId } }),
      prisma.stairElement.findMany({ where: { projectId } }),
      prisma.railingElement.findMany({ where: { projectId } }),
      prisma.beamElement.findMany({ where: { projectId } }),
      prisma.doorElement.findMany({ where: { projectId } }),
      prisma.windowElement.findMany({ where: { projectId } }),
      prisma.wallMaterial.findMany({ where: { projectId } }),
      prisma.roofMaterial.findMany({ where: { projectId } })
    ]);

    // Объединяем все элементы
    const allElements = [
      ...columns.map(e => ({ ...e, type: "columns" })),
      ...slabs.map(e => ({ ...e, type: "slabs" })),
      ...stairs.map(e => ({ ...e, type: "stairs" })),
      ...railings.map(e => ({ ...e, type: "railings" })),
      ...beams.map(e => ({ ...e, type: "beams" })),
      ...doors.map(e => ({ ...e, type: "doors" })),
      ...windows.map(e => ({ ...e, type: "windows" }))
    ];

    // Группировка элементов по уровню и типу
    const elementMap = new Map();

    for (const el of allElements) {
      const key = `${el.level || "Unknown"}_${el.type}`;
      if (!elementMap.has(key)) {
        elementMap.set(key, {
          name: el.type,
          volumeWork: 0,
          area: 0,
          volume: 0,
          count: 0,
          level: el.level || null,
          elevation: el.elevation ?? null,
          projectId
        });
      }

      const agg = elementMap.get(key);
      agg.volumeWork += el.volume || 0;
      agg.area += el.area || 0;
      agg.volume += el.volume || 0;
      agg.count += 1;
    }

    // Группировка материалов по уровню и названию
    const allMaterials = [...wallMaterials, ...roofMaterials];
    const materialMap = new Map();

    for (const mat of allMaterials) {
      const key = `${mat.level || "Unknown"}_${mat.name}`;
      if (!materialMap.has(key)) {
        materialMap.set(key, {
          name: mat.name,
          volumeWork: 0,
          area: 0,
          volume: 0,
          count: 0,
          level: mat.level || null,
          elevation: mat.elevation ?? null,
          projectId
        });
      }

      const agg = materialMap.get(key);
      agg.volumeWork += mat.volume || 0;
      agg.area += mat.area || 0;
      agg.volume += mat.volume || 0;
      agg.count += 1;
    }

    const workVolumes = [
      ...Array.from(elementMap.values()),
      ...Array.from(materialMap.values())
    ];

    // Сохраняем в базу
    await prisma.workVolume.createMany({
      data: workVolumes,
      skipDuplicates: true
    });

    return NextResponse.json(workVolumes);
  } catch (error) {
    console.error("Error processing work volume:", error);
    return NextResponse.json(
      { error: "Failed to process work volume" },
      { status: 500 }
    );
  }
}
export async function PUT(request) {
  try {
    const requestData = await request.json();
    const { projectId, elementName, elementId } = requestData;

    // Проверка обязательных полей
    if (!projectId || !elementName) {
      return NextResponse.json(
        { error: "Требуется projectId и elementName" },
        { status: 400 }
      );
    }

    // Подготовка данных для обновления
    const updateData = {};
    const updatedFields = [];
    
    // Обработка обновления ГЭСН (применяется ко всем записям с этим именем)
    if (requestData.gasnId) {
      const gasn = await prisma.gasn.findUnique({
        where: { id: requestData.gasnId }
      });

      if (!gasn) {
        return NextResponse.json(
          { error: "ГЭСН не найден" },
          { status: 404 }
        );
      }

      updateData.gasnId = gasn.id;
      updatedFields.push('gasnId');
    }

    // Для рабочих, машин и смен проверяем наличие elementId
    if (requestData.numberOfWorkers !== undefined || 
        requestData.numberOfMashine !== undefined || 
        requestData.numberOfChanges !== undefined) {
      
      if (!elementId) {
        return NextResponse.json(
          { error: "Для обновления рабочих/машин/смен требуется elementId" },
          { status: 400 }
        );
      }

      // Обработка обновления количества рабочих
      if (requestData.numberOfWorkers !== undefined) {
        updateData.numberOfWorkers = parseInt(requestData.numberOfWorkers) || 0;
        updatedFields.push('numberOfWorkers');
      }

      // Обработка обновления количества машин
      if (requestData.numberOfMashine !== undefined) {
        updateData.numberOfMashine = parseInt(requestData.numberOfMashine) || 0;
        updatedFields.push('numberOfMashine');
      }

      // Обработка обновления количества смен
      if (requestData.numberOfChanges !== undefined) {
        updateData.numberOfChanges = parseInt(requestData.numberOfChanges) || 0;
        updatedFields.push('numberOfChanges');
      }
    }

    // Если нечего обновлять
    if (updatedFields.length === 0) {
      return NextResponse.json(
        { error: "Нет данных для обновления" },
        { status: 400 }
      );
    }

    // Для ГЭСН обновляем все записи с этим именем
    if (requestData.gasnId) {
      await prisma.workVolume.updateMany({
        where: {
          projectId,
          name: elementName
        },
        data: {
          gasnId: updateData.gasnId
        }
      });
    }

    // Для рабочих/машин/смен обновляем только конкретную запись
    if (elementId && (
        requestData.numberOfWorkers !== undefined || 
        requestData.numberOfMashine !== undefined || 
        requestData.numberOfChanges !== undefined)) {
      
      await prisma.workVolume.update({
        where: {
          id: elementId,
          projectId,
          name: elementName
        },
        data: {
          ...(requestData.numberOfWorkers !== undefined && { numberOfWorkers: updateData.numberOfWorkers }),
          ...(requestData.numberOfMashine !== undefined && { numberOfMashine: updateData.numberOfMashine }),
          ...(requestData.numberOfChanges !== undefined && { numberOfChanges: updateData.numberOfChanges })
        }
      });
    }

    return NextResponse.json({ 
      success: true,
      updatedFields: updatedFields
    });
  } catch (error) {
    console.error("Error updating work volume:", error);
    return NextResponse.json(
      { error: "Failed to update work volume data" },
      { status: 500 }
    );
  }
}