-- Cover photo curation for well-ranked churches whose first Google photo was a
-- logo card, a street sign, a flyer, an empty banquet hall or a portrait of an
-- individual. Each church's photos were reviewed by eye on 2026-11-11 and the
-- best view of the building or sanctuary moved to the front.
--
-- Guarded by photo id and current position, so it is a no-op on databases
-- that do not hold these rows or where the order has since changed.

-- San Antonio Spanish Durango SDA Church: photo 2 becomes the cover
UPDATE "church_photos" SET "displayOrder" = "displayOrder" + 1 WHERE "churchId" = '22e00aae-adee-401e-8ca8-82f5ac9c5932' AND "displayOrder" < 1 AND EXISTS (SELECT 1 FROM "church_photos" WHERE "id" = '453ff6d0-3889-4bc5-b3f5-dfc922609ede' AND "displayOrder" = 1);
UPDATE "churches" SET "coverImageUrl" = 'https://tepseltgvmnusqhtfuww.supabase.co/storage/v1/object/public/church-photos/google-import/ChIJfxPETytfXIYRw11u3bBZLJY/1.jpg' WHERE "id" = '22e00aae-adee-401e-8ca8-82f5ac9c5932' AND EXISTS (SELECT 1 FROM "church_photos" WHERE "id" = '453ff6d0-3889-4bc5-b3f5-dfc922609ede' AND "displayOrder" = 1);
UPDATE "church_photos" SET "displayOrder" = 0 WHERE "id" = '453ff6d0-3889-4bc5-b3f5-dfc922609ede' AND "displayOrder" = 1;

-- Victory Gospel Chapel: photo 2 becomes the cover
UPDATE "church_photos" SET "displayOrder" = "displayOrder" + 1 WHERE "churchId" = 'a4ae2ae4-6f57-4533-a0e8-53ec05094162' AND "displayOrder" < 1 AND EXISTS (SELECT 1 FROM "church_photos" WHERE "id" = '870307d0-3ed7-4641-97e2-ad8399a838a0' AND "displayOrder" = 1);
UPDATE "churches" SET "coverImageUrl" = 'https://tepseltgvmnusqhtfuww.supabase.co/storage/v1/object/public/church-photos/google-import/ChIJM92SgnH2XIYROG3FGCTvPpE/1.jpg' WHERE "id" = 'a4ae2ae4-6f57-4533-a0e8-53ec05094162' AND EXISTS (SELECT 1 FROM "church_photos" WHERE "id" = '870307d0-3ed7-4641-97e2-ad8399a838a0' AND "displayOrder" = 1);
UPDATE "church_photos" SET "displayOrder" = 0 WHERE "id" = '870307d0-3ed7-4641-97e2-ad8399a838a0' AND "displayOrder" = 1;

-- Emanuel United Methodist Church: photo 5 becomes the cover
UPDATE "church_photos" SET "displayOrder" = "displayOrder" + 1 WHERE "churchId" = '9b2fa3ca-3da3-4c7f-a921-cd6c10ab3ca9' AND "displayOrder" < 4 AND EXISTS (SELECT 1 FROM "church_photos" WHERE "id" = 'a1bd1a00-345a-45e3-b31e-1097ef3ae72a' AND "displayOrder" = 4);
UPDATE "churches" SET "coverImageUrl" = 'https://tepseltgvmnusqhtfuww.supabase.co/storage/v1/object/public/church-photos/google-import/ChIJ-2EiVcJeXIYRJw0gkRJ3A7M/4.jpg' WHERE "id" = '9b2fa3ca-3da3-4c7f-a921-cd6c10ab3ca9' AND EXISTS (SELECT 1 FROM "church_photos" WHERE "id" = 'a1bd1a00-345a-45e3-b31e-1097ef3ae72a' AND "displayOrder" = 4);
UPDATE "church_photos" SET "displayOrder" = 0 WHERE "id" = 'a1bd1a00-345a-45e3-b31e-1097ef3ae72a' AND "displayOrder" = 4;

