import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { execSync } from "child_process";
import path from "path";
import fs from "fs";

const prisma = new PrismaClient();

interface WallLevelData {
  level: string;
  count: number;
  volume: number;
  area: number;
  elevation?: number;
  types: string[];
  elements: WallElementData[];
}

interface WallElementData {
  name: string;
  globalId: string;
  type: string;
  volume: number;
  area: number;
  width: number;
  height: number;
  length: number;
  level: string;
  elevation?: number;
  materials: WallMaterialData[];
}

interface WallMaterialData {
  name: string;
  type?: string;
  thickness?: number;
  volume: number;
  area: number;
}

export async function GET(request: NextRequest) {
  try {
    // 1. Configure paths
    const pythonExecutable = 'C:\\Users\\sofikakolina\\AppData\\Local\\Programs\\Python\\Python312\\python.exe';
    const { searchParams } = new URL(request.url);
    const ifcId = searchParams.get("ifcId");
    if (!ifcId){
      return NextResponse.json(
        { 
          error: "Требуется id модели",
        },
        { status: 400 }
      );
    }
    // 2. Get absolute paths
    const ifc = await prisma.iFC.findUnique({
      where:{
        id: ifcId
      }
    });
    if (!ifc){
      return NextResponse.json(
        { 
          error: "Нужной модели не найдено",
        },
        { status: 400 }
      );
    }
    // 2. Get absolute paths
    const baseDir = path.join(process.cwd(), 'src', 'app', 'api', 'python');    
    const baseDirModel = path.join(process.cwd(), 'public');
    const scriptPath = path.join(baseDir, 'code', '16_02_2025_wall_materials.py');
    const modelPath = path.join(baseDirModel, ifc.path);
    
    // 3. Verify files exist
    if (!fs.existsSync(scriptPath)) {
      throw new Error(`Python script not found at: ${scriptPath}`);
    }
    if (!fs.existsSync(modelPath)) {
      throw new Error(`IFC model not found at: ${modelPath}`);
    }

    // 4. Execute Python script with UTF-8 encoding
    const command = `"${pythonExecutable}" "${scriptPath}" "${modelPath}"`;
    
    const env = {
      ...process.env,
      PYTHONIOENCODING: 'utf-8',
      PYTHONUTF8: '1'
    };

    const output = execSync(command, {
      encoding: 'utf-8',
      stdio: 'pipe',
      windowsHide: true,
      maxBuffer: 1024 * 1024 * 10, // 10MB buffer
      env: env
    });

    // 5. Parse and store results
    const { totalCount, totalVolume, totalArea, levelsData } = parsePythonOutput(output);
    // Удаляем данные в правильном порядке, учитывая ограничения внешних ключей
    await prisma.wallMaterial.deleteMany({ where: {} });
    await prisma.wallElement.deleteMany({ where: {} });
    await prisma.wall.deleteMany({ where: {} });

    // Create main Wall record
    const wall = await prisma.wall.create({
      data: {
        name: "Wall Analysis",
        totalCount,
        totalVolume,
        totalArea,
        projectId: ifc.projectId,
        description: `Generated from ${path.basename(modelPath)}`,
      },
    });

    // Create all WallElement and WallMaterial records
    const createElementPromises = levelsData.flatMap(levelData => 
      levelData.elements.map(async (element) => {
        try {
          const createdElement = await prisma.wallElement.create({
            data: {
              wallId: wall.id,
              name: element.name,
              globalId: element.globalId,
              type: element.type,
              level: element.level,
              elevation: element.elevation,
              volume: element.volume,
              area: element.area,
              width: element.width,
              height: element.height,
              length: element.length,
              projectId: ifc.projectId,
            }
          });

          // Create materials for this element
          if (element.materials && element.materials.length > 0) {
            const materialPromises = element.materials.map(material => 
              prisma.wallMaterial.create({
                data: {
                  wallElementId: createdElement.id,
                  name: material.name,
                  type: material.type,
                  thickness: material.thickness,
                  volume: material.volume,
                  area: material.area,
                  elevation: element.elevation,
                  projectId: ifc.projectId,
                }
              })
            );
            await Promise.all(materialPromises);
          }
        } catch (error) {
          console.error(`Error processing element ${element.globalId}:`, error);
          throw error;
        }
      })
    );

    await Promise.all(createElementPromises);

    return NextResponse.json({
      success: true,
      wall,
      levels: levelsData.length,
      elements: totalCount,
    });

  } catch (error) {
    console.error("Error processing walls:", error);
    return NextResponse.json(
      { 
        error: "Failed to process walls",
        details: error instanceof Error ? error.message : String(error),
        suggestion: "Check file paths and Python environment"
      },
      { status: 500 }
    );
  }
}

