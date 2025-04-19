/*
  Warnings:

  - Added the required column `name` to the `Procurement` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Procurement" ADD COLUMN     "description" TEXT,
ADD COLUMN     "details" TEXT,
ADD COLUMN     "name" TEXT NOT NULL;
