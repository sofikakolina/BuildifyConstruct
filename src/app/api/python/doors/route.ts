import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { execSync } from "child_process";
import path from "path";
import fs from "fs";

const prisma = new PrismaClient();

interface SlabLevelData {
  level: string;
  count: number;
  area: number;
  width: number;
  height: number;
  elevation?: number;
  types: string[];
  elements: SlabElementData[];
}

interface SlabElementData {
  name: string;
  globalId: string;
  type: string;
  area: number;
  width: number;
  height: number;
  level: string;
  elevation?: number;
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
    const baseDir = path.join(process.cwd(), 'src', 'app', 'api', 'python');
    const baseDirModel = path.join(process.cwd(), 'public');
    const scriptPath = path.join(baseDir, 'code', '17_02_2025_door.py');
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
    console.log(`Executing: ${command}`);
    
    const env = {
      ...process.env,
      PYTHONIOENCODING: 'utf-8',
      PYTHONUTF8: '1'
    };

    const output = execSync(command, {
      encoding: 'utf-8',
      stdio: 'pipe',
      windowsHide: true,
    //   shell: true,
      maxBuffer: 1024 * 1024 * 10, // 10MB buffer
      env: env
    });

    const { totalCount, totalArea, levelsData } = parsePythonOutput(output);
    await prisma.doorElement.deleteMany({ where: {} });
    await prisma.door.deleteMany({ where: {} });
    // Create main Slab record
    const slab = await prisma.door.create({
      data: {
        name: "Slab Analysis",
        totalCount,
        totalArea,
        projectId: ifc.projectId,
        description: `Generated from ${path.basename(modelPath)}`,
      },
    });
    const createPromises = levelsData.flatMap(levelData => 
      levelData.elements.map(element => 
        prisma.doorElement.create({
          data: {
            doorId: slab.id,
            name: element.name,
            globalId: element.globalId,
            type: element.type,
            level: element.level,
            elevation: element.elevation,
            area: element.area,
            width: element.width,
            height: element.height,
          }
        })
      )
    );

    await Promise.all(createPromises);

    return NextResponse.json({
      success: true,
      slab,
      levels: levelsData.length,
      elements: totalCount,
    });

  } catch (error) {
    console.error("Error processing slabs:", error);
    return NextResponse.json(
      { 
        error: "Failed to process slabs",
        details: error,
        suggestion: "Check file paths and Python environment"
      },
      { status: 500 }
    );
  }
}
function parsePythonOutput(output: string): {
    totalCount: number;
    totalArea: number;
    levelsData: SlabLevelData[];
  } {
    const lines = output.split("\n");
    let totalCount = 0;
    let totalArea = 0;
    const levelsData: SlabLevelData[] = [];
    let currentLevel: SlabLevelData | null = null;
    let currentElement: Partial<SlabElementData> | null = null;
  
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
  
      // Parse total count
      if (line.startsWith("Общее количество дверей:")) {
        totalCount = parseInt(line.split(":")[1].trim());
        continue;
      }
      
      // Parse total volume
      if (line.startsWith("Общий объем перекрытий:")) {
        const volumeStr = line.split(":")[1].trim().split(" ")[0];
        totalArea = parseFloat(volumeStr);
        continue;
      }
      
      // Parse level header (looking for "=== Уровень:" pattern)
      if (line.startsWith("=== Уровень:")) {
        const levelParts = line.split(":")[1].split("===")[0].trim().split("(");
        const levelName = levelParts[0].trim();
        
        // Extract elevation if available
        let elevation: number | undefined;
        if (levelParts.length > 1) {
          const elevationMatch = levelParts[1].match(/Отметка:\s*([\d.]+)\s*м/);
          if (elevationMatch) {
            elevation = parseFloat(elevationMatch[1]);
          }
        }
  
        currentLevel = {
          level: levelName,
          count: 0,
          area: 0,
          width: 0,
          height: 0,
          elevation,
          types: [],
          elements: [],
        };
        levelsData.push(currentLevel);
        continue;
      }
  
      // Start parsing a new slab element
      if (line.startsWith("Дверь") && line.includes(":")) {
        currentElement = {
          level: currentLevel?.level || 'Unknown Level',
          elevation: currentLevel?.elevation
        };
        continue;
      }
      
      // Parse element details if we have a currentElement
      if (currentElement) {
        if (line.includes("Название:")) {
          currentElement.name = line.split(":")[1].trim();
        } else if (line.includes("GlobalId:")) {
          currentElement.globalId = line.split(":")[1].trim();
        } else if (line.includes("Тип:")) {
          currentElement.type = line.split(":")[1].trim();
        } else if (line.includes("Площадь:")) {
          const volumeStr = line.split(":")[1].trim().split(" ")[0];
          currentElement.area = parseFloat(volumeStr);
        } else if (line.includes("Высота:")) {
          const volumeStr = line.split(":")[1].trim().split(" ")[0];
          currentElement.height = parseFloat(volumeStr);
        } else if (line.includes("Ширина:")) {
          const volumeStr = line.split(":")[1].trim().split(" ")[0];
          currentElement.width = parseFloat(volumeStr);
        } else if (line.includes("Уровень:")) {
          currentElement.level = line.split(":")[1].trim();
        } else if (line.includes("Отметка уровня:")) {
          const elevationStr = line.split(":")[1].trim().split(" ")[0];
          if (elevationStr !== "N/A") {
            currentElement.elevation = parseFloat(elevationStr);
          }
        }
        
        // When we hit an empty line or next element, save the current element
        if (line === "" || i === lines.length - 1 || lines[i+1].trim().startsWith("Дверь")) {
          if (currentElement.name && currentElement.globalId && currentElement.type && currentElement.area !== undefined && currentElement.width !== undefined && currentElement.height !== undefined) {
            // Find or create the level in levelsData
            let levelData = levelsData.find(l => l.level === currentElement?.level);
            if (!levelData) {
              levelData = {
                level: currentElement.level || 'Unknown Level',
                count: 0,
                area: 0,
                width: 0,
                height: 0,
                elevation: currentElement.elevation,
                types: [],
                elements: []
              };
              levelsData.push(levelData);
            }
            
            // Add the element to the level
            levelData.elements.push({
              name: currentElement.name,
              globalId: currentElement.globalId,
              type: currentElement.type,
              area: currentElement.area,
              width: currentElement.width,
              height: currentElement.height,
              level: currentElement.level || 'Unknown Level',
              elevation: currentElement.elevation
            });
            
            // Update level stats
            levelData.count += 1;
            levelData.area += currentElement.area;
            if (!levelData.types.includes(currentElement.type)) {
              levelData.types.push(currentElement.type);
            }
          }
          currentElement = null;
        }
      }
    }
  
    return { totalCount, totalArea, levelsData };
  }