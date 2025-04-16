// scripts/seedTemplates.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.structureTemplate.createMany({
    data: [
      {
        name: "Прорабская",
        defaultDimensions: "5.85x2.45",
        defaultProject: "Сборно-разборный блок-контейнер",
        minAreaPerPerson: 3,
        areaCalculation: "perPerson",
        buildingCount: 1
      },
      {
        name: "Гардеробная",
        defaultDimensions: "6.00x4.90",
        defaultProject: "Раздевалка для строителей Краус",
        minAreaPerPerson: 0.6,
        areaCalculation: "perPerson",
        buildingCount: 1
      },
      {
        name: "Душевая",
        defaultDimensions: "5.85x2.45",
        defaultProject: "Раздевалка с душем маленькая",
        minAreaPerPerson: 0.43,
        areaCalculation: "perPerson",
        buildingCount: 2
      },
      {
        name: "Умывальная",
        defaultDimensions: "6x2.45",
        defaultProject: "Сантехнический модуль",
        minAreaPerPerson: 0.05,
        areaCalculation: "perPerson",
        buildingCount: 2
      },
      {
        name: "Сушильная",
        defaultDimensions: "5x2.3",
        defaultProject: "Металлическая бытовка БЖ-01 (5м) ДВП",
        minAreaPerPerson: 0.2,
        areaCalculation: "perPerson",
        buildingCount: 2
      },
      {
        name: "Помещение для обогрева, отдыха и принятия пищи",
        defaultDimensions: "5.85x2.45",
        defaultProject: "БК-00 ДВП",
        minAreaPerPerson: 0.9,
        areaCalculation: "perPerson",
        buildingCount: 1
      },
      {
        name: "Столовые",
        defaultDimensions: "5.85x2.45",
        defaultProject: "Блок контейнер БКОД-01",
        minAreaPerPerson: 1,
        areaCalculation: "perPerson",
        buildingCount: 1
      },
      {
        name: "Медпункт",
        defaultDimensions: "8x2.45",
        defaultProject: "Модульный фельдшерско акушерский пункт",
        minAreaPerPerson: 0.6,
        areaCalculation: "perPerson",
        buildingCount: 1
      },
      {
        name: "Кладовые (объектные)",
        defaultDimensions: "2.45x5.85",
        defaultProject: "БК-04 ДВП",
        minAreaPerPerson: 0.6,
        areaCalculation: "fixed",
        fixedArea: 25,
        buildingCount: 2
      },
      {
        name: "Кладовые (общеплощадочные)",
        defaultDimensions: "2.45x5.85",
        defaultProject: "БК-04 ДВП",
        minAreaPerPerson: 0.6,
        areaCalculation: "fixed",
        fixedArea: 60,
        buildingCount: 5
      },
      // Special template for toilet calculation
      {
        name: "Туалет",
        defaultDimensions: "1.2x1.2",
        defaultProject: "Санузел сборный",
        minAreaPerPerson: 1,
        areaCalculation: "fixed", // Will be overridden in calculation
        fixedArea: 0,
        buildingCount: 0 // Calculated dynamically
      }
    ],
    skipDuplicates: true
  });

  console.log("Successfully seeded all structure templates");
}

main()
  .catch(e => {
    console.error("Error seeding templates:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });