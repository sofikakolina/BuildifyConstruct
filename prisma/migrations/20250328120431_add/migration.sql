/*
  Warnings:

  - You are about to drop the column `columnId` on the `door_elements` table. All the data in the column will be lost.
  - Added the required column `doorId` to the `door_elements` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "door_elements" DROP CONSTRAINT "door_elements_columnId_fkey";

-- AlterTable
ALTER TABLE "door_elements" DROP COLUMN "columnId",
ADD COLUMN     "doorId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "door_elements" ADD CONSTRAINT "door_elements_doorId_fkey" FOREIGN KEY ("doorId") REFERENCES "Door"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
