-- CreateTable
CREATE TABLE "TemporaryStructures" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "numberOfStaff" INTEGER NOT NULL DEFAULT 0,
    "maximumOfWorkers" INTEGER NOT NULL DEFAULT 0,
    "standardOnOneman" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "EstimatedArea" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "AcceptedArea" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "dimensionsInPlan" TEXT,
    "numberOfBuildings" INTEGER NOT NULL DEFAULT 0,
    "standardProjectUsed" TEXT,

    CONSTRAINT "TemporaryStructures_pkey" PRIMARY KEY ("id")
);
