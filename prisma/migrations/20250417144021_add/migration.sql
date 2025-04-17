/*
  Warnings:

  - You are about to drop the column `paths` on the `photoReport` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "photoReport" DROP COLUMN "paths";

-- CreateTable
CREATE TABLE "PhotoReportImage" (
    "id" TEXT NOT NULL,
    "photoReportId" TEXT NOT NULL,
    "src" TEXT NOT NULL,

    CONSTRAINT "PhotoReportImage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PhotoReportImage" ADD CONSTRAINT "PhotoReportImage_photoReportId_fkey" FOREIGN KEY ("photoReportId") REFERENCES "photoReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;
