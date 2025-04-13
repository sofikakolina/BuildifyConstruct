/*
  Warnings:

  - You are about to drop the column `laborCost` on the `Gasn` table. All the data in the column will be lost.
  - Added the required column `justification` to the `Gasn` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Gasn" DROP COLUMN "laborCost",
ADD COLUMN     "justification" TEXT NOT NULL,
ADD COLUMN     "laborCostTime" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "numberOfChanges" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "numberOfMashine" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "numberOfWorkers" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "teamConsists" TEXT,
ALTER COLUMN "machineTime" SET DEFAULT 0,
ALTER COLUMN "workers" SET DEFAULT 0;