-- Woodlawn Christian Church: photo 2 becomes the cover
UPDATE "church_photos" SET "displayOrder" = "displayOrder" + 1 WHERE "churchId" = 'f796ff48-e7f2-4abc-8b66-18cdd42aed22' AND "displayOrder" < 1 AND EXISTS (SELECT 1 FROM "church_photos" WHERE "id" = '0ad3bcc3-31cb-4fae-b43a-ad0518cd7f89' AND "displayOrder" = 1);
UPDATE "churches" SET "coverImageUrl" = 'https://tepseltgvmnusqhtfuww.supabase.co/storage/v1/object/public/church-photos/google-import/ChIJXTKxrwNfXIYRCrF7Xtp0h4I/1.jpg' WHERE "id" = 'f796ff48-e7f2-4abc-8b66-18cdd42aed22' AND EXISTS (SELECT 1 FROM "church_photos" WHERE "id" = '0ad3bcc3-31cb-4fae-b43a-ad0518cd7f89' AND "displayOrder" = 1);
UPDATE "church_photos" SET "displayOrder" = 0 WHERE "id" = '0ad3bcc3-31cb-4fae-b43a-ad0518cd7f89' AND "displayOrder" = 1;

-- Freedom House Apostolic Church: photo 2 becomes the cover
UPDATE "church_photos" SET "displayOrder" = "displayOrder" + 1 WHERE "churchId" = 'f7600d38-7ea8-459d-9be7-12712f9f74c1' AND "displayOrder" < 1 AND EXISTS (SELECT 1 FROM "church_photos" WHERE "id" = '335d8b4d-8e7c-43bd-b094-cc378727d9c9' AND "displayOrder" = 1);
UPDATE "churches" SET "coverImageUrl" = 'https://tepseltgvmnusqhtfuww.supabase.co/storage/v1/object/public/church-photos/google-import/ChIJMRGgrvpbXIYRUnxHqW8yOGs/1.jpg' WHERE "id" = 'f7600d38-7ea8-459d-9be7-12712f9f74c1' AND EXISTS (SELECT 1 FROM "church_photos" WHERE "id" = '335d8b4d-8e7c-43bd-b094-cc378727d9c9' AND "displayOrder" = 1);
UPDATE "church_photos" SET "displayOrder" = 0 WHERE "id" = '335d8b4d-8e7c-43bd-b094-cc378727d9c9' AND "displayOrder" = 1;

-- First Mexican Fundamental Baptist: photo 4 becomes the cover
UPDATE "church_photos" SET "displayOrder" = "displayOrder" + 1 WHERE "churchId" = 'eb652a1f-0a41-4d5a-a84a-fafc059b9c38' AND "displayOrder" < 3 AND EXISTS (SELECT 1 FROM "church_photos" WHERE "id" = 'edaa7961-641d-4f70-8295-a94b5161c8d9' AND "displayOrder" = 3);
UPDATE "churches" SET "coverImageUrl" = 'https://tepseltgvmnusqhtfuww.supabase.co/storage/v1/object/public/church-photos/google-import/ChIJ15qYCDn2XIYRcVuf1NQaW7s/3.jpg' WHERE "id" = 'eb652a1f-0a41-4d5a-a84a-fafc059b9c38' AND EXISTS (SELECT 1 FROM "church_photos" WHERE "id" = 'edaa7961-641d-4f70-8295-a94b5161c8d9' AND "displayOrder" = 3);
UPDATE "church_photos" SET "displayOrder" = 0 WHERE "id" = 'edaa7961-641d-4f70-8295-a94b5161c8d9' AND "displayOrder" = 3;

