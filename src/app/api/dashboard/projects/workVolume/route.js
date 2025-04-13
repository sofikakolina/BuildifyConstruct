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

    // Получаем все элементы для проекта
    const [
      columns,
      slabs,
      stairs,
      railings,
      beams,
      doors,
      windows,
      walls,
      roofs
    ] = await Promise.all([
      prisma.columnElement.findMany({ where: { projectId }, orderBy: { elevation: "asc" } }),
      prisma.slabElement.findMany({ where: { projectId }, orderBy: { elevation: "asc" } }),
      prisma.stairElement.findMany({ where: { projectId }, orderBy: { elevation: "asc" } }),
      prisma.railingElement.findMany({ where: { projectId }, orderBy: { elevation: "asc" } }),
      prisma.beamElement.findMany({ where: { projectId }, orderBy: { elevation: "asc" } }),
      prisma.doorElement.findMany({ where: { projectId }, orderBy: { elevation: "asc" } }),
      prisma.windowElement.findMany({ where: { projectId }, orderBy: { elevation: "asc" } }),
      prisma.wallElement.findMany({ where: { projectId }, orderBy: { elevation: "asc" } }),
      prisma.roofElement.findMany({ where: { projectId }, orderBy: { elevation: "asc" } })
    ]);

    // Создаем объект для группировки по уровням
    const levelsMap = {};

    // Функция для обработки элементов
    const processElements = (elements, type) => {
      elements.forEach(element => {
        const levelKey = `Этаж ${element.level || element.elevation}`;
        
        if (!levelsMap[levelKey]) {
          levelsMap[levelKey] = {
            slabs: { length: 0, count: 0, volume: 0, area: 0, elements: [] },
            stairs: { length: 0, count: 0, volume: 0, area: 0, elements: [] },
            beams: { length: 0, count: 0, volume: 0, area: 0, elements: [] },
            columns: { length: 0, count: 0, volume: 0, area: 0, elements: [] },
            railings: { length: 0, count: 0, volume: 0, area: 0, elements: [] },
            doors: { length: 0, count: 0, volume: 0, area: 0, elements: [] },
            windows: { length: 0, count: 0, volume: 0, area: 0, elements: [] },
            walls: { length: 0, count: 0, volume: 0, area: 0, elements: [] },
            roofs: { length: 0, count: 0, volume: 0, area: 0, elements: [] },
            totalElements: 0
          };
        }
        
        levelsMap[levelKey][type].length += element.length || 0;
        levelsMap[levelKey][type].count++;
        levelsMap[levelKey][type].volume += element.volume || 0;
        levelsMap[levelKey][type].area += element.area || 0;
        levelsMap[levelKey][type].elements.push(element);
        levelsMap[levelKey].totalElements++;
      });
    };

    // Обрабатываем все типы элементов
    processElements(columns, 'columns');
    processElements(slabs, 'slabs');
    processElements(stairs, 'stairs');
    processElements(railings, 'railings');
    processElements(beams, 'beams');
    processElements(doors, 'doors');
    processElements(windows, 'windows');
    processElements(walls, 'walls');
    processElements(roofs, 'roofs');

    // Формируем итоговый результат с сохранением elevation
    const result = Object.entries(levelsMap).map(([level, data]) => {
      // Находим первый элемент, чтобы получить elevation (все элементы на уровне имеют одинаковый elevation)
      const firstElement = 
        data.columns.elements[0] || 
        data.slabs.elements[0] || 
        data.beams.elements[0] || 
        data.stairs.elements[0] || 
        data.walls.elements[0] || 
        data.roofs.elements[0] || 
        data.doors.elements[0] || 
        data.windows.elements[0] || 
        data.railings.elements[0];
      
      return {
        level,
        elevation: firstElement?.elevation || 0, // Добавляем поле elevation
        lengths: {
          columns: data.columns.length,
          slabs: data.slabs.length,
          stairs: data.stairs.length,
          railings: data.railings.length,
          beams: data.beams.length,
          doors: data.doors.length,
          windows: data.windows.length,
          walls: data.walls.length,
          roofs: data.roofs.length,
          total: data.totalElements
        },
        counts: {
          columns: data.columns.count,
          slabs: data.slabs.count,
          stairs: data.stairs.count,
          railings: data.railings.count,
          beams: data.beams.count,
          doors: data.doors.count,
          windows: data.windows.count,
          walls: data.walls.count,
          roofs: data.roofs.count,
          total: data.totalElements
        },
        volumes: {
          columns: data.columns.volume,
          slabs: data.slabs.volume,
          stairs: data.stairs.volume,
          railings: data.railings.volume,
          beams: data.beams.volume,
          doors: data.doors.volume,
          windows: data.windows.volume,
          walls: data.walls.volume,
          roofs: data.roofs.volume
        },
        areas: {
          columns: data.columns.area,
          slabs: data.slabs.area,
          stairs: data.stairs.area,
          railings: data.railings.area,
          beams: data.beams.area,
          doors: data.doors.area,
          windows: data.windows.area,
          walls: data.walls.area,
          roofs: data.roofs.area
        },
        elements: {
          columns: data.columns.elements,
          slabs: data.slabs.elements,
          stairs: data.stairs.elements,
          railings: data.railings.elements,
          beams: data.beams.elements,
          doors: data.doors.elements,
          windows: data.windows.elements,
          walls: data.walls.elements,
          roofs: data.roofs.elements
        }
      };
    });

    result.sort((a, b) => {
      // Проверяем, является ли уровень "Unknown Level"
      const isUnknownA = a.level.includes("Unknown Level");
      const isUnknownB = b.level.includes("Unknown Level");
      
      // Если оба "Unknown Level" - сохраняем порядок
      if (isUnknownA && isUnknownB) return 0;
      
      // Если только 'a' - "Unknown Level" - помещаем его ближе к концу
      if (isUnknownA) return 1;
      
      // Если только 'b' - "Unknown Level" - помещаем его ближе к концу
      if (isUnknownB) return -1;
      
      // Для остальных случаев сортируем по elevation
      const elevA = a.elevation ?? Infinity;
      const elevB = b.elevation ?? Infinity;
      
      return elevA - elevB;
    });
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}