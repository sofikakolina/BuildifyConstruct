-- AlterTable
ALTER TABLE "Slab" ALTER COLUMN "totalCount" SET DEFAULT 0,
ALTER COLUMN "totalVolume" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "slab_elements" ADD COLUMN     "volume" DOUBLE PRECISION;

-- CreateIndex
CREATE INDEX "Slab_totalCount_idx" ON "Slab"("totalCount");

-- CreateIndex
CREATE INDEX "Slab_totalVolume_idx" ON "Slab"("totalVolume");

-- CreateIndex
CREATE INDEX "slab_elements_level_idx" ON "slab_elements"("level");

-- CreateIndex
CREATE INDEX "slab_elements_elevation_idx" ON "slab_elements"("elevation");

-- CreateIndex
CREATE INDEX "slab_elements_type_idx" ON "slab_elements"("type");
