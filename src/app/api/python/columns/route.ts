import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { execSync } from "child_process";
import path from "path";
import fs from "fs";

const prisma = new PrismaClient();

interface ColumnLevelData {
  level: string;
  count: number;
  volume: number;
  elevation?: number;
  types: string[];
  elements: ColumnElementData[];
}

interface ColumnElementData {
  name: string;
  globalId: string;
  type: string;
  volume: number;
  level: string;
  elevation?: number;
}

export async function GET() {
  try {
    // 1. Configure paths
    const pythonExecutable = 'C:\\Users\\sofikakolina\\AppData\\Local\\Programs\\Python\\Python312\\python.exe';
    
    // 2. Get absolute paths
    const baseDir = path.join(process.cwd(), 'src', 'app', 'api', 'python');
    const scriptPath = path.join(baseDir, 'code', '17_02_2025_column.py');
    const modelPath = path.join(baseDir, 'code', 'models', 'КолдинТЭ_2-2_revit.ifc');

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
    console.log(output)
    console.log(levelsData)
    // Create main Slab record
    const column = await prisma.column.create({
      data: {
        name: "Column Analysis",
        totalCount,
        totalVolume,
        description: `Generated from ${path.basename(modelPath)}`,
      },
    });

    // Create all SlabElement records with elevation
    const createPromises = levelsData.flatMap(levelData => 
      levelData.elements.map(element => 
        prisma.columnElement.create({
          data: {
            columnId: column.id,
            name: element.name,
            globalId: element.globalId,
            type: element.type,
            level: element.level,
            elevation: element.elevation,
            volume: element.volume,
          }
        })
      )
    );

    await Promise.all(createPromises);

    return NextResponse.json({
      success: true,
      column,
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
    levelsData: ColumnLevelData[];
  } {
    const lines = output.split("\n");
    let totalCount = 0;
    let totalVolume = 0;
    const levelsData: ColumnLevelData[] = [];
    let currentLevel: ColumnLevelData | null = null;
    let currentElement: Partial<ColumnElementData> | null = null;
  
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
  
      // Parse total count
      if (line.startsWith("Общее количество колонн:")) {
        totalCount = parseInt(line.split(":")[1].trim());
        continue;
      }
      
      // Parse total volume
      if (line.startsWith("Общий объем бетона:")) {
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
          elevation,
          types: [],
          elements: [],
        };
        levelsData.push(currentLevel);
        continue;
      }
  
      // Start parsing a new slab element
      if (line.startsWith("Колонна") && line.includes(":")) {
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
        } else if (line.includes("Уровень:")) {
          currentElement.level = line.split(":")[1].trim();
        } else if (line.includes("Отметка уровня:")) {
          const elevationStr = line.split(":")[1].trim().split(" ")[0];
          if (elevationStr !== "N/A") {
            currentElement.elevation = parseFloat(elevationStr);
          }
        }
        
        // When we hit an empty line or next element, save the current element
        if (line === "" || i === lines.length - 1 || lines[i+1].trim().startsWith("Перекрытие")) {
          if (currentElement.name && currentElement.globalId && currentElement.type && currentElement.volume !== undefined) {
            // Find or create the level in levelsData
            let levelData = levelsData.find(l => l.level === currentElement?.level);
            if (!levelData) {
              levelData = {
                level: currentElement.level || 'Unknown Level',
                count: 0,
                volume: 0,
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