function parsePythonOutput(output: string): {
  totalCount: number;
  totalVolume: number;
  totalArea: number;
  levelsData: WallLevelData[];
} {
  const lines = output.split(/\r?\n/);
  let totalCount = 0;
  let totalVolume = 0;
  let totalArea = 0;
  const levelsData: WallLevelData[] = [];
  let currentElement: Partial<WallElementData> | null = null;
  let currentMaterials: WallMaterialData[] = [];
  let parsingMaterials = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Parse total counts
    if (line.startsWith("Общее количество стен:")) {
      totalCount = parseInt(line.split(":")[1].trim());
      continue;
    }
    if (line.startsWith("Общий объем всех стен:")) {
      totalVolume = parseFloat(line.split(":")[1].trim().split(" ")[0]);
      continue;
    }
    if (line.startsWith("Общая площадь всех стен:")) {
      totalArea = parseFloat(line.split(":")[1].trim().split(" ")[0]);
      continue;
    }

    // Start new wall element
    if (line.startsWith("Стена") && line.includes(":")) {
      // Finalize previous element if exists
      if (currentElement && currentElement.name && currentElement.globalId) {
        addElementToLevel(currentElement, currentMaterials, levelsData);
      }
      
      currentElement = {
        materials: []
      };
      currentMaterials = [];
      parsingMaterials = false;
      continue;
    }

    if (!currentElement) continue;

    // Parse element properties
    if (line.includes("Название:")) {
      currentElement.name = line.split(":")[1].trim();
    } else if (line.includes("GlobalId:")) {
      currentElement.globalId = line.split(":")[1].trim();
    } else if (line.includes("Тип:")) {
      currentElement.type = line.split(":")[1].trim();
    } else if (line.includes("Объем:")) {
      currentElement.volume = parseFloat(line.split(":")[1].trim().split(" ")[0]);
    } else if (line.includes("Площадь:")) {
      currentElement.area = parseFloat(line.split(":")[1].trim().split(" ")[0]);
    } else if (line.includes("Ширина:")) {
      currentElement.width = parseFloat(line.split(":")[1].trim().split(" ")[0]);
    } else if (line.includes("Высота:")) {
      currentElement.height = parseFloat(line.split(":")[1].trim().split(" ")[0]);
    } else if (line.includes("Длина:")) {
      currentElement.length = parseFloat(line.split(":")[1].trim().split(" ")[0]);
    } else if (line.includes("Уровень:")) {
      currentElement.level = line.split(":")[1].trim();
    } else if (line.includes("Отметка уровня:")) {
      const elevationStr = line.split(":")[1].trim().split(" ")[0];
      if (elevationStr !== "N/A") {
        currentElement.elevation = parseFloat(elevationStr);
      }
    } else if (line.includes("Материалы:")) {
      parsingMaterials = true;
    } else if (parsingMaterials) {
      if (line.startsWith("-")) {
        const materialLine = line.substring(1).trim();
        const materialParts = materialLine.split(" - ").map(part => part.trim());
        
        if (materialParts.length > 0) {
          const materialName = materialParts[0];
          let materialType: string | undefined;
          let thickness: number | undefined;
          
          const nameParts = materialName.split(":");
          if (nameParts.length > 1) {
            materialType = nameParts[0].trim();
            const thicknessMatch = nameParts[1].match(/(\d+)\s*мм/);
            if (thicknessMatch) thickness = parseFloat(thicknessMatch[1]);
          }

          let materialVolume = 0;
          let materialArea = 0;
          
          for (const part of materialParts.slice(1)) {
            if (part.includes("Объем_Материала:")) {
              const volMatch = part.match(/Объем_Материала:\s*([\d.]+)\s*м³/);
              if (volMatch) materialVolume = parseFloat(volMatch[1]);
            }
            if (part.includes("Площадь_Материала:")) {
              const areaMatch = part.match(/Площадь_Материала:\s*([\d.]+)\s*м²/);
              if (areaMatch) materialArea = parseFloat(areaMatch[1]);
            }
          }

          currentMaterials.push({
            name: materialName,
            type: materialType,
            thickness,
            volume: materialVolume,
            area: materialArea
          });
        }
      } else if (line === "") {
        parsingMaterials = false;
      }
    }
  }

  // Add the last element if exists
  if (currentElement && currentElement.name && currentElement.globalId) {
    addElementToLevel(currentElement, currentMaterials, levelsData);
  }

  return { totalCount, totalVolume, totalArea, levelsData };
}

function addElementToLevel(
  element: Partial<WallElementData>,
  materials: WallMaterialData[],
  levelsData: WallLevelData[]
) {
  if (!element.level) return;

  let levelData = levelsData.find(l => l.level === element.level);
  if (!levelData) {
    levelData = {
      level: element.level,
      count: 0,
      volume: 0,
      area: 0,
      elevation: element.elevation,
      types: [],
      elements: []
    };
    levelsData.push(levelData);
  }

  levelData.elements.push({
    name: element.name || '',
    globalId: element.globalId || '',
    type: element.type || 'Unknown Type',
    volume: element.volume || 0,
    area: element.area || 0,
    width: element.width || 0,
    height: element.height || 0,
    length: element.length || 0,
    level: element.level || 'Unknown Level',
    elevation: element.elevation,
    materials: materials
  });

  levelData.count += 1;
  levelData.volume += element.volume || 0;
  levelData.area += element.area || 0;
  if (element.type && !levelData.types.includes(element.type)) {
    levelData.types.push(element.type);
  }
}