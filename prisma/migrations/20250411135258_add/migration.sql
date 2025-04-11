-- AlterTable
ALTER TABLE "beam_elements" ADD COLUMN     "projectId" TEXT;

-- AlterTable
ALTER TABLE "column_elements" ADD COLUMN     "projectId" TEXT;

-- AlterTable
ALTER TABLE "door_elements" ADD COLUMN     "projectId" TEXT;

-- AlterTable
ALTER TABLE "railing_elements" ADD COLUMN     "projectId" TEXT;

-- AlterTable
ALTER TABLE "roof_elements" ADD COLUMN     "projectId" TEXT;

-- AlterTable
ALTER TABLE "roof_materials" ADD COLUMN     "projectId" TEXT;

-- AlterTable
ALTER TABLE "slab_elements" ADD COLUMN     "projectId" TEXT;

-- AlterTable
ALTER TABLE "stair_elements" ADD COLUMN     "projectId" TEXT;

-- AlterTable
ALTER TABLE "wall_elements" ADD COLUMN     "projectId" TEXT;

-- AlterTable
ALTER TABLE "wall_materials" ADD COLUMN     "projectId" TEXT;

-- AlterTable
ALTER TABLE "window_elements" ADD COLUMN     "projectId" TEXT;
