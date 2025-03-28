/*
  Warnings:

  - You are about to drop the column `totalVolume` on the `Door` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Door_totalVolume_idx";

-- AlterTable
ALTER TABLE "Door" DROP COLUMN "totalVolume",
ADD COLUMN     "totalArea" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "Door_totalArea_idx" ON "Door"("totalArea");