-- Word Of Faith Christian Center: photo 5 becomes the cover
UPDATE "church_photos" SET "displayOrder" = "displayOrder" + 1 WHERE "churchId" = '623c5b93-08ec-4002-bcd4-9aa53644e052' AND "displayOrder" < 4 AND EXISTS (SELECT 1 FROM "church_photos" WHERE "id" = 'be21a630-3348-46cd-b039-6ef1cb8d54bd' AND "displayOrder" = 4);
UPDATE "churches" SET "coverImageUrl" = 'https://tepseltgvmnusqhtfuww.supabase.co/storage/v1/object/public/church-photos/google-import/ChIJ6QoUZ7dfXIYRgI8iocnKQ9c/4.jpg' WHERE "id" = '623c5b93-08ec-4002-bcd4-9aa53644e052' AND EXISTS (SELECT 1 FROM "church_photos" WHERE "id" = 'be21a630-3348-46cd-b039-6ef1cb8d54bd' AND "displayOrder" = 4);
UPDATE "church_photos" SET "displayOrder" = 0 WHERE "id" = 'be21a630-3348-46cd-b039-6ef1cb8d54bd' AND "displayOrder" = 4;

-- First Baptist Church of San Antonio: photo 5 becomes the cover
UPDATE "church_photos" SET "displayOrder" = "displayOrder" + 1 WHERE "churchId" = 'b8bd6a11-7eb6-4713-9e3b-008b944a0600' AND "displayOrder" < 4 AND EXISTS (SELECT 1 FROM "church_photos" WHERE "id" = 'cb485ff7-1378-4b4c-985c-cf84e29d559e' AND "displayOrder" = 4);
UPDATE "churches" SET "coverImageUrl" = 'https://tepseltgvmnusqhtfuww.supabase.co/storage/v1/object/public/church-photos/google-import/ChIJ_9PBflZfXIYRA7M2ysoSb_A/4.jpg' WHERE "id" = 'b8bd6a11-7eb6-4713-9e3b-008b944a0600' AND EXISTS (SELECT 1 FROM "church_photos" WHERE "id" = 'cb485ff7-1378-4b4c-985c-cf84e29d559e' AND "displayOrder" = 4);
UPDATE "church_photos" SET "displayOrder" = 0 WHERE "id" = 'cb485ff7-1378-4b4c-985c-cf84e29d559e' AND "displayOrder" = 4;

-- Iglesia Cristiana Emanuel: photo 2 becomes the cover
UPDATE "church_photos" SET "displayOrder" = "displayOrder" + 1 WHERE "churchId" = 'e4ae8394-271c-438d-843b-fd698fb31944' AND "displayOrder" < 1 AND EXISTS (SELECT 1 FROM "church_photos" WHERE "id" = '14b2a41b-1b70-4241-a154-e3daf2f69100' AND "displayOrder" = 1);
UPDATE "churches" SET "coverImageUrl" = 'https://tepseltgvmnusqhtfuww.supabase.co/storage/v1/object/public/church-photos/google-import/ChIJ_YjVo4JgXIYRVz1O-fPsqD4/1.jpg' WHERE "id" = 'e4ae8394-271c-438d-843b-fd698fb31944' AND EXISTS (SELECT 1 FROM "church_photos" WHERE "id" = '14b2a41b-1b70-4241-a154-e3daf2f69100' AND "displayOrder" = 1);
UPDATE "church_photos" SET "displayOrder" = 0 WHERE "id" = '14b2a41b-1b70-4241-a154-e3daf2f69100' AND "displayOrder" = 1;

-- Rock of Revelation Church: photo 2 becomes the cover
UPDATE "church_photos" SET "displayOrder" = "displayOrder" + 1 WHERE "churchId" = 'a902b1ad-b52e-4eef-b937-32b61d2209f2' AND "displayOrder" < 1 AND EXISTS (SELECT 1 FROM "church_photos" WHERE "id" = 'c48c2b94-7657-4d28-9605-293ca3833a5c' AND "displayOrder" = 1);
UPDATE "churches" SET "coverImageUrl" = 'https://tepseltgvmnusqhtfuww.supabase.co/storage/v1/object/public/church-photos/google-import/ChIJU8vV2gH4XIYRRtt6ZZvl0Cc/1.jpg' WHERE "id" = 'a902b1ad-b52e-4eef-b937-32b61d2209f2' AND EXISTS (SELECT 1 FROM "church_photos" WHERE "id" = 'c48c2b94-7657-4d28-9605-293ca3833a5c' AND "displayOrder" = 1);
UPDATE "church_photos" SET "displayOrder" = 0 WHERE "id" = 'c48c2b94-7657-4d28-9605-293ca3833a5c' AND "displayOrder" = 1;

