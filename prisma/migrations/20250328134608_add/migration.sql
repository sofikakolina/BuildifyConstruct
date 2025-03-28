/*
  Warnings:

  - You are about to drop the column `totalVOlume` on the `Beam` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Beam_totalVOlume_idx";

-- AlterTable
ALTER TABLE "Beam" DROP COLUMN "totalVOlume",
ADD COLUMN     "totalVolume" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "Beam_totalVolume_idx" ON "Beam"("totalVolume");
