-- CreateTable
CREATE TABLE "Column" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "totalCount" INTEGER NOT NULL DEFAULT 0,
    "totalVolume" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "projectId" TEXT,

    CONSTRAINT "Column_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "column_elements" (
    "id" TEXT NOT NULL,
    "slabId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "GlobalId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "level" TEXT,
    "elevation" DOUBLE PRECISION,
    "volume" DOUBLE PRECISION,
    "area" DOUBLE PRECISION,
    "thickness" DOUBLE PRECISION,
    "material" TEXT,
    "IFCType" TEXT,
    "properties" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "column_elements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Column_totalCount_idx" ON "Column"("totalCount");

-- CreateIndex
CREATE INDEX "Column_totalVolume_idx" ON "Column"("totalVolume");

-- CreateIndex
CREATE UNIQUE INDEX "column_elements_GlobalId_key" ON "column_elements"("GlobalId");

-- CreateIndex
CREATE INDEX "column_elements_level_idx" ON "column_elements"("level");

-- CreateIndex
CREATE INDEX "column_elements_elevation_idx" ON "column_elements"("elevation");

-- CreateIndex
CREATE INDEX "column_elements_type_idx" ON "column_elements"("type");

-- AddForeignKey
ALTER TABLE "Column" ADD CONSTRAINT "Column_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "column_elements" ADD CONSTRAINT "column_elements_slabId_fkey" FOREIGN KEY ("slabId") REFERENCES "Column"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
