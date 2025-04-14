/*
  Warnings:

  - You are about to drop the column `laborCostTime` on the `Gasn` table. All the data in the column will be lost.
  - You are about to drop the column `machineTime` on the `Gasn` table. All the data in the column will be lost.
  - You are about to drop the column `teamConsists` on the `Gasn` table. All the data in the column will be lost.
  - You are about to drop the column `workerscostTime` on the `Gasn` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Gasn" DROP COLUMN "laborCostTime",
DROP COLUMN "machineTime",
DROP COLUMN "teamConsists",
DROP COLUMN "workerscostTime",
ADD COLUMN     "countOfUnit" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "normalHoursMashine" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "normalHoursPeaple" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "volumeCalculation" TEXT,
ADD COLUMN     "workVolume" DOUBLE PRECISION NOT NULL DEFAULT 0;
