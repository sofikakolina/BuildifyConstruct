/*
  Warnings:

  - You are about to drop the column `normalHoursPeaple` on the `Gasn` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Gasn" DROP COLUMN "normalHoursPeaple",
ADD COLUMN     "normalHoursPeople" DOUBLE PRECISION NOT NULL DEFAULT 0;
