-- CreateEnum
CREATE TYPE "event_source" AS ENUM ('MANUAL', 'WEBSITE_SCRAPE');
CREATE TYPE "event_status" AS ENUM ('PUBLISHED', 'PENDING', 'REJECTED');

-- AlterTable: Add event discovery pipeline fields
ALTER TABLE "events" ADD COLUMN "source" "event_source" NOT NULL DEFAULT 'MANUAL';
ALTER TABLE "events" ADD COLUMN "status" "event_status" NOT NULL DEFAULT 'PUBLISHED';
ALTER TABLE "events" ADD COLUMN "sourceUrl" TEXT;
ALTER TABLE "events" ADD COLUMN "sourceHash" TEXT;

-- CreateIndex: Unique hash for deduplication of discovered events
CREATE UNIQUE INDEX "events_sourceHash_key" ON "events"("sourceHash");
