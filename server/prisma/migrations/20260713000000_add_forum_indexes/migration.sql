-- The original forum migration (20260413200000_add_forum_models) omitted the
-- indexes declared in schema.prisma. IF NOT EXISTS keeps this safe on any
-- database where they were created out of band.

-- CreateIndex
CREATE INDEX IF NOT EXISTS "forum_posts_category_idx" ON "forum_posts"("category");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "forum_posts_authorId_idx" ON "forum_posts"("authorId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "forum_posts_createdAt_idx" ON "forum_posts"("createdAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "forum_replies_postId_idx" ON "forum_replies"("postId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "forum_replies_authorId_idx" ON "forum_replies"("authorId");
