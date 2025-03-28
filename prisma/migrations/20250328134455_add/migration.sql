-- CreateTable
CREATE TABLE "Beam" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "totalCount" INTEGER NOT NULL DEFAULT 0,
    "totalVOlume" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "projectId" TEXT,

    CONSTRAINT "Beam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "beam_elements" (
    "id" TEXT NOT NULL,
    "beamId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "GlobalId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "level" TEXT,
    "material" TEXT,
    "elevation" DOUBLE PRECISION,
    "volume" DOUBLE PRECISION,
    "size" DOUBLE PRECISION,
    "height" DOUBLE PRECISION,
    "width" DOUBLE PRECISION,
    "length" DOUBLE PRECISION,
    "IFCType" TEXT,
    "properties" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "beam_elements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Beam_totalCount_idx" ON "Beam"("totalCount");

-- CreateIndex
CREATE INDEX "Beam_totalVOlume_idx" ON "Beam"("totalVOlume");

-- CreateIndex
CREATE UNIQUE INDEX "beam_elements_GlobalId_key" ON "beam_elements"("GlobalId");

-- CreateIndex
CREATE INDEX "beam_elements_level_idx" ON "beam_elements"("level");

-- CreateIndex
CREATE INDEX "beam_elements_elevation_idx" ON "beam_elements"("elevation");

-- CreateIndex
CREATE INDEX "beam_elements_type_idx" ON "beam_elements"("type");

-- AddForeignKey
ALTER TABLE "Beam" ADD CONSTRAINT "Beam_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "beam_elements" ADD CONSTRAINT "beam_elements_beamId_fkey" FOREIGN KEY ("beamId") REFERENCES "Beam"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
