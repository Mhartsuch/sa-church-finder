-- Hidden listings: non-churches (offices, schools, cemeteries) and duplicates
-- that Google's `church` place type sweeps in. Additive and backwards
-- compatible: every existing row stays visible until a later step flags it.
ALTER TABLE "churches" ADD COLUMN "isHidden" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "churches" ADD COLUMN "hiddenReason" TEXT;

CREATE INDEX "churches_isHidden_idx" ON "churches"("isHidden");
