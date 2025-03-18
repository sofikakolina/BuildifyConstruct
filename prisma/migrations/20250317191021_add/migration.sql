/*
  Warnings:

  - A unique constraint covering the columns `[path]` on the table `IFC` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[projectId]` on the table `IFC` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "IFC_path_key" ON "IFC"("path");

-- CreateIndex
CREATE UNIQUE INDEX "IFC_projectId_key" ON "IFC"("projectId");
