-- CreateTable
CREATE TABLE "Railing" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "totalCount" INTEGER NOT NULL DEFAULT 0,
    "totalLength" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "projectId" TEXT,

    CONSTRAINT "Railing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "railing_elements" (
    "id" TEXT NOT NULL,
    "railingId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "GlobalId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "level" TEXT,
    "material" TEXT,
    "elevation" DOUBLE PRECISION,
    "volume" DOUBLE PRECISION,
    "height" DOUBLE PRECISION,
    "length" DOUBLE PRECISION,
    "properties" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "railing_elements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Railing_totalCount_idx" ON "Railing"("totalCount");

-- CreateIndex
CREATE INDEX "Railing_totalLength_idx" ON "Railing"("totalLength");

-- CreateIndex
CREATE UNIQUE INDEX "railing_elements_GlobalId_key" ON "railing_elements"("GlobalId");

-- CreateIndex
CREATE INDEX "railing_elements_level_idx" ON "railing_elements"("level");

-- CreateIndex
CREATE INDEX "railing_elements_elevation_idx" ON "railing_elements"("elevation");

-- CreateIndex
CREATE INDEX "railing_elements_type_idx" ON "railing_elements"("type");

-- AddForeignKey
ALTER TABLE "Railing" ADD CONSTRAINT "Railing_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "railing_elements" ADD CONSTRAINT "railing_elements_railingId_fkey" FOREIGN KEY ("railingId") REFERENCES "Railing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
