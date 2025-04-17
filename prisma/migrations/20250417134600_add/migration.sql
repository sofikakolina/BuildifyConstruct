-- CreateTable
CREATE TABLE "photoReport" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cost" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "paths" TEXT[],
    "projectId" TEXT NOT NULL,
    "taskId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "photoReport_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "photoReport" ADD CONSTRAINT "photoReport_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "photoReport" ADD CONSTRAINT "photoReport_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE SET NULL ON UPDATE CASCADE;
