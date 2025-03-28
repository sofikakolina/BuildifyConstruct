-- CreateTable
CREATE TABLE "Door" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "totalCount" INTEGER NOT NULL DEFAULT 0,
    "totalVolume" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "projectId" TEXT,

    CONSTRAINT "Door_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "door_elements" (
    "id" TEXT NOT NULL,
    "columnId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "GlobalId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "level" TEXT,
    "elevation" DOUBLE PRECISION,
    "area" DOUBLE PRECISION,
    "size" DOUBLE PRECISION,
    "height" DOUBLE PRECISION,
    "width" DOUBLE PRECISION,
    "IFCType" TEXT,
    "properties" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "door_elements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Door_totalCount_idx" ON "Door"("totalCount");

-- CreateIndex
CREATE INDEX "Door_totalVolume_idx" ON "Door"("totalVolume");

-- CreateIndex
CREATE UNIQUE INDEX "door_elements_GlobalId_key" ON "door_elements"("GlobalId");

-- CreateIndex
CREATE INDEX "door_elements_level_idx" ON "door_elements"("level");

-- CreateIndex
CREATE INDEX "door_elements_elevation_idx" ON "door_elements"("elevation");

-- CreateIndex
CREATE INDEX "door_elements_type_idx" ON "door_elements"("type");

-- AddForeignKey
ALTER TABLE "Door" ADD CONSTRAINT "Door_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "door_elements" ADD CONSTRAINT "door_elements_columnId_fkey" FOREIGN KEY ("columnId") REFERENCES "Door"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
