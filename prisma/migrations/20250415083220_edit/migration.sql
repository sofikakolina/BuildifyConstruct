-- AlterTable
ALTER TABLE "WorkVolume" ADD COLUMN     "area" DOUBLE PRECISION,
ADD COLUMN     "count" DOUBLE PRECISION,
ADD COLUMN     "elevation" DOUBLE PRECISION,
ADD COLUMN     "level" TEXT,
ADD COLUMN     "volume" DOUBLE PRECISION,
ALTER COLUMN "volumeWork" DROP NOT NULL;
