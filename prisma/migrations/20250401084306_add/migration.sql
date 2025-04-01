-- CreateTable
CREATE TABLE "Stair" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "totalCount" INTEGER NOT NULL DEFAULT 0,
    "totalVolume" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "projectId" TEXT,

    CONSTRAINT "Stair_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stair_elements" (
    "id" TEXT NOT NULL,
    "stairId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "GlobalId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "level" TEXT,
    "material" TEXT,
    "elevation" DOUBLE PRECISION,
    "volume" DOUBLE PRECISION,
    "width" DOUBLE PRECISION,
    "stepHeight" DOUBLE PRECISION,
    "stepLength" DOUBLE PRECISION,
    "numberOfSteps" INTEGER,
    "properties" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stair_elements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Stair_totalCount_idx" ON "Stair"("totalCount");

-- CreateIndex
CREATE INDEX "Stair_totalVolume_idx" ON "Stair"("totalVolume");

-- CreateIndex
CREATE UNIQUE INDEX "stair_elements_GlobalId_key" ON "stair_elements"("GlobalId");

-- CreateIndex
CREATE INDEX "stair_elements_level_idx" ON "stair_elements"("level");

-- CreateIndex
CREATE INDEX "stair_elements_elevation_idx" ON "stair_elements"("elevation");

-- CreateIndex
CREATE INDEX "stair_elements_type_idx" ON "stair_elements"("type");

-- AddForeignKey
ALTER TABLE "Stair" ADD CONSTRAINT "Stair_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stair_elements" ADD CONSTRAINT "stair_elements_stairId_fkey" FOREIGN KEY ("stairId") REFERENCES "Stair"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
