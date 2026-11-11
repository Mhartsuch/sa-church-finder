-- Cover photo curation, second pass (churches ranked 100–200 by relevance).
-- Same method and guards as 20261111000200_curate_cover_photos: the best view
-- of the building or sanctuary moves to the front in place of a logo, flyer,
-- sign or event snapshot.

-- University Methodist Church (North Campus): photo 2 becomes the cover
UPDATE "church_photos" SET "displayOrder" = "displayOrder" + 1 WHERE "churchId" = '6bc8d3f0-7a87-4ba9-be12-90e2935847f3' AND "displayOrder" < 1 AND EXISTS (SELECT 1 FROM "church_photos" WHERE "id" = '0101a2da-a2f5-4b72-a9fd-80313ff002aa' AND "displayOrder" = 1);
UPDATE "churches" SET "coverImageUrl" = 'https://tepseltgvmnusqhtfuww.supabase.co/storage/v1/object/public/church-photos/google-import/ChIJHTHjWNpmXIYRYdxPix9nkZo/1.jpg' WHERE "id" = '6bc8d3f0-7a87-4ba9-be12-90e2935847f3' AND EXISTS (SELECT 1 FROM "church_photos" WHERE "id" = '0101a2da-a2f5-4b72-a9fd-80313ff002aa' AND "displayOrder" = 1);
UPDATE "church_photos" SET "displayOrder" = 0 WHERE "id" = '0101a2da-a2f5-4b72-a9fd-80313ff002aa' AND "displayOrder" = 1;

-- Shenandoah Community of Christ: photo 4 becomes the cover
UPDATE "church_photos" SET "displayOrder" = "displayOrder" + 1 WHERE "churchId" = 'd5858f5d-a973-49c1-ac53-677c0d866639' AND "displayOrder" < 3 AND EXISTS (SELECT 1 FROM "church_photos" WHERE "id" = 'b3407471-8c8b-4d7c-9b69-ec484e8a2df0' AND "displayOrder" = 3);
UPDATE "churches" SET "coverImageUrl" = 'https://tepseltgvmnusqhtfuww.supabase.co/storage/v1/object/public/church-photos/google-import/ChIJp9PZc9NgXIYRapTP9lKKN7A/3.jpg' WHERE "id" = 'd5858f5d-a973-49c1-ac53-677c0d866639' AND EXISTS (SELECT 1 FROM "church_photos" WHERE "id" = 'b3407471-8c8b-4d7c-9b69-ec484e8a2df0' AND "displayOrder" = 3);
UPDATE "church_photos" SET "displayOrder" = 0 WHERE "id" = 'b3407471-8c8b-4d7c-9b69-ec484e8a2df0' AND "displayOrder" = 3;

-- Hillburn Drive Grace Baptist Church: photo 3 becomes the cover
UPDATE "church_photos" SET "displayOrder" = "displayOrder" + 1 WHERE "churchId" = 'f737e9c4-909d-4eff-a79d-e4131d9781f0' AND "displayOrder" < 2 AND EXISTS (SELECT 1 FROM "church_photos" WHERE "id" = 'a99d5930-7c99-4f9a-a5db-9bef1aacfaaf' AND "displayOrder" = 2);
UPDATE "churches" SET "coverImageUrl" = 'https://tepseltgvmnusqhtfuww.supabase.co/storage/v1/object/public/church-photos/google-import/ChIJbZSLJUNaXIYRrtKmolIG2fA/2.jpg' WHERE "id" = 'f737e9c4-909d-4eff-a79d-e4131d9781f0' AND EXISTS (SELECT 1 FROM "church_photos" WHERE "id" = 'a99d5930-7c99-4f9a-a5db-9bef1aacfaaf' AND "displayOrder" = 2);
UPDATE "church_photos" SET "displayOrder" = 0 WHERE "id" = 'a99d5930-7c99-4f9a-a5db-9bef1aacfaaf' AND "displayOrder" = 2;

-- Iglesia Pentecostal Voz De DIOS: photo 3 becomes the cover
UPDATE "church_photos" SET "displayOrder" = "displayOrder" + 1 WHERE "churchId" = 'fe81645f-4a56-4c6b-9731-b5fcaa436b6b' AND "displayOrder" < 2 AND EXISTS (SELECT 1 FROM "church_photos" WHERE "id" = '460bc98a-ebd4-40c9-bfde-cae01eea59e7' AND "displayOrder" = 2);
UPDATE "churches" SET "coverImageUrl" = 'https://tepseltgvmnusqhtfuww.supabase.co/storage/v1/object/public/church-photos/google-import/ChIJv6Qhw6dcXIYRZL_YIA9EJSU/2.jpg' WHERE "id" = 'fe81645f-4a56-4c6b-9731-b5fcaa436b6b' AND EXISTS (SELECT 1 FROM "church_photos" WHERE "id" = '460bc98a-ebd4-40c9-bfde-cae01eea59e7' AND "displayOrder" = 2);
UPDATE "church_photos" SET "displayOrder" = 0 WHERE "id" = '460bc98a-ebd4-40c9-bfde-cae01eea59e7' AND "displayOrder" = 2;

