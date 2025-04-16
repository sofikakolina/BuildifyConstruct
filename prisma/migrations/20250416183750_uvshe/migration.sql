/*
  Warnings:

  - You are about to drop the `TemporaryStructures` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "TemporaryStructures";

-- CreateTable
CREATE TABLE "Calculation" (
    "id" TEXT NOT NULL,
    "workersPerShift" INTEGER NOT NULL,
    "totalWorkers" INTEGER NOT NULL,
    "coefficient1" DOUBLE PRECISION NOT NULL,
    "coefficient2" DOUBLE PRECISION NOT NULL,
    "itr" INTEGER NOT NULL,
    "employees" INTEGER NOT NULL,
    "security" INTEGER NOT NULL,
    "workersInBusiestShift" INTEGER NOT NULL,
    "women" INTEGER NOT NULL,
    "men" INTEGER NOT NULL,
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Calculation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TemporaryStructure" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "numberOfStaff" INTEGER NOT NULL,
    "maximumOfWorkers" INTEGER NOT NULL,
    "standardOnOneman" DOUBLE PRECISION NOT NULL,
    "EstimatedArea" DOUBLE PRECISION NOT NULL,
    "AcceptedArea" DOUBLE PRECISION NOT NULL,
    "dimensionsInPlan" TEXT,
    "numberOfBuildings" INTEGER NOT NULL,
    "standardProjectUsed" TEXT,
    "calculationId" TEXT NOT NULL,

    CONSTRAINT "TemporaryStructure_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TemporaryStructure" ADD CONSTRAINT "TemporaryStructure_calculationId_fkey" FOREIGN KEY ("calculationId") REFERENCES "Calculation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
