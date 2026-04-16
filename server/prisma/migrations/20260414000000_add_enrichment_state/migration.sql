-- CreateTable
CREATE TABLE "enrichment_states" (
    "id" TEXT NOT NULL,
    "churchId" TEXT NOT NULL,
    "version" TEXT NOT NULL DEFAULT 'v2',
    "status" TEXT NOT NULL,
    "pagesFetched" JSONB NOT NULL DEFAULT '[]',
    "extractedData" JSONB,
    "confidence" DOUBLE PRECISION,
    "source" TEXT,
    "lastError" TEXT,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "enrichment_states_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "enrichment_states_churchId_key" ON "enrichment_states"("churchId");

-- CreateIndex
CREATE INDEX "enrichment_states_status_version_idx" ON "enrichment_states"("status", "version");

-- AddForeignKey
ALTER TABLE "enrichment_states" ADD CONSTRAINT "enrichment_states_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "churches"("id") ON DELETE CASCADE ON UPDATE CASCADE;
