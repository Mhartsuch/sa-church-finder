-- AlterTable: Add Google Places rating fields for display when no local reviews exist
ALTER TABLE "churches" ADD COLUMN "googleRating" DECIMAL(3,2);
ALTER TABLE "churches" ADD COLUMN "googleReviewCount" INTEGER;
