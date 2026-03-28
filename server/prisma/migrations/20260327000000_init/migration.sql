-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "postgis";

-- CreateEnum
CREATE TYPE "role" AS ENUM ('USER', 'CHURCH_ADMIN', 'SITE_ADMIN');

-- CreateEnum
CREATE TYPE "claim_status" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable: users
CREATE TABLE "users" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "name" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "role" "role" NOT NULL DEFAULT 'USER',
    "googleId" TEXT,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable: churches
CREATE TABLE "churches" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "denomination" TEXT,
    "denominationFamily" TEXT,
    "description" TEXT,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL DEFAULT 'San Antonio',
    "state" TEXT NOT NULL DEFAULT 'TX',
    "zipCode" TEXT NOT NULL,
    "neighborhood" TEXT,
    "latitude" DECIMAL(10,8) NOT NULL,
    "longitude" DECIMAL(11,8) NOT NULL,
    "location" geography(Point, 4326),
    "phone" TEXT,
    "email" TEXT,
    "website" TEXT,
    "pastorName" TEXT,
    "yearEstablished" INTEGER,
    "avgRating" DECIMAL(3,2) NOT NULL DEFAULT 0,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "isClaimed" BOOLEAN NOT NULL DEFAULT false,
    "claimedById" TEXT,
    "languages" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "amenities" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "coverImageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "churches_pkey" PRIMARY KEY ("id")
);

-- CreateTable: church_services
CREATE TABLE "church_services" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "churchId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT,
    "serviceType" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'English',
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "church_services_pkey" PRIMARY KEY ("id")
);

-- CreateTable: church_photos
CREATE TABLE "church_photos" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "churchId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "altText" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "uploadedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "church_photos_pkey" PRIMARY KEY ("id")
);

-- CreateTable: reviews
CREATE TABLE "reviews" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "userId" TEXT NOT NULL,
    "churchId" TEXT NOT NULL,
    "rating" DECIMAL(3,2) NOT NULL,
    "body" TEXT NOT NULL,
    "welcomeRating" INTEGER,
    "worshipRating" INTEGER,
    "sermonRating" INTEGER,
    "facilitiesRating" INTEGER,
    "helpfulCount" INTEGER NOT NULL DEFAULT 0,
    "isFlagged" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable: review_votes
CREATE TABLE "review_votes" (
    "userId" TEXT NOT NULL,
    "reviewId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "review_votes_pkey" PRIMARY KEY ("userId","reviewId")
);

-- CreateTable: events
CREATE TABLE "events" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "churchId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "eventType" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3),
    "locationOverride" TEXT,
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "recurrenceRule" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable: church_claims
CREATE TABLE "church_claims" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "churchId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roleTitle" TEXT NOT NULL,
    "verificationEmail" TEXT NOT NULL,
    "status" "claim_status" NOT NULL DEFAULT 'PENDING',
    "reviewedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),

    CONSTRAINT "church_claims_pkey" PRIMARY KEY ("id")
);

-- CreateTable: password_reset_tokens
CREATE TABLE "password_reset_tokens" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable: user_saved_churches
CREATE TABLE "user_saved_churches" (
    "userId" TEXT NOT NULL,
    "churchId" TEXT NOT NULL,
    "savedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_saved_churches_pkey" PRIMARY KEY ("userId","churchId")
);

-- Unique indexes
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "users_googleId_key" ON "users"("googleId");
CREATE UNIQUE INDEX "churches_slug_key" ON "churches"("slug");
CREATE UNIQUE INDEX "reviews_userId_churchId_key" ON "reviews"("userId", "churchId");
CREATE UNIQUE INDEX "password_reset_tokens_tokenHash_key" ON "password_reset_tokens"("tokenHash");

-- Regular indexes
CREATE INDEX "churches_slug_idx" ON "churches"("slug");
CREATE INDEX "churches_denominationFamily_idx" ON "churches"("denominationFamily");
CREATE INDEX "churches_latitude_longitude_idx" ON "churches"("latitude", "longitude");

-- PostGIS spatial index on geography column (GIST)
CREATE INDEX "churches_location_gist_idx" ON "churches" USING GIST ("location");

-- Trigger: auto-sync location geography column from lat/lng on INSERT or UPDATE
CREATE OR REPLACE FUNCTION churches_sync_location()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW."latitude" IS NOT NULL AND NEW."longitude" IS NOT NULL THEN
        NEW."location" := ST_SetSRID(ST_MakePoint(
            CAST(NEW."longitude" AS double precision),
            CAST(NEW."latitude" AS double precision)
        ), 4326)::geography;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER churches_location_sync
    BEFORE INSERT OR UPDATE OF "latitude", "longitude"
    ON "churches"
    FOR EACH ROW
    EXECUTE FUNCTION churches_sync_location();

-- Foreign keys
ALTER TABLE "church_services" ADD CONSTRAINT "church_services_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "churches"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "church_photos" ADD CONSTRAINT "church_photos_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "churches"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "church_photos" ADD CONSTRAINT "church_photos_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "churches"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "review_votes" ADD CONSTRAINT "review_votes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "review_votes" ADD CONSTRAINT "review_votes_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "reviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "events" ADD CONSTRAINT "events_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "churches"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "events" ADD CONSTRAINT "events_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "church_claims" ADD CONSTRAINT "church_claims_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "churches"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "church_claims" ADD CONSTRAINT "church_claims_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "church_claims" ADD CONSTRAINT "church_claims_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "user_saved_churches" ADD CONSTRAINT "user_saved_churches_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "user_saved_churches" ADD CONSTRAINT "user_saved_churches_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "churches"("id") ON DELETE CASCADE ON UPDATE CASCADE;
