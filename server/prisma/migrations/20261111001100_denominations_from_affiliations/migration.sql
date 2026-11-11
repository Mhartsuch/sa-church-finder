-- Churches whose own website lists the Assemblies of God among its
-- affiliations but names no denomination. Fills unknown rows only.

UPDATE "churches" SET "denomination" = 'Assemblies of God', "denominationFamily" = 'Pentecostal' WHERE "id" = '7a02c560-3ce2-42b1-b6b3-7a6f27ad4e7e' AND "denomination" IS NULL AND "denominationFamily" IS NULL; -- Camelot Christian Center
UPDATE "churches" SET "denomination" = 'Assemblies of God', "denominationFamily" = 'Pentecostal' WHERE "id" = 'a6201f1a-9e5e-44e6-b126-4b79139be2c3' AND "denomination" IS NULL AND "denominationFamily" IS NULL; -- Heart of Praise Worship Center
UPDATE "churches" SET "denomination" = 'Assemblies of God', "denominationFamily" = 'Pentecostal' WHERE "id" = '72db72bb-3cea-4e61-ba11-554009fc9207' AND "denomination" IS NULL AND "denominationFamily" IS NULL; -- Live the Life Church
