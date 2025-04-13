-- AlterTable
ALTER TABLE "beam_elements" ADD COLUMN     "gasnId" TEXT;

-- AlterTable
ALTER TABLE "column_elements" ADD COLUMN     "gasnId" TEXT;

-- AlterTable
ALTER TABLE "door_elements" ADD COLUMN     "gasnId" TEXT;

-- AlterTable
ALTER TABLE "railing_elements" ADD COLUMN     "gasnId" TEXT;

-- AlterTable
ALTER TABLE "roof_materials" ADD COLUMN     "gasnId" TEXT;

-- AlterTable
ALTER TABLE "slab_elements" ADD COLUMN     "gasnId" TEXT;

-- AlterTable
ALTER TABLE "stair_elements" ADD COLUMN     "gasnId" TEXT;

-- AlterTable
ALTER TABLE "wall_materials" ADD COLUMN     "gasnId" TEXT;

-- AlterTable
ALTER TABLE "window_elements" ADD COLUMN     "gasnId" TEXT;

-- CreateTable
CREATE TABLE "Gasn" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "laborCost" DOUBLE PRECISION NOT NULL,
    "machine" TEXT NOT NULL,
    "machineTime" DOUBLE PRECISION NOT NULL,
    "workers" INTEGER NOT NULL,
    "crew" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "projectId" TEXT,

    CONSTRAINT "Gasn_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "slab_elements" ADD CONSTRAINT "slab_elements_gasnId_fkey" FOREIGN KEY ("gasnId") REFERENCES "Gasn"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "column_elements" ADD CONSTRAINT "column_elements_gasnId_fkey" FOREIGN KEY ("gasnId") REFERENCES "Gasn"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "door_elements" ADD CONSTRAINT "door_elements_gasnId_fkey" FOREIGN KEY ("gasnId") REFERENCES "Gasn"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "window_elements" ADD CONSTRAINT "window_elements_gasnId_fkey" FOREIGN KEY ("gasnId") REFERENCES "Gasn"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "beam_elements" ADD CONSTRAINT "beam_elements_gasnId_fkey" FOREIGN KEY ("gasnId") REFERENCES "Gasn"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stair_elements" ADD CONSTRAINT "stair_elements_gasnId_fkey" FOREIGN KEY ("gasnId") REFERENCES "Gasn"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "railing_elements" ADD CONSTRAINT "railing_elements_gasnId_fkey" FOREIGN KEY ("gasnId") REFERENCES "Gasn"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wall_materials" ADD CONSTRAINT "wall_materials_gasnId_fkey" FOREIGN KEY ("gasnId") REFERENCES "Gasn"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roof_materials" ADD CONSTRAINT "roof_materials_gasnId_fkey" FOREIGN KEY ("gasnId") REFERENCES "Gasn"("id") ON DELETE SET NULL ON UPDATE CASCADE;
