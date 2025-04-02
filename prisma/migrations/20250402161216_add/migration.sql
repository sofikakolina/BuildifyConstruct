-- CreateTable
CREATE TABLE "Roof" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "totalCount" INTEGER NOT NULL DEFAULT 0,
    "totalVolume" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalArea" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "projectId" TEXT,

    CONSTRAINT "Roof_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roof_elements" (
    "id" TEXT NOT NULL,
    "roofId" TEXT NOT NULL,
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

    CONSTRAINT "roof_elements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roof_materials" (
    "id" TEXT NOT NULL,
    "roofElementId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT,
    "thickness" DOUBLE PRECISION,
    "volume" DOUBLE PRECISION,
    "area" DOUBLE PRECISION,
    "elevation" DOUBLE PRECISION,
    "properties" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roof_materials_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Roof_totalVolume_idx" ON "Roof"("totalVolume");

-- CreateIndex
CREATE INDEX "Roof_totalCount_idx" ON "Roof"("totalCount");

-- CreateIndex
CREATE INDEX "Roof_totalArea_idx" ON "Roof"("totalArea");

-- CreateIndex
CREATE UNIQUE INDEX "roof_elements_GlobalId_key" ON "roof_elements"("GlobalId");

-- CreateIndex
CREATE INDEX "roof_elements_level_idx" ON "roof_elements"("level");

-- CreateIndex
CREATE INDEX "roof_elements_elevation_idx" ON "roof_elements"("elevation");

-- CreateIndex
CREATE INDEX "roof_elements_type_idx" ON "roof_elements"("type");

-- CreateIndex
CREATE INDEX "roof_materials_name_idx" ON "roof_materials"("name");

-- CreateIndex
CREATE INDEX "roof_materials_type_idx" ON "roof_materials"("type");

-- CreateIndex
CREATE INDEX "roof_materials_elevation_idx" ON "roof_materials"("elevation");

-- CreateIndex
CREATE INDEX "roof_materials_roofElementId_idx" ON "roof_materials"("roofElementId");

-- AddForeignKey
ALTER TABLE "Roof" ADD CONSTRAINT "Roof_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roof_elements" ADD CONSTRAINT "roof_elements_roofId_fkey" FOREIGN KEY ("roofId") REFERENCES "Roof"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roof_materials" ADD CONSTRAINT "roof_materials_roofElementId_fkey" FOREIGN KEY ("roofElementId") REFERENCES "roof_elements"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
