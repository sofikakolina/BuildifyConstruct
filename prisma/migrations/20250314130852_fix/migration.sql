-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "userId" TEXT[];

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "projectId" TEXT[];
