import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { execSync } from "child_process";
import path from "path";
import fs from "fs";

const prisma = new PrismaClient();

interface SlabLevelData {
  level: string;
  count: number;
  volume: number;
  width: number;
  height: number;
  length: number;
  material?: string;
  elevation?: number;
  types: string[];
  elements: SlabElementData[];
}

interface SlabElementData {
  name: string;
  globalId: string;
  type: string;
  volume: number;
  width: number;
  height: number;
  length: number;
  material?: string;
  level: string;
  elevation?: number;
}


export async function GET(request:NextRequest) {
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
    const modelPath = path.join(baseDirModel, ifc.path);
    const scriptPath = path.join(baseDir, 'code', '22.02.2025_beam.py');

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

    // 5. Parse and store results
    const { totalCount, totalVolume, levelsData } = parsePythonOutput(output);
    await prisma.beamElement.deleteMany({ where: {} });
    await prisma.beam.deleteMany({ where: {} });

    // Create main Slab record
    const slab = await prisma.beam.create({
      data: {
        name: "Slab Analysis",
        totalCount,
        projectId: ifc.projectId,
        totalVolume,
        description: `Generated from ${path.basename(modelPath)}`,
      },
    });
    // Create all SlabElement records with elevation
    const createPromises = levelsData.flatMap(levelData => 
      levelData.elements.map(element => 
        prisma.beamElement.create({
          data: {
            beamId: slab.id,
            name: element.name,
            globalId: element.globalId,
            type: element.type,
            level: element.level,
            elevation: element.elevation,
            volume: element.volume,
            width: element.width,
            height: element.height,
            length: element.length,
            material: element.material,
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
    totalVolume: number;
    levelsData: SlabLevelData[];
  } {
    const lines = output.split("\n");
    let totalCount = 0;
    let totalVolume = 0;
    const levelsData: SlabLevelData[] = [];
    let currentLevel: SlabLevelData | null = null;
    let currentElement: Partial<SlabElementData> | null = null;
  
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
  
      // Parse total count
      if (line.startsWith("Общее количество балок:")) {
        totalCount = parseInt(line.split(":")[1].trim());
        continue;
      }
      
      // Parse total volume
      if (line.startsWith("Общий объем всех балок:")) {
        const volumeStr = line.split(":")[1].trim().split(" ")[0];
        totalVolume = parseFloat(volumeStr);
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
          volume: 0,
          width: 0,
          height: 0,
          length: 0,
          material:"",
          elevation,
          types: [],
          elements: [],
        };
        levelsData.push(currentLevel);
        continue;
      }
  
      // Start parsing a new slab element
      if (line.startsWith("Балка") && line.includes(":")) {
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
        } else if (line.includes("Объем:")) {
          const volumeStr = line.split(":")[1].trim().split(" ")[0];
          currentElement.volume = parseFloat(volumeStr);
        } else if (line.includes("Высота:")) {
          const volumeStr = line.split(":")[1].trim().split(" ")[0];
          currentElement.height = parseFloat(volumeStr);
        } else if (line.includes("Ширина:")) {
          const volumeStr = line.split(":")[1].trim().split(" ")[0];
          currentElement.width = parseFloat(volumeStr);
        } else if (line.includes("Длина:")) {
          const volumeStr = line.split(":")[1].trim().split(" ")[0];
          currentElement.length = parseFloat(volumeStr);
        } else if (line.includes("Материалы:")) {
          // const volumeStr = line.split(":")[1].trim().split(" ")[0];
          currentElement.material = line.split(":")[1].trim();
        } else if (line.includes("Уровень:")) {
          currentElement.level = line.split(":")[1].trim();
        } else if (line.includes("Отметка уровня:")) {
          const elevationStr = line.split(":")[1].trim().split(" ")[0];
          if (elevationStr !== "N/A") {
            currentElement.elevation = parseFloat(elevationStr);
          }
        }
        
        // When we hit an empty line or next element, save the current element
        if (line === "" || i === lines.length - 1 || lines[i+1].trim().startsWith("Балка")) {
          if (currentElement.name && currentElement.globalId && currentElement.type && currentElement.volume !== undefined && currentElement.width !== undefined && currentElement.height !== undefined && currentElement.length !== undefined ) {
            // Find or create the level in levelsData
            let levelData = levelsData.find(l => l.level === currentElement?.level);
            if (!levelData) {
              levelData = {
                level: currentElement.level || 'Unknown Level',
                count: 0,
                volume: 0,
                width: 0,
                height: 0,
                length: 0,
                material: "",
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
              volume: currentElement.volume,
              width: currentElement.width,
              height: currentElement.height,
              length: currentElement.length,
              material: currentElement.material,
              level: currentElement.level || 'Unknown Level',
              elevation: currentElement.elevation
            });
            
            // Update level stats
            levelData.count += 1;
            levelData.volume += currentElement.volume;
            if (!levelData.types.includes(currentElement.type)) {
              levelData.types.push(currentElement.type);
            }
          }
          currentElement = null;
        }
      }
    }
  
    return { totalCount, totalVolume, levelsData };
  }