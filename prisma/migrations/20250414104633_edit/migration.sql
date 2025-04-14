/*
  Warnings:

  - You are about to drop the column `workers` on the `Gasn` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Gasn" DROP COLUMN "workers",
ADD COLUMN     "workerscostTime" DOUBLE PRECISION NOT NULL DEFAULT 0;
