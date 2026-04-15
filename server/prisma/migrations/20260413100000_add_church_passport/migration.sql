-- CreateTable
CREATE TABLE "church_visits" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "churchId" TEXT NOT NULL,
    "visitedAt" DATE NOT NULL,
    "notes" TEXT,
    "rating" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "church_visits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "church_collections" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "slug" TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "church_collections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "church_collection_items" (
    "collectionId" TEXT NOT NULL,
    "churchId" TEXT NOT NULL,
    "notes" TEXT,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "church_collection_items_pkey" PRIMARY KEY ("collectionId","churchId")
);

-- CreateTable
CREATE TABLE "user_awards" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "awardType" TEXT NOT NULL,
    "earnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_awards_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "church_visits_userId_churchId_visitedAt_key" ON "church_visits"("userId", "churchId", "visitedAt");

-- CreateIndex
CREATE INDEX "church_visits_userId_idx" ON "church_visits"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "church_collections_userId_slug_key" ON "church_collections"("userId", "slug");

-- CreateIndex
CREATE INDEX "church_collections_userId_idx" ON "church_collections"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "user_awards_userId_awardType_key" ON "user_awards"("userId", "awardType");

-- CreateIndex
CREATE INDEX "user_awards_userId_idx" ON "user_awards"("userId");

-- AddForeignKey
ALTER TABLE "church_visits" ADD CONSTRAINT "church_visits_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "church_visits" ADD CONSTRAINT "church_visits_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "churches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "church_collections" ADD CONSTRAINT "church_collections_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "church_collection_items" ADD CONSTRAINT "church_collection_items_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "church_collections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "church_collection_items" ADD CONSTRAINT "church_collection_items_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "churches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_awards" ADD CONSTRAINT "user_awards_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
