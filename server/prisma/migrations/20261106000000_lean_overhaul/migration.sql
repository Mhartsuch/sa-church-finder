-- Lean overhaul (v2): drop cut features.
-- DATA IMPACT: user-generated rows in these tables are permanently destroyed.

-- Drop tables (children first; CASCADE removes remaining FKs)
DROP TABLE IF EXISTS "review_votes" CASCADE;
DROP TABLE IF EXISTS "events" CASCADE;
DROP TABLE IF EXISTS "forum_replies" CASCADE;
DROP TABLE IF EXISTS "forum_posts" CASCADE;
DROP TABLE IF EXISTS "church_collection_items" CASCADE;
DROP TABLE IF EXISTS "church_collections" CASCADE;
DROP TABLE IF EXISTS "church_visits" CASCADE;
DROP TABLE IF EXISTS "user_awards" CASCADE;
DROP TABLE IF EXISTS "church_claims" CASCADE;
DROP TABLE IF EXISTS "ribbon_categories" CASCADE;

-- Drop columns
ALTER TABLE "users" DROP COLUMN IF EXISTS "role";
ALTER TABLE "users" DROP COLUMN IF EXISTS "deactivatedAt";

ALTER TABLE "churches" DROP COLUMN IF EXISTS "isClaimed";
ALTER TABLE "churches" DROP COLUMN IF EXISTS "claimedById";

ALTER TABLE "church_photos" DROP CONSTRAINT IF EXISTS "church_photos_uploadedById_fkey";
ALTER TABLE "church_photos" DROP COLUMN IF EXISTS "uploadedById";

ALTER TABLE "reviews" DROP COLUMN IF EXISTS "welcomeRating";
ALTER TABLE "reviews" DROP COLUMN IF EXISTS "worshipRating";
ALTER TABLE "reviews" DROP COLUMN IF EXISTS "sermonRating";
ALTER TABLE "reviews" DROP COLUMN IF EXISTS "facilitiesRating";
ALTER TABLE "reviews" DROP COLUMN IF EXISTS "helpfulCount";
ALTER TABLE "reviews" DROP COLUMN IF EXISTS "isFlagged";
ALTER TABLE "reviews" DROP COLUMN IF EXISTS "responseBody";
ALTER TABLE "reviews" DROP COLUMN IF EXISTS "respondedAt";

-- Drop enums
DROP TYPE IF EXISTS "role";
DROP TYPE IF EXISTS "claim_status";
DROP TYPE IF EXISTS "ribbon_category_source";
DROP TYPE IF EXISTS "ribbon_category_filter_type";