-- Place of Grace Fellowship: photo 2 becomes the cover
UPDATE "church_photos" SET "displayOrder" = "displayOrder" + 1 WHERE "churchId" = '77253b89-19da-4093-9fab-9a3ee19c359a' AND "displayOrder" < 1 AND EXISTS (SELECT 1 FROM "church_photos" WHERE "id" = '711dedf9-2ae4-4efe-81ba-6797c75ae722' AND "displayOrder" = 1);
UPDATE "churches" SET "coverImageUrl" = 'https://tepseltgvmnusqhtfuww.supabase.co/storage/v1/object/public/church-photos/google-import/ChIJ0wZolNWKXIYRQ7U6Xpcmkv4/1.jpg' WHERE "id" = '77253b89-19da-4093-9fab-9a3ee19c359a' AND EXISTS (SELECT 1 FROM "church_photos" WHERE "id" = '711dedf9-2ae4-4efe-81ba-6797c75ae722' AND "displayOrder" = 1);
UPDATE "church_photos" SET "displayOrder" = 0 WHERE "id" = '711dedf9-2ae4-4efe-81ba-6797c75ae722' AND "displayOrder" = 1;

-- St Bonaventure Church: photo 2 becomes the cover
UPDATE "church_photos" SET "displayOrder" = "displayOrder" + 1 WHERE "churchId" = 'a4022951-db9b-4913-87ae-7086810c45a3' AND "displayOrder" < 1 AND EXISTS (SELECT 1 FROM "church_photos" WHERE "id" = '16c9cbb8-f6d4-4b04-9d75-45a9e8d31001' AND "displayOrder" = 1);
UPDATE "churches" SET "coverImageUrl" = 'https://tepseltgvmnusqhtfuww.supabase.co/storage/v1/object/public/church-photos/google-import/ChIJSUaMW-BZXIYRQgP67M_VP1c/1.jpg' WHERE "id" = 'a4022951-db9b-4913-87ae-7086810c45a3' AND EXISTS (SELECT 1 FROM "church_photos" WHERE "id" = '16c9cbb8-f6d4-4b04-9d75-45a9e8d31001' AND "displayOrder" = 1);
UPDATE "church_photos" SET "displayOrder" = 0 WHERE "id" = '16c9cbb8-f6d4-4b04-9d75-45a9e8d31001' AND "displayOrder" = 1;

-- Ministerio Internacional ERJTX: photo 3 becomes the cover
UPDATE "church_photos" SET "displayOrder" = "displayOrder" + 1 WHERE "churchId" = '1d7dc36e-9dec-4770-be79-d00f08387d39' AND "displayOrder" < 2 AND EXISTS (SELECT 1 FROM "church_photos" WHERE "id" = '3c0d60e0-c6b5-40bc-8ccc-8e9b48c280cd' AND "displayOrder" = 2);
UPDATE "churches" SET "coverImageUrl" = 'https://tepseltgvmnusqhtfuww.supabase.co/storage/v1/object/public/church-photos/google-import/ChIJJYTgEoaJXIYRoyqZukkpHd8/2.jpg' WHERE "id" = '1d7dc36e-9dec-4770-be79-d00f08387d39' AND EXISTS (SELECT 1 FROM "church_photos" WHERE "id" = '3c0d60e0-c6b5-40bc-8ccc-8e9b48c280cd' AND "displayOrder" = 2);
UPDATE "church_photos" SET "displayOrder" = 0 WHERE "id" = '3c0d60e0-c6b5-40bc-8ccc-8e9b48c280cd' AND "displayOrder" = 2;

-- Woodlawn Christian Church: two close-up photos of a child are not pictures of the church; remove them from the listing
DELETE FROM "church_photos" WHERE "id" IN ('a4756f07-11c9-4c23-bfff-fdb5278d47c7', '41880033-843a-464c-aee6-45e2fe1a4750');
