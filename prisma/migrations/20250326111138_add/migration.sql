/*
  Warnings:

  - Added the required column `totalCount` to the `Slab` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalVolume` to the `Slab` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Slab" ADD COLUMN     "totalCount" INTEGER NOT NULL,
ADD COLUMN     "totalVolume" INTEGER NOT NULL;
