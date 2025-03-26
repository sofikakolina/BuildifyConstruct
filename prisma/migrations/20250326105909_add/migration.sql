-- CreateTable
CREATE TABLE "Slab" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "projectId" TEXT,

    CONSTRAINT "Slab_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "slab_elements" (
    "id" TEXT NOT NULL,
    "slabId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "GlobalId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "level" TEXT,
    "elevation" DOUBLE PRECISION,
    "area" DOUBLE PRECISION,
    "thickness" DOUBLE PRECISION,
    "material" TEXT,
    "IFCType" TEXT,
    "properties" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "slab_elements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "slab_elements_GlobalId_key" ON "slab_elements"("GlobalId");

-- AddForeignKey
ALTER TABLE "Slab" ADD CONSTRAINT "Slab_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "slab_elements" ADD CONSTRAINT "slab_elements_slabId_fkey" FOREIGN KEY ("slabId") REFERENCES "Slab"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
