-- CreateTable
CREATE TABLE "Window" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "totalCount" INTEGER NOT NULL DEFAULT 0,
    "totalArea" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "projectId" TEXT,

    CONSTRAINT "Window_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "window_elements" (
    "id" TEXT NOT NULL,
    "windowId" TEXT NOT NULL,
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

    CONSTRAINT "window_elements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Window_totalCount_idx" ON "Window"("totalCount");

-- CreateIndex
CREATE INDEX "Window_totalArea_idx" ON "Window"("totalArea");

-- CreateIndex
CREATE UNIQUE INDEX "window_elements_GlobalId_key" ON "window_elements"("GlobalId");

-- CreateIndex
CREATE INDEX "window_elements_level_idx" ON "window_elements"("level");

-- CreateIndex
CREATE INDEX "window_elements_elevation_idx" ON "window_elements"("elevation");

-- CreateIndex
CREATE INDEX "window_elements_type_idx" ON "window_elements"("type");

-- AddForeignKey
ALTER TABLE "Window" ADD CONSTRAINT "Window_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "window_elements" ADD CONSTRAINT "window_elements_windowId_fkey" FOREIGN KEY ("windowId") REFERENCES "Window"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
