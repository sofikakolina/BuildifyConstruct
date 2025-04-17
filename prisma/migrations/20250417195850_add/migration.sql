/*
  Warnings:

  - A unique constraint covering the columns `[projectId]` on the table `Calendar` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Calendar_projectId_key" ON "Calendar"("projectId");
