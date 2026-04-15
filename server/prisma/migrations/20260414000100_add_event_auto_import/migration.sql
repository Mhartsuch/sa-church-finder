-- AlterTable
ALTER TABLE "events"
  ADD COLUMN "isAutoImported" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "sourceUrl" TEXT;

-- CreateIndex
CREATE INDEX "events_churchId_isAutoImported_idx" ON "events"("churchId", "isAutoImported");
