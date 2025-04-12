import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, SlabElement, StairElement, BeamElement } from "@prisma/client";
const prisma = new PrismaClient();

type ElementGroup = {
  count: number;
  volume: number;
  elements: (SlabElement | StairElement | BeamElement)[];
};

type LevelData = {
  slabs: ElementGroup;
  stairs: ElementGroup;
  beams: ElementGroup;
  totalElements: number;
};

export async function GET(request: NextRequest) {
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
    const [slabs, stairs, beams] = await Promise.all([
      prisma.slabElement.findMany({
        where: { projectId },
        orderBy: { elevation: "asc" }
      }),
      prisma.stairElement.findMany({
        where: { projectId },
        orderBy: { elevation: "asc" }
      }),
      prisma.beamElement.findMany({
        where: { projectId },
        orderBy: { elevation: "asc" }
      }),
    ]);

    // Создаем объект для группировки по уровням
    const levelsMap: Record<string, LevelData> = {};

    // Группируем элементы по уровням
    const processElements = (
      elements: SlabElement[] | StairElement[] | BeamElement[],
      type: 'slabs' | 'stairs' | 'beams'
    ) => {
      elements.forEach(element => {
        const levelKey = `Этаж ${element.level || element.elevation}`;
        
        if (!levelsMap[levelKey]) {
          levelsMap[levelKey] = {
            slabs: { count: 0, volume: 0, elements: [] },
            stairs: { count: 0, volume: 0, elements: [] },
            beams: { count: 0, volume: 0, elements: [] },
            totalElements: 0
          };
        }
        
        levelsMap[levelKey][type].count++;
        levelsMap[levelKey][type].volume += element.volume || 0;
        levelsMap[levelKey][type].elements.push(element);
        levelsMap[levelKey].totalElements++;
      });
    };

    processElements(slabs, 'slabs');
    processElements(stairs, 'stairs');
    processElements(beams, 'beams');

    // Формируем итоговый результат
    const result = Object.entries(levelsMap).map(([level, data]) => ({
      level,
      counts: {
        slabs: data.slabs.count,
        stairs: data.stairs.count,
        beams: data.beams.count,
        total: data.totalElements
      },
      volumes: {
        stairs: data.stairs.volume,
        slabs: data.slabs.volume,
        beams: data.beams.volume,
      },
      elements: {
        slabs: data.slabs.elements,
        stairs: data.stairs.elements,
        beams: data.beams.elements
      }
    }));

    // Сортируем этажи по elevation (если есть)
    result.sort((a, b) => {
      const getElevation = (level: string) => {
        const match = level.match(/Этаж (-?\d+)/);
        return match ? parseInt(match[1]) : 0;
      };
      return getElevation(a.level) - getElevation(b.level);
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