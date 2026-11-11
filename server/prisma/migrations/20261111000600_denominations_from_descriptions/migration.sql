-- Denominations stated outright in a church's own description ("is a
-- non-denominational church", "is a Korean Baptist congregation"). Only
-- fills rows that are still unknown.

UPDATE "churches" SET "denomination" = 'Non-denominational', "denominationFamily" = 'Non-denominational' WHERE "id" = '3412b4ad-2650-4b93-a867-bce7f47a5c42' AND "denomination" IS NULL AND "denominationFamily" IS NULL; -- Cross Church San Antonio
UPDATE "churches" SET "denomination" = 'Non-denominational', "denominationFamily" = 'Non-denominational' WHERE "id" = 'f2d1eeb1-6910-48ce-868c-e2c9d125460f' AND "denomination" IS NULL AND "denominationFamily" IS NULL; -- Grace Bible Chapel
UPDATE "churches" SET "denomination" = 'Non-denominational', "denominationFamily" = 'Non-denominational' WHERE "id" = 'c1c6d946-e2ef-4216-a32c-363c22874321' AND "denomination" IS NULL AND "denominationFamily" IS NULL; -- New Life Outreach San Antonio
UPDATE "churches" SET "denomination" = 'Baptist', "denominationFamily" = 'Baptist' WHERE "id" = 'c067e5d3-ea9f-466b-b262-d324fa16398b' AND "denomination" IS NULL AND "denominationFamily" IS NULL; -- San Antonio Han-Ma-Eum Korean Church
UPDATE "churches" SET "denomination" = 'Non-denominational', "denominationFamily" = 'Non-denominational' WHERE "id" = '7f11cffc-3a59-4a5d-8d3c-4aedb65009da' AND "denomination" IS NULL AND "denominationFamily" IS NULL; -- The Rock San Antonio
