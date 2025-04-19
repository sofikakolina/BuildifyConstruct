/*
  Warnings:

  - A unique constraint covering the columns `[projectId]` on the table `IFC` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "ProcurementStatus" AS ENUM ('Initial', 'InWork', 'Check', 'ForCorrection', 'Complete');

-- CreateTable
CREATE TABLE "Procurement" (
    "id" TEXT NOT NULL,
    "status" "ProcurementStatus" NOT NULL DEFAULT 'Initial',
    "projectId" TEXT NOT NULL,

    CONSTRAINT "Procurement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_DocumentToProcurementDocuments" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_DocumentToProcurementDesigns" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_DocumentToProcurementDocumentation" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_DocumentToProcurementDeliveryDocs" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_DocumentToProcurementAccountingDocs" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_AssignedTasksForProcurement" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_AccountingDocmentToProcurementAccountingDocs" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_DocumentToProcurementDocuments_AB_unique" ON "_DocumentToProcurementDocuments"("A", "B");

-- CreateIndex
CREATE INDEX "_DocumentToProcurementDocuments_B_index" ON "_DocumentToProcurementDocuments"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_DocumentToProcurementDesigns_AB_unique" ON "_DocumentToProcurementDesigns"("A", "B");

-- CreateIndex
CREATE INDEX "_DocumentToProcurementDesigns_B_index" ON "_DocumentToProcurementDesigns"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_DocumentToProcurementDocumentation_AB_unique" ON "_DocumentToProcurementDocumentation"("A", "B");

-- CreateIndex
CREATE INDEX "_DocumentToProcurementDocumentation_B_index" ON "_DocumentToProcurementDocumentation"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_DocumentToProcurementDeliveryDocs_AB_unique" ON "_DocumentToProcurementDeliveryDocs"("A", "B");

-- CreateIndex
CREATE INDEX "_DocumentToProcurementDeliveryDocs_B_index" ON "_DocumentToProcurementDeliveryDocs"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_DocumentToProcurementAccountingDocs_AB_unique" ON "_DocumentToProcurementAccountingDocs"("A", "B");

-- CreateIndex
CREATE INDEX "_DocumentToProcurementAccountingDocs_B_index" ON "_DocumentToProcurementAccountingDocs"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_AssignedTasksForProcurement_AB_unique" ON "_AssignedTasksForProcurement"("A", "B");

-- CreateIndex
CREATE INDEX "_AssignedTasksForProcurement_B_index" ON "_AssignedTasksForProcurement"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_AccountingDocmentToProcurementAccountingDocs_AB_unique" ON "_AccountingDocmentToProcurementAccountingDocs"("A", "B");

-- CreateIndex
CREATE INDEX "_AccountingDocmentToProcurementAccountingDocs_B_index" ON "_AccountingDocmentToProcurementAccountingDocs"("B");

-- CreateIndex
CREATE UNIQUE INDEX "IFC_projectId_key" ON "IFC"("projectId");

-- AddForeignKey
ALTER TABLE "Procurement" ADD CONSTRAINT "Procurement_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "IFC"("projectId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DocumentToProcurementDocuments" ADD CONSTRAINT "_DocumentToProcurementDocuments_A_fkey" FOREIGN KEY ("A") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DocumentToProcurementDocuments" ADD CONSTRAINT "_DocumentToProcurementDocuments_B_fkey" FOREIGN KEY ("B") REFERENCES "Procurement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DocumentToProcurementDesigns" ADD CONSTRAINT "_DocumentToProcurementDesigns_A_fkey" FOREIGN KEY ("A") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DocumentToProcurementDesigns" ADD CONSTRAINT "_DocumentToProcurementDesigns_B_fkey" FOREIGN KEY ("B") REFERENCES "Procurement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DocumentToProcurementDocumentation" ADD CONSTRAINT "_DocumentToProcurementDocumentation_A_fkey" FOREIGN KEY ("A") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DocumentToProcurementDocumentation" ADD CONSTRAINT "_DocumentToProcurementDocumentation_B_fkey" FOREIGN KEY ("B") REFERENCES "Procurement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DocumentToProcurementDeliveryDocs" ADD CONSTRAINT "_DocumentToProcurementDeliveryDocs_A_fkey" FOREIGN KEY ("A") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DocumentToProcurementDeliveryDocs" ADD CONSTRAINT "_DocumentToProcurementDeliveryDocs_B_fkey" FOREIGN KEY ("B") REFERENCES "Procurement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DocumentToProcurementAccountingDocs" ADD CONSTRAINT "_DocumentToProcurementAccountingDocs_A_fkey" FOREIGN KEY ("A") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DocumentToProcurementAccountingDocs" ADD CONSTRAINT "_DocumentToProcurementAccountingDocs_B_fkey" FOREIGN KEY ("B") REFERENCES "Procurement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AssignedTasksForProcurement" ADD CONSTRAINT "_AssignedTasksForProcurement_A_fkey" FOREIGN KEY ("A") REFERENCES "Procurement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AssignedTasksForProcurement" ADD CONSTRAINT "_AssignedTasksForProcurement_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AccountingDocmentToProcurementAccountingDocs" ADD CONSTRAINT "_AccountingDocmentToProcurementAccountingDocs_A_fkey" FOREIGN KEY ("A") REFERENCES "Procurement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AccountingDocmentToProcurementAccountingDocs" ADD CONSTRAINT "_AccountingDocmentToProcurementAccountingDocs_B_fkey" FOREIGN KEY ("B") REFERENCES "paymentDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE;
