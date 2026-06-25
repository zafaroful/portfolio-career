-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('DRAFT', 'ACTIVE', 'COMPLETED', 'ARCHIVED');

-- AlterTable
ALTER TABLE "users" ADD COLUMN "onboarding_completed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "onboarding_step" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "projects" ADD COLUMN "status" "ProjectStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN "category" TEXT,
ADD COLUMN "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- CreateIndex
CREATE INDEX "projects_status_idx" ON "projects"("status");

-- CreateIndex
CREATE INDEX "projects_category_idx" ON "projects"("category");
