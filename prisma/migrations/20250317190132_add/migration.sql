/*
  Warnings:

  - Added the required column `name` to the `IFC` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "IFC" ADD COLUMN     "name" TEXT NOT NULL;
