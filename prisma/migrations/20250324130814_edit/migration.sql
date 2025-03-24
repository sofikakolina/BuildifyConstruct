-- DropForeignKey
ALTER TABLE "Document" DROP CONSTRAINT "Document_taskId_fkey";

-- DropForeignKey
ALTER TABLE "paymentDocument" DROP CONSTRAINT "paymentDocument_taskId_fkey";

-- AlterTable
ALTER TABLE "Document" ALTER COLUMN "taskId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "paymentDocument" ALTER COLUMN "taskId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "paymentDocument" ADD CONSTRAINT "paymentDocument_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE SET NULL ON UPDATE CASCADE;
