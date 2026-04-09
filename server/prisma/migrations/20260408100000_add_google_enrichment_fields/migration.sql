-- AlterTable
ALTER TABLE "churches" ADD COLUMN "businessStatus" TEXT;
ALTER TABLE "churches" ADD COLUMN "googleMapsUrl" TEXT;
ALTER TABLE "churches" ADD COLUMN "primaryType" TEXT;
ALTER TABLE "churches" ADD COLUMN "goodForChildren" BOOLEAN;
ALTER TABLE "churches" ADD COLUMN "goodForGroups" BOOLEAN;
ALTER TABLE "churches" ADD COLUMN "wheelchairAccessible" BOOLEAN;

-- AlterTable
ALTER TABLE "church_services" ADD COLUMN "isAutoImported" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "idx_churches_business_status" ON "churches"("businessStatus");
