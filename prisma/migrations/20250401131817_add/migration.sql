-- CreateTable
CREATE TABLE "Wall" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "totalCount" INTEGER NOT NULL DEFAULT 0,
    "totalVolume" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalArea" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "projectId" TEXT,

    CONSTRAINT "Wall_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wall_elements" (
    "id" TEXT NOT NULL,
    "wallId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "GlobalId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "level" TEXT,
    "elevation" DOUBLE PRECISION,
    "volume" DOUBLE PRECISION,
    "area" DOUBLE PRECISION,
    "height" DOUBLE PRECISION,
    "length" DOUBLE PRECISION,
    "width" DOUBLE PRECISION,
    "properties" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wall_elements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wall_materials" (
    "id" TEXT NOT NULL,
    "wallElementId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT,
    "thickness" DOUBLE PRECISION,
    "volume" DOUBLE PRECISION,
    "area" DOUBLE PRECISION,
    "elevation" DOUBLE PRECISION,
    "properties" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wall_materials_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Wall_totalVolume_idx" ON "Wall"("totalVolume");

-- CreateIndex
CREATE INDEX "Wall_totalCount_idx" ON "Wall"("totalCount");

-- CreateIndex
CREATE INDEX "Wall_totalArea_idx" ON "Wall"("totalArea");

-- CreateIndex
CREATE UNIQUE INDEX "wall_elements_GlobalId_key" ON "wall_elements"("GlobalId");

-- CreateIndex
CREATE INDEX "wall_elements_level_idx" ON "wall_elements"("level");

-- CreateIndex
CREATE INDEX "wall_elements_elevation_idx" ON "wall_elements"("elevation");

-- CreateIndex
CREATE INDEX "wall_elements_type_idx" ON "wall_elements"("type");

-- CreateIndex
CREATE INDEX "wall_materials_name_idx" ON "wall_materials"("name");

-- CreateIndex
CREATE INDEX "wall_materials_type_idx" ON "wall_materials"("type");

-- CreateIndex
CREATE INDEX "wall_materials_elevation_idx" ON "wall_materials"("elevation");

-- CreateIndex
CREATE INDEX "wall_materials_wallElementId_idx" ON "wall_materials"("wallElementId");

-- AddForeignKey
ALTER TABLE "Wall" ADD CONSTRAINT "Wall_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wall_elements" ADD CONSTRAINT "wall_elements_wallId_fkey" FOREIGN KEY ("wallId") REFERENCES "Wall"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wall_materials" ADD CONSTRAINT "wall_materials_wallElementId_fkey" FOREIGN KEY ("wallElementId") REFERENCES "wall_elements"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
