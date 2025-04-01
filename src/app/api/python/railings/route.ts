import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { execSync } from "child_process";
import path from "path";
import fs from "fs";

const prisma = new PrismaClient();

interface RailingLevelData {
  level: string;
  count: number;
  totalLength: number;
  elevation?: number;
  types: string[];
  elements: RailingElementData[];
}

interface RailingElementData {
  name: string;
  globalId: string;
  type: string;
  length: number;
  height: number;
  material: string;
  level: string;
  elevation?: number;
  lengthSource: string;
}

export async function GET() {
  try {
    // 1. Configure paths
    const pythonExecutable = 'C:\\Users\\sofikakolina\\AppData\\Local\\Programs\\Python\\Python312\\python.exe';
    
    // 2. Get absolute paths
    const baseDir = path.join(process.cwd(), 'src', 'app', 'api', 'python');
    const scriptPath = path.join(baseDir, 'code', '25_03_2025_railing.py');
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
      maxBuffer: 1024 * 1024 * 10, // 10MB buffer
      env: env
    });

    // 5. Parse and store results
    const { totalCount, totalLength, levelsData } = parsePythonOutput(output);
    
    // Create main Railing record
    const railing = await prisma.railing.create({
      data: {
        name: "Railing Analysis",
        totalCount,
        totalLength,
        description: `Generated from ${path.basename(modelPath)}`,
      },
    });

    // Create all RailingElement records
    const createPromises = levelsData.flatMap(levelData => 
      levelData.elements.map(element => 
        prisma.railingElement.create({
          data: {
            railingId: railing.id,
            name: element.name,
            globalId: element.globalId,
            type: element.type,
            length: element.length,
            height: element.height,
            material: element.material,
            level: element.level,
            elevation: element.elevation,
            // lengthSource: element.lengthSource
          }
        })
      )
    );

    await Promise.all(createPromises);

    return NextResponse.json({
      success: true,
      railing,
      levels: levelsData.length,
      elements: totalCount,
    });

  } catch (error) {
    console.error("Error processing railings:", error);
    return NextResponse.json(
      { 
        error: "Failed to process railings",
        details: error instanceof Error ? error.message : String(error),
        suggestion: "Check file paths and Python environment"
      },
      { status: 500 }
    );
  }
}

function parsePythonOutput(output: string): {
  totalCount: number;
  totalLength: number;
  levelsData: RailingLevelData[];
} {
  const lines = output.split("\n");
  let totalCount = 0;
  let totalLength = 0;
  const levelsData: RailingLevelData[] = [];
  let currentLevel: RailingLevelData | null = null;
  let currentElement: Partial<RailingElementData> | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Parse total count
    if (line.startsWith("Общее количество перил:")) {
      totalCount = parseInt(line.split(":")[1].trim());
      continue;
    }
    
    // Parse total length
    if (line.startsWith("Общая длина перил:")) {
      const lengthStr = line.split(":")[1].trim().split(" ")[0];
      totalLength = parseFloat(lengthStr);
      continue;
    }
    
    // Parse level information (looking for "Перила X:" pattern)
    if (line.startsWith("Перила") && line.includes(":")) {
      // If we have a previous element, save it
      if (currentElement && currentElement.name && currentElement.globalId) {
        saveElement(currentElement, levelsData);
      }
      
      currentElement = {
        lengthSource: 'Parameters' // Default source
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
      } else if (line.includes("Длина:")) {
        const lengthParts = line.split(":")[1].trim().split(" ");
        currentElement.length = parseFloat(lengthParts[0]);
        if (lengthParts.length > 1 && lengthParts[1].includes("источник")) {
          currentElement.lengthSource = lengthParts[1].replace(/\(источник:\s*([^)]+)\)/, '$1').trim();
        }
      } else if (line.includes("Высота:")) {
        currentElement.height = parseFloat(line.split(":")[1].trim().split(" ")[0]);
      } else if (line.includes("Материал:")) {
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
      if (line === "" || i === lines.length - 1 || lines[i+1].trim().startsWith("Перила")) {
        if (currentElement.name && currentElement.globalId) {
          saveElement(currentElement, levelsData);
        }
        currentElement = null;
      }
    }
  }

  return { totalCount, totalLength, levelsData };
}

function saveElement(element: Partial<RailingElementData>, levelsData: RailingLevelData[]) {
  if (!element.name || !element.globalId || !element.type || element.length === undefined) return;

  // Find or create the level in levelsData
  let levelData = levelsData.find(l => l.level === element.level);
  if (!levelData) {
    levelData = {
      level: element.level || 'Unknown Level',
      count: 0,
      totalLength: 0,
      elevation: element.elevation,
      types: [],
      elements: []
    };
    levelsData.push(levelData);
  }
  
  // Create the full element data
  const fullElement: RailingElementData = {
    name: element.name,
    globalId: element.globalId,
    type: element.type,
    length: element.length || 0,
    height: element.height || 0,
    material: element.material || 'Не указан',
    level: element.level || 'Unknown Level',
    elevation: element.elevation,
    lengthSource: element.lengthSource || 'Parameters'
  };
  
  // Add the element to the level
  levelData.elements.push(fullElement);
  
  // Update level stats
  levelData.count += 1;
  levelData.totalLength += fullElement.length;
  if (!levelData.types.includes(fullElement.type)) {
    levelData.types.push(fullElement.type);
  }
  
  // Update elevation if not set
  if (fullElement.elevation !== undefined && levelData.elevation === undefined) {
    levelData.elevation = fullElement.elevation;
  }
}