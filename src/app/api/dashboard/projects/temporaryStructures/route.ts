// app/api/dashboard/projects/temporaryStructures/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { 
      workersPerShift, 
      totalWorkers,
      coefficient1,
      coefficient2,
      calculationId
    } = await request.json();

    // Calculate worker counts
    const itr = Math.ceil(totalWorkers * 0.08);
    const employees = Math.ceil(totalWorkers * 0.05);
    const security = Math.ceil(totalWorkers * 0.03);
    const workersInBusiestShift = Math.ceil(totalWorkers * 0.85);
    const women = Math.ceil(workersInBusiestShift * 0.3);
    const men = Math.ceil(workersInBusiestShift * 0.7);

    // Get all structure templates
    const templates = await prisma.structureTemplate.findMany();

    let calculation;
    
    if (calculationId) {
      // Update existing calculation
      calculation = await prisma.calculation.update({
        where: { id: calculationId },
        data: {
          workersPerShift,
          totalWorkers,
          coefficient1,
          coefficient2,
          itr,
          employees,
          security,
          workersInBusiestShift,
          women,
          men,
          calculatedAt: new Date()
        }
      });

      // Delete old structures
      await prisma.temporaryStructure.deleteMany({
        where: { calculationId }
      });
    } else {
      // Create new calculation
      calculation = await prisma.calculation.create({
        data: {
          workersPerShift,
          totalWorkers,
          coefficient1,
          coefficient2,
          itr,
          employees,
          security,
          workersInBusiestShift,
          women,
          men,
          calculatedAt: new Date()
        }
      });
    }

    // Create structures based on templates
    const structuresData = templates.map(template => {
      // Calculate staff count based on structure type
      let numberOfStaff = 0;
      if (template.name.includes('Прорабская')) numberOfStaff = itr;
      else if (template.name.includes('Гардеробная') || 
               template.name.includes('Умывальная') || 
               template.name.includes('Столовые') || 
               template.name.includes('Медпункт')) numberOfStaff = totalWorkers;
      else numberOfStaff = workersInBusiestShift;

      // Calculate area
      let EstimatedArea = 0;
      if (template.areaCalculation === 'perPerson') {
        EstimatedArea = numberOfStaff * template.minAreaPerPerson;
      } else {
        EstimatedArea = template.fixedArea || 0;
      }

      // Calculate dimensions
      const [length, width] = template.defaultDimensions.split(/[xх×]/).map(parseFloat);
      const AcceptedArea = length * width * template.buildingCount;

      return {
        name: template.name,
        numberOfStaff,
        maximumOfWorkers: workersInBusiestShift,
        standardOnOneman: template.minAreaPerPerson,
        EstimatedArea,
        AcceptedArea,
        dimensionsInPlan: template.defaultDimensions,
        numberOfBuildings: template.buildingCount,
        standardProjectUsed: template.defaultProject,
        calculationId: calculation.id
      };
    });

    // Special handling for toilets
    const womenToilets = Math.ceil(women / 15);
    const menToilets = Math.ceil(men / 30);
    const totalToilets = womenToilets + menToilets;

    const toiletStructure = {
      name: "Туалет",
      numberOfStaff: women + men,
      maximumOfWorkers: workersInBusiestShift,
      standardOnOneman: 1,
      EstimatedArea: (women * 1) + (men * 2),
      AcceptedArea: totalToilets * 1.2 * 1.2,
      dimensionsInPlan: "1.2x1.2",
      numberOfBuildings: totalToilets,
      standardProjectUsed: "Санузел сборный",
      calculationId: calculation.id
    };

    // Store all structures
    const createdStructures = await prisma.$transaction([
      ...structuresData.map(structure => 
        prisma.temporaryStructure.create({ data: structure })
      ),
      prisma.temporaryStructure.create({ data: toiletStructure })
    ]);

    return NextResponse.json({
      calculation,
      structures: createdStructures
    });
  } catch (error) {
    console.error('Error calculating structures:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}