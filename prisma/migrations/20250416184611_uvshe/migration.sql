-- CreateTable
CREATE TABLE "StructureTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "defaultDimensions" TEXT NOT NULL,
    "defaultProject" TEXT NOT NULL,
    "minAreaPerPerson" DOUBLE PRECISION NOT NULL,
    "areaCalculation" TEXT NOT NULL,
    "fixedArea" DOUBLE PRECISION,
    "buildingCount" INTEGER NOT NULL,

    CONSTRAINT "StructureTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StructureTemplate_name_key" ON "StructureTemplate"("name");
