/*
  Warnings:

  - Added the required column `cost` to the `paymentDocument` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "paymentDocument" ADD COLUMN     "cost" INTEGER NOT NULL;
