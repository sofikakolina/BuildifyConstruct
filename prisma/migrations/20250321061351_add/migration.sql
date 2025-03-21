/*
  Warnings:

  - Added the required column `taskId` to the `Document` table without a default value. This is not possible if the table is not empty.
  - Added the required column `taskId` to the `paymentDocument` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "taskId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "paymentDocument" ADD COLUMN     "taskId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "paymentDocument" ADD CONSTRAINT "paymentDocument_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
