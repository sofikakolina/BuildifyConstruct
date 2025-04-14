/*
  Warnings:

  - You are about to drop the column `numberOfChanges` on the `Gasn` table. All the data in the column will be lost.
  - You are about to drop the column `numberOfMashine` on the `Gasn` table. All the data in the column will be lost.
  - You are about to drop the column `numberOfWorkers` on the `Gasn` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Gasn" DROP COLUMN "numberOfChanges",
DROP COLUMN "numberOfMashine",
DROP COLUMN "numberOfWorkers";

-- CreateTable
CREATE TABLE "WorkVolume" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "volumeWork" DOUBLE PRECISION NOT NULL,
    "numberOfWorkers" INTEGER NOT NULL DEFAULT 0,
    "numberOfMashine" INTEGER NOT NULL DEFAULT 0,
    "numberOfChanges" INTEGER NOT NULL DEFAULT 0,
    "gasnId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "projectId" TEXT,

    CONSTRAINT "WorkVolume_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "WorkVolume" ADD CONSTRAINT "WorkVolume_gasnId_fkey" FOREIGN KEY ("gasnId") REFERENCES "Gasn"("id") ON DELETE SET NULL ON UPDATE CASCADE;
