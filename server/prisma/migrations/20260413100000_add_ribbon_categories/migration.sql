-- CreateEnum
CREATE TYPE "ribbon_category_source" AS ENUM ('MANUAL', 'AUTO');

-- CreateEnum
CREATE TYPE "ribbon_category_filter_type" AS ENUM ('QUERY', 'DENOMINATION');

-- CreateTable
CREATE TABLE "ribbon_categories" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "icon" TEXT NOT NULL DEFAULT '⛪',
    "slug" TEXT NOT NULL,
    "filterType" "ribbon_category_filter_type" NOT NULL,
    "filterValue" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "source" "ribbon_category_source" NOT NULL DEFAULT 'MANUAL',
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ribbon_categories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ribbon_categories_slug_key" ON "ribbon_categories"("slug");

-- CreateIndex
CREATE INDEX "ribbon_categories_position_idx" ON "ribbon_categories"("position");

-- CreateIndex
CREATE INDEX "ribbon_categories_isVisible_idx" ON "ribbon_categories"("isVisible");
