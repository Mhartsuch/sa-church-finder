-- Website links whose domain no longer exists (NXDOMAIN for both the bare and
-- www host, checked 2026-11-11 against a public resolver). A "Visit website"
-- button that leads nowhere is worse than none. Guarded by the audited link.

UPDATE "churches" SET "website" = NULL WHERE "id" = 'da87ca5e-8b22-45cb-b350-dc8115cfe180' AND "website" = 'http://www.crestwaychurchofchrist.com/'; -- Crestway Church of Christ
UPDATE "churches" SET "website" = NULL WHERE "id" = '74d55efc-268f-4ab8-adc8-9c3ec7021953' AND "website" = 'http://dedicated.baptist-church-online.com/'; -- Dedicated Baptist Church
UPDATE "churches" SET "website" = NULL WHERE "id" = 'c1233131-e92b-41be-a871-9bed0414e095' AND "website" = 'https://harlandalemethodistchurch.com/'; -- Harlandale Methodist Church
UPDATE "churches" SET "website" = NULL WHERE "id" = 'afa7660d-082d-4341-9f66-59a3f95efbce' AND "website" = 'http://nwpbc.org/'; -- Northwest Park Baptist Church
UPDATE "churches" SET "website" = NULL WHERE "id" = '7a5ea43c-0664-430c-ba49-fc402520371c' AND "website" = 'http://www.somersetumc.com/'; -- Somerset Methodist Church
UPDATE "churches" SET "website" = NULL WHERE "id" = 'f0b12964-6802-4e64-a204-5d359276075b' AND "website" = 'http://templemissionarybc.webs.com/'; -- Temple Missionary Baptist Church
