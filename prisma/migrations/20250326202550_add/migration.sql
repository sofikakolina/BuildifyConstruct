/*
  Warnings:

  - You are about to drop the column `slabId` on the `column_elements` table. All the data in the column will be lost.
  - Added the required column `columnId` to the `column_elements` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "column_elements" DROP CONSTRAINT "column_elements_slabId_fkey";

-- AlterTable
ALTER TABLE "column_elements" DROP COLUMN "slabId",
ADD COLUMN     "columnId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "column_elements" ADD CONSTRAINT "column_elements_columnId_fkey" FOREIGN KEY ("columnId") REFERENCES "Column"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
