/*
  Warnings:

  - You are about to drop the column `url` on the `Document` table. All the data in the column will be lost.
  - Added the required column `name` to the `Document` table without a default value. This is not possible if the table is not empty.
  - Added the required column `path` to the `Document` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "IFC_projectId_key";

-- AlterTable
ALTER TABLE "Document" DROP COLUMN "url",
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "path" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "paymentDocument" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "paymentDocument_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "paymentDocument" ADD CONSTRAINT "paymentDocument_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IFC" ADD CONSTRAINT "IFC_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
