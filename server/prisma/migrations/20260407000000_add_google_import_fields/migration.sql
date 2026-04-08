-- AlterTable: Add googlePlaceId to churches for Google Maps import deduplication
ALTER TABLE "churches" ADD COLUMN "googlePlaceId" TEXT;

-- CreateIndex: Unique index on googlePlaceId
CREATE UNIQUE INDEX "churches_googlePlaceId_key" ON "churches"("googlePlaceId");

-- AlterTable: Add googlePhotoRef to church_photos for tracking imported photos
ALTER TABLE "church_photos" ADD COLUMN "googlePhotoRef" TEXT;