-- New Life Baptist Church: photo 2 becomes the cover
UPDATE "church_photos" SET "displayOrder" = "displayOrder" + 1 WHERE "churchId" = '184b1d2c-9b52-4bba-bca2-1e304f10fee2' AND "displayOrder" < 1 AND EXISTS (SELECT 1 FROM "church_photos" WHERE "id" = 'c5694c11-7746-4a32-ac8e-f8c28ab3f827' AND "displayOrder" = 1);
UPDATE "churches" SET "coverImageUrl" = 'https://tepseltgvmnusqhtfuww.supabase.co/storage/v1/object/public/church-photos/google-import/ChIJPROc_KjyXIYR-WuqA34tEd0/1.jpg' WHERE "id" = '184b1d2c-9b52-4bba-bca2-1e304f10fee2' AND EXISTS (SELECT 1 FROM "church_photos" WHERE "id" = 'c5694c11-7746-4a32-ac8e-f8c28ab3f827' AND "displayOrder" = 1);
UPDATE "church_photos" SET "displayOrder" = 0 WHERE "id" = 'c5694c11-7746-4a32-ac8e-f8c28ab3f827' AND "displayOrder" = 1;

-- RISE Church: photo 3 becomes the cover
UPDATE "church_photos" SET "displayOrder" = "displayOrder" + 1 WHERE "churchId" = 'eaf6a6c2-5906-4685-8707-315af1860b58' AND "displayOrder" < 2 AND EXISTS (SELECT 1 FROM "church_photos" WHERE "id" = 'de9ed4a1-543c-4a32-b611-fb015759c748' AND "displayOrder" = 2);
UPDATE "churches" SET "coverImageUrl" = 'https://tepseltgvmnusqhtfuww.supabase.co/storage/v1/object/public/church-photos/google-import/ChIJvUoouh1pXIYRssP1gW_rmZk/2.jpg' WHERE "id" = 'eaf6a6c2-5906-4685-8707-315af1860b58' AND EXISTS (SELECT 1 FROM "church_photos" WHERE "id" = 'de9ed4a1-543c-4a32-b611-fb015759c748' AND "displayOrder" = 2);
UPDATE "church_photos" SET "displayOrder" = 0 WHERE "id" = 'de9ed4a1-543c-4a32-b611-fb015759c748' AND "displayOrder" = 2;

-- St. Francis Episcopal Church: photo 2 becomes the cover
UPDATE "church_photos" SET "displayOrder" = "displayOrder" + 1 WHERE "churchId" = '169c3290-e9c2-4a4d-9f94-e86fa1073ca4' AND "displayOrder" < 1 AND EXISTS (SELECT 1 FROM "church_photos" WHERE "id" = '105e5f4d-8e31-4fd2-9bf8-1edf9ff373e1' AND "displayOrder" = 1);
UPDATE "churches" SET "coverImageUrl" = 'https://tepseltgvmnusqhtfuww.supabase.co/storage/v1/object/public/church-photos/google-import/ChIJGXdUNrRgXIYR_qb37bYtp54/1.jpg' WHERE "id" = '169c3290-e9c2-4a4d-9f94-e86fa1073ca4' AND EXISTS (SELECT 1 FROM "church_photos" WHERE "id" = '105e5f4d-8e31-4fd2-9bf8-1edf9ff373e1' AND "displayOrder" = 1);
UPDATE "church_photos" SET "displayOrder" = 0 WHERE "id" = '105e5f4d-8e31-4fd2-9bf8-1edf9ff373e1' AND "displayOrder" = 1;

-- True Life Church: photo 3 becomes the cover
UPDATE "church_photos" SET "displayOrder" = "displayOrder" + 1 WHERE "churchId" = '8076ce42-26eb-4e30-9003-44567e3dbe11' AND "displayOrder" < 2 AND EXISTS (SELECT 1 FROM "church_photos" WHERE "id" = 'fc1b8a87-81c2-426d-aeb9-84dd5c78793b' AND "displayOrder" = 2);
UPDATE "churches" SET "coverImageUrl" = 'https://tepseltgvmnusqhtfuww.supabase.co/storage/v1/object/public/church-photos/google-import/ChIJq6-mQbmSXIYREazsg7bbszA/2.jpg' WHERE "id" = '8076ce42-26eb-4e30-9003-44567e3dbe11' AND EXISTS (SELECT 1 FROM "church_photos" WHERE "id" = 'fc1b8a87-81c2-426d-aeb9-84dd5c78793b' AND "displayOrder" = 2);
UPDATE "church_photos" SET "displayOrder" = 0 WHERE "id" = 'fc1b8a87-81c2-426d-aeb9-84dd5c78793b' AND "displayOrder" = 2;

-- St. Anthony Catholic Church & Hall: photo 2 becomes the cover
UPDATE "church_photos" SET "displayOrder" = "displayOrder" + 1 WHERE "churchId" = 'c51f208a-3b80-4170-bdb8-1a1935085b1a' AND "displayOrder" < 1 AND EXISTS (SELECT 1 FROM "church_photos" WHERE "id" = '922b3f4a-28d3-4d40-a489-c15b114c42ae' AND "displayOrder" = 1);
UPDATE "churches" SET "coverImageUrl" = 'https://tepseltgvmnusqhtfuww.supabase.co/storage/v1/object/public/church-photos/google-import/ChIJoTYQnkP7XIYRUkskIFbqZK8/1.jpg' WHERE "id" = 'c51f208a-3b80-4170-bdb8-1a1935085b1a' AND EXISTS (SELECT 1 FROM "church_photos" WHERE "id" = '922b3f4a-28d3-4d40-a489-c15b114c42ae' AND "displayOrder" = 1);
UPDATE "church_photos" SET "displayOrder" = 0 WHERE "id" = '922b3f4a-28d3-4d40-a489-c15b114c42ae' AND "displayOrder" = 1;
