-- Church details re-read from each church's own website on 2026-11-11 by the
-- reworked enrich-website-v2 stage (run against a copy of production):
--   * 387 churches get a verified weekly schedule (46 had none before).
--     Every time was found written on the church's site; dated announcements,
--     holy-day schedules and office hours were excluded. Replaced rows are
--     backed up in prisma/data-backups/.
--   * fills where production had nothing: 65 descriptions, 191 pastor names,
--     96 emails, 101 founding years, 4 phone numbers
--   * 20 denominations stated on the church's site, 40 language lists
--
-- Guards: fills apply only where the column is still NULL; denomination and
-- language updates only if the row still holds the audited value; service
-- replacement only touches auto-imported rows of churches that exist.

-- 247 Church
DELETE FROM "church_services" WHERE "churchId" = '96db25f0-f219-4f16-8b26-48b056ab66a8' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '96db25f0-f219-4f16-8b26-48b056ab66a8', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '10:30', NULL, 'Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '96db25f0-f219-4f16-8b26-48b056ab66a8');

-- 3ra IAFCJ San Antonio, Tx
UPDATE "churches" SET "languages" = ARRAY['English', 'Spanish']::text[] WHERE "id" = 'b026afbc-4c1c-4ec8-8340-e7fed7183afc' AND "languages" = ARRAY['English']::text[];

-- Abiding Presence Lutheran Church and Day School
UPDATE "churches" SET "yearEstablished" = 1980 WHERE "id" = 'b84c997f-94c0-42dd-98ae-4b6b6beb5d4e' AND "yearEstablished" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = 'b84c997f-94c0-42dd-98ae-4b6b6beb5d4e' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'b84c997f-94c0-42dd-98ae-4b6b6beb5d4e', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '08:30', NULL, 'Service', 'English'),
  (0, '10:00', '10:45', 'Sunday School', 'English'),
  (0, '11:00', NULL, 'Service', 'English'),
  (6, '17:30', NULL, 'Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'b84c997f-94c0-42dd-98ae-4b6b6beb5d4e');

-- Abundant Life Church of God
UPDATE "churches" SET "languages" = ARRAY['English', 'Spanish']::text[] WHERE "id" = '7596ba36-4111-4511-9ae4-5eeb53a909ed' AND "languages" = ARRAY['English']::text[];
DELETE FROM "church_services" WHERE "churchId" = '7596ba36-4111-4511-9ae4-5eeb53a909ed' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '7596ba36-4111-4511-9ae4-5eeb53a909ed', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:00', NULL, 'Service', 'English'),
  (0, '10:00', NULL, 'Service', 'Spanish'),
  (0, '12:00', NULL, 'Service', 'Spanish')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '7596ba36-4111-4511-9ae4-5eeb53a909ed');

-- Agape Baptist Church
UPDATE "churches" SET "languages" = ARRAY['English', 'Spanish']::text[] WHERE "id" = 'cae0c50a-b249-4d8b-bcb5-a46984045bec' AND "languages" = ARRAY['English']::text[];
DELETE FROM "church_services" WHERE "churchId" = 'cae0c50a-b249-4d8b-bcb5-a46984045bec' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'cae0c50a-b249-4d8b-bcb5-a46984045bec', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:30', NULL, 'Service', 'Spanish'),
  (0, '11:00', NULL, 'Service', 'English'),
  (3, '18:00', '19:00', 'Prayer', 'English'),
  (3, '19:00', NULL, 'Bible Study', 'English'),
  (3, '19:00', NULL, 'Young Bible Study', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'cae0c50a-b249-4d8b-bcb5-a46984045bec');

-- Agape Christian Church
UPDATE "churches" SET "pastorName" = 'Stuart Perryman' WHERE "id" = 'ada343ec-ea2c-434d-9b18-7bb447523aa8' AND "pastorName" IS NULL;
UPDATE "churches" SET "yearEstablished" = 2014 WHERE "id" = 'ada343ec-ea2c-434d-9b18-7bb447523aa8' AND "yearEstablished" IS NULL;
UPDATE "churches" SET "languages" = ARRAY['English', 'Spanish']::text[] WHERE "id" = 'ada343ec-ea2c-434d-9b18-7bb447523aa8' AND "languages" = ARRAY['English']::text[];
DELETE FROM "church_services" WHERE "churchId" = 'ada343ec-ea2c-434d-9b18-7bb447523aa8' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'ada343ec-ea2c-434d-9b18-7bb447523aa8', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:30', NULL, 'Worship Experience', 'English'),
  (3, '18:15', NULL, 'Bible Study', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'ada343ec-ea2c-434d-9b18-7bb447523aa8');

-- Alamo City Apostolic Church
UPDATE "churches" SET "email" = 'info@alamocityapostolic.org' WHERE "id" = '1a61765f-8b4c-4f0f-a952-159c572bd491' AND "email" IS NULL;
UPDATE "churches" SET "goodForChildren" = true WHERE "id" = '1a61765f-8b4c-4f0f-a952-159c572bd491' AND "goodForChildren" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = '1a61765f-8b4c-4f0f-a952-159c572bd491' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '1a61765f-8b4c-4f0f-a952-159c572bd491', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '10:30', NULL, 'Service', 'English'),
  (4, '19:30', NULL, 'Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '1a61765f-8b4c-4f0f-a952-159c572bd491');

-- Alamo City Church
UPDATE "churches" SET "goodForGroups" = true WHERE "id" = '3b8ce273-ba97-434b-b979-16ff36e98c82' AND "goodForGroups" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = '3b8ce273-ba97-434b-b979-16ff36e98c82' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '3b8ce273-ba97-434b-b979-16ff36e98c82', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:00', NULL, 'Service', 'English'),
  (0, '11:00', NULL, 'Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '3b8ce273-ba97-434b-b979-16ff36e98c82');

-- Alamo Heights Baptist Church
UPDATE "churches" SET "email" = 'bobby@AHBC09.org' WHERE "id" = 'ee1b9988-dcac-447b-89ab-37a9d08dd999' AND "email" IS NULL;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'ee1b9988-dcac-447b-89ab-37a9d08dd999', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:00', NULL, 'Bible Study', 'English'),
  (0, '10:30', NULL, 'Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'ee1b9988-dcac-447b-89ab-37a9d08dd999');

-- Alamo Heights Christian Church
DELETE FROM "church_services" WHERE "churchId" = '36d2c3b8-472d-4d6b-b538-30fc8f8ed11d' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '36d2c3b8-472d-4d6b-b538-30fc8f8ed11d', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '11:00', NULL, 'Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '36d2c3b8-472d-4d6b-b538-30fc8f8ed11d');

-- Alamo Heights Presbyterian Church
UPDATE "churches" SET "email" = 'ahpc@alamoheightspres.com' WHERE "id" = 'cdaa99cc-a860-4329-8cae-a990024ab00c' AND "email" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = 'cdaa99cc-a860-4329-8cae-a990024ab00c' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'cdaa99cc-a860-4329-8cae-a990024ab00c', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '08:45', '09:45', 'BEE Adventures', 'English'),
  (0, '10:00', NULL, 'Traditional', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'cdaa99cc-a860-4329-8cae-a990024ab00c');

-- Alamo Heights United Methodist Church
DELETE FROM "church_services" WHERE "churchId" = 'c76f0765-c433-4c67-915c-421b827a6e37' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'c76f0765-c433-4c67-915c-421b827a6e37', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '08:30', NULL, 'Sanctuary Worship', 'English'),
  (0, '09:30', NULL, 'Modern Worship', 'English'),
  (0, '11:00', NULL, 'Sanctuary Worship', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'c76f0765-c433-4c67-915c-421b827a6e37');

-- Alamo United Methodist Church
UPDATE "churches" SET "pastorName" = 'Robert Knappage' WHERE "id" = '53f40746-25e3-4cbb-bfc5-a95051c22dd4' AND "pastorName" IS NULL;
UPDATE "churches" SET "yearEstablished" = 1908 WHERE "id" = '53f40746-25e3-4cbb-bfc5-a95051c22dd4' AND "yearEstablished" IS NULL;
UPDATE "churches" SET "goodForGroups" = true WHERE "id" = '53f40746-25e3-4cbb-bfc5-a95051c22dd4' AND "goodForGroups" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = '53f40746-25e3-4cbb-bfc5-a95051c22dd4' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '53f40746-25e3-4cbb-bfc5-a95051c22dd4', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:30', NULL, 'Bible Study', 'English'),
  (0, '09:30', NULL, 'Sunday School', 'English'),
  (0, '10:30', NULL, 'Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '53f40746-25e3-4cbb-bfc5-a95051c22dd4');

-- All Saints Anglican Church
UPDATE "churches" SET "pastorName" = 'Isaac Rehberg' WHERE "id" = '6aab5ec7-c662-4383-a8a7-6253ba7a3563' AND "pastorName" IS NULL;
UPDATE "churches" SET "description" = 'All Saints Anglican Church is a congregation in San Antonio, Texas that worships in the Anglican tradition through Word, Sacrament, and liturgical worship. Its calling is to proclaim the good news of Jesus Christ and to form disciples and equip the laity for ministry through classical spiritual disciplines.' WHERE "id" = '6aab5ec7-c662-4383-a8a7-6253ba7a3563' AND "description" IS NULL;
UPDATE "churches" SET "goodForChildren" = true WHERE "id" = '6aab5ec7-c662-4383-a8a7-6253ba7a3563' AND "goodForChildren" IS NULL;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '6aab5ec7-c662-4383-a8a7-6253ba7a3563', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:00', NULL, 'Holy Communion', 'English'),
  (0, '09:00', NULL, 'The Atrium (Kids)', 'English'),
  (0, '10:30', NULL, 'Adult Catechesis', 'English'),
  (0, '11:15', NULL, 'Holy Communion (Choral)', 'English'),
  (3, '09:15', NULL, 'The Atrium (Kids)', 'English'),
  (3, '09:30', NULL, 'Matins (Morning Prayer)', 'English'),
  (3, '18:00', NULL, 'Evensong (Evening Prayer)', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '6aab5ec7-c662-4383-a8a7-6253ba7a3563');

-- Amazing Church Texas
DELETE FROM "church_services" WHERE "churchId" = 'e15492d1-2ca5-423b-89a2-bf7e51037ed7' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'e15492d1-2ca5-423b-89a2-bf7e51037ed7', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '10:00', NULL, 'Service', 'English'),
  (3, '19:00', NULL, 'Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'e15492d1-2ca5-423b-89a2-bf7e51037ed7');

-- Antioch Missionary Baptist Church
UPDATE "churches" SET "pastorName" = 'Kenneth R. Kemp' WHERE "id" = '9d37df9e-964c-4f4a-99de-30bcea6a7081' AND "pastorName" IS NULL;
UPDATE "churches" SET "yearEstablished" = 1935 WHERE "id" = '9d37df9e-964c-4f4a-99de-30bcea6a7081' AND "yearEstablished" IS NULL;
UPDATE "churches" SET "description" = 'Antioch Missionary Baptist Church is a diverse, Bible-believing church in San Antonio, Texas, established in 1935. It is dedicated to reaching the lost, encouraging the saved, and enhancing the community through faith.' WHERE "id" = '9d37df9e-964c-4f4a-99de-30bcea6a7081' AND "description" IS NULL;
UPDATE "churches" SET "goodForChildren" = true WHERE "id" = '9d37df9e-964c-4f4a-99de-30bcea6a7081' AND "goodForChildren" IS NULL;

-- Assumption Chapel
UPDATE "churches" SET "email" = 'jlloyd@stmarytx.edu' WHERE "id" = '6e300d60-bab3-4c2f-a8ed-9506d1494b9d' AND "email" IS NULL;

-- Babcock Road Christian Church
DELETE FROM "church_services" WHERE "churchId" = '74028cc3-b30a-45ce-9905-4a322aaead5a' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '74028cc3-b30a-45ce-9905-4a322aaead5a', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '10:35', NULL, 'Morning Worship', 'English'),
  (0, '16:00', NULL, 'Bible Study', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '74028cc3-b30a-45ce-9905-4a322aaead5a');

-- Baruch Hashem Congregation
UPDATE "churches" SET "pastorName" = 'Roi Garcia' WHERE "id" = '3ab43eae-26ab-4868-b024-47be4af969e4' AND "pastorName" IS NULL;
UPDATE "churches" SET "goodForChildren" = true WHERE "id" = '3ab43eae-26ab-4868-b024-47be4af969e4' AND "goodForChildren" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = '3ab43eae-26ab-4868-b024-47be4af969e4' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '3ab43eae-26ab-4868-b024-47be4af969e4', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '14:00', NULL, 'Hebrew Classes', 'English'),
  (4, '19:00', NULL, 'Bible Study', 'English'),
  (5, '19:15', NULL, 'Erev Shabbat', 'English'),
  (6, '11:00', NULL, 'Boker Shabbat', 'English'),
  (6, '14:30', NULL, 'Spanish Sephardic', 'Spanish')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '3ab43eae-26ab-4868-b024-47be4af969e4');

-- Basilica of the National Shrine of the Little Flower
UPDATE "churches" SET "email" = 'admin@littleflowerbasilica.org' WHERE "id" = '4d4ddfbb-b4f1-476f-856f-d2bcee72e5a4' AND "email" IS NULL;
UPDATE "churches" SET "yearEstablished" = 1926 WHERE "id" = '4d4ddfbb-b4f1-476f-856f-d2bcee72e5a4' AND "yearEstablished" IS NULL;
UPDATE "churches" SET "description" = 'The Basilica of the National Shrine of the Little Flower is a Catholic parish in San Antonio, Texas, and the first National Shrine in the United States dedicated to St. Thérèse of Lisieux. It is served by the community of Discalced Carmelite Friars and serves as both a traditional parish and a historical and spiritual landmark.' WHERE "id" = '4d4ddfbb-b4f1-476f-856f-d2bcee72e5a4' AND "description" IS NULL;
UPDATE "churches" SET "languages" = ARRAY['English', 'Spanish']::text[] WHERE "id" = '4d4ddfbb-b4f1-476f-856f-d2bcee72e5a4' AND "languages" = ARRAY['English']::text[];
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '4d4ddfbb-b4f1-476f-856f-d2bcee72e5a4', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '08:00', NULL, 'Mass', 'English'),
  (0, '10:00', NULL, 'Mass', 'Spanish'),
  (0, '12:00', NULL, 'Mass', 'English'),
  (0, '17:30', NULL, 'Mass', 'Spanish'),
  (1, '12:00', NULL, 'Mass', 'English'),
  (2, '12:00', NULL, 'Mass', 'English'),
  (3, '12:00', NULL, 'Mass', 'English'),
  (4, '12:00', NULL, 'Mass', 'English'),
  (5, '12:00', NULL, 'Mass', 'English'),
  (6, '12:00', NULL, 'Mass', 'English'),
  (6, '17:30', NULL, 'Vigil Mass', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '4d4ddfbb-b4f1-476f-856f-d2bcee72e5a4');

-- Believers Fellowship
UPDATE "churches" SET "pastorName" = 'Chance Hunt' WHERE "id" = 'b2eee541-4722-4335-b3b9-51218fe67d1b' AND "pastorName" IS NULL;
UPDATE "churches" SET "email" = 'bf@bfsatx.org' WHERE "id" = 'b2eee541-4722-4335-b3b9-51218fe67d1b' AND "email" IS NULL;
UPDATE "churches" SET "yearEstablished" = 2007 WHERE "id" = 'b2eee541-4722-4335-b3b9-51218fe67d1b' AND "yearEstablished" IS NULL;
UPDATE "churches" SET "description" = 'Believers Fellowship is a church in San Antonio, Texas committed to the Bible as the inspired, authoritative, inerrant, and sufficient Word of God. It proclaims Jesus Christ as the central Person in history and offers Sunday services, Bible classes, fellowship groups, and ministries for children, students, and adults, including a Spanish ministry.' WHERE "id" = 'b2eee541-4722-4335-b3b9-51218fe67d1b' AND "description" IS NULL;
UPDATE "churches" SET "goodForChildren" = true WHERE "id" = 'b2eee541-4722-4335-b3b9-51218fe67d1b' AND "goodForChildren" IS NULL;
UPDATE "churches" SET "goodForGroups" = true WHERE "id" = 'b2eee541-4722-4335-b3b9-51218fe67d1b' AND "goodForGroups" IS NULL;
UPDATE "churches" SET "languages" = ARRAY['English', 'Spanish']::text[] WHERE "id" = 'b2eee541-4722-4335-b3b9-51218fe67d1b' AND "languages" = ARRAY['English']::text[];
DELETE FROM "church_services" WHERE "churchId" = 'b2eee541-4722-4335-b3b9-51218fe67d1b' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'b2eee541-4722-4335-b3b9-51218fe67d1b', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:00', NULL, 'Service', 'English'),
  (0, '11:00', NULL, 'Service', 'English'),
  (3, '18:30', '20:00', 'Bereans (College & Career)', 'English'),
  (3, '18:30', '20:00', 'CrossLife (High School Youth Group)', 'English'),
  (3, '18:30', '20:00', 'The Way (Middle School Youth Group)', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'b2eee541-4722-4335-b3b9-51218fe67d1b');

-- Belong Church
DELETE FROM "church_services" WHERE "churchId" = 'a7a45e2a-0485-4bac-b475-1d3afea67fd8' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'a7a45e2a-0485-4bac-b475-1d3afea67fd8', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '10:00', NULL, 'Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'a7a45e2a-0485-4bac-b475-1d3afea67fd8');

-- Bethany Missionary Baptist Church
UPDATE "churches" SET "pastorName" = 'Douglas Randle' WHERE "id" = '3ce90278-cd69-40cc-ade8-9821626a7cde' AND "pastorName" IS NULL;
UPDATE "churches" SET "goodForChildren" = true WHERE "id" = '3ce90278-cd69-40cc-ade8-9821626a7cde' AND "goodForChildren" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = '3ce90278-cd69-40cc-ade8-9821626a7cde' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '3ce90278-cd69-40cc-ade8-9821626a7cde', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '08:45', NULL, 'Sunday School', 'English'),
  (0, '10:00', NULL, 'Worship Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '3ce90278-cd69-40cc-ade8-9821626a7cde');

-- Bethany Primitive Baptist Church
UPDATE "churches" SET "pastorName" = 'Steve Wilkinson' WHERE "id" = '7db7eb25-e2b4-4ec8-b51e-850340139052' AND "pastorName" IS NULL;
UPDATE "churches" SET "email" = 'sabethanypbc@gmail.com' WHERE "id" = '7db7eb25-e2b4-4ec8-b51e-850340139052' AND "email" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = '7db7eb25-e2b4-4ec8-b51e-850340139052' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '7db7eb25-e2b4-4ec8-b51e-850340139052', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '10:30', NULL, 'Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '7db7eb25-e2b4-4ec8-b51e-850340139052');

-- Bethel Covenant AG
UPDATE "churches" SET "pastorName" = 'John Aniemeke' WHERE "id" = '9cfbaf96-be0b-4be7-a028-f1d07d96fb37' AND "pastorName" IS NULL;
UPDATE "churches" SET "yearEstablished" = 2013 WHERE "id" = '9cfbaf96-be0b-4be7-a028-f1d07d96fb37' AND "yearEstablished" IS NULL;
UPDATE "churches" SET "goodForChildren" = true WHERE "id" = '9cfbaf96-be0b-4be7-a028-f1d07d96fb37' AND "goodForChildren" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = '9cfbaf96-be0b-4be7-a028-f1d07d96fb37' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '9cfbaf96-be0b-4be7-a028-f1d07d96fb37', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '10:00', NULL, 'Service', 'English'),
  (3, '18:30', NULL, 'Service', 'English'),
  (5, '18:30', NULL, 'Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '9cfbaf96-be0b-4be7-a028-f1d07d96fb37');

-- Bethel United Methodist Church
UPDATE "churches" SET "pastorName" = 'Robert Brown' WHERE "id" = '30c97732-812e-4c19-9bc5-6ed4b6e5a73f' AND "pastorName" IS NULL;
UPDATE "churches" SET "email" = 'bethelumchurch@sbcglobal.net' WHERE "id" = '30c97732-812e-4c19-9bc5-6ed4b6e5a73f' AND "email" IS NULL;
UPDATE "churches" SET "yearEstablished" = 1966 WHERE "id" = '30c97732-812e-4c19-9bc5-6ed4b6e5a73f' AND "yearEstablished" IS NULL;

-- Brookhill Baptist Church
UPDATE "churches" SET "pastorName" = 'Aaron Treanor' WHERE "id" = 'b8433bc9-5243-404a-bf4f-0d8056ef54d1' AND "pastorName" IS NULL;
UPDATE "churches" SET "email" = 'brookhillchurch@sbcglobal.net' WHERE "id" = 'b8433bc9-5243-404a-bf4f-0d8056ef54d1' AND "email" IS NULL;
UPDATE "churches" SET "yearEstablished" = 1957 WHERE "id" = 'b8433bc9-5243-404a-bf4f-0d8056ef54d1' AND "yearEstablished" IS NULL;
UPDATE "churches" SET "description" = 'Brookhill Baptist Church is a church in San Antonio, TX that began in 1957 as a chapel formed through prayer services in a home. It seeks to be a light to the Brooks City-Base community and emphasizes growing together in knowing God as a lifelong process.' WHERE "id" = 'b8433bc9-5243-404a-bf4f-0d8056ef54d1' AND "description" IS NULL;
UPDATE "churches" SET "goodForChildren" = true WHERE "id" = 'b8433bc9-5243-404a-bf4f-0d8056ef54d1' AND "goodForChildren" IS NULL;
UPDATE "churches" SET "goodForGroups" = true WHERE "id" = 'b8433bc9-5243-404a-bf4f-0d8056ef54d1' AND "goodForGroups" IS NULL;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'b8433bc9-5243-404a-bf4f-0d8056ef54d1', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:30', '10:30', 'Sunday School', 'English'),
  (0, '10:50', NULL, 'Service', 'English'),
  (3, '17:30', '18:30', 'Food & Fellowship', 'English'),
  (3, '18:30', '19:30', 'Backyard Kids', 'English'),
  (3, '18:30', '19:30', 'Small Group', 'English'),
  (3, '18:30', '19:30', 'Youth Connect', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'b8433bc9-5243-404a-bf4f-0d8056ef54d1');

-- Bynum Seventh-day Adventist Church Spanish
DELETE FROM "church_services" WHERE "churchId" = '7eff7b12-35eb-4452-9262-a8662f03904e' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '7eff7b12-35eb-4452-9262-a8662f03904e', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (3, '19:30', NULL, 'Prayer Meeting', 'Spanish'),
  (6, '09:15', NULL, 'Sabbath School', 'Spanish'),
  (6, '11:00', NULL, 'Worship Service', 'Spanish')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '7eff7b12-35eb-4452-9262-a8662f03904e');

-- Calvary Chapel Jesus is The Way
UPDATE "churches" SET "pastorName" = 'Joel Ortega' WHERE "id" = '66292e70-a8c4-4a38-9510-9bea77da9271' AND "pastorName" IS NULL;

-- Calvary Chapel Solid Rock
UPDATE "churches" SET "goodForGroups" = true WHERE "id" = 'e0aba20a-54d2-4276-8197-2a5feb7b0538' AND "goodForGroups" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = 'e0aba20a-54d2-4276-8197-2a5feb7b0538' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'e0aba20a-54d2-4276-8197-2a5feb7b0538', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:00', NULL, 'Sunday Service', 'English'),
  (0, '11:00', NULL, 'Middle School', 'English'),
  (0, '11:00', NULL, 'Sunday Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'e0aba20a-54d2-4276-8197-2a5feb7b0538');

-- Calvary Chapel of San Antonio
UPDATE "churches" SET "email" = 'info@calvarysa.com' WHERE "id" = '6b397e1d-2914-48d7-9aa2-29a53437468f' AND "email" IS NULL;
UPDATE "churches" SET "yearEstablished" = 1994 WHERE "id" = '6b397e1d-2914-48d7-9aa2-29a53437468f' AND "yearEstablished" IS NULL;
UPDATE "churches" SET "description" = 'Calvary Chapel of San Antonio is a Calvary Chapel fellowship in Universal City, Texas, focused on verse-by-verse Bible teaching with an emphasis on practical application. The church began with a home Bible study in 1995 and now includes a Spanish-language service, youth ministries, a church academy, and a Bible college.' WHERE "id" = '6b397e1d-2914-48d7-9aa2-29a53437468f' AND "description" IS NULL;
UPDATE "churches" SET "goodForChildren" = true WHERE "id" = '6b397e1d-2914-48d7-9aa2-29a53437468f' AND "goodForChildren" IS NULL;
UPDATE "churches" SET "goodForGroups" = true WHERE "id" = '6b397e1d-2914-48d7-9aa2-29a53437468f' AND "goodForGroups" IS NULL;
UPDATE "churches" SET "languages" = ARRAY['English', 'Spanish']::text[] WHERE "id" = '6b397e1d-2914-48d7-9aa2-29a53437468f' AND "languages" = ARRAY['English']::text[];
DELETE FROM "church_services" WHERE "churchId" = '6b397e1d-2914-48d7-9aa2-29a53437468f' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '6b397e1d-2914-48d7-9aa2-29a53437468f', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '08:30', NULL, 'Service', 'English'),
  (0, '10:15', NULL, 'Service', 'English'),
  (0, '11:59', NULL, 'Service', 'English'),
  (0, '17:00', NULL, 'Spanish Service', 'Spanish'),
  (1, '19:00', NULL, 'Men''s Bible Study', 'English'),
  (1, '19:00', NULL, 'Women''s Bible Study', 'English'),
  (1, '19:00', NULL, 'Youth Bible Study', 'English'),
  (3, '19:00', NULL, 'Bible Study', 'English'),
  (5, '19:00', NULL, 'Bible Study', 'English'),
  (5, '19:00', NULL, 'Bible Study (Spanish)', 'Spanish'),
  (6, '09:30', NULL, 'Corporate Prayer', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '6b397e1d-2914-48d7-9aa2-29a53437468f');

-- Calvary Church
UPDATE "churches" SET "pastorName" = 'David Caruthers' WHERE "id" = '9ffa1aea-482e-4c5c-98c8-f7f65568d5c8' AND "pastorName" IS NULL;
UPDATE "churches" SET "denomination" = 'Oneness Pentecostal', "denominationFamily" = 'Pentecostal' WHERE "id" = '9ffa1aea-482e-4c5c-98c8-f7f65568d5c8' AND "denomination" IS NULL AND "denominationFamily" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = '9ffa1aea-482e-4c5c-98c8-f7f65568d5c8' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '9ffa1aea-482e-4c5c-98c8-f7f65568d5c8', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '10:00', NULL, 'Bible Class', 'English'),
  (0, '11:00', NULL, 'Worship & the Word', 'English'),
  (3, '19:30', NULL, 'Midweek Bible Study', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '9ffa1aea-482e-4c5c-98c8-f7f65568d5c8');

-- Calvary Hills Baptist Church
DELETE FROM "church_services" WHERE "churchId" = 'f2aab93d-5d1d-4925-aceb-588ffe10be2d' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'f2aab93d-5d1d-4925-aceb-588ffe10be2d', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '11:00', NULL, 'Service', 'English'),
  (0, '18:30', NULL, 'Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'f2aab93d-5d1d-4925-aceb-588ffe10be2d');

-- Calvary New Spring Church
UPDATE "churches" SET "goodForChildren" = true WHERE "id" = '256423b2-cb7e-4a1a-8e09-663dd31f7f2b' AND "goodForChildren" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = '256423b2-cb7e-4a1a-8e09-663dd31f7f2b' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '256423b2-cb7e-4a1a-8e09-663dd31f7f2b', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '10:00', NULL, 'Sunday Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '256423b2-cb7e-4a1a-8e09-663dd31f7f2b');

-- Camelot Christian Center
UPDATE "churches" SET "pastorName" = 'Stephen Corder' WHERE "id" = '7a02c560-3ce2-42b1-b6b3-7a6f27ad4e7e' AND "pastorName" IS NULL;
UPDATE "churches" SET "email" = 'Don@CamelotChristianCenter.com' WHERE "id" = '7a02c560-3ce2-42b1-b6b3-7a6f27ad4e7e' AND "email" IS NULL;

-- Catalyst Church SA
UPDATE "churches" SET "email" = 'info@catalystchurchsa.org' WHERE "id" = 'e8aa6c61-4c8a-44ee-814b-dcedd6fb7d62' AND "email" IS NULL;
UPDATE "churches" SET "yearEstablished" = 2014 WHERE "id" = 'e8aa6c61-4c8a-44ee-814b-dcedd6fb7d62' AND "yearEstablished" IS NULL;
UPDATE "churches" SET "goodForGroups" = true WHERE "id" = 'e8aa6c61-4c8a-44ee-814b-dcedd6fb7d62' AND "goodForGroups" IS NULL;
UPDATE "churches" SET "denomination" = 'Church of God', "denominationFamily" = 'Pentecostal' WHERE "id" = 'e8aa6c61-4c8a-44ee-814b-dcedd6fb7d62' AND "denomination" IS NULL AND "denominationFamily" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = 'e8aa6c61-4c8a-44ee-814b-dcedd6fb7d62' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'e8aa6c61-4c8a-44ee-814b-dcedd6fb7d62', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '12:30', NULL, 'Worship Service', 'Bilingual'),
  (0, '17:00', NULL, 'Worship Service', 'English'),
  (3, '19:30', NULL, 'Family Discipleship & Training Classes', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'e8aa6c61-4c8a-44ee-814b-dcedd6fb7d62');

-- Chapel Hill United Methodist Church
UPDATE "churches" SET "email" = 'chapelhill410@att.net' WHERE "id" = '3855529f-a906-428a-af4a-3039d9404de4' AND "email" IS NULL;
UPDATE "churches" SET "description" = 'Chapel Hill United Methodist Church in San Antonio is a Christ-centered, Bible-based church focused on reaching out, serving others, and growing in relationship with God and each other. Its mission is making disciples of Jesus Christ for the transformation of the world.' WHERE "id" = '3855529f-a906-428a-af4a-3039d9404de4' AND "description" IS NULL;
UPDATE "churches" SET "goodForChildren" = true WHERE "id" = '3855529f-a906-428a-af4a-3039d9404de4' AND "goodForChildren" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = '3855529f-a906-428a-af4a-3039d9404de4' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '3855529f-a906-428a-af4a-3039d9404de4', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '08:30', NULL, 'Traditional Worship & Communion', 'English'),
  (0, '09:45', NULL, 'Adult Bible Study (Theophilus)', 'English'),
  (0, '09:45', NULL, 'Youth Connect', 'English'),
  (0, '10:00', NULL, 'Adult Sunday School (Agape)', 'English'),
  (0, '11:00', NULL, 'Contemporary Worship Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '3855529f-a906-428a-af4a-3039d9404de4');

-- Chase Oaks Church - San Antonio
UPDATE "churches" SET "pastorName" = 'Jeff Jones' WHERE "id" = '6a7413b7-9935-4226-98f0-1426af4dc292' AND "pastorName" IS NULL;
UPDATE "churches" SET "yearEstablished" = 2004 WHERE "id" = '6a7413b7-9935-4226-98f0-1426af4dc292' AND "yearEstablished" IS NULL;
UPDATE "churches" SET "goodForChildren" = true WHERE "id" = '6a7413b7-9935-4226-98f0-1426af4dc292' AND "goodForChildren" IS NULL;
UPDATE "churches" SET "goodForGroups" = true WHERE "id" = '6a7413b7-9935-4226-98f0-1426af4dc292' AND "goodForGroups" IS NULL;

-- Chosen4Service Ministries
UPDATE "churches" SET "pastorName" = 'Charles Trammell Jr' WHERE "id" = '49041299-51c9-481e-8392-6e87ea55eb50' AND "pastorName" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = '49041299-51c9-481e-8392-6e87ea55eb50' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '49041299-51c9-481e-8392-6e87ea55eb50', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '18:00', NULL, 'Sunday Night Worship Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '49041299-51c9-481e-8392-6e87ea55eb50');

-- Christ Church San Antonio
UPDATE "churches" SET "pastorName" = 'Dom Fisher' WHERE "id" = 'a9b637ef-2ba3-4aee-a92f-34f8b219e3de' AND "pastorName" IS NULL;
UPDATE "churches" SET "email" = 'info@christchurchsa.com' WHERE "id" = 'a9b637ef-2ba3-4aee-a92f-34f8b219e3de' AND "email" IS NULL;
UPDATE "churches" SET "description" = 'Christ Church San Antonio is a gospel-centered church whose mission is to glorify God by making mature disciples of Christ, rooted in the Word, growing in grace, and living together in covenant community. It offers ministries for children, students, men, women, and community groups.' WHERE "id" = 'a9b637ef-2ba3-4aee-a92f-34f8b219e3de' AND "description" IS NULL;
UPDATE "churches" SET "goodForChildren" = true WHERE "id" = 'a9b637ef-2ba3-4aee-a92f-34f8b219e3de' AND "goodForChildren" IS NULL;
UPDATE "churches" SET "goodForGroups" = true WHERE "id" = 'a9b637ef-2ba3-4aee-a92f-34f8b219e3de' AND "goodForGroups" IS NULL;

-- Christ Community Church
UPDATE "churches" SET "pastorName" = 'Will Davis' WHERE "id" = '8b1a5d06-91f2-400a-a4c5-c6432cb31159' AND "pastorName" IS NULL;

-- Christ Fellowship United Methodist Church
UPDATE "churches" SET "pastorName" = 'Kevin Portwood' WHERE "id" = '14b6cc40-5e66-43a5-877a-f9f7b96a65b1' AND "pastorName" IS NULL;
UPDATE "churches" SET "email" = 'info@cfumcsa.org' WHERE "id" = '14b6cc40-5e66-43a5-877a-f9f7b96a65b1' AND "email" IS NULL;
UPDATE "churches" SET "yearEstablished" = 2013 WHERE "id" = '14b6cc40-5e66-43a5-877a-f9f7b96a65b1' AND "yearEstablished" IS NULL;
UPDATE "churches" SET "description" = 'Christ Fellowship UMC is a United Methodist congregation on the far west side of San Antonio, Texas, founded in 2013 as a church plant from University Methodist Church. Its vision is to gather, equip and empower the community to make new disciples of Jesus Christ for the transformation of the world.' WHERE "id" = '14b6cc40-5e66-43a5-877a-f9f7b96a65b1' AND "description" IS NULL;
UPDATE "churches" SET "goodForChildren" = true WHERE "id" = '14b6cc40-5e66-43a5-877a-f9f7b96a65b1' AND "goodForChildren" IS NULL;
UPDATE "churches" SET "goodForGroups" = true WHERE "id" = '14b6cc40-5e66-43a5-877a-f9f7b96a65b1' AND "goodForGroups" IS NULL;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '14b6cc40-5e66-43a5-877a-f9f7b96a65b1', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:00', NULL, 'Sunday School', 'English'),
  (0, '10:30', NULL, 'Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '14b6cc40-5e66-43a5-877a-f9f7b96a65b1');

-- Christ Is King Church
UPDATE "churches" SET "pastorName" = 'Matt Bell' WHERE "id" = 'b96cfd68-e1cc-4549-a168-5f780caf2f13' AND "pastorName" IS NULL;
UPDATE "churches" SET "email" = 'office@christisking.church' WHERE "id" = 'b96cfd68-e1cc-4549-a168-5f780caf2f13' AND "email" IS NULL;
UPDATE "churches" SET "yearEstablished" = 1941 WHERE "id" = 'b96cfd68-e1cc-4549-a168-5f780caf2f13' AND "yearEstablished" IS NULL;
UPDATE "churches" SET "description" = 'Christ Is King Church is a nondenominational, multi-generational and multi-cultural Protestant church with campuses in San Antonio and Fredericksburg, Texas. It exists to advance the Kingdom of Christ in every area of thought and life.' WHERE "id" = 'b96cfd68-e1cc-4549-a168-5f780caf2f13' AND "description" IS NULL;
UPDATE "churches" SET "goodForChildren" = true WHERE "id" = 'b96cfd68-e1cc-4549-a168-5f780caf2f13' AND "goodForChildren" IS NULL;
UPDATE "churches" SET "goodForGroups" = true WHERE "id" = 'b96cfd68-e1cc-4549-a168-5f780caf2f13' AND "goodForGroups" IS NULL;
UPDATE "churches" SET "denomination" = 'Non-denominational', "denominationFamily" = 'Non-denominational' WHERE "id" = 'b96cfd68-e1cc-4549-a168-5f780caf2f13' AND "denomination" IS NULL AND "denominationFamily" IS NULL;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'b96cfd68-e1cc-4549-a168-5f780caf2f13', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '10:00', NULL, 'Service', 'English'),
  (3, '19:00', NULL, 'Youth', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'b96cfd68-e1cc-4549-a168-5f780caf2f13');

-- Christ Lutheran Church
UPDATE "churches" SET "pastorName" = 'Leslie Price' WHERE "id" = '65a34b9c-316b-479a-a67d-795773aaa977' AND "pastorName" IS NULL;
UPDATE "churches" SET "email" = 'leslie@clcah.org' WHERE "id" = '65a34b9c-316b-479a-a67d-795773aaa977' AND "email" IS NULL;
UPDATE "churches" SET "goodForChildren" = true WHERE "id" = '65a34b9c-316b-479a-a67d-795773aaa977' AND "goodForChildren" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = '65a34b9c-316b-479a-a67d-795773aaa977' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '65a34b9c-316b-479a-a67d-795773aaa977', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '08:30', NULL, 'Service', 'English'),
  (0, '10:30', NULL, 'Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '65a34b9c-316b-479a-a67d-795773aaa977');

-- Christ Our Savior Lutheran Church
DELETE FROM "church_services" WHERE "churchId" = '3f7dbf63-e0db-4956-acc6-197cca343bc1' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '3f7dbf63-e0db-4956-acc6-197cca343bc1', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '10:30', NULL, 'Worship Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '3f7dbf63-e0db-4956-acc6-197cca343bc1');

-- Christ the King Catholic Church
UPDATE "churches" SET "pastorName" = 'Martin Garcia-Avila' WHERE "id" = 'ee91f580-0c67-4d00-b241-39b7586a920c' AND "pastorName" IS NULL;
UPDATE "churches" SET "yearEstablished" = 1927 WHERE "id" = 'ee91f580-0c67-4d00-b241-39b7586a920c' AND "yearEstablished" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = 'ee91f580-0c67-4d00-b241-39b7586a920c' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'ee91f580-0c67-4d00-b241-39b7586a920c', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '08:00', NULL, 'Mass', 'Spanish'),
  (0, '10:00', NULL, 'Mass', 'Spanish'),
  (0, '12:00', NULL, 'Mass', 'English'),
  (0, '14:00', NULL, 'Mass', 'Spanish'),
  (1, '08:00', NULL, 'Mass', 'Spanish'),
  (2, '08:00', NULL, 'Mass', 'Spanish'),
  (3, '08:00', NULL, 'Mass', 'Spanish'),
  (4, '08:00', NULL, 'Mass', 'Spanish'),
  (6, '16:00', NULL, 'Vigil Mass', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'ee91f580-0c67-4d00-b241-39b7586a920c');

-- Christ the King Lutheran Church
UPDATE "churches" SET "email" = 'info@crosstrails.org' WHERE "id" = '5011fcca-b2a3-47aa-8307-5c8b365d72ab' AND "email" IS NULL;
UPDATE "churches" SET "yearEstablished" = 1964 WHERE "id" = '5011fcca-b2a3-47aa-8307-5c8b365d72ab' AND "yearEstablished" IS NULL;
UPDATE "churches" SET "description" = 'Christ the King Lutheran Church is an ELCA congregation in Universal City, TX, founded in 1964 near Randolph Air Force Base. It has over 400 baptized and confirmed members and hosts community organizations such as the Disabled American Veterans and AARP Tax Aide.' WHERE "id" = '5011fcca-b2a3-47aa-8307-5c8b365d72ab' AND "description" IS NULL;
UPDATE "churches" SET "goodForGroups" = true WHERE "id" = '5011fcca-b2a3-47aa-8307-5c8b365d72ab' AND "goodForGroups" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = '5011fcca-b2a3-47aa-8307-5c8b365d72ab' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '5011fcca-b2a3-47aa-8307-5c8b365d72ab', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:15', NULL, 'Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '5011fcca-b2a3-47aa-8307-5c8b365d72ab');

-- Christ the Servant Charismatic Episcopal Church
UPDATE "churches" SET "pastorName" = 'John Sweeney' WHERE "id" = 'f4a0638a-4a61-4241-9e44-ac66166ddca2' AND "pastorName" IS NULL;
UPDATE "churches" SET "goodForChildren" = true WHERE "id" = 'f4a0638a-4a61-4241-9e44-ac66166ddca2' AND "goodForChildren" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = 'f4a0638a-4a61-4241-9e44-ac66166ddca2' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'f4a0638a-4a61-4241-9e44-ac66166ddca2', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '10:30', NULL, 'Holy Eucharist', 'English'),
  (4, '19:00', NULL, 'Adult Formation/Catechism', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'f4a0638a-4a61-4241-9e44-ac66166ddca2');

-- Christian Family Baptist Church
UPDATE "churches" SET "pastorName" = 'Rob Johnson' WHERE "id" = '93e9b857-9d9a-457a-80fa-4dfb14abba3b' AND "pastorName" IS NULL;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '93e9b857-9d9a-457a-80fa-4dfb14abba3b', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:00', NULL, 'Bible Study', 'English'),
  (0, '10:00', NULL, 'Worship', 'English'),
  (2, '18:00', NULL, 'Community Prayer', 'English'),
  (3, '18:00', NULL, 'Bible Study', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '93e9b857-9d9a-457a-80fa-4dfb14abba3b');

-- Christian Family Church San Antonio
UPDATE "churches" SET "pastorName" = 'Theo Wolmarans' WHERE "id" = '247aa8c5-8bcf-4870-82ac-eab178be88c0' AND "pastorName" IS NULL;
UPDATE "churches" SET "yearEstablished" = 2002 WHERE "id" = '247aa8c5-8bcf-4870-82ac-eab178be88c0' AND "yearEstablished" IS NULL;
UPDATE "churches" SET "languages" = ARRAY['English', 'Spanish']::text[] WHERE "id" = '247aa8c5-8bcf-4870-82ac-eab178be88c0' AND "languages" = ARRAY['English']::text[];
DELETE FROM "church_services" WHERE "churchId" = '247aa8c5-8bcf-4870-82ac-eab178be88c0' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '247aa8c5-8bcf-4870-82ac-eab178be88c0', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '10:00', NULL, 'Morning service', 'English'),
  (6, '17:00', NULL, 'Evening service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '247aa8c5-8bcf-4870-82ac-eab178be88c0');

-- Christian World Ministries
DELETE FROM "church_services" WHERE "churchId" = 'f796e11f-1d73-4882-965a-120f62931b57' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'f796e11f-1d73-4882-965a-120f62931b57', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '10:00', NULL, 'Main Service', 'English'),
  (3, '19:00', NULL, 'Bible Study', 'English'),
  (3, '19:00', NULL, 'Youth', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'f796e11f-1d73-4882-965a-120f62931b57');

-- Church of Acts
UPDATE "churches" SET "description" = 'Church of Acts is an Apostolic Training Center located in San Antonio, Texas.' WHERE "id" = 'e4ea7f28-d861-40a1-a989-0e1d44176a00' AND "description" IS NULL;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'e4ea7f28-d861-40a1-a989-0e1d44176a00', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '11:00', NULL, 'Service', 'English'),
  (3, '19:30', NULL, 'Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'e4ea7f28-d861-40a1-a989-0e1d44176a00');

-- Church of God (Seventh-Day)
UPDATE "churches" SET "email" = 'contact@cog7.org' WHERE "id" = 'b85a5de1-e752-4c47-bf05-57646bad4079' AND "email" IS NULL;
UPDATE "churches" SET "yearEstablished" = 1863 WHERE "id" = 'b85a5de1-e752-4c47-bf05-57646bad4079' AND "yearEstablished" IS NULL;

-- Church of the Blessed Sacrament
UPDATE "churches" SET "pastorName" = 'Johnson Lê' WHERE "id" = 'b0145d14-939e-408a-a59f-b3668f065cb6' AND "pastorName" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = 'b0145d14-939e-408a-a59f-b3668f065cb6' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'b0145d14-939e-408a-a59f-b3668f065cb6', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '08:00', NULL, 'Mass', 'English'),
  (0, '10:00', NULL, 'Mass', 'English'),
  (0, '12:15', NULL, 'Mass', 'English'),
  (0, '15:00', NULL, 'Mass', 'Spanish'),
  (0, '20:00', NULL, 'Mass', 'English'),
  (1, '08:00', NULL, 'Mass', 'English'),
  (2, '08:00', NULL, 'Mass', 'English'),
  (3, '08:00', NULL, 'Mass', 'English'),
  (3, '17:30', NULL, 'Mass', 'English'),
  (4, '08:00', NULL, 'Mass', 'English'),
  (5, '08:00', NULL, 'Mass', 'English'),
  (6, '17:30', NULL, 'Vigil Mass', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'b0145d14-939e-408a-a59f-b3668f065cb6');

-- Church of the Resurrection, Episcopal
DELETE FROM "church_services" WHERE "churchId" = '8d5fae84-89ef-4bbb-b54c-9a1234569ee4' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '8d5fae84-89ef-4bbb-b54c-9a1234569ee4', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '08:00', NULL, 'Holy Eucharist Rite 1', 'English'),
  (0, '09:00', NULL, 'Adult Sunday School', 'English'),
  (0, '10:00', NULL, 'Holy Eucharist Rite 2', 'English'),
  (0, '11:30', NULL, 'Eucaristía rito 2', 'Spanish')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '8d5fae84-89ef-4bbb-b54c-9a1234569ee4');

-- Churchill Baptist Church
UPDATE "churches" SET "pastorName" = 'Jordan Cedeño' WHERE "id" = 'b53c972f-02e6-42ef-a787-ab45e94f4054' AND "pastorName" IS NULL;
UPDATE "churches" SET "email" = 'churchill@churchillbaptist.org' WHERE "id" = 'b53c972f-02e6-42ef-a787-ab45e94f4054' AND "email" IS NULL;
UPDATE "churches" SET "description" = 'Churchill Baptist Church is a Baptist congregation in San Antonio, Texas, offering Sunday Bible study for all ages and a contemporary blend worship service. It has ministries for children and students, and a Spanish-language ministry.' WHERE "id" = 'b53c972f-02e6-42ef-a787-ab45e94f4054' AND "description" IS NULL;
UPDATE "churches" SET "goodForChildren" = true WHERE "id" = 'b53c972f-02e6-42ef-a787-ab45e94f4054' AND "goodForChildren" IS NULL;
UPDATE "churches" SET "goodForGroups" = true WHERE "id" = 'b53c972f-02e6-42ef-a787-ab45e94f4054' AND "goodForGroups" IS NULL;
UPDATE "churches" SET "languages" = ARRAY['English', 'Spanish']::text[] WHERE "id" = 'b53c972f-02e6-42ef-a787-ab45e94f4054' AND "languages" = ARRAY['English']::text[];
DELETE FROM "church_services" WHERE "churchId" = 'b53c972f-02e6-42ef-a787-ab45e94f4054' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'b53c972f-02e6-42ef-a787-ab45e94f4054', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:30', '10:30', 'Bible Study', 'English'),
  (0, '10:40', NULL, 'Worship Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'b53c972f-02e6-42ef-a787-ab45e94f4054');

-- City Tribe
UPDATE "churches" SET "pastorName" = 'Doug Robins' WHERE "id" = '6e1f8a03-a730-4e79-b593-59c9c7121aca' AND "pastorName" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = '6e1f8a03-a730-4e79-b593-59c9c7121aca' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '6e1f8a03-a730-4e79-b593-59c9c7121aca', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '08:30', NULL, 'Service', 'English'),
  (0, '10:00', NULL, 'Service', 'English'),
  (0, '11:30', NULL, 'Service', 'English'),
  (0, '13:00', NULL, 'Service', 'English'),
  (3, '19:00', NULL, 'Youth', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '6e1f8a03-a730-4e79-b593-59c9c7121aca');

-- City of Refuge Christian Fellowship
DELETE FROM "church_services" WHERE "churchId" = '3d59bc76-fe58-40c0-80b0-e21241ea5736' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '3d59bc76-fe58-40c0-80b0-e21241ea5736', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '10:00', '12:30', 'Service', 'English'),
  (2, '19:00', NULL, 'Intercessory Prayer', 'English'),
  (3, '19:00', '21:00', 'Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '3d59bc76-fe58-40c0-80b0-e21241ea5736');

-- CityChurch San Antonio
UPDATE "churches" SET "pastorName" = 'Brent Saathoff' WHERE "id" = '89180069-75af-4f24-bf3b-3a2a05b70f0a' AND "pastorName" IS NULL;

-- Coker Methodist Church
UPDATE "churches" SET "email" = 'communications@coker.org' WHERE "id" = '7f0db9a6-862f-4f04-992a-f3eff3040fdb' AND "email" IS NULL;
UPDATE "churches" SET "yearEstablished" = 1883 WHERE "id" = '7f0db9a6-862f-4f04-992a-f3eff3040fdb' AND "yearEstablished" IS NULL;
UPDATE "churches" SET "description" = 'Coker Methodist Church is a friendly, family-oriented, mission-minded Global Methodist church in San Antonio, Texas, founded in 1883. It offers multiple worship services including Chapel, Contemporary, Traditional and Spanish/Bilingual options, plus a second worshipping community at Hope Arise in the Stone Oak area.' WHERE "id" = '7f0db9a6-862f-4f04-992a-f3eff3040fdb' AND "description" IS NULL;
UPDATE "churches" SET "goodForChildren" = true WHERE "id" = '7f0db9a6-862f-4f04-992a-f3eff3040fdb' AND "goodForChildren" IS NULL;
UPDATE "churches" SET "goodForGroups" = true WHERE "id" = '7f0db9a6-862f-4f04-992a-f3eff3040fdb' AND "goodForGroups" IS NULL;
UPDATE "churches" SET "wheelchairAccessible" = true WHERE "id" = '7f0db9a6-862f-4f04-992a-f3eff3040fdb' AND "wheelchairAccessible" IS NULL;
UPDATE "churches" SET "languages" = ARRAY['English', 'Spanish']::text[] WHERE "id" = '7f0db9a6-862f-4f04-992a-f3eff3040fdb' AND "languages" = ARRAY['English']::text[];
DELETE FROM "church_services" WHERE "churchId" = '7f0db9a6-862f-4f04-992a-f3eff3040fdb' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '7f0db9a6-862f-4f04-992a-f3eff3040fdb', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '08:00', NULL, 'Chapel Service', 'English'),
  (0, '09:30', NULL, 'Contemporary', 'English'),
  (0, '10:30', '12:00', 'Hope Arise', 'English'),
  (0, '11:00', NULL, 'Español y Bilingual', 'Spanish'),
  (0, '11:00', NULL, 'Traditional', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '7f0db9a6-862f-4f04-992a-f3eff3040fdb');

-- Coliseum Park Baptist Church
UPDATE "churches" SET "pastorName" = 'LaCarlton D. Stephens' WHERE "id" = '2b6eedc5-b784-4539-8c50-258325e2b2af' AND "pastorName" IS NULL;
UPDATE "churches" SET "email" = 'cpbc101@gmail.com' WHERE "id" = '2b6eedc5-b784-4539-8c50-258325e2b2af' AND "email" IS NULL;
UPDATE "churches" SET "description" = 'Coliseum Park Baptist Church is a Baptist congregation in San Antonio, Texas, led by Rev. LaCarlton D. Stephens, who has served as pastor for 17 years. The church offers worship, Sunday School, midweek prayer and Bible study, and a range of ministries for its members.' WHERE "id" = '2b6eedc5-b784-4539-8c50-258325e2b2af' AND "description" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = '2b6eedc5-b784-4539-8c50-258325e2b2af' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '2b6eedc5-b784-4539-8c50-258325e2b2af', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '08:15', NULL, 'Sunday School', 'English'),
  (0, '09:15', NULL, 'Worship Service', 'English'),
  (3, '18:30', NULL, 'Prayer and Bible Study', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '2b6eedc5-b784-4539-8c50-258325e2b2af');

-- Colonial Hills United Methodist Church
UPDATE "churches" SET "pastorName" = 'Dan Harrington' WHERE "id" = '63fd7e0a-eeef-4dea-85c0-ba36221de823' AND "pastorName" IS NULL;
UPDATE "churches" SET "yearEstablished" = 2005 WHERE "id" = '63fd7e0a-eeef-4dea-85c0-ba36221de823' AND "yearEstablished" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = '63fd7e0a-eeef-4dea-85c0-ba36221de823' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '63fd7e0a-eeef-4dea-85c0-ba36221de823', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '08:30', NULL, 'Traditional', 'English'),
  (0, '11:00', NULL, 'Blended', 'English'),
  (2, '13:00', '14:30', 'Bible Study', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '63fd7e0a-eeef-4dea-85c0-ba36221de823');

-- Community Bible Church
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'b2e8213b-11f7-4e0c-97a1-be78a4c1a0a9', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '08:00', NULL, 'Service', 'English'),
  (0, '10:00', NULL, 'Service', 'English'),
  (0, '12:00', NULL, 'Service', 'English'),
  (0, '14:00', NULL, 'Service', 'English'),
  (6, '15:00', NULL, 'Service', 'English'),
  (6, '17:00', NULL, 'Deaf Service', 'English'),
  (6, '17:00', NULL, 'Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'b2e8213b-11f7-4e0c-97a1-be78a4c1a0a9');

-- Community Bible Church - Southside
UPDATE "churches" SET "pastorName" = 'Ed Newton' WHERE "id" = '6b8a5b81-3a77-41bd-9b68-de44d78293a1' AND "pastorName" IS NULL;
UPDATE "churches" SET "phone" = '210-496-5096' WHERE "id" = '6b8a5b81-3a77-41bd-9b68-de44d78293a1' AND "phone" IS NULL;
UPDATE "churches" SET "languages" = ARRAY['English', 'Spanish', 'ASL', 'American Sign Language']::text[] WHERE "id" = '6b8a5b81-3a77-41bd-9b68-de44d78293a1' AND "languages" = ARRAY['English', 'Spanish', 'ASL']::text[];
DELETE FROM "church_services" WHERE "churchId" = '6b8a5b81-3a77-41bd-9b68-de44d78293a1' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '6b8a5b81-3a77-41bd-9b68-de44d78293a1', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:00', NULL, 'Service', 'English'),
  (0, '11:00', NULL, 'Service', 'English'),
  (0, '13:00', NULL, 'Deaf Service', 'American Sign Language'),
  (0, '13:00', NULL, 'Service', 'English'),
  (3, '18:00', NULL, 'Youth', 'English'),
  (6, '17:00', NULL, 'Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '6b8a5b81-3a77-41bd-9b68-de44d78293a1');

-- Community Bible Church - West
UPDATE "churches" SET "pastorName" = 'Ed Newton' WHERE "id" = 'e4a4216f-41b1-4b0f-ab1b-5f5354985015' AND "pastorName" IS NULL;
UPDATE "churches" SET "languages" = ARRAY['English', 'Spanish']::text[] WHERE "id" = 'e4a4216f-41b1-4b0f-ab1b-5f5354985015' AND "languages" = ARRAY['English']::text[];
DELETE FROM "church_services" WHERE "churchId" = 'e4a4216f-41b1-4b0f-ab1b-5f5354985015' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'e4a4216f-41b1-4b0f-ab1b-5f5354985015', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:00', NULL, 'Service', 'English'),
  (0, '11:00', NULL, 'Service', 'English'),
  (3, '18:00', NULL, 'Youth', 'English'),
  (6, '17:00', NULL, 'Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'e4a4216f-41b1-4b0f-ab1b-5f5354985015');

-- Compassion Church
UPDATE "churches" SET "pastorName" = 'Adrian B. Compton' WHERE "id" = 'fffe3e66-a7ef-4fbe-a6e0-30e5a66acbaa' AND "pastorName" IS NULL;
UPDATE "churches" SET "yearEstablished" = 2015 WHERE "id" = 'fffe3e66-a7ef-4fbe-a6e0-30e5a66acbaa' AND "yearEstablished" IS NULL;
UPDATE "churches" SET "description" = 'Compassion Church is a church in San Antonio, Texas, founded in 2015 by Pastor Adrian B. Compton. It offers Sunday services, Compassion Kids, Life Groups, and local and global mission outreach.' WHERE "id" = 'fffe3e66-a7ef-4fbe-a6e0-30e5a66acbaa' AND "description" IS NULL;
UPDATE "churches" SET "goodForChildren" = true WHERE "id" = 'fffe3e66-a7ef-4fbe-a6e0-30e5a66acbaa' AND "goodForChildren" IS NULL;
UPDATE "churches" SET "goodForGroups" = true WHERE "id" = 'fffe3e66-a7ef-4fbe-a6e0-30e5a66acbaa' AND "goodForGroups" IS NULL;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'fffe3e66-a7ef-4fbe-a6e0-30e5a66acbaa', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '08:15', '09:00', 'Bible Study', 'English'),
  (0, '11:00', NULL, 'Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'fffe3e66-a7ef-4fbe-a6e0-30e5a66acbaa');

-- Concordia Lutheran Church
DELETE FROM "church_services" WHERE "churchId" = 'f2a965c3-1565-4de3-9bde-702cca283e64' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'f2a965c3-1565-4de3-9bde-702cca283e64', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '08:00', NULL, 'Traditional', 'English'),
  (0, '09:30', NULL, 'Blended', 'English'),
  (0, '11:00', NULL, 'Contemporary', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'f2a965c3-1565-4de3-9bde-702cca283e64');

-- Congregation Beth Simcha
UPDATE "churches" SET "goodForChildren" = true WHERE "id" = '795c1e8e-52de-43c2-bee1-530e3c5e73ae' AND "goodForChildren" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = '795c1e8e-52de-43c2-bee1-530e3c5e73ae' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '795c1e8e-52de-43c2-bee1-530e3c5e73ae', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (6, '09:30', NULL, 'Shabbat School', 'English'),
  (6, '10:30', NULL, 'Shabbat Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '795c1e8e-52de-43c2-bee1-530e3c5e73ae');

-- Cornerstone Church
UPDATE "churches" SET "pastorName" = 'John Hagee' WHERE "id" = '74d11d4e-5908-45c1-a7fc-38559bedbd5f' AND "pastorName" IS NULL;
UPDATE "churches" SET "description" = 'Cornerstone Church is a non-denominational evangelical church in San Antonio, Texas, founded by Pastor John Hagee. Its mission is to bring all the Gospel to all the world and to all generations, saving the lost and building up believers.' WHERE "id" = '74d11d4e-5908-45c1-a7fc-38559bedbd5f' AND "description" IS NULL;
UPDATE "churches" SET "goodForChildren" = true WHERE "id" = '74d11d4e-5908-45c1-a7fc-38559bedbd5f' AND "goodForChildren" IS NULL;
UPDATE "churches" SET "goodForGroups" = true WHERE "id" = '74d11d4e-5908-45c1-a7fc-38559bedbd5f' AND "goodForGroups" IS NULL;
UPDATE "churches" SET "languages" = ARRAY['English', 'Spanish']::text[] WHERE "id" = '74d11d4e-5908-45c1-a7fc-38559bedbd5f' AND "languages" = ARRAY['English']::text[];
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '74d11d4e-5908-45c1-a7fc-38559bedbd5f', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '08:30', NULL, 'Service', 'English'),
  (0, '11:00', NULL, 'Service', 'English'),
  (0, '14:00', NULL, 'Service', 'Spanish'),
  (3, '19:00', NULL, 'Service', 'Spanish')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '74d11d4e-5908-45c1-a7fc-38559bedbd5f');

-- Corona De Vida Assembly of God
UPDATE "churches" SET "email" = 'francisco_casas@hotmail.com' WHERE "id" = 'cf521ed5-d939-4e98-8b0c-e207aa423c72' AND "email" IS NULL;
UPDATE "churches" SET "goodForChildren" = true WHERE "id" = 'cf521ed5-d939-4e98-8b0c-e207aa423c72' AND "goodForChildren" IS NULL;
UPDATE "churches" SET "goodForGroups" = true WHERE "id" = 'cf521ed5-d939-4e98-8b0c-e207aa423c72' AND "goodForGroups" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = 'cf521ed5-d939-4e98-8b0c-e207aa423c72' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'cf521ed5-d939-4e98-8b0c-e207aa423c72', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '10:00', NULL, 'Servicio de Educación', 'Spanish'),
  (0, '11:00', NULL, 'Servicio de Adoración', 'Spanish'),
  (2, '19:00', NULL, 'Servicio de Oración', 'Spanish'),
  (3, '10:00', '12:30', 'Estudio Bíblico y Servicio Edad de Oro', 'Spanish'),
  (4, '13:00', NULL, 'Servicio Familiar', 'Spanish')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'cf521ed5-d939-4e98-8b0c-e207aa423c72');

-- Covenant Baptist Church
UPDATE "churches" SET "pastorName" = 'Jenny Perkins Kiser' WHERE "id" = 'bfc291e8-f321-4ea2-a2de-fc06bdd7f4dd' AND "pastorName" IS NULL;
UPDATE "churches" SET "yearEstablished" = 1970 WHERE "id" = 'bfc291e8-f321-4ea2-a2de-fc06bdd7f4dd' AND "yearEstablished" IS NULL;
UPDATE "churches" SET "phone" = '210-878-4200' WHERE "id" = 'bfc291e8-f321-4ea2-a2de-fc06bdd7f4dd' AND "phone" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = 'bfc291e8-f321-4ea2-a2de-fc06bdd7f4dd' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'bfc291e8-f321-4ea2-a2de-fc06bdd7f4dd', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:15', NULL, 'Sunday School', 'English'),
  (0, '10:30', NULL, 'Main Worship Gathering', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'bfc291e8-f321-4ea2-a2de-fc06bdd7f4dd');

-- Covenant Community Church
UPDATE "churches" SET "email" = 'cccadmin@mycovenantcc.onmicrosoft.com' WHERE "id" = '1145e932-9472-4409-a430-6c91a5f6272a' AND "email" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = '1145e932-9472-4409-a430-6c91a5f6272a' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '1145e932-9472-4409-a430-6c91a5f6272a', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '08:45', '09:45', 'Sunday School', 'English'),
  (0, '10:00', NULL, 'Service', 'English'),
  (3, '19:00', '20:30', 'Worship and the Word', 'English'),
  (5, '06:00', '06:30', 'Friday Prayer Call', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '1145e932-9472-4409-a430-6c91a5f6272a');

-- Covenant Presbyterian Church
UPDATE "churches" SET "email" = 'office@covenantcares.org' WHERE "id" = 'f646dd40-c774-4f1e-bcb0-31f5adc66b38' AND "email" IS NULL;
UPDATE "churches" SET "yearEstablished" = 1956 WHERE "id" = 'f646dd40-c774-4f1e-bcb0-31f5adc66b38' AND "yearEstablished" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = 'f646dd40-c774-4f1e-bcb0-31f5adc66b38' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'f646dd40-c774-4f1e-bcb0-31f5adc66b38', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '10:30', NULL, 'Service', 'English'),
  (2, '19:00', NULL, 'Bible Study', 'English'),
  (2, '19:00', NULL, 'Young Adult Bible Study', 'English'),
  (3, '10:00', NULL, 'Women''s Bible Study', 'English'),
  (4, '19:00', NULL, 'Zoom Bible Study', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'f646dd40-c774-4f1e-bcb0-31f5adc66b38');

-- Crestview Baptist Church
DELETE FROM "church_services" WHERE "churchId" = '2e908a4b-c9ab-4609-b857-4c5292f744b0' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '2e908a4b-c9ab-4609-b857-4c5292f744b0', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:45', NULL, 'Bible Study', 'English'),
  (0, '11:00', NULL, 'Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '2e908a4b-c9ab-4609-b857-4c5292f744b0');

-- Cross Church San Antonio
UPDATE "churches" SET "pastorName" = 'Jaime Loya' WHERE "id" = '3412b4ad-2650-4b93-a867-bce7f47a5c42' AND "pastorName" IS NULL;
UPDATE "churches" SET "yearEstablished" = 1995 WHERE "id" = '3412b4ad-2650-4b93-a867-bce7f47a5c42' AND "yearEstablished" IS NULL;

-- Cross Roads Church
UPDATE "churches" SET "wheelchairAccessible" = true WHERE "id" = '2d1e9236-7e94-4991-adfa-b7adafe22919' AND "wheelchairAccessible" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = '2d1e9236-7e94-4991-adfa-b7adafe22919' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '2d1e9236-7e94-4991-adfa-b7adafe22919', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '10:00', NULL, 'Worship', 'English'),
  (0, '11:30', '12:30', 'Sunday School', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '2d1e9236-7e94-4991-adfa-b7adafe22919');

-- Cross of Christ Evangelical Lutheran
UPDATE "churches" SET "pastorName" = 'Dave Schneider' WHERE "id" = '66cc5212-c1d0-45c7-a0cf-58d5c342a4ed' AND "pastorName" IS NULL;
UPDATE "churches" SET "email" = 'info@crossofchristtx.com' WHERE "id" = '66cc5212-c1d0-45c7-a0cf-58d5c342a4ed' AND "email" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = '66cc5212-c1d0-45c7-a0cf-58d5c342a4ed' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '66cc5212-c1d0-45c7-a0cf-58d5c342a4ed', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '08:00', NULL, 'Early Service', 'English'),
  (0, '09:15', NULL, 'Family Bible Study Hour', 'English'),
  (0, '10:30', NULL, 'Late Service', 'English'),
  (2, '10:00', NULL, 'Men''s Bible Study', 'English'),
  (2, '10:00', NULL, 'Women''s Bible Study', 'English'),
  (4, '19:00', NULL, 'Midweek Worship', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '66cc5212-c1d0-45c7-a0cf-58d5c342a4ed');

-- CrossingPoint Church
UPDATE "churches" SET "email" = 'crossingpoint.church@gmail.com' WHERE "id" = 'd6414987-8d82-4b82-9b68-11ea764b5fec' AND "email" IS NULL;
UPDATE "churches" SET "description" = 'CrossingPoint Church in San Antonio, Texas describes its mission as meeting people at the crossingpoints of life with the gospel of Jesus Christ.' WHERE "id" = 'd6414987-8d82-4b82-9b68-11ea764b5fec' AND "description" IS NULL;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'd6414987-8d82-4b82-9b68-11ea764b5fec', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:30', NULL, 'Sunday Morning Worship', 'English'),
  (0, '11:15', NULL, 'Sunday Morning Worship', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'd6414987-8d82-4b82-9b68-11ea764b5fec');

-- Crossroads Baptist Church
UPDATE "churches" SET "pastorName" = 'Doug Diehl' WHERE "id" = 'b21e798c-3382-4df3-8e45-f7238d878ba8' AND "pastorName" IS NULL;
UPDATE "churches" SET "email" = 'cbcstaff@cbcsa.net' WHERE "id" = 'b21e798c-3382-4df3-8e45-f7238d878ba8' AND "email" IS NULL;
UPDATE "churches" SET "yearEstablished" = 1976 WHERE "id" = 'b21e798c-3382-4df3-8e45-f7238d878ba8' AND "yearEstablished" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = 'b21e798c-3382-4df3-8e45-f7238d878ba8' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'b21e798c-3382-4df3-8e45-f7238d878ba8', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:00', '10:00', 'Bible Study', 'English'),
  (0, '10:30', '11:30', 'Service', 'English'),
  (0, '17:00', '18:00', 'Service', 'English'),
  (3, '18:00', '19:00', 'Bible Study', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'b21e798c-3382-4df3-8e45-f7238d878ba8');

-- Crossroads Community Church
DELETE FROM "church_services" WHERE "churchId" = 'ee0f9936-3575-432b-a781-17d62390ca0c' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'ee0f9936-3575-432b-a781-17d62390ca0c', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:00', NULL, 'Service', 'English'),
  (0, '11:00', NULL, 'Service', 'English'),
  (0, '13:00', NULL, 'Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'ee0f9936-3575-432b-a781-17d62390ca0c');

-- Crossway Bible Church
UPDATE "churches" SET "pastorName" = 'Josh de Koning' WHERE "id" = 'a444e859-3bf0-43f7-a8e2-2a2dbb7918ab' AND "pastorName" IS NULL;
UPDATE "churches" SET "email" = 'josh@crosswaysa.org' WHERE "id" = 'a444e859-3bf0-43f7-a8e2-2a2dbb7918ab' AND "email" IS NULL;
UPDATE "churches" SET "description" = 'Crossway Bible Church is a church in San Antonio, Texas, that exists to glorify God through the fulfillment of the Great Commission. It is led by a plurality of elders and offers small groups, student and children''s ministries, and biblical counseling.' WHERE "id" = 'a444e859-3bf0-43f7-a8e2-2a2dbb7918ab' AND "description" IS NULL;
UPDATE "churches" SET "goodForChildren" = true WHERE "id" = 'a444e859-3bf0-43f7-a8e2-2a2dbb7918ab' AND "goodForChildren" IS NULL;
UPDATE "churches" SET "goodForGroups" = true WHERE "id" = 'a444e859-3bf0-43f7-a8e2-2a2dbb7918ab' AND "goodForGroups" IS NULL;
UPDATE "churches" SET "languages" = ARRAY['English', 'Spanish']::text[] WHERE "id" = 'a444e859-3bf0-43f7-a8e2-2a2dbb7918ab' AND "languages" = ARRAY['English']::text[];
DELETE FROM "church_services" WHERE "churchId" = 'a444e859-3bf0-43f7-a8e2-2a2dbb7918ab' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'a444e859-3bf0-43f7-a8e2-2a2dbb7918ab', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:00', NULL, 'Service', 'English'),
  (0, '10:45', NULL, 'Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'a444e859-3bf0-43f7-a8e2-2a2dbb7918ab');

-- Crown of Life Lutheran Church
DELETE FROM "church_services" WHERE "churchId" = '5ba68c20-92ff-49fc-9f7f-edf094442829' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '5ba68c20-92ff-49fc-9f7f-edf094442829', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '08:00', NULL, 'Divine Service', 'English'),
  (0, '09:30', NULL, 'Bible Classes and Sunday School', 'English'),
  (0, '11:00', NULL, 'Divine Service', 'English'),
  (0, '13:30', NULL, 'Introduction to the Lutheran Faith', 'English'),
  (0, '15:00', NULL, 'Young Adult Bible Study', 'English'),
  (3, '18:00', NULL, 'Vespers', 'English'),
  (4, '18:30', NULL, 'Men''s Thursday Night Bible Study', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '5ba68c20-92ff-49fc-9f7f-edf094442829');

-- Dellcrest Church of Christ
UPDATE "churches" SET "pastorName" = 'Zechariah Smith' WHERE "id" = '3baa692c-d728-4ac5-b9dd-0a9ee982b6cd' AND "pastorName" IS NULL;
UPDATE "churches" SET "yearEstablished" = 1951 WHERE "id" = '3baa692c-d728-4ac5-b9dd-0a9ee982b6cd' AND "yearEstablished" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = '3baa692c-d728-4ac5-b9dd-0a9ee982b6cd' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '3baa692c-d728-4ac5-b9dd-0a9ee982b6cd', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:30', NULL, 'Bible Class', 'English'),
  (0, '10:30', NULL, 'Worship', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '3baa692c-d728-4ac5-b9dd-0a9ee982b6cd');

-- Disciple Community Church
DELETE FROM "church_services" WHERE "churchId" = 'ff16aa6a-4968-4889-814d-f5a2b9084864' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'ff16aa6a-4968-4889-814d-f5a2b9084864', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '10:00', NULL, 'Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'ff16aa6a-4968-4889-814d-f5a2b9084864');

-- Divine Providence Catholic Church
UPDATE "churches" SET "goodForGroups" = true WHERE "id" = 'f7c37576-f5e3-49fb-b4d8-4477f806367b' AND "goodForGroups" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = 'f7c37576-f5e3-49fb-b4d8-4477f806367b' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'f7c37576-f5e3-49fb-b4d8-4477f806367b', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '08:00', NULL, 'Mass', 'English'),
  (0, '10:00', NULL, 'Mass', 'Spanish'),
  (0, '12:00', NULL, 'Mass', 'English'),
  (0, '17:30', NULL, 'Mass', 'Spanish'),
  (3, '08:00', NULL, 'Mass', 'Spanish'),
  (4, '08:00', NULL, 'Mass', 'Spanish'),
  (4, '19:00', NULL, 'Prayer Meeting', 'Spanish'),
  (6, '18:30', NULL, 'Vigil Mass', 'Spanish')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'f7c37576-f5e3-49fb-b4d8-4477f806367b');

-- E T Dixon United Methodist Church
UPDATE "churches" SET "pastorName" = 'Terrence K. Hayes' WHERE "id" = 'a3fa1d32-ed2e-4618-a376-2b97da891eb9' AND "pastorName" IS NULL;
UPDATE "churches" SET "email" = 'etadmin@satx.rr.com' WHERE "id" = 'a3fa1d32-ed2e-4618-a376-2b97da891eb9' AND "email" IS NULL;
UPDATE "churches" SET "yearEstablished" = 1982 WHERE "id" = 'a3fa1d32-ed2e-4618-a376-2b97da891eb9' AND "yearEstablished" IS NULL;
UPDATE "churches" SET "description" = 'Ernest T. Dixon United Methodist Church, known as "The Church on The Hill," is a congregation on the far east side of San Antonio, Texas, organized in 1982. It seeks to embody the Gospel through innovative ministry and to nourish all people in the name of the Father, Son and Holy Spirit.' WHERE "id" = 'a3fa1d32-ed2e-4618-a376-2b97da891eb9' AND "description" IS NULL;
UPDATE "churches" SET "goodForChildren" = true WHERE "id" = 'a3fa1d32-ed2e-4618-a376-2b97da891eb9' AND "goodForChildren" IS NULL;
UPDATE "churches" SET "goodForGroups" = true WHERE "id" = 'a3fa1d32-ed2e-4618-a376-2b97da891eb9' AND "goodForGroups" IS NULL;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'a3fa1d32-ed2e-4618-a376-2b97da891eb9', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:30', '10:30', 'Service', 'English'),
  (2, '19:00', NULL, 'Bible Study', 'English'),
  (3, '10:00', NULL, 'Bible Study', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'a3fa1d32-ed2e-4618-a376-2b97da891eb9');

-- Emanuel United Methodist Church
UPDATE "churches" SET "pastorName" = 'Maribel Vazquez' WHERE "id" = '9b2fa3ca-3da3-4c7f-a921-cd6c10ab3ca9' AND "pastorName" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = '9b2fa3ca-3da3-4c7f-a921-cd6c10ab3ca9' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '9b2fa3ca-3da3-4c7f-a921-cd6c10ab3ca9', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:30', NULL, 'Sunday School', 'English'),
  (0, '11:00', NULL, 'Service', 'English'),
  (1, '18:30', NULL, 'Bible Study', 'English'),
  (2, '18:30', NULL, 'Men''s Group', 'English'),
  (3, '18:30', NULL, 'Bible Study', 'Spanish')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '9b2fa3ca-3da3-4c7f-a921-cd6c10ab3ca9');

-- Emmanuel Worship Center of San Antonio
DELETE FROM "church_services" WHERE "churchId" = '8674870e-45e6-4ea2-904f-f8bf8d259dc7' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '8674870e-45e6-4ea2-904f-f8bf8d259dc7', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:00', '10:30', 'Service', 'English'),
  (4, '19:00', '20:30', 'Bible Study', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '8674870e-45e6-4ea2-904f-f8bf8d259dc7');

-- Encuentro
UPDATE "churches" SET "email" = 'hola@encuentrosa.org' WHERE "id" = 'be4c8244-384a-482a-8b4c-1c8c8f2e4c75' AND "email" IS NULL;
UPDATE "churches" SET "yearEstablished" = 2016 WHERE "id" = 'be4c8244-384a-482a-8b4c-1c8c8f2e4c75' AND "yearEstablished" IS NULL;
UPDATE "churches" SET "denomination" = 'Evangelical Free Church of America', "denominationFamily" = 'Evangelical' WHERE "id" = 'be4c8244-384a-482a-8b4c-1c8c8f2e4c75' AND "denomination" IS NULL AND "denominationFamily" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = 'be4c8244-384a-482a-8b4c-1c8c8f2e4c75' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'be4c8244-384a-482a-8b4c-1c8c8f2e4c75', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '11:00', NULL, 'Service', 'Bilingual')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'be4c8244-384a-482a-8b4c-1c8c8f2e4c75');

-- Episcopal Church of Reconciliation
UPDATE "churches" SET "pastorName" = 'Reagan Gonzalez' WHERE "id" = '460e910e-5b2e-439f-8e68-08763255eb4c' AND "pastorName" IS NULL;
UPDATE "churches" SET "wheelchairAccessible" = true WHERE "id" = '460e910e-5b2e-439f-8e68-08763255eb4c' AND "wheelchairAccessible" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = '460e910e-5b2e-439f-8e68-08763255eb4c' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '460e910e-5b2e-439f-8e68-08763255eb4c', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '08:00', NULL, 'Holy Eucharist', 'English'),
  (0, '11:00', NULL, 'Holy Eucharist', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '460e910e-5b2e-439f-8e68-08763255eb4c');

-- Epworth United Methodist Church
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'b3703103-9bdb-43d4-8379-bc5a5ba56156', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:15', NULL, 'Bible Study', 'English'),
  (0, '10:30', NULL, 'Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'b3703103-9bdb-43d4-8379-bc5a5ba56156');

-- Everlasting Light Baptist Church
UPDATE "churches" SET "pastorName" = 'Lionel Franklin' WHERE "id" = 'dd92ce3c-4b19-49b7-8ddc-65581ae93540' AND "pastorName" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = 'dd92ce3c-4b19-49b7-8ddc-65581ae93540' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'dd92ce3c-4b19-49b7-8ddc-65581ae93540', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:30', '10:30', 'Sunday School', 'Bilingual'),
  (0, '10:45', '12:00', 'Praise & Worship Sunday Service', 'English'),
  (0, '11:00', '12:00', 'Children''s Church', 'English'),
  (3, '17:30', '19:00', 'Bible Study', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'dd92ce3c-4b19-49b7-8ddc-65581ae93540');

-- Evers Road Christian Church San Antonio
UPDATE "churches" SET "pastorName" = 'Mark Wright' WHERE "id" = '714e1939-0de2-4799-8ed2-bc00761f81c7' AND "pastorName" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = '714e1939-0de2-4799-8ed2-bc00761f81c7' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '714e1939-0de2-4799-8ed2-bc00761f81c7', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:00', '09:45', 'Bible Study', 'English'),
  (0, '10:00', NULL, 'Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '714e1939-0de2-4799-8ed2-bc00761f81c7');

-- Expanse Bible Church
UPDATE "churches" SET "pastorName" = 'Levy Johnny Griffin' WHERE "id" = 'd5d78ea5-778c-4d51-821b-b1ae086780b5' AND "pastorName" IS NULL;
UPDATE "churches" SET "yearEstablished" = 2021 WHERE "id" = 'd5d78ea5-778c-4d51-821b-b1ae086780b5' AND "yearEstablished" IS NULL;
UPDATE "churches" SET "phone" = '210-786-3395' WHERE "id" = 'd5d78ea5-778c-4d51-821b-b1ae086780b5' AND "phone" IS NULL;
UPDATE "churches" SET "goodForChildren" = true WHERE "id" = 'd5d78ea5-778c-4d51-821b-b1ae086780b5' AND "goodForChildren" IS NULL;
UPDATE "churches" SET "goodForGroups" = true WHERE "id" = 'd5d78ea5-778c-4d51-821b-b1ae086780b5' AND "goodForGroups" IS NULL;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'd5d78ea5-778c-4d51-821b-b1ae086780b5', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '10:15', NULL, 'Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'd5d78ea5-778c-4d51-821b-b1ae086780b5');

-- Experience Church
UPDATE "churches" SET "pastorName" = 'Manuel Magana' WHERE "id" = '99fcec02-93bc-47f9-b528-a1500d90f271' AND "pastorName" IS NULL;
UPDATE "churches" SET "yearEstablished" = 2018 WHERE "id" = '99fcec02-93bc-47f9-b528-a1500d90f271' AND "yearEstablished" IS NULL;
UPDATE "churches" SET "goodForChildren" = true WHERE "id" = '99fcec02-93bc-47f9-b528-a1500d90f271' AND "goodForChildren" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = '99fcec02-93bc-47f9-b528-a1500d90f271' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '99fcec02-93bc-47f9-b528-a1500d90f271', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '10:00', NULL, 'Service', 'English'),
  (2, '06:00', NULL, 'Prayer', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '99fcec02-93bc-47f9-b528-a1500d90f271');

-- Faith Baptist Church
DELETE FROM "church_services" WHERE "churchId" = '3f8a0cd1-a2a0-4591-8443-92aa800ce31f' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '3f8a0cd1-a2a0-4591-8443-92aa800ce31f', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '10:30', NULL, 'Bible Study', 'English'),
  (0, '11:00', NULL, 'Worship Service', 'English'),
  (3, '19:00', NULL, 'Prayer/Worship service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '3f8a0cd1-a2a0-4591-8443-92aa800ce31f');

-- Faith Bible Church
UPDATE "churches" SET "yearEstablished" = 1974 WHERE "id" = '9c9ef068-8aea-4c09-a607-a1167fbb300b' AND "yearEstablished" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = '9c9ef068-8aea-4c09-a607-a1167fbb300b' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '9c9ef068-8aea-4c09-a607-a1167fbb300b', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:30', NULL, 'Sunday School', 'English'),
  (0, '10:30', NULL, 'Morning Service', 'English'),
  (0, '18:00', NULL, 'Evening Service', 'English'),
  (3, '19:00', NULL, 'Prayer Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '9c9ef068-8aea-4c09-a607-a1167fbb300b');

-- Faith Church
DELETE FROM "church_services" WHERE "churchId" = '2e11b26e-d95d-43e5-addd-ba168f748cea' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '2e11b26e-d95d-43e5-addd-ba168f748cea', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:00', NULL, 'Worship', 'English'),
  (0, '10:30', NULL, 'Worship', 'English'),
  (0, '12:30', NULL, 'Spanish Service', 'Spanish'),
  (3, '18:30', NULL, 'One Society Student Ministry', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '2e11b26e-d95d-43e5-addd-ba168f748cea');

-- Faith Lutheran Church
UPDATE "churches" SET "pastorName" = 'Micah Ernst' WHERE "id" = '50d87e97-c9fd-44fa-8d8e-f22dcba208db' AND "pastorName" IS NULL;
UPDATE "churches" SET "description" = 'Faith Lutheran Church is a congregation in San Antonio, Texas, and a member of the Evangelical Lutheran Synod. It follows a liturgical, Trinitarian and Christ-centered order of service from the Evangelical Lutheran Hymnary.' WHERE "id" = '50d87e97-c9fd-44fa-8d8e-f22dcba208db' AND "description" IS NULL;

-- Faith Outreach Center international
DELETE FROM "church_services" WHERE "churchId" = '539b61c6-96c4-4e0e-91ad-987d7cfdf03f' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '539b61c6-96c4-4e0e-91ad-987d7cfdf03f', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '10:00', NULL, 'Service', 'English'),
  (3, '18:30', NULL, 'Training', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '539b61c6-96c4-4e0e-91ad-987d7cfdf03f');

-- Faith Worship Center Church
UPDATE "churches" SET "email" = 'officeadmin@fwcsa.org' WHERE "id" = 'a78e6506-8ca7-4c23-9f5b-f04e67d773c1' AND "email" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = 'a78e6506-8ca7-4c23-9f5b-f04e67d773c1' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'a78e6506-8ca7-4c23-9f5b-f04e67d773c1', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:00', NULL, 'Sunday Service', 'English'),
  (3, '19:00', NULL, 'Mid-Week Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'a78e6506-8ca7-4c23-9f5b-f04e67d773c1');

-- Fellowship Bible Church
UPDATE "churches" SET "pastorName" = 'Russell Schwarz' WHERE "id" = '5902bb8d-7f5a-48a8-9a59-c727bfa9892e' AND "pastorName" IS NULL;
UPDATE "churches" SET "email" = 'fbcoffice@fbcsatx.com' WHERE "id" = '5902bb8d-7f5a-48a8-9a59-c727bfa9892e' AND "email" IS NULL;
UPDATE "churches" SET "yearEstablished" = 1975 WHERE "id" = '5902bb8d-7f5a-48a8-9a59-c727bfa9892e' AND "yearEstablished" IS NULL;
UPDATE "churches" SET "description" = 'Fellowship Bible Church in San Antonio, Texas is a local church whose stated aim is leading people into a living adventure with Jesus. It offers Bible studies for children, youth and adults along with a Sunday worship service, and teaches a statement of faith centered on the authority of Scripture and believer''s baptism.' WHERE "id" = '5902bb8d-7f5a-48a8-9a59-c727bfa9892e' AND "description" IS NULL;
UPDATE "churches" SET "goodForChildren" = true WHERE "id" = '5902bb8d-7f5a-48a8-9a59-c727bfa9892e' AND "goodForChildren" IS NULL;
UPDATE "churches" SET "goodForGroups" = true WHERE "id" = '5902bb8d-7f5a-48a8-9a59-c727bfa9892e' AND "goodForGroups" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = '5902bb8d-7f5a-48a8-9a59-c727bfa9892e' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '5902bb8d-7f5a-48a8-9a59-c727bfa9892e', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:30', NULL, 'Adult Bible Study', 'English'),
  (0, '09:30', NULL, 'Children''s Bible Study', 'English'),
  (0, '09:30', NULL, 'Youth Life', 'English'),
  (0, '10:45', NULL, 'Worship Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '5902bb8d-7f5a-48a8-9a59-c727bfa9892e');

-- First Assembly of God San Antonio
DELETE FROM "church_services" WHERE "churchId" = 'a5656037-a95b-48d1-b1a2-b5283dbc0b48' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'a5656037-a95b-48d1-b1a2-b5283dbc0b48', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:00', NULL, 'Service', 'English'),
  (0, '10:15', NULL, 'Sunday Classes', 'English'),
  (0, '11:00', NULL, 'Service', 'English'),
  (3, '18:30', NULL, 'Family Night', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'a5656037-a95b-48d1-b1a2-b5283dbc0b48');

-- First Baptist Church of Helotes
UPDATE "churches" SET "pastorName" = 'James Covey' WHERE "id" = '7ec05246-f49b-4eca-b31c-85adc57c30af' AND "pastorName" IS NULL;
UPDATE "churches" SET "yearEstablished" = 2007 WHERE "id" = '7ec05246-f49b-4eca-b31c-85adc57c30af' AND "yearEstablished" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = '7ec05246-f49b-4eca-b31c-85adc57c30af' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '7ec05246-f49b-4eca-b31c-85adc57c30af', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:45', NULL, 'Bible Study', 'English'),
  (0, '11:00', NULL, 'Service', 'English'),
  (3, '17:45', '19:30', 'Refuel', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '7ec05246-f49b-4eca-b31c-85adc57c30af');

-- First Baptist Church of San Antonio
UPDATE "churches" SET "pastorName" = 'Chris Johnson' WHERE "id" = 'b8bd6a11-7eb6-4713-9e3b-008b944a0600' AND "pastorName" IS NULL;
UPDATE "churches" SET "languages" = ARRAY['English', 'Spanish', 'Karenni', 'Congolese']::text[] WHERE "id" = 'b8bd6a11-7eb6-4713-9e3b-008b944a0600' AND "languages" = ARRAY['English']::text[];
DELETE FROM "church_services" WHERE "churchId" = 'b8bd6a11-7eb6-4713-9e3b-008b944a0600' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'b8bd6a11-7eb6-4713-9e3b-008b944a0600', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '08:30', NULL, 'Traditional', 'English'),
  (0, '09:30', NULL, 'Bible Study', 'English'),
  (0, '11:00', NULL, 'Contemporary', 'English'),
  (0, '11:00', NULL, 'Service', 'Karenni'),
  (0, '11:00', NULL, 'Service', 'Spanish'),
  (0, '11:00', NULL, 'Traditional', 'English'),
  (0, '12:45', NULL, 'Service', 'Congolese')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'b8bd6a11-7eb6-4713-9e3b-008b944a0600');

-- First Baptist Church of Universal City
UPDATE "churches" SET "goodForChildren" = true WHERE "id" = 'b1dd3857-338b-4eaa-956d-7e5ab7abb156' AND "goodForChildren" IS NULL;

-- First Chinese Baptist Church
UPDATE "churches" SET "pastorName" = 'John Lee' WHERE "id" = 'd9b0f47b-a42c-4a59-a015-78d42c9d5d44' AND "pastorName" IS NULL;
UPDATE "churches" SET "yearEstablished" = 1923 WHERE "id" = 'd9b0f47b-a42c-4a59-a015-78d42c9d5d44' AND "yearEstablished" IS NULL;
UPDATE "churches" SET "languages" = ARRAY['English', 'Mandarin', 'Chinese']::text[] WHERE "id" = 'd9b0f47b-a42c-4a59-a015-78d42c9d5d44' AND "languages" = ARRAY['English', 'Mandarin']::text[];
DELETE FROM "church_services" WHERE "churchId" = 'd9b0f47b-a42c-4a59-a015-78d42c9d5d44' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'd9b0f47b-a42c-4a59-a015-78d42c9d5d44', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:45', NULL, 'Chinese Worship Service', 'Chinese'),
  (0, '09:45', NULL, 'Middle School Bible Study', 'English'),
  (0, '11:15', NULL, 'English Worship Service', 'English'),
  (5, '19:30', NULL, 'Mandarin Adult Fellowship', 'Mandarin'),
  (5, '19:30', NULL, 'Youth Group', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'd9b0f47b-a42c-4a59-a015-78d42c9d5d44');

-- First Love Christian Church
UPDATE "churches" SET "pastorName" = 'Sun Hui East' WHERE "id" = 'f032246b-47cf-4878-925a-04faf48cdded' AND "pastorName" IS NULL;

-- First Mexican Fundamental Baptist
UPDATE "churches" SET "email" = 'pibfm@yahoo.com' WHERE "id" = 'eb652a1f-0a41-4d5a-a84a-fafc059b9c38' AND "email" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = 'eb652a1f-0a41-4d5a-a84a-fafc059b9c38' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'eb652a1f-0a41-4d5a-a84a-fafc059b9c38', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '10:00', NULL, 'Escuela Dominical', 'Spanish'),
  (0, '11:00', NULL, 'Servicio de Adoración y Mensaje', 'Spanish'),
  (0, '18:00', NULL, 'Servicio de Adoración', 'Spanish'),
  (2, '19:30', NULL, 'Reunión de Oración', 'Spanish'),
  (4, '19:30', NULL, 'Servicio de Adoración y Mensaje', 'Spanish')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'eb652a1f-0a41-4d5a-a84a-fafc059b9c38');

-- First Presbyterian Church
DELETE FROM "church_services" WHERE "churchId" = '1697494b-9b14-48fb-8bc5-24eee1562a71' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '1697494b-9b14-48fb-8bc5-24eee1562a71', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '08:30', NULL, 'Adult Sunday School', 'English'),
  (0, '09:30', NULL, 'Modern', 'English'),
  (0, '09:30', NULL, 'Sunday School', 'English'),
  (0, '09:30', NULL, 'Traditional', 'English'),
  (0, '11:00', NULL, 'Modern', 'English'),
  (0, '11:00', NULL, 'Traditional', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '1697494b-9b14-48fb-8bc5-24eee1562a71');

-- First Unitarian Universalist Church of San Antonio
DELETE FROM "church_services" WHERE "churchId" = 'e098435b-c8b5-40f1-aa06-0d14ede7655e' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'e098435b-c8b5-40f1-aa06-0d14ede7655e', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '11:00', '12:00', 'Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'e098435b-c8b5-40f1-aa06-0d14ede7655e');

-- First United Pentecostal Church
UPDATE "churches" SET "email" = 'info@firstupcsa.org' WHERE "id" = '29eaa7ad-956d-4b77-a122-49aa93240cf4' AND "email" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = '29eaa7ad-956d-4b77-a122-49aa93240cf4' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '29eaa7ad-956d-4b77-a122-49aa93240cf4', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:30', NULL, 'Corporate Prayer', 'English'),
  (0, '10:00', NULL, 'First Sunday Service', 'English'),
  (0, '12:15', NULL, 'Second Sunday Service', 'English'),
  (3, '19:30', NULL, 'Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '29eaa7ad-956d-4b77-a122-49aa93240cf4');

-- Forest Hills Presbyterian Church
UPDATE "churches" SET "pastorName" = 'Glenn Sampayan' WHERE "id" = 'b8f939c1-bd72-4435-bead-8a68b4cd1db9' AND "pastorName" IS NULL;
UPDATE "churches" SET "email" = 'info@fhpconline.org' WHERE "id" = 'b8f939c1-bd72-4435-bead-8a68b4cd1db9' AND "email" IS NULL;
UPDATE "churches" SET "yearEstablished" = 2005 WHERE "id" = 'b8f939c1-bd72-4435-bead-8a68b4cd1db9' AND "yearEstablished" IS NULL;
UPDATE "churches" SET "goodForChildren" = true WHERE "id" = 'b8f939c1-bd72-4435-bead-8a68b4cd1db9' AND "goodForChildren" IS NULL;
UPDATE "churches" SET "wheelchairAccessible" = true WHERE "id" = 'b8f939c1-bd72-4435-bead-8a68b4cd1db9' AND "wheelchairAccessible" IS NULL;

-- Fountain Of Praise Church of God in Christ
UPDATE "churches" SET "pastorName" = 'Anthony White' WHERE "id" = 'ab58f65b-7f40-4976-8cc9-abbbb3f8ca09' AND "pastorName" IS NULL;
UPDATE "churches" SET "email" = 'fopcogic@gmail.com' WHERE "id" = 'ab58f65b-7f40-4976-8cc9-abbbb3f8ca09' AND "email" IS NULL;
UPDATE "churches" SET "goodForChildren" = true WHERE "id" = 'ab58f65b-7f40-4976-8cc9-abbbb3f8ca09' AND "goodForChildren" IS NULL;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'ab58f65b-7f40-4976-8cc9-abbbb3f8ca09', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:00', NULL, 'Sunday School', 'English'),
  (0, '10:30', NULL, 'Sunday Morning Worship', 'English'),
  (0, '18:00', NULL, 'Sunday Evening Service', 'English'),
  (3, '12:00', NULL, 'Noon Day Prayer', 'English'),
  (3, '19:00', NULL, 'Bible Study', 'English'),
  (5, '12:00', NULL, 'Noon Day Prayer', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'ab58f65b-7f40-4976-8cc9-abbbb3f8ca09');

-- Fountain of Praise Church
UPDATE "churches" SET "pastorName" = 'Harvey L. Hale Sr.' WHERE "id" = '760f0741-b422-4f71-b792-ff67779d848f' AND "pastorName" IS NULL;
UPDATE "churches" SET "yearEstablished" = 2015 WHERE "id" = '760f0741-b422-4f71-b792-ff67779d848f' AND "yearEstablished" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = '760f0741-b422-4f71-b792-ff67779d848f' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '760f0741-b422-4f71-b792-ff67779d848f', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '10:00', NULL, 'Sunday School', 'English'),
  (0, '11:00', NULL, 'Morning Worship Experience', 'English'),
  (2, '12:00', NULL, 'Prayer', 'English'),
  (3, '18:30', NULL, 'Prayer', 'English'),
  (3, '19:00', NULL, 'Bible Study', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '760f0741-b422-4f71-b792-ff67779d848f');

-- Free Born Church
UPDATE "churches" SET "description" = 'Free Born Church is a Christian church in San Antonio that preaches the gospel of Jesus, centered on Romans 10:9. It welcomes anyone interested in how the gospel offers an explanation of the world and a solution to the longing people experience.' WHERE "id" = 'f5ab525e-b007-42c3-8d31-c0b3efeeab03' AND "description" IS NULL;
UPDATE "churches" SET "goodForChildren" = true WHERE "id" = 'f5ab525e-b007-42c3-8d31-c0b3efeeab03' AND "goodForChildren" IS NULL;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'f5ab525e-b007-42c3-8d31-c0b3efeeab03', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:45', '10:45', 'Sunday School', 'English'),
  (0, '11:00', '12:00', 'Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'f5ab525e-b007-42c3-8d31-c0b3efeeab03');

-- Freedom, A Church For All People
UPDATE "churches" SET "pastorName" = 'Anthony Lamb' WHERE "id" = 'b2c8f56c-7477-41fe-98f7-6abfc1d46d02' AND "pastorName" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = 'b2c8f56c-7477-41fe-98f7-6abfc1d46d02' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'b2c8f56c-7477-41fe-98f7-6abfc1d46d02', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:30', NULL, 'Adult Life Groups (Bible Study)', 'English'),
  (0, '09:30', NULL, 'Children''s Sunday School', 'English'),
  (0, '09:30', '11:00', 'Morning Worship', 'English'),
  (0, '09:30', NULL, 'Youth Life Groups', 'English'),
  (0, '11:00', NULL, 'Children''s Church', 'English'),
  (0, '11:00', '12:30', 'Sunday Morning Worship', 'English'),
  (3, '19:00', '20:30', 'Bible Study & Prayer Meeting', 'English'),
  (3, '19:00', NULL, 'KidsZone', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'b2c8f56c-7477-41fe-98f7-6abfc1d46d02');

-- Friendship Church
UPDATE "churches" SET "pastorName" = 'Warren Cook' WHERE "id" = 'ca877a71-10f3-4614-9cd2-617a8db0c18d' AND "pastorName" IS NULL;

-- Ft. Sam Houston Church of Christ
DELETE FROM "church_services" WHERE "churchId" = '259eec0e-869b-41ec-8dc7-07a55bdc0bf6' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '259eec0e-869b-41ec-8dc7-07a55bdc0bf6', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:30', NULL, 'Bible Study', 'English'),
  (0, '10:30', NULL, 'Worship', 'English'),
  (0, '17:00', NULL, 'Evening Worship', 'English'),
  (3, '19:00', NULL, 'Bible Study', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '259eec0e-869b-41ec-8dc7-07a55bdc0bf6');

-- Garden City Church
UPDATE "churches" SET "goodForChildren" = true WHERE "id" = '4bc11e9d-ecf7-454d-abcf-09319f270ab8' AND "goodForChildren" IS NULL;

-- Garden Ridge Church of Christ
DELETE FROM "church_services" WHERE "churchId" = '625c600b-5c2b-4c9f-9d25-3609bbbe22e7' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '625c600b-5c2b-4c9f-9d25-3609bbbe22e7', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:30', NULL, 'Bible Study', 'English'),
  (0, '10:30', NULL, 'AM Worship', 'English'),
  (0, '17:00', NULL, 'PM Worship', 'English'),
  (3, '19:00', NULL, 'Bible Study', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '625c600b-5c2b-4c9f-9d25-3609bbbe22e7');

-- Generations Family Church (Mission Cristiana Maranatha)
UPDATE "churches" SET "pastorName" = 'Veronica Soto' WHERE "id" = 'b491cebd-44cb-4206-b648-3c1f8db9eda8' AND "pastorName" IS NULL;
UPDATE "churches" SET "yearEstablished" = 2021 WHERE "id" = 'b491cebd-44cb-4206-b648-3c1f8db9eda8' AND "yearEstablished" IS NULL;

-- Genesis Full Life Fellowship
UPDATE "churches" SET "pastorName" = 'Douglass Thompson' WHERE "id" = 'fc4a76b0-03ac-4107-861e-bbbb3fa167e9' AND "pastorName" IS NULL;
UPDATE "churches" SET "yearEstablished" = 1996 WHERE "id" = 'fc4a76b0-03ac-4107-861e-bbbb3fa167e9' AND "yearEstablished" IS NULL;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'fc4a76b0-03ac-4107-861e-bbbb3fa167e9', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '11:00', NULL, 'Service', 'English'),
  (3, '19:00', NULL, 'Bible Study', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'fc4a76b0-03ac-4107-861e-bbbb3fa167e9');

-- GodChasers Community Church
UPDATE "churches" SET "pastorName" = 'Donte Banks' WHERE "id" = '528db041-2a18-4551-a9b5-c26a0f739c90' AND "pastorName" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = '528db041-2a18-4551-a9b5-c26a0f739c90' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '528db041-2a18-4551-a9b5-c26a0f739c90', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:19', NULL, 'Service', 'English'),
  (0, '11:30', NULL, 'Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '528db041-2a18-4551-a9b5-c26a0f739c90');

-- Good Shepherd Lutheran Church
UPDATE "churches" SET "email" = 'goodshepla@yahoo.com' WHERE "id" = '480f0622-5c2d-4613-ab06-2a439ab613ba' AND "email" IS NULL;

-- Grace Avenue Church
UPDATE "churches" SET "pastorName" = 'Daniel Villarreal' WHERE "id" = '2138640a-24c2-447a-8333-0fb73445958d' AND "pastorName" IS NULL;
UPDATE "churches" SET "yearEstablished" = 2010 WHERE "id" = '2138640a-24c2-447a-8333-0fb73445958d' AND "yearEstablished" IS NULL;
UPDATE "churches" SET "description" = 'Grace Avenue Church is a community of faith born out of the heart of San Antonio, started in 2010 by Daniel and Jannelle Villarreal. The church holds Sunday services at its Midtown Campus and emphasizes grace, generosity, and helping people pursue the potential God has for their lives.' WHERE "id" = '2138640a-24c2-447a-8333-0fb73445958d' AND "description" IS NULL;
UPDATE "churches" SET "goodForChildren" = true WHERE "id" = '2138640a-24c2-447a-8333-0fb73445958d' AND "goodForChildren" IS NULL;
UPDATE "churches" SET "goodForGroups" = true WHERE "id" = '2138640a-24c2-447a-8333-0fb73445958d' AND "goodForGroups" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = '2138640a-24c2-447a-8333-0fb73445958d' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '2138640a-24c2-447a-8333-0fb73445958d', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:30', NULL, 'Service', 'English'),
  (0, '11:00', NULL, 'Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '2138640a-24c2-447a-8333-0fb73445958d');

-- Grace Baptist Church
DELETE FROM "church_services" WHERE "churchId" = '639da2af-93cf-47ce-8368-4710714e31c3' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '639da2af-93cf-47ce-8368-4710714e31c3', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:45', NULL, 'Spanish Sunday School', 'Spanish'),
  (0, '09:45', NULL, 'Sunday School', 'English'),
  (0, '11:00', NULL, 'Worship Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '639da2af-93cf-47ce-8368-4710714e31c3');

-- Grace Bible Chapel
DELETE FROM "church_services" WHERE "churchId" = 'f2d1eeb1-6910-48ce-868c-e2c9d125460f' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'f2d1eeb1-6910-48ce-868c-e2c9d125460f', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:30', '10:15', 'Sunday School', 'English'),
  (0, '10:45', '12:15', 'Morning Worship', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'f2d1eeb1-6910-48ce-868c-e2c9d125460f');

-- Grace Calvary Chapel
UPDATE "churches" SET "goodForGroups" = true WHERE "id" = 'da71af2f-2038-4fa5-a115-f245c4f15eb3' AND "goodForGroups" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = 'da71af2f-2038-4fa5-a115-f245c4f15eb3' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'da71af2f-2038-4fa5-a115-f245c4f15eb3', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '08:30', NULL, 'Service', 'English'),
  (0, '11:00', NULL, 'Service', 'English'),
  (0, '11:00', NULL, 'Youth', 'English'),
  (3, '19:00', NULL, 'Mid Week Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'da71af2f-2038-4fa5-a115-f245c4f15eb3');

-- Grace Community Church
UPDATE "churches" SET "yearEstablished" = 1989 WHERE "id" = '8d5f06f9-a414-41b4-bf17-6b5b06eb4a27' AND "yearEstablished" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = '8d5f06f9-a414-41b4-bf17-6b5b06eb4a27' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '8d5f06f9-a414-41b4-bf17-6b5b06eb4a27', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:00', NULL, 'Service', 'English'),
  (0, '10:30', NULL, 'Service', 'English'),
  (0, '12:00', NULL, 'Service', 'English'),
  (1, '18:30', '20:00', 'Student Ministry', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '8d5f06f9-a414-41b4-bf17-6b5b06eb4a27');

-- Grace Community Church
DELETE FROM "church_services" WHERE "churchId" = '05822fb1-0304-47d8-a5df-09f76fa1e2b5' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '05822fb1-0304-47d8-a5df-09f76fa1e2b5', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:00', NULL, 'Bible Study', 'Spanish'),
  (0, '10:00', '11:00', 'Sunday School', 'English'),
  (0, '11:20', '13:15', 'Worship Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '05822fb1-0304-47d8-a5df-09f76fa1e2b5');

-- Grace Community Church
UPDATE "churches" SET "pastorName" = 'Chris O''Neil' WHERE "id" = '71d1928d-9a36-4520-b0a4-bac5b1f4bd22' AND "pastorName" IS NULL;

-- Grace Covenant Church (Vanguard Presbyterian Church)
DELETE FROM "church_services" WHERE "churchId" = '396e3f61-8013-423e-83d5-06ac95eb7a62' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '396e3f61-8013-423e-83d5-06ac95eb7a62', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:30', NULL, 'Sunday School', 'English'),
  (0, '11:00', NULL, 'Worship', 'English'),
  (3, '19:00', NULL, 'Men''s Study', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '396e3f61-8013-423e-83d5-06ac95eb7a62');

-- Grace First Baptist Church
DELETE FROM "church_services" WHERE "churchId" = '16170ed1-6b90-481b-96b6-b4b22e0b6781' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '16170ed1-6b90-481b-96b6-b4b22e0b6781', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '08:30', NULL, 'Sunday School', 'English'),
  (0, '09:45', NULL, 'Worship Service', 'English'),
  (3, '19:00', NULL, 'Adult Bible Study', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '16170ed1-6b90-481b-96b6-b4b22e0b6781');

-- Grace Mosaic Church (PCA)
UPDATE "churches" SET "email" = 'adam@gracemosaicsa.org' WHERE "id" = 'c26058b8-e979-4a93-8c77-c22a8cf01658' AND "email" IS NULL;
UPDATE "churches" SET "goodForChildren" = true WHERE "id" = 'c26058b8-e979-4a93-8c77-c22a8cf01658' AND "goodForChildren" IS NULL;

-- Grace Northridge Anglican Church
DELETE FROM "church_services" WHERE "churchId" = '83500030-a68b-44c5-b709-00ae947a1966' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '83500030-a68b-44c5-b709-00ae947a1966', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:00', NULL, 'Service', 'English'),
  (0, '10:45', NULL, 'Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '83500030-a68b-44c5-b709-00ae947a1966');

-- Grace Orthodox Presbyterian Church
UPDATE "churches" SET "goodForGroups" = true WHERE "id" = 'fb1977b7-af8e-4318-bda9-8bcfd48feb58' AND "goodForGroups" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = 'fb1977b7-af8e-4318-bda9-8bcfd48feb58' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'fb1977b7-af8e-4318-bda9-8bcfd48feb58', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '10:00', NULL, 'Sunday School', 'English'),
  (0, '11:00', NULL, 'Service', 'English'),
  (3, '18:30', NULL, 'Prayer Meeting', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'fb1977b7-af8e-4318-bda9-8bcfd48feb58');

-- Grace Point Church
UPDATE "churches" SET "pastorName" = 'Jeff Harris' WHERE "id" = '76927500-a3d9-4314-9005-b5f5c875e346' AND "pastorName" IS NULL;
UPDATE "churches" SET "email" = 'Jeff.Harris@gracepoint.org' WHERE "id" = '76927500-a3d9-4314-9005-b5f5c875e346' AND "email" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = '76927500-a3d9-4314-9005-b5f5c875e346' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '76927500-a3d9-4314-9005-b5f5c875e346', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '11:00', NULL, 'Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '76927500-a3d9-4314-9005-b5f5c875e346');

-- Gravetop Church
UPDATE "churches" SET "goodForChildren" = true WHERE "id" = '5e4be366-df86-4136-a96c-0ee58755c12d' AND "goodForChildren" IS NULL;

-- Great Oaks Fellowship
UPDATE "churches" SET "languages" = ARRAY['English', 'Spanish']::text[] WHERE "id" = '15be8f5a-afa3-4f97-b4c1-ed09fb83bba0' AND "languages" = ARRAY['English']::text[];
DELETE FROM "church_services" WHERE "churchId" = '15be8f5a-afa3-4f97-b4c1-ed09fb83bba0' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '15be8f5a-afa3-4f97-b4c1-ed09fb83bba0', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:00', NULL, 'Service', 'English'),
  (0, '11:00', NULL, 'Service', 'English'),
  (2, '19:00', NULL, 'City-wide Prayer & Worship', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '15be8f5a-afa3-4f97-b4c1-ed09fb83bba0');

-- Greater Joy Temple Church of God In Christ
UPDATE "churches" SET "pastorName" = 'Dewey C. Johnson' WHERE "id" = '6c261773-48f5-48dd-8a66-010fcd1f3d28' AND "pastorName" IS NULL;
UPDATE "churches" SET "yearEstablished" = 1949 WHERE "id" = '6c261773-48f5-48dd-8a66-010fcd1f3d28' AND "yearEstablished" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = '6c261773-48f5-48dd-8a66-010fcd1f3d28' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '6c261773-48f5-48dd-8a66-010fcd1f3d28', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '10:00', NULL, 'Sunday School', 'English'),
  (0, '11:30', NULL, 'Worship Service', 'English'),
  (3, '19:00', NULL, 'Bible Study', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '6c261773-48f5-48dd-8a66-010fcd1f3d28');

-- Greater Randolph Seventh-day Adventist Church
DELETE FROM "church_services" WHERE "churchId" = 'ff3e65b8-43bd-4095-a990-039c611dcef4' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'ff3e65b8-43bd-4095-a990-039c611dcef4', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (3, '19:00', NULL, 'Prayer Meeting & Bible Study', 'English'),
  (5, '19:30', NULL, 'Sabbath School', 'English'),
  (6, '09:45', NULL, 'Sabbath School', 'English'),
  (6, '11:00', NULL, 'Worship Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'ff3e65b8-43bd-4095-a990-039c611dcef4');

-- Greater Works Ministries Church - SA
UPDATE "churches" SET "pastorName" = 'Brian Wilson' WHERE "id" = '522a2b91-121b-4e23-b8f9-3c7b93aedb2e' AND "pastorName" IS NULL;
UPDATE "churches" SET "description" = 'Greater Works Ministries Church is a San Antonio church founded by Pastors Brian and Tanya Wilson. They describe themselves as REAL people serving a REAL God, with a motto of "Keeping it REAL!" and welcome everyone.' WHERE "id" = '522a2b91-121b-4e23-b8f9-3c7b93aedb2e' AND "description" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = '522a2b91-121b-4e23-b8f9-3c7b93aedb2e' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '522a2b91-121b-4e23-b8f9-3c7b93aedb2e', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '11:00', NULL, 'Worship Service', 'English'),
  (3, '18:00', '18:45', 'Corporate Prayer', 'English'),
  (3, '19:00', '20:00', 'Bible Study', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '522a2b91-121b-4e23-b8f9-3c7b93aedb2e');

-- Grissom Road Church of Christ
UPDATE "churches" SET "goodForChildren" = true WHERE "id" = '0b383263-07ec-4278-9e84-d851e3221b4c' AND "goodForChildren" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = '0b383263-07ec-4278-9e84-d851e3221b4c' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '0b383263-07ec-4278-9e84-d851e3221b4c', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:30', NULL, 'Bible Classes', 'English'),
  (0, '10:30', NULL, 'Worship Service with Lord''s Supper', 'English'),
  (3, '19:00', NULL, 'Bible Study', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '0b383263-07ec-4278-9e84-d851e3221b4c');

-- Harmony Baptist Church
UPDATE "churches" SET "email" = 'harmony12088@gmail.com' WHERE "id" = 'f9d00525-2bf8-4e08-9803-541bbc8d3e41' AND "email" IS NULL;

-- Harvest City Church
DELETE FROM "church_services" WHERE "churchId" = 'f4212ca4-445d-4db7-a63a-837bccc512d1' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'f4212ca4-445d-4db7-a63a-837bccc512d1', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:00', NULL, 'Service', 'English'),
  (0, '11:00', NULL, 'Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'f4212ca4-445d-4db7-a63a-837bccc512d1');

-- Harvest Hill Baptist Church
UPDATE "churches" SET "email" = 'hhbc@harvesthillbaptistchurch.com' WHERE "id" = 'e814f276-a26f-4366-849d-af330e353e7c' AND "email" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = 'e814f276-a26f-4366-849d-af330e353e7c' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'e814f276-a26f-4366-849d-af330e353e7c', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '10:00', NULL, 'Sunday School', 'English'),
  (0, '11:00', NULL, 'Morning Worship', 'English'),
  (0, '18:00', NULL, 'Evening Worship', 'English'),
  (3, '19:00', NULL, 'Evening Services', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'e814f276-a26f-4366-849d-af330e353e7c');

-- Heart of Praise Worship Center
UPDATE "churches" SET "goodForGroups" = true WHERE "id" = 'a6201f1a-9e5e-44e6-b126-4b79139be2c3' AND "goodForGroups" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = 'a6201f1a-9e5e-44e6-b126-4b79139be2c3' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'a6201f1a-9e5e-44e6-b126-4b79139be2c3', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:00', NULL, 'Service', 'English'),
  (0, '10:45', NULL, 'Service', 'English'),
  (0, '12:30', NULL, 'Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'a6201f1a-9e5e-44e6-b126-4b79139be2c3');

-- Heights Community Church
UPDATE "churches" SET "pastorName" = 'Ken Hicks' WHERE "id" = 'eb8c1d3d-8443-4ee8-8dd2-b6312cf755ec' AND "pastorName" IS NULL;
UPDATE "churches" SET "yearEstablished" = 2009 WHERE "id" = 'eb8c1d3d-8443-4ee8-8dd2-b6312cf755ec' AND "yearEstablished" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = 'eb8c1d3d-8443-4ee8-8dd2-b6312cf755ec' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'eb8c1d3d-8443-4ee8-8dd2-b6312cf755ec', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:30', NULL, 'Celebration', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'eb8c1d3d-8443-4ee8-8dd2-b6312cf755ec');

-- Helotes Hills United Methodist Church
UPDATE "churches" SET "pastorName" = 'Will Rice' WHERE "id" = '877a909d-c801-473a-8aa1-a11dcf6f3206' AND "pastorName" IS NULL;
UPDATE "churches" SET "email" = 'office@hhumc.com' WHERE "id" = '877a909d-c801-473a-8aa1-a11dcf6f3206' AND "email" IS NULL;
UPDATE "churches" SET "yearEstablished" = 1966 WHERE "id" = '877a909d-c801-473a-8aa1-a11dcf6f3206' AND "yearEstablished" IS NULL;
UPDATE "churches" SET "description" = 'Helotes Hills United Methodist Church is a Wesleyan-tradition congregation in Helotes, TX, organized in 1966. Its mission is to grow and nurture disciples of Jesus Christ for the transformation of the community and the world.' WHERE "id" = '877a909d-c801-473a-8aa1-a11dcf6f3206' AND "description" IS NULL;
UPDATE "churches" SET "goodForChildren" = true WHERE "id" = '877a909d-c801-473a-8aa1-a11dcf6f3206' AND "goodForChildren" IS NULL;
UPDATE "churches" SET "wheelchairAccessible" = true WHERE "id" = '877a909d-c801-473a-8aa1-a11dcf6f3206' AND "wheelchairAccessible" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = '877a909d-c801-473a-8aa1-a11dcf6f3206' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '877a909d-c801-473a-8aa1-a11dcf6f3206', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:00', '10:00', 'Sunday School', 'English'),
  (0, '10:30', NULL, 'Blended', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '877a909d-c801-473a-8aa1-a11dcf6f3206');

-- Helotes Independent Baptist Church
UPDATE "churches" SET "pastorName" = 'Joshua Kelley' WHERE "id" = '56e51c92-6740-4170-9754-ba4c9b44b9d1' AND "pastorName" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = '56e51c92-6740-4170-9754-ba4c9b44b9d1' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '56e51c92-6740-4170-9754-ba4c9b44b9d1', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '10:00', NULL, 'Service', 'English'),
  (0, '11:00', NULL, 'Service', 'English'),
  (0, '18:00', NULL, 'Service', 'English'),
  (3, '19:00', NULL, 'Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '56e51c92-6740-4170-9754-ba4c9b44b9d1');

-- Hispanic Christian Church
DELETE FROM "church_services" WHERE "churchId" = 'b987d7a1-06b4-4163-92f1-c1f833656899' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'b987d7a1-06b4-4163-92f1-c1f833656899', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:00', NULL, 'Service', 'English'),
  (0, '11:00', NULL, 'Service', 'English'),
  (0, '14:00', NULL, 'River City en Español', 'Spanish')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'b987d7a1-06b4-4163-92f1-c1f833656899');

-- Holy Family Parish Church
UPDATE "churches" SET "description" = 'Holy Family Catholic Church is a parish of the Archdiocese of San Antonio, located on Florencia Avenue in San Antonio, Texas. It offers daily and weekend Masses in English and Spanish, the sacraments, faith formation, and a variety of parish ministries.' WHERE "id" = '6d93b00e-bebe-4bd0-a277-7606b88ea573' AND "description" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = '6d93b00e-bebe-4bd0-a277-7606b88ea573' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '6d93b00e-bebe-4bd0-a277-7606b88ea573', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '08:00', NULL, 'Mass', 'Spanish'),
  (0, '10:00', NULL, 'Mass', 'English'),
  (0, '12:00', NULL, 'Mass', 'English'),
  (2, '08:30', NULL, 'Mass', 'English'),
  (3, '11:00', NULL, 'Mass', 'English'),
  (4, '08:30', NULL, 'Mass', 'English'),
  (5, '08:30', NULL, 'Mass', 'English'),
  (6, '16:00', NULL, 'Mass', 'Bilingual')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '6d93b00e-bebe-4bd0-a277-7606b88ea573');

-- Holy Name Catholic Church
UPDATE "churches" SET "description" = 'Holy Name Catholic Church is a parish of the Roman Catholic Archdiocese of San Antonio, located on Nash Blvd. The parish offers English and Spanish Masses, religious education, and a range of parish ministries and societies.' WHERE "id" = 'a6595ff3-c22d-40c0-b844-3c8c84b9901e' AND "description" IS NULL;
UPDATE "churches" SET "goodForChildren" = true WHERE "id" = 'a6595ff3-c22d-40c0-b844-3c8c84b9901e' AND "goodForChildren" IS NULL;
UPDATE "churches" SET "languages" = ARRAY['English', 'Spanish']::text[] WHERE "id" = 'a6595ff3-c22d-40c0-b844-3c8c84b9901e' AND "languages" = ARRAY['English']::text[];
DELETE FROM "church_services" WHERE "churchId" = 'a6595ff3-c22d-40c0-b844-3c8c84b9901e' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'a6595ff3-c22d-40c0-b844-3c8c84b9901e', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:00', NULL, 'Mass', 'English'),
  (0, '11:00', NULL, 'Mass', 'English'),
  (0, '13:00', NULL, 'Mass', 'Spanish'),
  (1, '07:30', NULL, 'Communion Service', 'English'),
  (2, '07:30', NULL, 'Mass', 'English'),
  (3, '18:30', NULL, 'Mass', 'English'),
  (4, '07:30', NULL, 'Mass', 'English'),
  (5, '07:30', NULL, 'Mass', 'English'),
  (5, '09:00', NULL, 'School Mass', 'English'),
  (6, '17:00', NULL, 'Mass', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'a6595ff3-c22d-40c0-b844-3c8c84b9901e');

-- Holy Redeemer Catholic Church
UPDATE "churches" SET "yearEstablished" = 1901 WHERE "id" = 'c0a541c8-c408-436b-8e40-be1733dc93f0' AND "yearEstablished" IS NULL;

-- Holy Rosary Catholic Church
UPDATE "churches" SET "pastorName" = 'Neville O''Donohue' WHERE "id" = 'e9605ff7-5d6d-4471-8c74-3851d108d79c' AND "pastorName" IS NULL;
UPDATE "churches" SET "email" = 'nodonohue@hrosary.com' WHERE "id" = 'e9605ff7-5d6d-4471-8c74-3851d108d79c' AND "email" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = 'e9605ff7-5d6d-4471-8c74-3851d108d79c' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'e9605ff7-5d6d-4471-8c74-3851d108d79c', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:00', NULL, 'Mass', 'Spanish'),
  (0, '12:00', NULL, 'Mass', 'English'),
  (2, '18:30', NULL, 'Prayer Meeting', 'English'),
  (2, '19:00', NULL, 'Bible Study', 'English'),
  (3, '18:30', '20:30', 'Youth', 'English'),
  (4, '18:00', NULL, 'Bible Study', 'English'),
  (5, '16:00', NULL, 'Prayer Meeting', 'English'),
  (6, '17:00', NULL, 'Mass', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'e9605ff7-5d6d-4471-8c74-3851d108d79c');

-- Holy Spirit Catholic Church
UPDATE "churches" SET "goodForGroups" = true WHERE "id" = '6f7ceddb-59bb-4ae1-bff0-2da023a0350d' AND "goodForGroups" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = '6f7ceddb-59bb-4ae1-bff0-2da023a0350d' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '6f7ceddb-59bb-4ae1-bff0-2da023a0350d', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '08:00', NULL, 'Mass', 'English'),
  (0, '10:00', NULL, 'Mass', 'English'),
  (0, '12:00', NULL, 'Mass', 'English'),
  (0, '14:00', NULL, 'Mass', 'Spanish'),
  (0, '16:00', NULL, 'Mass', 'English'),
  (1, '08:15', NULL, 'Mass', 'English'),
  (1, '12:10', NULL, 'Mass', 'English'),
  (2, '08:15', NULL, 'Mass', 'English'),
  (2, '12:10', NULL, 'Mass', 'English'),
  (3, '08:15', NULL, 'Mass', 'English'),
  (3, '12:10', NULL, 'Mass', 'English'),
  (4, '08:15', NULL, 'Mass', 'English'),
  (4, '12:10', NULL, 'Mass', 'English'),
  (5, '08:15', NULL, 'Mass', 'English'),
  (5, '12:10', NULL, 'Mass', 'English'),
  (6, '17:00', NULL, 'Vigil Mass', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '6f7ceddb-59bb-4ae1-bff0-2da023a0350d');

-- Holy Trinity Presbyterian Church
UPDATE "churches" SET "pastorName" = 'Tobias Green' WHERE "id" = '000a8630-18e8-44ab-82a3-c39c32a54044' AND "pastorName" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = '000a8630-18e8-44ab-82a3-c39c32a54044' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '000a8630-18e8-44ab-82a3-c39c32a54044', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '08:45', NULL, 'Berean Bible Study', 'English'),
  (0, '09:00', '09:45', 'Sunday School', 'English'),
  (0, '09:00', NULL, 'Young Adult Bible Study', 'English'),
  (0, '10:00', NULL, 'Sunday Worship', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '000a8630-18e8-44ab-82a3-c39c32a54044');

-- Home Church San Antonio
DELETE FROM "church_services" WHERE "churchId" = '0c2d0e36-efad-4278-afc9-79061ed4f184' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '0c2d0e36-efad-4278-afc9-79061ed4f184', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:30', NULL, 'Service', 'English'),
  (0, '11:15', NULL, 'Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '0c2d0e36-efad-4278-afc9-79061ed4f184');

-- Hope Center Church
UPDATE "churches" SET "pastorName" = 'Nathan Scoggins' WHERE "id" = '31120b4f-6978-4f65-8789-8290e6b70deb' AND "pastorName" IS NULL;
UPDATE "churches" SET "goodForChildren" = true WHERE "id" = '31120b4f-6978-4f65-8789-8290e6b70deb' AND "goodForChildren" IS NULL;
UPDATE "churches" SET "goodForGroups" = true WHERE "id" = '31120b4f-6978-4f65-8789-8290e6b70deb' AND "goodForGroups" IS NULL;
UPDATE "churches" SET "languages" = ARRAY['English', 'Spanish']::text[] WHERE "id" = '31120b4f-6978-4f65-8789-8290e6b70deb' AND "languages" = ARRAY['English']::text[];
DELETE FROM "church_services" WHERE "churchId" = '31120b4f-6978-4f65-8789-8290e6b70deb' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '31120b4f-6978-4f65-8789-8290e6b70deb', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:00', NULL, 'Sunday Impact Service', 'English'),
  (0, '11:15', NULL, 'Sunday Impact Service', 'English'),
  (0, '15:00', NULL, 'Service', 'Spanish'),
  (3, '19:00', NULL, 'Wednesday Discovery Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '31120b4f-6978-4f65-8789-8290e6b70deb');

-- Hope Church San Antonio
UPDATE "churches" SET "pastorName" = 'Tom Masterson' WHERE "id" = '13422e66-d73b-47b3-9a50-252e18f95370' AND "pastorName" IS NULL;
UPDATE "churches" SET "yearEstablished" = 2000 WHERE "id" = '13422e66-d73b-47b3-9a50-252e18f95370' AND "yearEstablished" IS NULL;
UPDATE "churches" SET "denomination" = 'Evangelical Presbyterian Church', "denominationFamily" = 'Presbyterian/Reformed' WHERE "id" = '13422e66-d73b-47b3-9a50-252e18f95370' AND "denomination" IS NULL AND "denominationFamily" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = '13422e66-d73b-47b3-9a50-252e18f95370' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '13422e66-d73b-47b3-9a50-252e18f95370', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '10:15', NULL, 'Service', 'Bilingual'),
  (1, '18:00', NULL, 'Women''s Group', 'English'),
  (2, '19:00', NULL, 'Bible Study', 'English'),
  (3, '19:00', NULL, 'Pickleball', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '13422e66-d73b-47b3-9a50-252e18f95370');

-- Hosanna Assembly of God
UPDATE "churches" SET "pastorName" = 'Gerald Gonzales' WHERE "id" = '199ee642-5637-45e3-9ddf-412eda8c53db' AND "pastorName" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = '199ee642-5637-45e3-9ddf-412eda8c53db' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '199ee642-5637-45e3-9ddf-412eda8c53db', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '11:00', NULL, 'Celebration Worship Service', 'English'),
  (3, '19:00', '20:30', 'Adult Bible Study', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '199ee642-5637-45e3-9ddf-412eda8c53db');

-- House of Freedom International Ministries
UPDATE "churches" SET "pastorName" = 'Oscar Garcia Jr.' WHERE "id" = '0aeea3d3-f7ef-420c-995c-6d247e1f2a5d' AND "pastorName" IS NULL;
UPDATE "churches" SET "email" = 'hof.church@outlook.com' WHERE "id" = '0aeea3d3-f7ef-420c-995c-6d247e1f2a5d' AND "email" IS NULL;

-- House of Prayer Lutheran Church
UPDATE "churches" SET "wheelchairAccessible" = true WHERE "id" = 'd430987a-18ea-4d92-809d-761f7a87c3a5' AND "wheelchairAccessible" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = 'd430987a-18ea-4d92-809d-761f7a87c3a5' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'd430987a-18ea-4d92-809d-761f7a87c3a5', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '10:00', '11:00', 'Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'd430987a-18ea-4d92-809d-761f7a87c3a5');

-- Huisache Avenue Baptist Church
DELETE FROM "church_services" WHERE "churchId" = '3c7e6070-5f48-40da-9511-1df234bde0cc' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '3c7e6070-5f48-40da-9511-1df234bde0cc', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '10:00', NULL, 'Sunday School', 'English'),
  (0, '11:00', NULL, 'Sunday Morning Worship', 'English'),
  (0, '18:00', NULL, 'Sunday Evening Worship', 'English'),
  (3, '18:30', NULL, 'Bible Study', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '3c7e6070-5f48-40da-9511-1df234bde0cc');

-- Huntleigh Park Baptist Church
UPDATE "churches" SET "pastorName" = 'Johnnie Guyton' WHERE "id" = 'fc451098-5c53-4fb5-bec3-5ddb484b2443' AND "pastorName" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = 'fc451098-5c53-4fb5-bec3-5ddb484b2443' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'fc451098-5c53-4fb5-bec3-5ddb484b2443', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '10:00', NULL, 'Sunday School', 'English'),
  (0, '11:00', NULL, 'Worship', 'English'),
  (3, '19:00', NULL, 'Bible Study', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'fc451098-5c53-4fb5-bec3-5ddb484b2443');

-- IPUL - Avivamiento (Revival Church)
UPDATE "churches" SET "pastorName" = 'Isaias Ossa Jr.' WHERE "id" = '47c91202-3c0a-4315-b4c7-35e4cd8274ea' AND "pastorName" IS NULL;
UPDATE "churches" SET "languages" = ARRAY['English', 'Spanish']::text[] WHERE "id" = '47c91202-3c0a-4315-b4c7-35e4cd8274ea' AND "languages" = ARRAY['English']::text[];
DELETE FROM "church_services" WHERE "churchId" = '47c91202-3c0a-4315-b4c7-35e4cd8274ea' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '47c91202-3c0a-4315-b4c7-35e4cd8274ea', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '11:00', NULL, 'Service', 'Spanish'),
  (0, '18:30', NULL, 'Service', 'English'),
  (3, '19:30', NULL, 'Service', 'Spanish'),
  (5, '19:30', NULL, 'Service', 'Spanish')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '47c91202-3c0a-4315-b4c7-35e4cd8274ea');

-- Iglesia Bethel
DELETE FROM "church_services" WHERE "churchId" = 'a5d70106-4e3c-477e-bf0f-88cd1f68f3d3' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'a5d70106-4e3c-477e-bf0f-88cd1f68f3d3', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:00', NULL, 'Service', 'Spanish'),
  (0, '11:00', NULL, 'Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'a5d70106-4e3c-477e-bf0f-88cd1f68f3d3');

-- Iglesia Biblica La Puerta
DELETE FROM "church_services" WHERE "churchId" = 'e916d9ca-c017-442a-bd1f-9971fde4d916' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'e916d9ca-c017-442a-bd1f-9971fde4d916', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:00', NULL, 'Congregational Prayer', 'Spanish'),
  (0, '10:00', NULL, 'Service', 'Spanish'),
  (0, '11:30', NULL, 'Bible Study', 'Spanish')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'e916d9ca-c017-442a-bd1f-9971fde4d916');

-- Iglesia Cristiana El Sembrador
UPDATE "churches" SET "pastorName" = 'Richard Zurita' WHERE "id" = 'a209d467-cc04-47a7-ba5f-3972e45a6153' AND "pastorName" IS NULL;

-- Iglesia Cristiana Emanuel
DELETE FROM "church_services" WHERE "churchId" = 'e4ae8394-271c-438d-843b-fd698fb31944' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'e4ae8394-271c-438d-843b-fd698fb31944', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:00', NULL, 'Escuela Bíblica Dominical', 'Spanish'),
  (0, '10:00', NULL, 'Adoración y Predicación', 'Spanish'),
  (2, '19:30', NULL, 'Oración y Estudio Bíblico', 'Spanish'),
  (5, '19:30', NULL, 'Estudio Bíblico en hogares', 'Spanish'),
  (5, '19:45', NULL, 'Jóvenes', 'Spanish')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'e4ae8394-271c-438d-843b-fd698fb31944');

-- Iglesia Cristiana Reparadores de Portillos
UPDATE "churches" SET "email" = 'info@reparadoresdeportillos.org' WHERE "id" = '36c1c1cb-0f6f-42eb-a03a-e3e93f3319ad' AND "email" IS NULL;

-- Iglesia Cristiana Roca De Salvacion
UPDATE "churches" SET "pastorName" = 'Gilberto Trinidad' WHERE "id" = '18f025c3-d149-47d1-9c65-7155e5205c63' AND "pastorName" IS NULL;
UPDATE "churches" SET "yearEstablished" = 2005 WHERE "id" = '18f025c3-d149-47d1-9c65-7155e5205c63' AND "yearEstablished" IS NULL;
UPDATE "churches" SET "denomination" = 'Non-denominational', "denominationFamily" = 'Non-denominational' WHERE "id" = '18f025c3-d149-47d1-9c65-7155e5205c63' AND "denomination" IS NULL AND "denominationFamily" IS NULL;

-- Iglesia Cristiana Triunfante
UPDATE "churches" SET "goodForChildren" = true WHERE "id" = 'e3a711ac-c239-484b-a46f-e4cdca94b1f4' AND "goodForChildren" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = 'e3a711ac-c239-484b-a46f-e4cdca94b1f4' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'e3a711ac-c239-484b-a46f-e4cdca94b1f4', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:30', NULL, 'Service', 'Spanish'),
  (0, '11:15', NULL, 'Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'e3a711ac-c239-484b-a46f-e4cdca94b1f4');

-- Iglesia Familia Cristiana
UPDATE "churches" SET "pastorName" = 'Alex Henriquez' WHERE "id" = 'aea00df7-843e-4993-933f-03c35ad53f73' AND "pastorName" IS NULL;
UPDATE "churches" SET "yearEstablished" = 2008 WHERE "id" = 'aea00df7-843e-4993-933f-03c35ad53f73' AND "yearEstablished" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = 'aea00df7-843e-4993-933f-03c35ad53f73' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'aea00df7-843e-4993-933f-03c35ad53f73', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '11:00', NULL, 'Experiencia de Adoración', 'Spanish'),
  (1, '19:00', NULL, 'Oración Online', 'Spanish'),
  (3, '19:00', NULL, 'Escuela del Discípulo y IFC Kids', 'Spanish')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'aea00df7-843e-4993-933f-03c35ad53f73');

-- Iglesia Pentecostal Voz De DIOS
DELETE FROM "church_services" WHERE "churchId" = 'fe81645f-4a56-4c6b-9731-b5fcaa436b6b' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'fe81645f-4a56-4c6b-9731-b5fcaa436b6b', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '15:00', NULL, 'Culto', 'Spanish'),
  (1, '19:30', NULL, 'Lunes de Guerra', 'Spanish'),
  (3, '19:30', NULL, 'Estudio Bíblico', 'Spanish'),
  (4, '19:30', NULL, 'Sociedades', 'Spanish')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'fe81645f-4a56-4c6b-9731-b5fcaa436b6b');

-- Iglesia Puerta de Restauracion
UPDATE "churches" SET "pastorName" = 'Rafael Gutierrez' WHERE "id" = '1567abe4-85dc-407f-a629-d1ce61b536ff' AND "pastorName" IS NULL;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '1567abe4-85dc-407f-a629-d1ce61b536ff', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '11:00', NULL, 'Service', 'Spanish'),
  (2, '09:00', NULL, 'Service', 'Spanish'),
  (5, '19:00', NULL, 'Service', 'Spanish')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '1567abe4-85dc-407f-a629-d1ce61b536ff');

-- Iglesia Sin Límites - Church Without Limits
UPDATE "churches" SET "description" = 'Iglesia Sin Limites is a Christian church in San Antonio, TX, based on Ephesians 1:19 and the idea of God''s limitless power at work in believers. It holds weekly in-person events with prayer and messages on Wednesdays, Fridays and Sundays.' WHERE "id" = '5b987c0f-a96a-465a-afd4-9e85a3afcb39' AND "description" IS NULL;

-- Iglesia Vida Nueva Stone Oak
DELETE FROM "church_services" WHERE "churchId" = '63ea23f0-80f9-4a92-be20-feff629fe7bf' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '63ea23f0-80f9-4a92-be20-feff629fe7bf', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '13:30', NULL, 'Vida Kids', 'Spanish'),
  (3, '10:00', NULL, 'Grupo de Conexión Mujeres', 'Spanish'),
  (3, '19:00', NULL, 'Clases de Inglés', 'Spanish'),
  (5, '19:30', NULL, 'Grupo de Conexión Adultos', 'Spanish')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '63ea23f0-80f9-4a92-be20-feff629fe7bf');

-- Immaculate Conception
UPDATE "churches" SET "pastorName" = 'Andy Martinez' WHERE "id" = '3765f826-9eb6-41bd-833e-28c9d6d2ae6f' AND "pastorName" IS NULL;
UPDATE "churches" SET "languages" = ARRAY['English', 'Spanish']::text[] WHERE "id" = '3765f826-9eb6-41bd-833e-28c9d6d2ae6f' AND "languages" = ARRAY['English']::text[];
DELETE FROM "church_services" WHERE "churchId" = '3765f826-9eb6-41bd-833e-28c9d6d2ae6f' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '3765f826-9eb6-41bd-833e-28c9d6d2ae6f', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '08:30', NULL, 'Mass', 'Spanish'),
  (0, '11:30', NULL, 'Mass', 'English'),
  (2, '08:00', NULL, 'Mass', 'English'),
  (4, '08:00', NULL, 'Mass', 'English'),
  (6, '17:00', NULL, 'Mass', 'Bilingual')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '3765f826-9eb6-41bd-833e-28c9d6d2ae6f');

-- Immaculate Conception Chapel - Oblate School of Theology
DELETE FROM "church_services" WHERE "churchId" = 'a448a815-f5e9-4971-8992-354f26833478' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'a448a815-f5e9-4971-8992-354f26833478', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '10:00', NULL, 'Mass', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'a448a815-f5e9-4971-8992-354f26833478');

-- Immanuel Seventh-day Adventist Church
DELETE FROM "church_services" WHERE "churchId" = '95fd39c3-bc4c-400c-bbb6-4fa552874fa6' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '95fd39c3-bc4c-400c-bbb6-4fa552874fa6', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (6, '09:30', NULL, 'Sabbath School', 'English'),
  (6, '11:00', NULL, 'Worship Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '95fd39c3-bc4c-400c-bbb6-4fa552874fa6');

-- Inspirational Church
DELETE FROM "church_services" WHERE "churchId" = '2a26f670-cbe1-4ce0-94dc-f678d082d59c' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '2a26f670-cbe1-4ce0-94dc-f678d082d59c', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '10:00', NULL, 'Sunday School', 'English'),
  (0, '11:45', NULL, 'Worship Service', 'English'),
  (1, '18:00', NULL, 'Bible College', 'English'),
  (4, '18:00', NULL, 'Bible College', 'English'),
  (5, '19:30', NULL, 'Bible Study', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '2a26f670-cbe1-4ce0-94dc-f678d082d59c');

-- International Bible Church
UPDATE "churches" SET "pastorName" = 'David Cook' WHERE "id" = '1a80df38-3d8b-428c-9bdf-4a6d7838616f' AND "pastorName" IS NULL;
UPDATE "churches" SET "goodForChildren" = true WHERE "id" = '1a80df38-3d8b-428c-9bdf-4a6d7838616f' AND "goodForChildren" IS NULL;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '1a80df38-3d8b-428c-9bdf-4a6d7838616f', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:30', NULL, 'Sunday School', 'English'),
  (0, '10:30', NULL, 'Morning Worship', 'English'),
  (3, '19:00', NULL, 'Bible Study', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '1a80df38-3d8b-428c-9bdf-4a6d7838616f');

-- Journey Church San Antonio
DELETE FROM "church_services" WHERE "churchId" = '3d5b1e18-71da-47c2-9fbd-fb09323681ae' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '3d5b1e18-71da-47c2-9fbd-fb09323681ae', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:15', NULL, 'Service', 'English'),
  (0, '11:00', NULL, 'Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '3d5b1e18-71da-47c2-9fbd-fb09323681ae');

-- Journey Fellowship
UPDATE "churches" SET "pastorName" = 'Todd Clayton' WHERE "id" = '63a76b08-999b-4607-b4f0-69c7dde582ce' AND "pastorName" IS NULL;
UPDATE "churches" SET "email" = 'info@myjf.church' WHERE "id" = '63a76b08-999b-4607-b4f0-69c7dde582ce' AND "email" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = '63a76b08-999b-4607-b4f0-69c7dde582ce' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '63a76b08-999b-4607-b4f0-69c7dde582ce', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:15', NULL, 'Service', 'English'),
  (0, '11:00', NULL, 'Service', 'English'),
  (3, '18:30', '20:30', 'Youth', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '63a76b08-999b-4607-b4f0-69c7dde582ce');

-- Jubilee Outreach
UPDATE "churches" SET "description" = 'Jubilee Outreach is a church in San Antonio, Texas, that gathers for Sunday prayer and worship and a Sunday service, along with a weekly women''s prayer time. It offers prayer requests, counseling sessions, and online messages.' WHERE "id" = '4e880366-c765-4d8c-b20f-c42ec88e1d5b' AND "description" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = '4e880366-c765-4d8c-b20f-c42ec88e1d5b' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '4e880366-c765-4d8c-b20f-c42ec88e1d5b', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:00', NULL, 'Prayer & Worship', 'English'),
  (0, '10:00', NULL, 'Service', 'English'),
  (4, '10:30', NULL, 'Women''s Prayer', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '4e880366-c765-4d8c-b20f-c42ec88e1d5b');

-- KRBC Ministries
UPDATE "churches" SET "pastorName" = 'Samuel Espinoza' WHERE "id" = '97532dae-f30f-4e44-98de-cea7b6e09b8b' AND "pastorName" IS NULL;
UPDATE "churches" SET "goodForGroups" = true WHERE "id" = '97532dae-f30f-4e44-98de-cea7b6e09b8b' AND "goodForGroups" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = '97532dae-f30f-4e44-98de-cea7b6e09b8b' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '97532dae-f30f-4e44-98de-cea7b6e09b8b', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '10:00', NULL, 'Sunday School', 'English'),
  (0, '11:00', NULL, 'Service', 'English'),
  (1, '19:00', NULL, 'Prayer Night', 'English'),
  (3, '19:00', NULL, 'Worship & Bible Study', 'English'),
  (5, '18:30', NULL, 'Celebrate Recovery', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '97532dae-f30f-4e44-98de-cea7b6e09b8b');

-- King of Kings Lutheran Church LCMS
UPDATE "churches" SET "pastorName" = 'Neldo Schmidt' WHERE "id" = '20f8fd57-55d4-4ba3-a5bb-449d885e6174' AND "pastorName" IS NULL;
UPDATE "churches" SET "wheelchairAccessible" = true WHERE "id" = '20f8fd57-55d4-4ba3-a5bb-449d885e6174' AND "wheelchairAccessible" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = '20f8fd57-55d4-4ba3-a5bb-449d885e6174' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '20f8fd57-55d4-4ba3-a5bb-449d885e6174', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '08:00', NULL, 'Traditional', 'English'),
  (0, '09:30', NULL, 'Adult Bible Study', 'English'),
  (0, '09:30', NULL, 'Sunday School', 'English'),
  (0, '10:45', NULL, 'Blended', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '20f8fd57-55d4-4ba3-a5bb-449d885e6174');

-- Kingdom Builders Transformation Ministries
DELETE FROM "church_services" WHERE "churchId" = '67774aec-5666-4907-aa33-887d1f52a411' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '67774aec-5666-4907-aa33-887d1f52a411', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:00', '10:00', 'Sunday Morning Bible School', 'English'),
  (0, '10:30', '12:00', 'Worship Service', 'English'),
  (1, '12:15', '13:15', 'Corporate Prayer Call', 'English'),
  (2, '19:00', NULL, 'Hour of Power Bible Study', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '67774aec-5666-4907-aa33-887d1f52a411');

-- Kirby Baptist Church
DELETE FROM "church_services" WHERE "churchId" = '07a5fb3b-6830-45d6-b189-3a75ff987e7c' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '07a5fb3b-6830-45d6-b189-3a75ff987e7c', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '11:00', NULL, 'Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '07a5fb3b-6830-45d6-b189-3a75ff987e7c');

-- LIDS Christian Center (La Iglesia del Señor)
UPDATE "churches" SET "pastorName" = 'Axayacatl Israel Ramírez' WHERE "id" = '36c584d4-007d-40e3-b495-a95176d9e916' AND "pastorName" IS NULL;
UPDATE "churches" SET "yearEstablished" = 2008 WHERE "id" = '36c584d4-007d-40e3-b495-a95176d9e916' AND "yearEstablished" IS NULL;

-- Lackland Baptist Church
DELETE FROM "church_services" WHERE "churchId" = '1fc6c3c9-4236-4ce6-9e2f-72f7734d15af' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '1fc6c3c9-4236-4ce6-9e2f-72f7734d15af', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:45', NULL, 'Bible Study', 'English'),
  (0, '11:00', NULL, 'Worship', 'English'),
  (0, '17:30', NULL, 'Evening Worship', 'English'),
  (3, '18:30', NULL, 'Food & Fellowship', 'English'),
  (3, '19:00', NULL, 'Bible Study', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '1fc6c3c9-4236-4ce6-9e2f-72f7734d15af');

-- Laurel Heights Seventh-day Adventist Church
UPDATE "churches" SET "yearEstablished" = 1900 WHERE "id" = '3ff79040-b592-4c6f-9633-a4263fe31df2' AND "yearEstablished" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = '3ff79040-b592-4c6f-9633-a4263fe31df2' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '3ff79040-b592-4c6f-9633-a4263fe31df2', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (6, '10:00', '11:00', 'Sabbath School', 'English'),
  (6, '11:15', '12:30', 'Worship', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '3ff79040-b592-4c6f-9633-a4263fe31df2');

-- Laurel Heights United Methodist Church
UPDATE "churches" SET "pastorName" = 'Michelle Vernone' WHERE "id" = '6040dee7-5300-4ea7-9323-b2dcf1100724' AND "pastorName" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = '6040dee7-5300-4ea7-9323-b2dcf1100724' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '6040dee7-5300-4ea7-9323-b2dcf1100724', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:00', NULL, 'Communion Service', 'English'),
  (0, '10:00', NULL, 'Sunday School', 'English'),
  (0, '11:00', NULL, 'Traditional Worship', 'English'),
  (3, '18:30', NULL, 'Prayer Gathering', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '6040dee7-5300-4ea7-9323-b2dcf1100724');

-- Laurel Street Church of Christ
UPDATE "churches" SET "pastorName" = 'Brandon Starling' WHERE "id" = '2b93fc6f-43a5-4c89-9ac4-f3e31c45e165' AND "pastorName" IS NULL;
UPDATE "churches" SET "email" = 'info@laurelstcoc.org' WHERE "id" = '2b93fc6f-43a5-4c89-9ac4-f3e31c45e165' AND "email" IS NULL;
UPDATE "churches" SET "yearEstablished" = 1935 WHERE "id" = '2b93fc6f-43a5-4c89-9ac4-f3e31c45e165' AND "yearEstablished" IS NULL;
UPDATE "churches" SET "description" = 'Laurel Street Church of Christ is a Bible-believing, family-oriented congregation in San Antonio, serving the community since 1935. It follows the New Testament pattern of Christianity and is dedicated to evangelism, edification, and benevolence. It is the first African-American Church of Christ in the region.' WHERE "id" = '2b93fc6f-43a5-4c89-9ac4-f3e31c45e165' AND "description" IS NULL;
UPDATE "churches" SET "goodForChildren" = true WHERE "id" = '2b93fc6f-43a5-4c89-9ac4-f3e31c45e165' AND "goodForChildren" IS NULL;
UPDATE "churches" SET "goodForGroups" = true WHERE "id" = '2b93fc6f-43a5-4c89-9ac4-f3e31c45e165' AND "goodForGroups" IS NULL;
UPDATE "churches" SET "languages" = ARRAY['English', 'Spanish']::text[] WHERE "id" = '2b93fc6f-43a5-4c89-9ac4-f3e31c45e165' AND "languages" = ARRAY['English']::text[];
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '2b93fc6f-43a5-4c89-9ac4-f3e31c45e165', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:15', NULL, 'Bible Class', 'English'),
  (0, '10:15', NULL, 'Morning Worship', 'English'),
  (0, '17:30', NULL, 'Evening Worship', 'English'),
  (3, '11:00', NULL, 'Morning Bible Class', 'English'),
  (3, '19:00', NULL, 'Evening Bible Class', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '2b93fc6f-43a5-4c89-9ac4-f3e31c45e165');

-- Leon Valley Baptist Church
UPDATE "churches" SET "pastorName" = 'Steve Burkholder' WHERE "id" = 'ca989c9f-be31-4caa-b0e7-8714e38b66de' AND "pastorName" IS NULL;
UPDATE "churches" SET "email" = 'secretary@lvbc.org' WHERE "id" = 'ca989c9f-be31-4caa-b0e7-8714e38b66de' AND "email" IS NULL;
UPDATE "churches" SET "yearEstablished" = 1984 WHERE "id" = 'ca989c9f-be31-4caa-b0e7-8714e38b66de' AND "yearEstablished" IS NULL;
UPDATE "churches" SET "description" = 'Leon Valley Baptist Church is a traditional, independent, Bible-believing Baptist church in northwest San Antonio, Texas. Launched in 1984 as a mission of Town East Baptist Church, it offers English, Spanish and ASL-interpreted services and supports missionaries around the world.' WHERE "id" = 'ca989c9f-be31-4caa-b0e7-8714e38b66de' AND "description" IS NULL;
UPDATE "churches" SET "goodForChildren" = true WHERE "id" = 'ca989c9f-be31-4caa-b0e7-8714e38b66de' AND "goodForChildren" IS NULL;
UPDATE "churches" SET "languages" = ARRAY['English', 'Spanish']::text[] WHERE "id" = 'ca989c9f-be31-4caa-b0e7-8714e38b66de' AND "languages" = ARRAY['English']::text[];
DELETE FROM "church_services" WHERE "churchId" = 'ca989c9f-be31-4caa-b0e7-8714e38b66de' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'ca989c9f-be31-4caa-b0e7-8714e38b66de', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:30', NULL, 'Bible Study', 'Bilingual'),
  (0, '10:30', NULL, 'Spanish Service', 'Spanish'),
  (0, '10:30', NULL, 'Worship Service', 'English'),
  (0, '18:30', NULL, 'Sunday Evening', 'English'),
  (3, '19:00', NULL, 'Spanish Service', 'Spanish'),
  (3, '19:00', NULL, 'Wednesday Evening', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'ca989c9f-be31-4caa-b0e7-8714e38b66de');

-- Liberty Baptist Church
UPDATE "churches" SET "pastorName" = 'DeWayne Nichols' WHERE "id" = '7f56b0ee-d4e3-4132-a86c-aef35765561b' AND "pastorName" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = '7f56b0ee-d4e3-4132-a86c-aef35765561b' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '7f56b0ee-d4e3-4132-a86c-aef35765561b', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:45', NULL, 'Sunday School', 'English'),
  (0, '10:50', NULL, 'Worship', 'English'),
  (0, '18:00', NULL, 'Worship', 'English'),
  (3, '19:30', NULL, 'Bible Study', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '7f56b0ee-d4e3-4132-a86c-aef35765561b');

-- Life Center Christian Fellowship
UPDATE "churches" SET "denomination" = 'Non-denominational', "denominationFamily" = 'Non-denominational' WHERE "id" = '45ab1348-f3a8-4bb4-a7f4-399f8d1562b8' AND "denomination" IS NULL AND "denominationFamily" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = '45ab1348-f3a8-4bb4-a7f4-399f8d1562b8' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '45ab1348-f3a8-4bb4-a7f4-399f8d1562b8', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '10:00', NULL, 'Sunday Worship', 'English'),
  (0, '10:30', NULL, 'Sunday School', 'English'),
  (3, '19:00', NULL, 'Bible Study', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '45ab1348-f3a8-4bb4-a7f4-399f8d1562b8');

-- Life Church of San Antonio
UPDATE "churches" SET "denomination" = 'Southern Baptist', "denominationFamily" = 'Baptist' WHERE "id" = '3ed39f61-6bdd-45f4-a645-ddc16c4893ce' AND "denomination" IS NULL AND "denominationFamily" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = '3ed39f61-6bdd-45f4-a645-ddc16c4893ce' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '3ed39f61-6bdd-45f4-a645-ddc16c4893ce', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '08:01', NULL, 'Traditional', 'Bilingual'),
  (0, '09:30', NULL, 'Service', 'Spanish'),
  (0, '11:00', NULL, 'Service', 'English'),
  (3, '18:30', NULL, 'Bible Study', 'Spanish'),
  (3, '19:30', NULL, 'Bible Study', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '3ed39f61-6bdd-45f4-a645-ddc16c4893ce');

-- Life Point Church
UPDATE "churches" SET "pastorName" = 'Danny Rivers' WHERE "id" = 'ed3febbb-8774-47b9-b375-7c687e6b750d' AND "pastorName" IS NULL;
UPDATE "churches" SET "goodForChildren" = true WHERE "id" = 'ed3febbb-8774-47b9-b375-7c687e6b750d' AND "goodForChildren" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = 'ed3febbb-8774-47b9-b375-7c687e6b750d' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'ed3febbb-8774-47b9-b375-7c687e6b750d', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '08:15', NULL, 'Service', 'English'),
  (0, '10:00', NULL, 'Service', 'English'),
  (0, '11:45', NULL, 'Service', 'English'),
  (0, '17:30', NULL, 'Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'ed3febbb-8774-47b9-b375-7c687e6b750d');

-- LifeShare Church
UPDATE "churches" SET "pastorName" = 'Ted Thevaos' WHERE "id" = '9f5e412f-919c-4aa8-b1f4-7aea94ebae15' AND "pastorName" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = '9f5e412f-919c-4aa8-b1f4-7aea94ebae15' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '9f5e412f-919c-4aa8-b1f4-7aea94ebae15', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '10:00', '12:00', 'Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '9f5e412f-919c-4aa8-b1f4-7aea94ebae15');

-- Lifehouse Church
UPDATE "churches" SET "pastorName" = 'Ryan Coffey' WHERE "id" = '981dc630-4172-466d-88ac-5a8d972c27b6' AND "pastorName" IS NULL;
UPDATE "churches" SET "yearEstablished" = 1997 WHERE "id" = '981dc630-4172-466d-88ac-5a8d972c27b6' AND "yearEstablished" IS NULL;
UPDATE "churches" SET "goodForChildren" = true WHERE "id" = '981dc630-4172-466d-88ac-5a8d972c27b6' AND "goodForChildren" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = '981dc630-4172-466d-88ac-5a8d972c27b6' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '981dc630-4172-466d-88ac-5a8d972c27b6', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:15', NULL, 'Service', 'English'),
  (0, '11:00', NULL, 'Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '981dc630-4172-466d-88ac-5a8d972c27b6');

-- Lighthouse Baptist Church
UPDATE "churches" SET "pastorName" = 'Greg Kern' WHERE "id" = '49423b87-5fae-4672-ad36-abedc5d2d920' AND "pastorName" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = '49423b87-5fae-4672-ad36-abedc5d2d920' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '49423b87-5fae-4672-ad36-abedc5d2d920', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '10:00', NULL, 'Sunday School', 'English'),
  (0, '11:00', NULL, 'AM Service', 'English'),
  (0, '14:00', NULL, 'PM Service', 'English'),
  (3, '19:00', NULL, 'Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '49423b87-5fae-4672-ad36-abedc5d2d920');

-- Limitless Church SA
UPDATE "churches" SET "pastorName" = 'Armando Andrade' WHERE "id" = '9a9e1e8e-08d9-417a-9735-a1d0d882fe65' AND "pastorName" IS NULL;
UPDATE "churches" SET "yearEstablished" = 1990 WHERE "id" = '9a9e1e8e-08d9-417a-9735-a1d0d882fe65' AND "yearEstablished" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = '9a9e1e8e-08d9-417a-9735-a1d0d882fe65' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '9a9e1e8e-08d9-417a-9735-a1d0d882fe65', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '11:00', NULL, 'Service', 'English'),
  (3, '19:00', NULL, 'David''s Tabernacle San Antonio (DTSA)', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '9a9e1e8e-08d9-417a-9735-a1d0d882fe65');

-- Live the Life Church
UPDATE "churches" SET "goodForGroups" = true WHERE "id" = '72db72bb-3cea-4e61-ba11-554009fc9207' AND "goodForGroups" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = '72db72bb-3cea-4e61-ba11-554009fc9207' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '72db72bb-3cea-4e61-ba11-554009fc9207', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:00', NULL, 'Service', 'English'),
  (0, '10:45', NULL, 'Service', 'English'),
  (0, '12:30', NULL, 'Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '72db72bb-3cea-4e61-ba11-554009fc9207');

-- Living Faith Church
UPDATE "churches" SET "pastorName" = 'Mario Nava' WHERE "id" = 'f00ec0e0-8639-45f6-b049-5b3ba3a31212' AND "pastorName" IS NULL;
UPDATE "churches" SET "goodForChildren" = true WHERE "id" = 'f00ec0e0-8639-45f6-b049-5b3ba3a31212' AND "goodForChildren" IS NULL;

-- Living Faith Community Church
DELETE FROM "church_services" WHERE "churchId" = '85eb2c8b-a009-481c-95cb-b58b004b60d5' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '85eb2c8b-a009-481c-95cb-b58b004b60d5', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '08:30', NULL, 'Service', 'English'),
  (0, '10:30', NULL, 'Service', 'English'),
  (3, '18:30', NULL, 'In The Word', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '85eb2c8b-a009-481c-95cb-b58b004b60d5');

-- Livingway Christian Church
UPDATE "churches" SET "yearEstablished" = 1975 WHERE "id" = 'ac6a9509-39eb-4be4-b54f-fbb8fdd84de1' AND "yearEstablished" IS NULL;

-- Luminous Church
DELETE FROM "church_services" WHERE "churchId" = '4f9c5e18-1f1a-4bb9-b335-be647dfef3ed' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '4f9c5e18-1f1a-4bb9-b335-be647dfef3ed', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:30', NULL, 'Service', 'English'),
  (0, '11:00', NULL, 'Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '4f9c5e18-1f1a-4bb9-b335-be647dfef3ed');

-- MTF Ministries
DELETE FROM "church_services" WHERE "churchId" = '5e524572-1bfa-4379-9a30-77198365b944' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '5e524572-1bfa-4379-9a30-77198365b944', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '11:00', NULL, 'Service', 'Bilingual'),
  (3, '19:30', NULL, 'Bible Study', 'English'),
  (5, '19:00', NULL, 'Prayer', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '5e524572-1bfa-4379-9a30-77198365b944');

-- Mac Arthur Park Lutheran Church
UPDATE "churches" SET "yearEstablished" = 1960 WHERE "id" = 'e14bc299-8f4d-44dd-805a-3bb11416375b' AND "yearEstablished" IS NULL;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'e14bc299-8f4d-44dd-805a-3bb11416375b', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:30', NULL, 'Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'e14bc299-8f4d-44dd-805a-3bb11416375b');

-- MacArthur Park Church of Christ
UPDATE "churches" SET "description" = 'MacArthur Park Church of Christ is a congregation in San Antonio, Texas, that welcomes people seeking to know God, grow in His Word, and love one another. It worships a cappella, shares the Lord''s Supper each Sunday, and is led by a group of ten elders.' WHERE "id" = '1aa82404-160b-47ee-af32-2b2bf6bd1de4' AND "description" IS NULL;
UPDATE "churches" SET "wheelchairAccessible" = true WHERE "id" = '1aa82404-160b-47ee-af32-2b2bf6bd1de4' AND "wheelchairAccessible" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = '1aa82404-160b-47ee-af32-2b2bf6bd1de4' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '1aa82404-160b-47ee-af32-2b2bf6bd1de4', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '08:30', NULL, 'Worship', 'English'),
  (0, '09:45', NULL, 'Bible Classes', 'English'),
  (0, '10:45', NULL, 'Worship', 'English'),
  (3, '17:00', NULL, 'Early-Bird Adult Bible Classes', 'English'),
  (3, '18:30', NULL, 'Bible Classes', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '1aa82404-160b-47ee-af32-2b2bf6bd1de4');

-- Mar Thoma Congregation of San Antonio
UPDATE "churches" SET "pastorName" = 'James K John' WHERE "id" = '6b98295a-5651-458f-8d1f-4fafc9c7448c' AND "pastorName" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = '6b98295a-5651-458f-8d1f-4fafc9c7448c' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '6b98295a-5651-458f-8d1f-4fafc9c7448c', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (3, '19:30', '20:30', 'Prayer Meeting', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '6b98295a-5651-458f-8d1f-4fafc9c7448c');

-- Maranatha Bible Church
DELETE FROM "church_services" WHERE "churchId" = '15858964-4cc2-45e2-8972-9433d01c882f' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '15858964-4cc2-45e2-8972-9433d01c882f', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:00', NULL, 'Sunday School', 'English'),
  (0, '10:00', NULL, 'Worship Celebration', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '15858964-4cc2-45e2-8972-9433d01c882f');

-- Mc Cauley Baptist Church
DELETE FROM "church_services" WHERE "churchId" = 'baaafc54-1f0e-4f01-ab52-97c1cc896e25' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'baaafc54-1f0e-4f01-ab52-97c1cc896e25', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:30', NULL, 'Adult Growth Groups', 'English'),
  (0, '09:30', NULL, 'Kids Sunday School', 'English'),
  (0, '09:30', NULL, 'Service', 'English'),
  (0, '11:00', NULL, 'Adult Growth Groups', 'English'),
  (0, '11:00', NULL, 'Service', 'English'),
  (3, '19:00', NULL, 'Prayer & Bible Study', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'baaafc54-1f0e-4f01-ab52-97c1cc896e25');

-- Mercy Church San Antonio
UPDATE "churches" SET "denomination" = 'Assemblies of God', "denominationFamily" = 'Pentecostal' WHERE "id" = '6a91449d-2f91-41b8-9075-fb7720bee809' AND "denomination" IS NULL AND "denominationFamily" IS NULL;

-- Messiah Bible Church
UPDATE "churches" SET "pastorName" = 'Tony Caffey' WHERE "id" = '6db1f00c-314e-4986-bb6b-f1b0abab9d43' AND "pastorName" IS NULL;
UPDATE "churches" SET "wheelchairAccessible" = true WHERE "id" = '6db1f00c-314e-4986-bb6b-f1b0abab9d43' AND "wheelchairAccessible" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = '6db1f00c-314e-4986-bb6b-f1b0abab9d43' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '6db1f00c-314e-4986-bb6b-f1b0abab9d43', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:00', '10:30', 'Service', 'English'),
  (0, '11:00', '12:30', 'Service', 'English'),
  (3, '19:00', '20:00', 'Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '6db1f00c-314e-4986-bb6b-f1b0abab9d43');

-- MetaChurch Potranco
UPDATE "churches" SET "denomination" = 'Non-denominational', "denominationFamily" = 'Non-denominational' WHERE "id" = '819a9ea4-7960-4c25-8e09-7674a98b7d60' AND "denomination" IS NULL AND "denominationFamily" IS NULL;

-- Ministerio Internacional ERJTX
DELETE FROM "church_services" WHERE "churchId" = '1d7dc36e-9dec-4770-be79-d00f08387d39' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '1d7dc36e-9dec-4770-be79-d00f08387d39', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '10:00', '13:00', 'Service', 'Spanish'),
  (2, '10:00', '12:00', 'Women''s Service', 'Spanish'),
  (3, '04:00', '06:00', 'Intercession', 'Spanish'),
  (4, '19:15', '21:00', 'Bible Institute', 'Spanish'),
  (5, '19:30', '21:00', 'Youth', 'Spanish')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '1d7dc36e-9dec-4770-be79-d00f08387d39');

-- Ministerios Nueva Vision
UPDATE "churches" SET "description" = 'Nueva Vision is a church in San Antonio, Texas, that holds weekly worship celebrations and is led by pastors Gumercindo and Orfa Gonzalez, with apostle and prophet Rene Abraham and Amanda Gonzalez also serving as pastors.' WHERE "id" = '20479099-bbd3-4edd-b208-c93640092f9b' AND "description" IS NULL;

-- Ministerios Rios De Vida
DELETE FROM "church_services" WHERE "churchId" = '572ab642-c9a8-42d0-85ab-f03a560cd68b' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '572ab642-c9a8-42d0-85ab-f03a560cd68b', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '11:00', NULL, 'Sunday Service', 'Bilingual')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '572ab642-c9a8-42d0-85ab-f03a560cd68b');

-- Ministry Center
UPDATE "churches" SET "pastorName" = 'Lupina Villalpando Stewart' WHERE "id" = 'c33f26cc-5b8f-44c1-ac26-d59b41e3195d' AND "pastorName" IS NULL;
UPDATE "churches" SET "wheelchairAccessible" = true WHERE "id" = 'c33f26cc-5b8f-44c1-ac26-d59b41e3195d' AND "wheelchairAccessible" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = 'c33f26cc-5b8f-44c1-ac26-d59b41e3195d' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'c33f26cc-5b8f-44c1-ac26-d59b41e3195d', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '08:30', NULL, 'Traditional', 'English'),
  (0, '11:00', NULL, 'Contemporary', 'English'),
  (0, '11:00', NULL, 'Traditional', 'English'),
  (0, '13:00', NULL, 'La Roca Bilingual Worship', 'Bilingual'),
  (3, '18:30', NULL, 'Holy Communion', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'c33f26cc-5b8f-44c1-ac26-d59b41e3195d');

-- Mission Church San Antonio
UPDATE "churches" SET "pastorName" = 'Daniel Duce' WHERE "id" = 'aa31c73f-13dc-4e5d-abf0-7e71fe1f0777' AND "pastorName" IS NULL;
UPDATE "churches" SET "yearEstablished" = 2008 WHERE "id" = 'aa31c73f-13dc-4e5d-abf0-7e71fe1f0777' AND "yearEstablished" IS NULL;
UPDATE "churches" SET "goodForChildren" = true WHERE "id" = 'aa31c73f-13dc-4e5d-abf0-7e71fe1f0777' AND "goodForChildren" IS NULL;
UPDATE "churches" SET "denomination" = 'Non-denominational', "denominationFamily" = 'Non-denominational' WHERE "id" = 'aa31c73f-13dc-4e5d-abf0-7e71fe1f0777' AND "denomination" IS NULL AND "denominationFamily" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = 'aa31c73f-13dc-4e5d-abf0-7e71fe1f0777' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'aa31c73f-13dc-4e5d-abf0-7e71fe1f0777', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '10:10', NULL, 'Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'aa31c73f-13dc-4e5d-abf0-7e71fe1f0777');

-- Mission City Church – Central
UPDATE "churches" SET "denomination" = 'Non-denominational', "denominationFamily" = 'Non-denominational' WHERE "id" = 'f1c0c1a4-ae15-4973-8b3d-be98c39c8a59' AND "denomination" IS NULL AND "denominationFamily" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = 'f1c0c1a4-ae15-4973-8b3d-be98c39c8a59' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'f1c0c1a4-ae15-4973-8b3d-be98c39c8a59', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:20', NULL, 'Service', 'English'),
  (0, '11:00', NULL, 'Service', 'English'),
  (4, '19:00', NULL, 'Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'f1c0c1a4-ae15-4973-8b3d-be98c39c8a59');

-- Mission Community Church Collective
UPDATE "churches" SET "pastorName" = 'Mike Kraft' WHERE "id" = '8a94d43e-0789-430d-accc-c7f283d6730c' AND "pastorName" IS NULL;
UPDATE "churches" SET "email" = 'mike@missioncommunitysa.com' WHERE "id" = '8a94d43e-0789-430d-accc-c7f283d6730c' AND "email" IS NULL;

-- Mission Concepción
UPDATE "churches" SET "pastorName" = 'Marcos A. Ramos' WHERE "id" = 'b9f4f6cc-c3c7-4366-b14d-741cd9a539fd' AND "pastorName" IS NULL;

-- Mosaic Church SA
DELETE FROM "church_services" WHERE "churchId" = '5370890f-9dff-4267-bd08-348ce9c6bbad' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '5370890f-9dff-4267-bd08-348ce9c6bbad', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:30', NULL, 'Service', 'English'),
  (0, '11:00', NULL, 'Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '5370890f-9dff-4267-bd08-348ce9c6bbad');

-- Motion Church
DELETE FROM "church_services" WHERE "churchId" = 'bf9f5aca-9b17-4c2f-a572-bc2383fb1afc' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'bf9f5aca-9b17-4c2f-a572-bc2383fb1afc', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:30', NULL, 'Service', 'English'),
  (0, '11:00', NULL, 'Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'bf9f5aca-9b17-4c2f-a572-bc2383fb1afc');

-- Mt. Olive Lutheran Church LCMS
DELETE FROM "church_services" WHERE "churchId" = '87191a76-247c-40ef-b53a-25794aa7295e' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '87191a76-247c-40ef-b53a-25794aa7295e', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:15', NULL, 'Adult Bible Study', 'English'),
  (0, '09:30', NULL, 'Children''s Sunday School', 'English'),
  (0, '10:30', NULL, 'Divine Service', 'English'),
  (1, '19:00', NULL, 'Bible Study', 'English'),
  (5, '18:00', NULL, 'Youth Confirmation', 'English'),
  (6, '09:30', NULL, 'Women''s Bible Study', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '87191a76-247c-40ef-b53a-25794aa7295e');

-- My Friend’s House Christian Fellowship
UPDATE "churches" SET "yearEstablished" = 1990 WHERE "id" = '7361ea12-172b-4cd9-b82e-7df3743ac9aa' AND "yearEstablished" IS NULL;
UPDATE "churches" SET "description" = 'My Friend''s House Christian Fellowship is a non-denominational church established in 1990. Its mission is to love with Christ''s love and share His message of reconciliation, summarized as: Display Jesus, Love People, Make Disciples, and Rescue A Generation.' WHERE "id" = '7361ea12-172b-4cd9-b82e-7df3743ac9aa' AND "description" IS NULL;
UPDATE "churches" SET "denomination" = 'Non-denominational', "denominationFamily" = 'Non-denominational' WHERE "id" = '7361ea12-172b-4cd9-b82e-7df3743ac9aa' AND "denomination" IS NULL AND "denominationFamily" IS NULL;

-- My Redeemer Lives Baptist Church
UPDATE "churches" SET "pastorName" = 'Eliseo Garza' WHERE "id" = 'ed481522-bcda-48f4-ad8c-ae7904da54c1' AND "pastorName" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = 'ed481522-bcda-48f4-ad8c-ae7904da54c1' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'ed481522-bcda-48f4-ad8c-ae7904da54c1', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '10:30', NULL, 'Service', 'Bilingual'),
  (0, '11:00', NULL, 'Service', 'Karen'),
  (3, '19:00', NULL, 'Bible Study', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'ed481522-bcda-48f4-ad8c-ae7904da54c1');

-- New Covenant Baptist Church
UPDATE "churches" SET "email" = 'church@newcovenantbcsa.org' WHERE "id" = 'db4e3321-d9bf-4e80-b9ac-c1dc01f8fee2' AND "email" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = 'db4e3321-d9bf-4e80-b9ac-c1dc01f8fee2' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'db4e3321-d9bf-4e80-b9ac-c1dc01f8fee2', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '08:15', NULL, 'Sunday School', 'English'),
  (0, '09:00', NULL, 'Sunday Worship Service', 'English'),
  (0, '10:15', NULL, 'Sunday School', 'English'),
  (3, '18:30', NULL, 'Fulfillment Hour', 'English'),
  (3, '19:00', NULL, 'Prayer Meeting/Bible Study', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'db4e3321-d9bf-4e80-b9ac-c1dc01f8fee2');

-- New Creation Christian Fellowship Windcrest
UPDATE "churches" SET "yearEstablished" = 1985 WHERE "id" = 'd8c8200a-115b-489f-9d7e-769d5a8169ce' AND "yearEstablished" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = 'd8c8200a-115b-489f-9d7e-769d5a8169ce' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'd8c8200a-115b-489f-9d7e-769d5a8169ce', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:00', NULL, 'Worship Service', 'English'),
  (0, '10:00', NULL, 'Worship Service', 'English'),
  (2, '19:00', NULL, 'Bible Study', 'English'),
  (3, '18:45', NULL, 'Mid Week Service', 'English'),
  (4, '19:00', NULL, 'It''s Time: The Inspirational Hour', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'd8c8200a-115b-489f-9d7e-769d5a8169ce');

-- New Dimensions Ministries
UPDATE "churches" SET "goodForGroups" = true WHERE "id" = 'c3600625-220b-4af9-8d77-da2b331a4894' AND "goodForGroups" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = 'c3600625-220b-4af9-8d77-da2b331a4894' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'c3600625-220b-4af9-8d77-da2b331a4894', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '11:00', NULL, 'Worship Service', 'English'),
  (3, '18:30', NULL, 'Prayer Call', 'English'),
  (4, '19:00', NULL, 'Bible Study', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'c3600625-220b-4af9-8d77-da2b331a4894');

-- New Hope United Church of God (Seventh Day)
UPDATE "churches" SET "pastorName" = 'Michael Mancha' WHERE "id" = '60a0e5bf-4806-4b60-bbaa-adc375756f4e' AND "pastorName" IS NULL;
UPDATE "churches" SET "yearEstablished" = 2012 WHERE "id" = '60a0e5bf-4806-4b60-bbaa-adc375756f4e' AND "yearEstablished" IS NULL;
UPDATE "churches" SET "goodForChildren" = true WHERE "id" = '60a0e5bf-4806-4b60-bbaa-adc375756f4e' AND "goodForChildren" IS NULL;
UPDATE "churches" SET "goodForGroups" = true WHERE "id" = '60a0e5bf-4806-4b60-bbaa-adc375756f4e' AND "goodForGroups" IS NULL;
UPDATE "churches" SET "wheelchairAccessible" = true WHERE "id" = '60a0e5bf-4806-4b60-bbaa-adc375756f4e' AND "wheelchairAccessible" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = '60a0e5bf-4806-4b60-bbaa-adc375756f4e' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '60a0e5bf-4806-4b60-bbaa-adc375756f4e', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (6, '10:30', '12:00', 'Worship Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '60a0e5bf-4806-4b60-bbaa-adc375756f4e');

-- New Life Baptist Church
DELETE FROM "church_services" WHERE "churchId" = '184b1d2c-9b52-4bba-bca2-1e304f10fee2' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '184b1d2c-9b52-4bba-bca2-1e304f10fee2', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:30', '10:20', 'Sunday School', 'English'),
  (0, '10:30', NULL, 'Sunday morning worship', 'English'),
  (0, '18:00', NULL, 'Sunday evening worship', 'English'),
  (3, '19:00', NULL, 'Adult Bible Study & Prayer', 'English'),
  (3, '19:00', NULL, 'Master Club for Kids', 'English'),
  (3, '19:00', NULL, 'Teen Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '184b1d2c-9b52-4bba-bca2-1e304f10fee2');

-- New Life Church
UPDATE "churches" SET "email" = 'OfficeAdmin@newlifechurchsa.com' WHERE "id" = '9b8daf08-200a-410a-94b2-244947677085' AND "email" IS NULL;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '9b8daf08-200a-410a-94b2-244947677085', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:00', NULL, 'Sunday School', 'English'),
  (0, '10:30', NULL, 'Sunday Morning Worship', 'English'),
  (3, '18:30', NULL, 'Bible Study', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '9b8daf08-200a-410a-94b2-244947677085');

-- New Life Fellowship
UPDATE "churches" SET "pastorName" = 'Duane Lowe' WHERE "id" = 'da19a0c1-e40d-461a-8da8-7fb64bd5c329' AND "pastorName" IS NULL;
UPDATE "churches" SET "yearEstablished" = 1992 WHERE "id" = 'da19a0c1-e40d-461a-8da8-7fb64bd5c329' AND "yearEstablished" IS NULL;
UPDATE "churches" SET "goodForChildren" = true WHERE "id" = 'da19a0c1-e40d-461a-8da8-7fb64bd5c329' AND "goodForChildren" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = 'da19a0c1-e40d-461a-8da8-7fb64bd5c329' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'da19a0c1-e40d-461a-8da8-7fb64bd5c329', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '10:00', NULL, 'Service', 'English'),
  (6, '09:00', NULL, 'Prayer', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'da19a0c1-e40d-461a-8da8-7fb64bd5c329');

-- New Vision Church of God
UPDATE "churches" SET "pastorName" = 'Jeff Stiewig' WHERE "id" = 'f1643681-4b87-4130-bd00-20b1679ff983' AND "pastorName" IS NULL;

-- North Oaks Free Will Baptist Church
DELETE FROM "church_services" WHERE "churchId" = '7b884380-09c7-4a65-b202-4e5d0380c639' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '7b884380-09c7-4a65-b202-4e5d0380c639', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '11:00', NULL, 'Service', 'English'),
  (3, '19:00', NULL, 'Bible Study', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '7b884380-09c7-4a65-b202-4e5d0380c639');

-- NorthRock Church
UPDATE "churches" SET "pastorName" = 'Jonathan Moore' WHERE "id" = '6128d54e-c766-4d7a-8030-2de70459fb69' AND "pastorName" IS NULL;
UPDATE "churches" SET "email" = 'info@northrocksa.com' WHERE "id" = '6128d54e-c766-4d7a-8030-2de70459fb69' AND "email" IS NULL;
UPDATE "churches" SET "languages" = ARRAY['English', 'Spanish']::text[] WHERE "id" = '6128d54e-c766-4d7a-8030-2de70459fb69' AND "languages" = ARRAY['English']::text[];

-- Northeast Bible Church
UPDATE "churches" SET "yearEstablished" = 1981 WHERE "id" = 'f9b42878-621d-4203-8039-f5df3eb8d0ad' AND "yearEstablished" IS NULL;

-- Northern Hills United Methodist Church
UPDATE "churches" SET "pastorName" = 'Lupina Villalpando Stewart' WHERE "id" = '007fa8fd-d64e-4aa5-b50b-4f76c8a04106' AND "pastorName" IS NULL;
UPDATE "churches" SET "wheelchairAccessible" = true WHERE "id" = '007fa8fd-d64e-4aa5-b50b-4f76c8a04106' AND "wheelchairAccessible" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = '007fa8fd-d64e-4aa5-b50b-4f76c8a04106' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '007fa8fd-d64e-4aa5-b50b-4f76c8a04106', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '08:30', NULL, 'Traditional', 'English'),
  (0, '11:00', NULL, 'Contemporary', 'English'),
  (0, '11:00', NULL, 'Traditional', 'English'),
  (0, '13:00', NULL, 'La Roca Bilingual Worship', 'Bilingual'),
  (1, '09:30', NULL, 'Precept Bible Study', 'English'),
  (1, '18:30', NULL, 'B.R.E.A.T.H. Bible Study', 'English'),
  (3, '18:30', NULL, 'Holy Communion', 'English'),
  (3, '19:00', NULL, 'Bible Study', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '007fa8fd-d64e-4aa5-b50b-4f76c8a04106');

-- Northminster Presbyterian Church
UPDATE "churches" SET "pastorName" = 'Dana Pope' WHERE "id" = 'fa321427-107e-4554-988a-b3c6d7b7fc6f' AND "pastorName" IS NULL;
UPDATE "churches" SET "goodForChildren" = true WHERE "id" = 'fa321427-107e-4554-988a-b3c6d7b7fc6f' AND "goodForChildren" IS NULL;

-- Northside Church of Christ
UPDATE "churches" SET "wheelchairAccessible" = true WHERE "id" = 'ad0f1a68-e6ad-4030-bd55-f2bc27159486' AND "wheelchairAccessible" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = 'ad0f1a68-e6ad-4030-bd55-f2bc27159486' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'ad0f1a68-e6ad-4030-bd55-f2bc27159486', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:00', NULL, 'Worship', 'English'),
  (0, '10:30', NULL, 'Classes', 'English'),
  (0, '19:00', NULL, 'Online Bible Study/Lifegroup', 'English'),
  (3, '18:30', NULL, 'Youth Gathering', 'English'),
  (3, '19:00', NULL, 'Children''s Activities', 'English'),
  (3, '19:00', NULL, 'Women''s and Men''s Bible Studies', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'ad0f1a68-e6ad-4030-bd55-f2bc27159486');

-- Northwest Assembly of God
UPDATE "churches" SET "pastorName" = 'Kathy Moore' WHERE "id" = '19c447e7-28f8-44fd-92c3-55037df4f46f' AND "pastorName" IS NULL;
UPDATE "churches" SET "email" = 'info@northwestag.org' WHERE "id" = '19c447e7-28f8-44fd-92c3-55037df4f46f' AND "email" IS NULL;
UPDATE "churches" SET "description" = 'Northwest Assembly of God is a Christ-centered church in San Antonio where people of all ages can grow, belong, and experience God''s presence. It serves its community and is part of the Assemblies of God fellowship.' WHERE "id" = '19c447e7-28f8-44fd-92c3-55037df4f46f' AND "description" IS NULL;
UPDATE "churches" SET "goodForChildren" = true WHERE "id" = '19c447e7-28f8-44fd-92c3-55037df4f46f' AND "goodForChildren" IS NULL;
UPDATE "churches" SET "languages" = ARRAY['English', 'Spanish']::text[] WHERE "id" = '19c447e7-28f8-44fd-92c3-55037df4f46f' AND "languages" = ARRAY['English']::text[];
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '19c447e7-28f8-44fd-92c3-55037df4f46f', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '10:15', NULL, 'Sunday Worship', 'English'),
  (3, '18:30', NULL, 'Midweek Teaching', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '19c447e7-28f8-44fd-92c3-55037df4f46f');

-- Northwest Church of Christ
DELETE FROM "church_services" WHERE "churchId" = 'c6dfb386-a337-481a-8e51-a9e3d6e924d6' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'c6dfb386-a337-481a-8e51-a9e3d6e924d6', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:15', NULL, 'Bible Class', 'English'),
  (0, '10:30', NULL, 'Service', 'English'),
  (0, '18:00', NULL, 'Service', 'English'),
  (3, '18:30', NULL, 'Wednesday Night', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'c6dfb386-a337-481a-8e51-a9e3d6e924d6');

-- Northwest Community Church
UPDATE "churches" SET "pastorName" = 'Dave Smith' WHERE "id" = '0e141ca3-b94f-43ff-b825-9d67a6c7190d' AND "pastorName" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = '0e141ca3-b94f-43ff-b825-9d67a6c7190d' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '0e141ca3-b94f-43ff-b825-9d67a6c7190d', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:30', NULL, 'Adult Bible Fellowship', 'English'),
  (0, '09:30', NULL, 'Service', 'English'),
  (0, '09:30', NULL, 'Sunday School', 'English'),
  (0, '11:00', NULL, 'Adult Bible Fellowship', 'English'),
  (0, '11:00', NULL, 'Encuentro', 'Spanish'),
  (0, '11:00', NULL, 'Service', 'English'),
  (3, '19:00', NULL, 'Student Ministry', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '0e141ca3-b94f-43ff-b825-9d67a6c7190d');

-- Northwest Hills Christian Church
UPDATE "churches" SET "pastorName" = 'Justin Hartpence' WHERE "id" = '1ead9bce-6f12-46d4-8dea-6bd70b50d2c9' AND "pastorName" IS NULL;
UPDATE "churches" SET "email" = 'nwhccsa@gmail.com' WHERE "id" = '1ead9bce-6f12-46d4-8dea-6bd70b50d2c9' AND "email" IS NULL;
UPDATE "churches" SET "description" = 'Northwest Hills Christian Church is a multi-ethnic, multi-generational church in San Antonio pursuing God''s Kingdom. It welcomes anyone, offers weekly communion and baptism by immersion, and seeks to help people move forward in their journey with God.' WHERE "id" = '1ead9bce-6f12-46d4-8dea-6bd70b50d2c9' AND "description" IS NULL;
UPDATE "churches" SET "goodForChildren" = true WHERE "id" = '1ead9bce-6f12-46d4-8dea-6bd70b50d2c9' AND "goodForChildren" IS NULL;
UPDATE "churches" SET "goodForGroups" = true WHERE "id" = '1ead9bce-6f12-46d4-8dea-6bd70b50d2c9' AND "goodForGroups" IS NULL;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '1ead9bce-6f12-46d4-8dea-6bd70b50d2c9', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:00', NULL, 'Service', 'English'),
  (0, '10:30', NULL, 'Service', 'English'),
  (3, '18:30', NULL, 'Bible Study', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '1ead9bce-6f12-46d4-8dea-6bd70b50d2c9');

-- Northwest Hills Global Methodist Church
UPDATE "churches" SET "pastorName" = 'Robert Barnes' WHERE "id" = 'fc431140-af81-4b4d-9118-74f4bbf2aebf' AND "pastorName" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = 'fc431140-af81-4b4d-9118-74f4bbf2aebf' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'fc431140-af81-4b4d-9118-74f4bbf2aebf', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '08:15', NULL, 'Service', 'English'),
  (0, '11:00', NULL, 'Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'fc431140-af81-4b4d-9118-74f4bbf2aebf');

-- Oak Hills Church - Crownridge Campus
UPDATE "churches" SET "pastorName" = 'Travis Eades' WHERE "id" = '00d36e5a-df86-4ad5-8ec5-e5b0fffcf043' AND "pastorName" IS NULL;
UPDATE "churches" SET "yearEstablished" = 1958 WHERE "id" = '00d36e5a-df86-4ad5-8ec5-e5b0fffcf043' AND "yearEstablished" IS NULL;
UPDATE "churches" SET "description" = 'Oak Hills Church is a non-denominational congregation in San Antonio, Texas, founded in 1958 as a church plant on Fredericksburg Road. Its mission is to be disciples who make disciples by guiding all people to follow Jesus moment by moment.' WHERE "id" = '00d36e5a-df86-4ad5-8ec5-e5b0fffcf043' AND "description" IS NULL;
UPDATE "churches" SET "goodForChildren" = true WHERE "id" = '00d36e5a-df86-4ad5-8ec5-e5b0fffcf043' AND "goodForChildren" IS NULL;
UPDATE "churches" SET "goodForGroups" = true WHERE "id" = '00d36e5a-df86-4ad5-8ec5-e5b0fffcf043' AND "goodForGroups" IS NULL;
UPDATE "churches" SET "languages" = ARRAY['English', 'Spanish']::text[] WHERE "id" = '00d36e5a-df86-4ad5-8ec5-e5b0fffcf043' AND "languages" = ARRAY['English']::text[];
DELETE FROM "church_services" WHERE "churchId" = '00d36e5a-df86-4ad5-8ec5-e5b0fffcf043' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '00d36e5a-df86-4ad5-8ec5-e5b0fffcf043', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '08:30', NULL, 'Worship Service', 'English'),
  (0, '10:00', NULL, 'Worship Service', 'English'),
  (0, '11:30', NULL, 'OHC Español Worship Service', 'Spanish'),
  (0, '11:30', NULL, 'Worship Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '00d36e5a-df86-4ad5-8ec5-e5b0fffcf043');

-- Oak Hills Presbyterian Church
DELETE FROM "church_services" WHERE "churchId" = '562ab6da-3a2d-46dc-a2c5-ef03496a0c34' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '562ab6da-3a2d-46dc-a2c5-ef03496a0c34', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '10:30', NULL, 'Traditional Worship', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '562ab6da-3a2d-46dc-a2c5-ef03496a0c34');

-- Oak Island Methodist Church, A Global Methodist Congregation
DELETE FROM "church_services" WHERE "churchId" = '09aa95fc-2041-4401-a409-db986d8b51ea' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '09aa95fc-2041-4401-a409-db986d8b51ea', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '10:00', '11:15', 'Sunday Worship', 'English'),
  (0, '11:30', '12:30', 'Sunday School', 'English'),
  (3, '18:00', '20:00', 'Kids Night Out', 'English'),
  (3, '19:00', '20:00', 'Support Group', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '09aa95fc-2041-4401-a409-db986d8b51ea');

-- Oak Meadow United Methodist
UPDATE "churches" SET "pastorName" = 'Jesse Franklin' WHERE "id" = 'fa541c2c-8ac6-44b5-a274-48b8c14d9cfa' AND "pastorName" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = 'fa541c2c-8ac6-44b5-a274-48b8c14d9cfa' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'fa541c2c-8ac6-44b5-a274-48b8c14d9cfa', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:00', NULL, 'Adult Sunday School', 'English'),
  (0, '10:30', NULL, 'Children''s & Youth Sunday School', 'English'),
  (0, '10:30', NULL, 'Worship Service', 'English'),
  (3, '18:00', NULL, 'Wednesday Night Worship Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'fa541c2c-8ac6-44b5-a274-48b8c14d9cfa');

-- Oak Ridge Baptist Church
UPDATE "churches" SET "pastorName" = 'Andrew D. Bedo' WHERE "id" = '822ce7aa-43c4-4f59-8c47-4153cffc0b1c' AND "pastorName" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = '822ce7aa-43c4-4f59-8c47-4153cffc0b1c' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '822ce7aa-43c4-4f59-8c47-4153cffc0b1c', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '10:00', NULL, 'Worship', 'English'),
  (0, '11:30', '12:30', 'Bible Fellowship', 'English'),
  (0, '13:00', NULL, 'Worship', 'Spanish'),
  (0, '17:00', '19:00', 'Youth/Children', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '822ce7aa-43c4-4f59-8c47-4153cffc0b1c');

-- Old Path Baptist Church
UPDATE "churches" SET "email" = 'oldpathtxb@gmail.com' WHERE "id" = 'b93ca945-358f-4116-907d-dd77aff7d95f' AND "email" IS NULL;
UPDATE "churches" SET "description" = 'Old Path Baptist Church is an independent, fundamental, King James Bible believing Baptist church in the San Antonio, Texas area. Pastored by Manly Perry, it is focused on soul-winning and reaching the area with the Gospel of Jesus Christ.' WHERE "id" = 'b93ca945-358f-4116-907d-dd77aff7d95f' AND "description" IS NULL;
UPDATE "churches" SET "goodForChildren" = true WHERE "id" = 'b93ca945-358f-4116-907d-dd77aff7d95f' AND "goodForChildren" IS NULL;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'b93ca945-358f-4116-907d-dd77aff7d95f', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '11:00', NULL, 'Preaching', 'English'),
  (0, '14:00', NULL, 'Preaching', 'English'),
  (4, '18:30', NULL, 'Prayer Meeting', 'English'),
  (4, '19:00', NULL, 'Preaching', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'b93ca945-358f-4116-907d-dd77aff7d95f');

-- Our Lady Queen of Heaven Church
UPDATE "churches" SET "email" = 'admin@olqh-tx.com' WHERE "id" = '22574bad-0cac-436c-b346-bfa0391433e2' AND "email" IS NULL;
UPDATE "churches" SET "description" = 'Our Lady Queen of Heaven is a Catholic parish in Atascosa, Texas, committed to knowing, loving and serving God by knowing and serving others. The parish offers Mass and Bible classes in Spanish, faith formation for children, and a range of parish ministries.' WHERE "id" = '22574bad-0cac-436c-b346-bfa0391433e2' AND "description" IS NULL;
UPDATE "churches" SET "goodForChildren" = true WHERE "id" = '22574bad-0cac-436c-b346-bfa0391433e2' AND "goodForChildren" IS NULL;
UPDATE "churches" SET "languages" = ARRAY['English', 'Spanish']::text[] WHERE "id" = '22574bad-0cac-436c-b346-bfa0391433e2' AND "languages" = ARRAY['English']::text[];
DELETE FROM "church_services" WHERE "churchId" = '22574bad-0cac-436c-b346-bfa0391433e2' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '22574bad-0cac-436c-b346-bfa0391433e2', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (2, '18:00', NULL, 'Bible Study', 'Spanish')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '22574bad-0cac-436c-b346-bfa0391433e2');

-- Our Lady of Grace Church
UPDATE "churches" SET "goodForGroups" = true WHERE "id" = 'e57ae095-6cf0-4e66-8de5-b8ceb4eb4d74' AND "goodForGroups" IS NULL;

-- Our Lady of Guadalupe Shrine
UPDATE "churches" SET "pastorName" = 'Andy Martinez' WHERE "id" = '8041d3f8-ce03-4fd3-8781-7b6f6d96ab2f' AND "pastorName" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = '8041d3f8-ce03-4fd3-8781-7b6f6d96ab2f' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '8041d3f8-ce03-4fd3-8781-7b6f6d96ab2f', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '08:30', NULL, 'Mass', 'Spanish'),
  (0, '11:30', NULL, 'Mass', 'English'),
  (2, '08:00', NULL, 'Daily Mass', 'English'),
  (4, '08:00', NULL, 'Daily Mass', 'English'),
  (6, '17:00', NULL, 'Mass', 'Bilingual')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '8041d3f8-ce03-4fd3-8781-7b6f6d96ab2f');

-- Our Lady of the Atonement Catholic Church
UPDATE "churches" SET "pastorName" = 'Jerry Sherbourne' WHERE "id" = '36d57a8c-94c6-4526-a02a-f5a0f8f07565' AND "pastorName" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = '36d57a8c-94c6-4526-a02a-f5a0f8f07565' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '36d57a8c-94c6-4526-a02a-f5a0f8f07565', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '07:00', NULL, 'Mass', 'English'),
  (0, '09:00', NULL, 'Mass', 'English'),
  (0, '11:00', NULL, 'Mass', 'English'),
  (0, '17:00', NULL, 'Mass', 'English'),
  (1, '07:00', NULL, 'Mass', 'English'),
  (2, '07:00', NULL, 'Mass', 'English'),
  (3, '07:00', NULL, 'Mass', 'English'),
  (4, '07:00', NULL, 'Mass', 'English'),
  (5, '07:00', NULL, 'Mass', 'English'),
  (6, '07:00', NULL, 'Mass', 'English'),
  (6, '17:00', NULL, 'Anticipatory Mass', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '36d57a8c-94c6-4526-a02a-f5a0f8f07565');

-- Outer West Community Church
UPDATE "churches" SET "pastorName" = 'Allen Thomas' WHERE "id" = 'a8d89035-f4a6-429c-b379-5f63680c9981' AND "pastorName" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = 'a8d89035-f4a6-429c-b379-5f63680c9981' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'a8d89035-f4a6-429c-b379-5f63680c9981', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:30', NULL, 'Service', 'English'),
  (0, '11:00', NULL, 'Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'a8d89035-f4a6-429c-b379-5f63680c9981');

-- Parkhills Baptist Church
UPDATE "churches" SET "goodForChildren" = true WHERE "id" = 'f354c70e-97cf-4745-b051-ea5f431b38d3' AND "goodForChildren" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = 'f354c70e-97cf-4745-b051-ea5f431b38d3' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'f354c70e-97cf-4745-b051-ea5f431b38d3', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:30', NULL, 'Connection Groups', 'English'),
  (0, '10:45', NULL, 'Worship Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'f354c70e-97cf-4745-b051-ea5f431b38d3');

-- Pearl St. Church
UPDATE "churches" SET "email" = 'info@pearlstreetchurch.org' WHERE "id" = '555e8d33-a2d9-465e-b8e8-f50d23bec928' AND "email" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = '555e8d33-a2d9-465e-b8e8-f50d23bec928' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '555e8d33-a2d9-465e-b8e8-f50d23bec928', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '08:30', NULL, 'Service', 'English'),
  (0, '10:00', NULL, 'Service', 'English'),
  (0, '11:45', '13:15', 'Next Steps', 'English'),
  (0, '11:45', NULL, 'Service', 'English'),
  (0, '13:30', NULL, 'Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '555e8d33-a2d9-465e-b8e8-f50d23bec928');

-- Pearl St. Church - North Location
UPDATE "churches" SET "email" = 'info@pearlstreetchurch.org' WHERE "id" = 'b3df812b-2e09-4baf-9a15-718232ced6fb' AND "email" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = 'b3df812b-2e09-4baf-9a15-718232ced6fb' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'b3df812b-2e09-4baf-9a15-718232ced6fb', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '08:30', NULL, 'Service', 'English'),
  (0, '10:00', NULL, 'Service', 'English'),
  (0, '11:45', NULL, 'Service', 'English'),
  (0, '13:30', NULL, 'Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'b3df812b-2e09-4baf-9a15-718232ced6fb');

-- Pearsall Road Church - Pastor Statt
UPDATE "churches" SET "pastorName" = 'Statt Riddlebarger' WHERE "id" = '26db5f77-b0fc-45d9-861e-3d7fa90465dd' AND "pastorName" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = '26db5f77-b0fc-45d9-861e-3d7fa90465dd' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '26db5f77-b0fc-45d9-861e-3d7fa90465dd', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:30', NULL, 'Bible Study', 'English'),
  (0, '10:45', NULL, 'Service', 'English'),
  (3, '18:55', NULL, 'Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '26db5f77-b0fc-45d9-861e-3d7fa90465dd');

-- Pecan Valley Church of Christ
DELETE FROM "church_services" WHERE "churchId" = 'd52e0f59-b326-4f23-8a88-298c030210ce' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'd52e0f59-b326-4f23-8a88-298c030210ce', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '10:00', NULL, 'Bible Study', 'English'),
  (0, '11:00', NULL, 'Assembly', 'English'),
  (0, '14:00', NULL, 'Bible Study', 'English'),
  (3, '19:00', NULL, 'Bible Study', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'd52e0f59-b326-4f23-8a88-298c030210ce');

-- Pillar Church of San Antonio
UPDATE "churches" SET "goodForChildren" = true WHERE "id" = '4741e806-c103-4980-8641-7bdc8052d853' AND "goodForChildren" IS NULL;
UPDATE "churches" SET "denomination" = 'Baptist', "denominationFamily" = 'Baptist' WHERE "id" = '4741e806-c103-4980-8641-7bdc8052d853' AND "denomination" IS NULL AND "denominationFamily" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = '4741e806-c103-4980-8641-7bdc8052d853' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '4741e806-c103-4980-8641-7bdc8052d853', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '10:30', NULL, 'Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '4741e806-c103-4980-8641-7bdc8052d853');

-- Place of Grace Fellowship
DELETE FROM "church_services" WHERE "churchId" = '77253b89-19da-4093-9fab-9a3ee19c359a' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '77253b89-19da-4093-9fab-9a3ee19c359a', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:30', NULL, 'Bible Study', 'English'),
  (0, '09:30', NULL, 'Teen Bible Study', 'English'),
  (0, '10:45', NULL, 'Worship Service', 'English'),
  (0, '11:00', NULL, 'Children''s Church', 'English'),
  (3, '18:00', NULL, 'Bible Study', 'English'),
  (4, '10:00', NULL, 'Women''s Bible Study', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '77253b89-19da-4093-9fab-9a3ee19c359a');

-- Potter's House Christian Church
UPDATE "churches" SET "pastorName" = 'Greg Mitchell' WHERE "id" = '502c3178-bbf3-4947-a272-dbd577235dcb' AND "pastorName" IS NULL;
UPDATE "churches" SET "yearEstablished" = 1991 WHERE "id" = '502c3178-bbf3-4947-a272-dbd577235dcb' AND "yearEstablished" IS NULL;
UPDATE "churches" SET "goodForChildren" = true WHERE "id" = '502c3178-bbf3-4947-a272-dbd577235dcb' AND "goodForChildren" IS NULL;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '502c3178-bbf3-4947-a272-dbd577235dcb', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:30', NULL, 'Sunday School', 'English'),
  (0, '10:30', NULL, 'Service', 'English'),
  (0, '18:00', NULL, 'Service', 'English'),
  (3, '19:00', NULL, 'Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '502c3178-bbf3-4947-a272-dbd577235dcb');

-- Praise Cathedral Church Of God In Christ
DELETE FROM "church_services" WHERE "churchId" = '99e3941b-f935-49c1-8f4a-26705ffdfa18' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '99e3941b-f935-49c1-8f4a-26705ffdfa18', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '11:00', NULL, 'Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '99e3941b-f935-49c1-8f4a-26705ffdfa18');

-- Praise Cathedral Cogic
DELETE FROM "church_services" WHERE "churchId" = '6d45cb7a-8a60-424e-b262-2939e2c8b5b6' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '6d45cb7a-8a60-424e-b262-2939e2c8b5b6', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '11:00', NULL, 'Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '6d45cb7a-8a60-424e-b262-2939e2c8b5b6');

-- Prince of Peace Catholic Church
UPDATE "churches" SET "pastorName" = 'Jomon Joseph' WHERE "id" = '50eb7216-132f-4d73-a633-173829e279f9' AND "pastorName" IS NULL;
UPDATE "churches" SET "email" = 'communications@princeofpeacecatholic.org' WHERE "id" = '50eb7216-132f-4d73-a633-173829e279f9' AND "email" IS NULL;
UPDATE "churches" SET "description" = 'Prince of Peace Catholic Church is a Catholic parish in San Antonio, Texas, within the Archdiocese of San Antonio. Its mission is to be a community united in faith, bringing God''s love to the world through the liturgy and sacraments, ministry participation, prayer, and parish family life.' WHERE "id" = '50eb7216-132f-4d73-a633-173829e279f9' AND "description" IS NULL;
UPDATE "churches" SET "goodForChildren" = true WHERE "id" = '50eb7216-132f-4d73-a633-173829e279f9' AND "goodForChildren" IS NULL;
UPDATE "churches" SET "languages" = ARRAY['English', 'Spanish']::text[] WHERE "id" = '50eb7216-132f-4d73-a633-173829e279f9' AND "languages" = ARRAY['English']::text[];
DELETE FROM "church_services" WHERE "churchId" = '50eb7216-132f-4d73-a633-173829e279f9' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '50eb7216-132f-4d73-a633-173829e279f9', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '08:30', NULL, 'Mass', 'English'),
  (0, '10:30', NULL, 'Mass', 'English'),
  (0, '12:30', NULL, 'Mass', 'English'),
  (0, '14:30', NULL, 'Mass', 'Spanish'),
  (0, '19:00', NULL, 'Mass', 'English'),
  (1, '08:15', NULL, 'Mass', 'English'),
  (1, '12:00', NULL, 'Mass', 'English'),
  (2, '08:15', NULL, 'Mass', 'English'),
  (2, '12:00', NULL, 'Mass', 'English'),
  (3, '08:15', NULL, 'Mass', 'English'),
  (3, '12:00', NULL, 'Mass', 'English'),
  (4, '08:15', NULL, 'Mass', 'English'),
  (4, '12:00', NULL, 'Mass', 'English'),
  (5, '08:15', NULL, 'Mass', 'English'),
  (5, '12:00', NULL, 'Mass', 'English'),
  (6, '17:00', NULL, 'Mass', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '50eb7216-132f-4d73-a633-173829e279f9');

-- RCCG Restoration Chapel San Antonio
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'b7b76073-d237-47b1-945b-f7de19cf9c71', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (1, '06:00', '06:30', 'Morning Dew Prayer Line', 'English'),
  (2, '19:00', '20:30', 'Bible Study', 'English'),
  (4, '19:00', '20:30', 'Prayer Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'b7b76073-d237-47b1-945b-f7de19cf9c71');

-- RCCG, Salvation Center San Antonio
UPDATE "churches" SET "pastorName" = 'Adekoye Sanni' WHERE "id" = '955fa170-bfe2-4ae4-b70a-bdaa1e4dd6d6' AND "pastorName" IS NULL;
UPDATE "churches" SET "yearEstablished" = 2003 WHERE "id" = '955fa170-bfe2-4ae4-b70a-bdaa1e4dd6d6' AND "yearEstablished" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = '955fa170-bfe2-4ae4-b70a-bdaa1e4dd6d6' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '955fa170-bfe2-4ae4-b70a-bdaa1e4dd6d6', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '10:30', NULL, 'Fresh Anointing Service', 'English'),
  (2, '19:00', NULL, 'Bible Study', 'English'),
  (5, '19:00', NULL, 'Victory Hour', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '955fa170-bfe2-4ae4-b70a-bdaa1e4dd6d6');

-- RISE Church
DELETE FROM "church_services" WHERE "churchId" = 'eaf6a6c2-5906-4685-8707-315af1860b58' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'eaf6a6c2-5906-4685-8707-315af1860b58', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '08:00', NULL, 'Service', 'English'),
  (0, '09:30', NULL, 'Service', 'English'),
  (0, '11:15', NULL, 'Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'eaf6a6c2-5906-4685-8707-315af1860b58');

-- Randolph Church of Christ
UPDATE "churches" SET "email" = 'admin@randolphcofc.org' WHERE "id" = 'd98daba3-92b0-4697-9994-7ed44c7f662a' AND "email" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = 'd98daba3-92b0-4697-9994-7ed44c7f662a' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'd98daba3-92b0-4697-9994-7ed44c7f662a', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '10:00', NULL, 'Morning Assembly', 'English'),
  (0, '17:00', NULL, 'Bible Class', 'English'),
  (3, '10:30', NULL, 'Ladies Bible Class', 'English'),
  (3, '19:00', NULL, 'Evening Fellowship', 'English'),
  (4, '18:30', NULL, 'Evening Fellowship', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'd98daba3-92b0-4697-9994-7ed44c7f662a');

-- Recovery Church San Antonio
UPDATE "churches" SET "goodForGroups" = true WHERE "id" = '00823fac-afef-41b4-9fd6-878a8aa30d50' AND "goodForGroups" IS NULL;

-- Redeemer Lutheran Church
UPDATE "churches" SET "description" = 'Redeemer Evangelical Lutheran Church is a congregation of The Lutheran Church—Missouri Synod in San Antonio, Texas. The church is committed to pure teaching and confession of the faith and to reaching out with the Gospel.' WHERE "id" = 'cb7a7080-00e0-44d6-964f-56dbb8f12cc3' AND "description" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = 'cb7a7080-00e0-44d6-964f-56dbb8f12cc3' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'cb7a7080-00e0-44d6-964f-56dbb8f12cc3', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:00', '10:00', 'Bible Class', 'English'),
  (0, '10:15', '11:30', 'Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'cb7a7080-00e0-44d6-964f-56dbb8f12cc3');

-- Redeemer Presbyterian Church
DELETE FROM "church_services" WHERE "churchId" = '2c45d988-18ca-4db0-8c28-e17ff28d6e74' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '2c45d988-18ca-4db0-8c28-e17ff28d6e74', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:15', NULL, 'First Service', 'English'),
  (0, '11:00', NULL, 'Second Service', 'English'),
  (0, '11:00', NULL, 'Servicio de Adoración en Español', 'Spanish')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '2c45d988-18ca-4db0-8c28-e17ff28d6e74');

-- Redeeming Grace Christian Church
DELETE FROM "church_services" WHERE "churchId" = 'a8885888-249e-4bd1-b5d5-515c2daf79c0' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'a8885888-249e-4bd1-b5d5-515c2daf79c0', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '08:30', NULL, 'Sunday School', 'English'),
  (0, '10:00', NULL, 'Worship Service', 'English'),
  (3, '19:00', NULL, 'Refresh Wednesday', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'a8885888-249e-4bd1-b5d5-515c2daf79c0');

-- Rescue Point Church
UPDATE "churches" SET "email" = 'info@rescuepoint.church' WHERE "id" = '5992ce71-4b4b-4dde-9772-4eb535ebe541' AND "email" IS NULL;
UPDATE "churches" SET "description" = 'Rescue Point Church is a non-denominational church in San Antonio, Texas, led by founding pastor James Rios. Its mission is to serve others to help people find hope in Christ, grow together in community, and discover joy by living out their purpose.' WHERE "id" = '5992ce71-4b4b-4dde-9772-4eb535ebe541' AND "description" IS NULL;
UPDATE "churches" SET "goodForChildren" = true WHERE "id" = '5992ce71-4b4b-4dde-9772-4eb535ebe541' AND "goodForChildren" IS NULL;
UPDATE "churches" SET "goodForGroups" = true WHERE "id" = '5992ce71-4b4b-4dde-9772-4eb535ebe541' AND "goodForGroups" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = '5992ce71-4b4b-4dde-9772-4eb535ebe541' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '5992ce71-4b4b-4dde-9772-4eb535ebe541', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '10:00', NULL, 'Main Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '5992ce71-4b4b-4dde-9772-4eb535ebe541');

-- Rest Church
UPDATE "churches" SET "pastorName" = 'Zack Cherian' WHERE "id" = 'a360f01d-23c0-47c7-9c4c-f0e8d15cdea7' AND "pastorName" IS NULL;
UPDATE "churches" SET "email" = 'misty@zcim.org' WHERE "id" = 'a360f01d-23c0-47c7-9c4c-f0e8d15cdea7' AND "email" IS NULL;
UPDATE "churches" SET "yearEstablished" = 1996 WHERE "id" = 'a360f01d-23c0-47c7-9c4c-f0e8d15cdea7' AND "yearEstablished" IS NULL;
UPDATE "churches" SET "description" = 'Rest Church is a San Antonio church led by Senior Pastor Zack Cherian. It offers ministries for children, youth, women, men and community outreach, along with weekly Life Groups for worship, prayer, and Bible study.' WHERE "id" = 'a360f01d-23c0-47c7-9c4c-f0e8d15cdea7' AND "description" IS NULL;
UPDATE "churches" SET "goodForChildren" = true WHERE "id" = 'a360f01d-23c0-47c7-9c4c-f0e8d15cdea7' AND "goodForChildren" IS NULL;
UPDATE "churches" SET "goodForGroups" = true WHERE "id" = 'a360f01d-23c0-47c7-9c4c-f0e8d15cdea7' AND "goodForGroups" IS NULL;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'a360f01d-23c0-47c7-9c4c-f0e8d15cdea7', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '11:30', NULL, 'Service', 'English'),
  (3, '19:00', NULL, 'Youth', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'a360f01d-23c0-47c7-9c4c-f0e8d15cdea7');

-- Restoration Church of San Antonio
UPDATE "churches" SET "pastorName" = 'Justin Brandt' WHERE "id" = 'b6b7b766-a3e3-443c-aa00-9e16d7bd586e' AND "pastorName" IS NULL;
UPDATE "churches" SET "goodForChildren" = true WHERE "id" = 'b6b7b766-a3e3-443c-aa00-9e16d7bd586e' AND "goodForChildren" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = 'b6b7b766-a3e3-443c-aa00-9e16d7bd586e' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'b6b7b766-a3e3-443c-aa00-9e16d7bd586e', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '08:30', NULL, 'Service', 'English'),
  (0, '11:00', NULL, 'Service', 'English'),
  (3, '19:00', NULL, 'Youth', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'b6b7b766-a3e3-443c-aa00-9e16d7bd586e');

-- Resurrection Baptist Church
UPDATE "churches" SET "yearEstablished" = 1990 WHERE "id" = 'b625edae-2735-4679-9cc1-bc0d2bdb97f6' AND "yearEstablished" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = 'b625edae-2735-4679-9cc1-bc0d2bdb97f6' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'b625edae-2735-4679-9cc1-bc0d2bdb97f6', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:00', NULL, 'Service', 'English'),
  (0, '11:00', NULL, 'Service', 'English'),
  (0, '12:00', NULL, 'Service', 'Spanish')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'b625edae-2735-4679-9cc1-bc0d2bdb97f6');

-- Resurrection of the Lord
DELETE FROM "church_services" WHERE "churchId" = '7715e74e-fd50-4cae-9155-bfc860db36f0' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '7715e74e-fd50-4cae-9155-bfc860db36f0', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '08:00', NULL, 'Mass', 'English'),
  (0, '10:00', NULL, 'Mass', 'Spanish'),
  (0, '12:00', NULL, 'Mass', 'English'),
  (0, '17:00', NULL, 'Mass', 'Spanish'),
  (1, '18:00', NULL, 'Communion Service', 'English'),
  (2, '18:00', NULL, 'Mass', 'English'),
  (3, '08:00', NULL, 'Mass', 'English'),
  (4, '08:00', NULL, 'Mass', 'English'),
  (5, '08:00', NULL, 'Mass', 'English'),
  (6, '08:00', NULL, 'Mass', 'Bilingual'),
  (6, '17:00', NULL, 'Vigil Mass', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '7715e74e-fd50-4cae-9155-bfc860db36f0');

-- Revelation Church San Antonio
UPDATE "churches" SET "pastorName" = 'Robert Dennard' WHERE "id" = 'e4a21bfa-bc67-4eba-8c48-87cd33b38db8' AND "pastorName" IS NULL;
UPDATE "churches" SET "denomination" = 'Assemblies of God', "denominationFamily" = 'Pentecostal' WHERE "id" = 'e4a21bfa-bc67-4eba-8c48-87cd33b38db8' AND "denomination" IS NULL AND "denominationFamily" IS NULL;

-- Revival Word of Life Church
UPDATE "churches" SET "description" = 'Revival Word of Life Church in San Antonio, Texas, is a congregation of Christians of the evangelical faith. It is a missionary church that seeks to take the gospel to different parts of the world and offers children''s programs, home groups, youth meetings, and women''s and men''s ministries.' WHERE "id" = '4181d7c1-ddb3-49dd-a852-9abc6364d19e' AND "description" IS NULL;
UPDATE "churches" SET "goodForGroups" = true WHERE "id" = '4181d7c1-ddb3-49dd-a852-9abc6364d19e' AND "goodForGroups" IS NULL;
UPDATE "churches" SET "languages" = ARRAY['English', 'Russian']::text[] WHERE "id" = '4181d7c1-ddb3-49dd-a852-9abc6364d19e' AND "languages" = ARRAY['English']::text[];
DELETE FROM "church_services" WHERE "churchId" = '4181d7c1-ddb3-49dd-a852-9abc6364d19e' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '4181d7c1-ddb3-49dd-a852-9abc6364d19e', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '13:30', NULL, 'Service', 'English'),
  (2, '20:00', NULL, 'Youth', 'English'),
  (3, '19:00', NULL, 'Service', 'English'),
  (5, '19:30', NULL, 'Bible Study', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '4181d7c1-ddb3-49dd-a852-9abc6364d19e');

-- Revive Church
UPDATE "churches" SET "goodForChildren" = true WHERE "id" = '36ccd8e1-03a7-4deb-9842-cc441f80d02b' AND "goodForChildren" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = '36ccd8e1-03a7-4deb-9842-cc441f80d02b' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '36ccd8e1-03a7-4deb-9842-cc441f80d02b', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '16:00', NULL, 'Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '36ccd8e1-03a7-4deb-9842-cc441f80d02b');

-- Revive Ministries San Antonio Church
UPDATE "churches" SET "email" = 'revivemediasa@gmail.com' WHERE "id" = '14cb6be8-76ca-4f9f-b714-0b8f73503c93' AND "email" IS NULL;
UPDATE "churches" SET "description" = 'Revive San Antonio is a church for people without a church or those looking for a fresh start. It focuses on helping people grow spiritually, personally and emotionally, and on loving God by loving people.' WHERE "id" = '14cb6be8-76ca-4f9f-b714-0b8f73503c93' AND "description" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = '14cb6be8-76ca-4f9f-b714-0b8f73503c93' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '14cb6be8-76ca-4f9f-b714-0b8f73503c93', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '11:00', NULL, 'Service', 'Spanish'),
  (4, '19:30', NULL, 'Service', 'Spanish')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '14cb6be8-76ca-4f9f-b714-0b8f73503c93');

-- Revolution Church
UPDATE "churches" SET "pastorName" = 'Zak White' WHERE "id" = '2466bf1e-cd4e-4f25-8f9f-1436a7d19e2b' AND "pastorName" IS NULL;
UPDATE "churches" SET "yearEstablished" = 2010 WHERE "id" = '2466bf1e-cd4e-4f25-8f9f-1436a7d19e2b' AND "yearEstablished" IS NULL;
UPDATE "churches" SET "goodForChildren" = true WHERE "id" = '2466bf1e-cd4e-4f25-8f9f-1436a7d19e2b' AND "goodForChildren" IS NULL;
UPDATE "churches" SET "goodForGroups" = true WHERE "id" = '2466bf1e-cd4e-4f25-8f9f-1436a7d19e2b' AND "goodForGroups" IS NULL;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '2466bf1e-cd4e-4f25-8f9f-1436a7d19e2b', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '08:30', NULL, 'Service', 'English'),
  (0, '10:00', NULL, 'Service', 'English'),
  (0, '11:30', NULL, 'Service', 'English'),
  (6, '17:00', NULL, 'Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '2466bf1e-cd4e-4f25-8f9f-1436a7d19e2b');

-- River City Community Church
UPDATE "churches" SET "goodForChildren" = true WHERE "id" = '410fe632-12d8-4f01-851c-8afb6518047a' AND "goodForChildren" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = '410fe632-12d8-4f01-851c-8afb6518047a' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '410fe632-12d8-4f01-851c-8afb6518047a', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:00', NULL, 'Service', 'English'),
  (0, '11:00', NULL, 'Service', 'English'),
  (0, '14:00', NULL, 'Service', 'Spanish')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '410fe632-12d8-4f01-851c-8afb6518047a');

-- River of Life Church
UPDATE "churches" SET "denomination" = 'Foursquare', "denominationFamily" = 'Pentecostal' WHERE "id" = '09236812-32fb-46e6-ba92-84c706f31216' AND "denomination" IS NULL AND "denominationFamily" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = '09236812-32fb-46e6-ba92-84c706f31216' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '09236812-32fb-46e6-ba92-84c706f31216', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '10:30', NULL, 'Worship', 'English'),
  (3, '19:00', NULL, 'Discipleship Class', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '09236812-32fb-46e6-ba92-84c706f31216');

-- Rock of Revelation Church
DELETE FROM "church_services" WHERE "churchId" = 'a902b1ad-b52e-4eef-b937-32b61d2209f2' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'a902b1ad-b52e-4eef-b937-32b61d2209f2', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '10:00', NULL, 'Service', 'English'),
  (1, '19:00', NULL, 'Prayer', 'English'),
  (3, '19:00', NULL, 'Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'a902b1ad-b52e-4eef-b937-32b61d2209f2');

-- Rolling Oaks Baptist Church
UPDATE "churches" SET "pastorName" = 'John O. Boubel' WHERE "id" = '659750df-ec44-4bf6-9de9-0da2892649d6' AND "pastorName" IS NULL;
UPDATE "churches" SET "yearEstablished" = 1988 WHERE "id" = '659750df-ec44-4bf6-9de9-0da2892649d6' AND "yearEstablished" IS NULL;
UPDATE "churches" SET "goodForChildren" = true WHERE "id" = '659750df-ec44-4bf6-9de9-0da2892649d6' AND "goodForChildren" IS NULL;

-- SA Life Church
UPDATE "churches" SET "pastorName" = 'Mario Escobedo' WHERE "id" = '704808ae-ef9c-4446-b64b-f2a2ffe8f8de' AND "pastorName" IS NULL;
UPDATE "churches" SET "yearEstablished" = 1960 WHERE "id" = '704808ae-ef9c-4446-b64b-f2a2ffe8f8de' AND "yearEstablished" IS NULL;

-- SA Life Church
UPDATE "churches" SET "pastorName" = 'Mario Escobedo' WHERE "id" = 'b8e81a44-b2e5-4425-b0e4-5ba75779984d' AND "pastorName" IS NULL;
UPDATE "churches" SET "yearEstablished" = 1960 WHERE "id" = 'b8e81a44-b2e5-4425-b0e4-5ba75779984d' AND "yearEstablished" IS NULL;

-- SOWERS Church of Christ
UPDATE "churches" SET "pastorName" = 'Neil Crisostomo' WHERE "id" = 'bf29edff-a36f-48fd-97ac-bb2247cabac7' AND "pastorName" IS NULL;
UPDATE "churches" SET "goodForGroups" = true WHERE "id" = 'bf29edff-a36f-48fd-97ac-bb2247cabac7' AND "goodForGroups" IS NULL;

-- Sacred Heart Chapel
UPDATE "churches" SET "email" = 'JDetzel@CDPTexas.org' WHERE "id" = '9dec9452-b0ee-416a-a44e-f2dc4aafa635' AND "email" IS NULL;
UPDATE "churches" SET "description" = 'The Sisters of Divine Providence are a community of women within the Catholic Church who dedicate their lives to furthering the mission of Jesus in the world. Sacred Heart Conventual Chapel is their English Gothic chapel in San Antonio, where the Sisters and the Our Lady of the Lake University community gather for liturgy.' WHERE "id" = '9dec9452-b0ee-416a-a44e-f2dc4aafa635' AND "description" IS NULL;

-- Saint Andrew Presbyterian Church
UPDATE "churches" SET "email" = 'office@saintandrewsatx.com' WHERE "id" = 'f69eab36-0078-4d7c-98ae-272d382dc78d' AND "email" IS NULL;
UPDATE "churches" SET "description" = 'Saint Andrew Presbyterian Church is a congregation in San Antonio, Texas, that studies the Word, serves those in need, and builds community through love, kindness, fellowship, and fun. It worships in person and online.' WHERE "id" = 'f69eab36-0078-4d7c-98ae-272d382dc78d' AND "description" IS NULL;
UPDATE "churches" SET "goodForChildren" = true WHERE "id" = 'f69eab36-0078-4d7c-98ae-272d382dc78d' AND "goodForChildren" IS NULL;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'f69eab36-0078-4d7c-98ae-272d382dc78d', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:30', NULL, 'Sunday School', 'English'),
  (0, '11:00', NULL, 'Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'f69eab36-0078-4d7c-98ae-272d382dc78d');

-- Saint Anthony the Great Orthodox Church
UPDATE "churches" SET "pastorName" = 'David Wooten' WHERE "id" = '640eef54-3941-465c-99a7-85d33015baa7' AND "pastorName" IS NULL;
UPDATE "churches" SET "email" = 'orthodoxsanantonio@gmail.com' WHERE "id" = '640eef54-3941-465c-99a7-85d33015baa7' AND "email" IS NULL;
UPDATE "churches" SET "yearEstablished" = 1979 WHERE "id" = '640eef54-3941-465c-99a7-85d33015baa7' AND "yearEstablished" IS NULL;
UPDATE "churches" SET "wheelchairAccessible" = true WHERE "id" = '640eef54-3941-465c-99a7-85d33015baa7' AND "wheelchairAccessible" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = '640eef54-3941-465c-99a7-85d33015baa7' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '640eef54-3941-465c-99a7-85d33015baa7', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:30', NULL, '3rd & 6th Hours', 'English'),
  (0, '10:00', NULL, 'Divine Liturgy', 'English'),
  (0, '11:15', NULL, 'Church School', 'English'),
  (3, '19:00', NULL, 'Daily Vespers', 'English'),
  (6, '18:00', NULL, 'Great Vespers', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '640eef54-3941-465c-99a7-85d33015baa7');

-- Saint Frances Cabrini Church
DELETE FROM "church_services" WHERE "churchId" = '55af3008-e1bc-4543-bc24-1d87d015083c' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '55af3008-e1bc-4543-bc24-1d87d015083c', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '08:00', NULL, 'Mass', 'Spanish'),
  (0, '12:00', NULL, 'Mass', 'English'),
  (2, '09:00', NULL, 'Mass', 'English'),
  (4, '18:00', '19:00', 'Holy Hour', 'English'),
  (4, '19:00', NULL, 'Mass', 'Bilingual')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '55af3008-e1bc-4543-bc24-1d87d015083c');

-- Saint John Cassian Romanian Orthodox
UPDATE "churches" SET "pastorName" = 'Valentin Ilieș' WHERE "id" = '0df86f88-e427-4164-9ef8-bee2a0b135e1' AND "pastorName" IS NULL;
UPDATE "churches" SET "email" = 'stjohncassian.sa@gmail.com' WHERE "id" = '0df86f88-e427-4164-9ef8-bee2a0b135e1' AND "email" IS NULL;
UPDATE "churches" SET "yearEstablished" = 2014 WHERE "id" = '0df86f88-e427-4164-9ef8-bee2a0b135e1' AND "yearEstablished" IS NULL;
UPDATE "churches" SET "description" = 'St. John Cassian is a Romanian Orthodox community of Romanian and American Orthodox Christians in San Antonio, Texas, under the Romanian Orthodox Metropolia of the Americas. Founded as a mission in 2014, it became a parish in 2022 and its church was consecrated in 2024.' WHERE "id" = '0df86f88-e427-4164-9ef8-bee2a0b135e1' AND "description" IS NULL;
UPDATE "churches" SET "goodForChildren" = true WHERE "id" = '0df86f88-e427-4164-9ef8-bee2a0b135e1' AND "goodForChildren" IS NULL;
UPDATE "churches" SET "languages" = ARRAY['English', 'Romanian']::text[] WHERE "id" = '0df86f88-e427-4164-9ef8-bee2a0b135e1' AND "languages" = ARRAY['English']::text[];
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '0df86f88-e427-4164-9ef8-bee2a0b135e1', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:30', NULL, 'Matins', 'English'),
  (0, '10:30', NULL, 'Divine Liturgy', 'Bilingual'),
  (6, '18:00', NULL, 'Vespers', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '0df86f88-e427-4164-9ef8-bee2a0b135e1');

-- Saint Paul's Episcopal Church
UPDATE "churches" SET "goodForGroups" = true WHERE "id" = '114fd41a-01a9-4f4d-ab78-8d91b78dc0fa' AND "goodForGroups" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = '114fd41a-01a9-4f4d-ab78-8d91b78dc0fa' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '114fd41a-01a9-4f4d-ab78-8d91b78dc0fa', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '08:00', NULL, 'Rite I Mass', 'English'),
  (0, '10:30', NULL, 'Choral Mass', 'English'),
  (3, '12:00', NULL, 'Healing Mass', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '114fd41a-01a9-4f4d-ab78-8d91b78dc0fa');

-- Saint Stephen's Chapel
UPDATE "churches" SET "denomination" = 'Christian Reformed Church', "denominationFamily" = 'Presbyterian/Reformed' WHERE "id" = 'c52957fc-23cb-4765-989d-4f4cbe082340' AND "denomination" IS NULL AND "denominationFamily" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = 'c52957fc-23cb-4765-989d-4f4cbe082340' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'c52957fc-23cb-4765-989d-4f4cbe082340', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '10:30', NULL, 'Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'c52957fc-23cb-4765-989d-4f4cbe082340');

-- Salem Sayers Baptist Church
DELETE FROM "church_services" WHERE "churchId" = '6882d96d-b631-48b2-858c-a2c2456c8f8b' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '6882d96d-b631-48b2-858c-a2c2456c8f8b', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:15', NULL, 'Sunday School', 'English'),
  (0, '10:30', NULL, 'Worship Service', 'English'),
  (3, '18:00', '19:30', 'Bible Study', 'English'),
  (3, '18:00', '19:30', 'Youth', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '6882d96d-b631-48b2-858c-a2c2456c8f8b');

-- San Antonio Bilingual Church: In His Word Church, Inc.
DELETE FROM "church_services" WHERE "churchId" = '5aaf87f9-aad6-4e6e-a5d4-cdf553010701' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '5aaf87f9-aad6-4e6e-a5d4-cdf553010701', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '10:30', NULL, 'Service', 'English'),
  (3, '19:00', NULL, 'Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '5aaf87f9-aad6-4e6e-a5d4-cdf553010701');

-- San Antonio Chinese Church
UPDATE "churches" SET "goodForGroups" = true WHERE "id" = '676ccfdf-f585-4b38-b255-4cf528fe4825' AND "goodForGroups" IS NULL;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '676ccfdf-f585-4b38-b255-4cf528fe4825', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:30', NULL, 'Sunday Worship', 'English'),
  (0, '11:00', NULL, 'Sunday School', 'English'),
  (5, '18:30', NULL, 'Bible Study', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '676ccfdf-f585-4b38-b255-4cf528fe4825');

-- San Antonio Christian Church
UPDATE "churches" SET "pastorName" = 'Fabian Ybarra' WHERE "id" = '3450abbb-d65b-4ad7-ad2f-dff0f7f3626d' AND "pastorName" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = '3450abbb-d65b-4ad7-ad2f-dff0f7f3626d' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '3450abbb-d65b-4ad7-ad2f-dff0f7f3626d', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '10:00', NULL, 'Prayer and Bible Study', 'English'),
  (0, '11:30', NULL, 'Service', 'English'),
  (3, '19:00', NULL, 'Bible Study & Fellowship', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '3450abbb-d65b-4ad7-ad2f-dff0f7f3626d');

-- San Antonio First Church (SAF Church)
UPDATE "churches" SET "email" = 'info@saf.church' WHERE "id" = 'dd46b505-7d3f-40e1-90a4-9337c2781bd7' AND "email" IS NULL;
UPDATE "churches" SET "description" = 'San Antonio First Church is a Church of the Nazarene whose mission is to make Christ-like disciples in San Antonio through investing in body, mind, and spirit. It offers Sunday worship, Bible study classes, children''s and youth programs, and community outreach through West Avenue Compassion.' WHERE "id" = 'dd46b505-7d3f-40e1-90a4-9337c2781bd7' AND "description" IS NULL;
UPDATE "churches" SET "goodForChildren" = true WHERE "id" = 'dd46b505-7d3f-40e1-90a4-9337c2781bd7' AND "goodForChildren" IS NULL;
UPDATE "churches" SET "goodForGroups" = true WHERE "id" = 'dd46b505-7d3f-40e1-90a4-9337c2781bd7' AND "goodForGroups" IS NULL;
UPDATE "churches" SET "denomination" = 'Church of the Nazarene', "denominationFamily" = 'Holiness' WHERE "id" = 'dd46b505-7d3f-40e1-90a4-9337c2781bd7' AND "denomination" IS NULL AND "denominationFamily" IS NULL;
UPDATE "churches" SET "languages" = ARRAY['English', 'Spanish']::text[] WHERE "id" = 'dd46b505-7d3f-40e1-90a4-9337c2781bd7' AND "languages" = ARRAY['English']::text[];
DELETE FROM "church_services" WHERE "churchId" = 'dd46b505-7d3f-40e1-90a4-9337c2781bd7' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'dd46b505-7d3f-40e1-90a4-9337c2781bd7', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:30', NULL, 'Bible Study', 'English'),
  (0, '11:00', NULL, 'Service', 'English'),
  (0, '13:00', NULL, 'Service', 'Spanish')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'dd46b505-7d3f-40e1-90a4-9337c2781bd7');

-- San Antonio Friends Meeting (Quaker)
DELETE FROM "church_services" WHERE "churchId" = '0440952b-16ed-44f4-8212-bd814a20d694' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '0440952b-16ed-44f4-8212-bd814a20d694', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '11:30', NULL, 'Forum', 'English'),
  (5, '08:00', '08:30', 'Meeting for Worship', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '0440952b-16ed-44f4-8212-bd814a20d694');

-- San Antonio Han-Ma-Eum Korean Church
UPDATE "churches" SET "pastorName" = 'Joseph Kim' WHERE "id" = 'c067e5d3-ea9f-466b-b262-d324fa16398b' AND "pastorName" IS NULL;
UPDATE "churches" SET "email" = 'hm*****@***il.com' WHERE "id" = 'c067e5d3-ea9f-466b-b262-d324fa16398b' AND "email" IS NULL;

-- San Antonio Highland Hills Seventh-day Adventist Church
UPDATE "churches" SET "wheelchairAccessible" = true WHERE "id" = 'd7e454c1-b78e-498c-a415-11cd2625a52b' AND "wheelchairAccessible" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = 'd7e454c1-b78e-498c-a415-11cd2625a52b' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'd7e454c1-b78e-498c-a415-11cd2625a52b', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (6, '09:30', NULL, 'Sabbath School', 'English'),
  (6, '11:00', NULL, 'Worship Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'd7e454c1-b78e-498c-a415-11cd2625a52b');

-- San Antonio Scenic Hills Seventh-day Adventist Church
UPDATE "churches" SET "pastorName" = 'Vitali Prolinski' WHERE "id" = 'f07fe433-3b34-4946-8787-9bc02ba67535' AND "pastorName" IS NULL;
UPDATE "churches" SET "languages" = ARRAY['English', 'Spanish']::text[] WHERE "id" = 'f07fe433-3b34-4946-8787-9bc02ba67535' AND "languages" = ARRAY['English']::text[];
DELETE FROM "church_services" WHERE "churchId" = 'f07fe433-3b34-4946-8787-9bc02ba67535' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'f07fe433-3b34-4946-8787-9bc02ba67535', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (3, '19:00', NULL, 'Prayer and Bible Study', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'f07fe433-3b34-4946-8787-9bc02ba67535');

-- San Antonio Spanish Durango SDA Church
DELETE FROM "church_services" WHERE "churchId" = '22e00aae-adee-401e-8ca8-82f5ac9c5932' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '22e00aae-adee-401e-8ca8-82f5ac9c5932', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (3, '19:30', NULL, 'Service', 'Spanish'),
  (6, '09:15', NULL, 'Escuela Sabatica', 'Spanish'),
  (6, '11:00', NULL, 'Culto Divino', 'Spanish'),
  (6, '18:30', NULL, 'Sociedad de Jovenes', 'Spanish')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '22e00aae-adee-401e-8ca8-82f5ac9c5932');

-- San Antonio Valley View Seventh-day Adventist Church
UPDATE "churches" SET "pastorName" = 'Kasper Haughton' WHERE "id" = '3582a644-ad0c-4a0c-9272-095cb696728d' AND "pastorName" IS NULL;
UPDATE "churches" SET "goodForChildren" = true WHERE "id" = '3582a644-ad0c-4a0c-9272-095cb696728d' AND "goodForChildren" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = '3582a644-ad0c-4a0c-9272-095cb696728d' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '3582a644-ad0c-4a0c-9272-095cb696728d', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (2, '13:00', NULL, 'Bible Study', 'English'),
  (4, '13:00', NULL, 'Bible Study', 'English'),
  (6, '10:00', NULL, 'Sabbath School', 'English'),
  (6, '11:00', NULL, 'Worship Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '3582a644-ad0c-4a0c-9272-095cb696728d');

-- San Pedro Church
DELETE FROM "church_services" WHERE "churchId" = '441d8757-be73-4c44-a7c7-2218da9a1aae' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '441d8757-be73-4c44-a7c7-2218da9a1aae', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '10:00', NULL, 'Education Hour', 'English'),
  (0, '11:00', NULL, 'Contemporary with Communion', 'English'),
  (0, '11:00', NULL, 'Traditional', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '441d8757-be73-4c44-a7c7-2218da9a1aae');

-- San Pedro Church of Christ
UPDATE "churches" SET "pastorName" = 'Charles Johanson' WHERE "id" = '5a0886c5-9506-4060-8ccb-234259ce94ac' AND "pastorName" IS NULL;

-- Saved By Grace Church
UPDATE "churches" SET "pastorName" = 'Joe Martinez' WHERE "id" = '3c0b505d-7d00-42c2-a1ad-42959f75af88' AND "pastorName" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = '3c0b505d-7d00-42c2-a1ad-42959f75af88' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '3c0b505d-7d00-42c2-a1ad-42959f75af88', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:30', NULL, 'Service', 'Spanish'),
  (0, '11:00', NULL, 'Service', 'English'),
  (3, '18:30', NULL, 'Women''s Bible Study', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '3c0b505d-7d00-42c2-a1ad-42959f75af88');

-- Second Baptist Church
DELETE FROM "church_services" WHERE "churchId" = '86dd641e-85e3-4219-b84c-f6f3a251cb50' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '86dd641e-85e3-4219-b84c-f6f3a251cb50', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:40', NULL, 'Sunday School', 'English'),
  (0, '11:00', NULL, 'Worship Service', 'English'),
  (3, '18:30', '19:30', 'Prayer and Bible Study', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '86dd641e-85e3-4219-b84c-f6f3a251cb50');

-- Shavano Baptist Church
UPDATE "churches" SET "pastorName" = 'Bill Swanson' WHERE "id" = '848d1830-5930-4062-ac81-79a59e0afdd1' AND "pastorName" IS NULL;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '848d1830-5930-4062-ac81-79a59e0afdd1', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:30', NULL, 'Bible Study', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '848d1830-5930-4062-ac81-79a59e0afdd1');

-- Shearer Hills Baptist Church
DELETE FROM "church_services" WHERE "churchId" = '13768b67-3ff3-45f9-9326-80f051a6c7ea' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '13768b67-3ff3-45f9-9326-80f051a6c7ea', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '08:30', NULL, 'Traditional', 'English'),
  (0, '09:45', NULL, 'Bible Study', 'English'),
  (0, '11:00', NULL, 'Contemporary', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '13768b67-3ff3-45f9-9326-80f051a6c7ea');

-- Shepherd King Lutheran Church
DELETE FROM "church_services" WHERE "churchId" = '5c095e1e-7608-4bb3-a6ca-3c072a847a5f' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '5c095e1e-7608-4bb3-a6ca-3c072a847a5f', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (2, '09:00', NULL, 'Quilters', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '5c095e1e-7608-4bb3-a6ca-3c072a847a5f');

-- Shepherd of the Hills Lutheran Church, School, & Child Care
UPDATE "churches" SET "pastorName" = 'Chris Kennedy' WHERE "id" = '7d026556-13c0-4c6b-a1b7-f8fe85cfc89f' AND "pastorName" IS NULL;
UPDATE "churches" SET "yearEstablished" = 2008 WHERE "id" = '7d026556-13c0-4c6b-a1b7-f8fe85cfc89f' AND "yearEstablished" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = '7d026556-13c0-4c6b-a1b7-f8fe85cfc89f' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '7d026556-13c0-4c6b-a1b7-f8fe85cfc89f', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:00', NULL, 'Traditional', 'English'),
  (0, '10:00', NULL, 'Discipleship Hour', 'English'),
  (0, '11:00', NULL, 'Contemporary', 'English'),
  (6, '18:00', NULL, 'Contemporary', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '7d026556-13c0-4c6b-a1b7-f8fe85cfc89f');

-- Skybridge Community Church
DELETE FROM "church_services" WHERE "churchId" = 'dc675530-5404-4ff1-9572-e24a9a94ebd4' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'dc675530-5404-4ff1-9572-e24a9a94ebd4', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:30', NULL, 'Sunday Morning Worship', 'English'),
  (1, '18:00', NULL, 'Women''s Ministry', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'dc675530-5404-4ff1-9572-e24a9a94ebd4');

-- Somerset Baptist Church
UPDATE "churches" SET "pastorName" = 'Nick Marnejon' WHERE "id" = '97f9b93f-a2e8-45a1-a1a0-4da0ccfeb422' AND "pastorName" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = '97f9b93f-a2e8-45a1-a1a0-4da0ccfeb422' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '97f9b93f-a2e8-45a1-a1a0-4da0ccfeb422', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:45', NULL, 'Sunday School', 'English'),
  (0, '11:00', NULL, 'Morning Worship', 'English'),
  (3, '18:30', NULL, 'Adult Prayer Time', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '97f9b93f-a2e8-45a1-a1a0-4da0ccfeb422');

-- South San Antonio Baptist Church
DELETE FROM "church_services" WHERE "churchId" = '05f4a294-4de2-436a-a1e4-b40edc4136ed' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '05f4a294-4de2-436a-a1e4-b40edc4136ed', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '11:00', NULL, 'Worship Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '05f4a294-4de2-436a-a1e4-b40edc4136ed');

-- Southeast Baptist Church
UPDATE "churches" SET "email" = 'southeastbaptist@yahoo.com' WHERE "id" = '84fa48b7-2451-4eb1-968a-28db04ee7f25' AND "email" IS NULL;
UPDATE "churches" SET "yearEstablished" = 1961 WHERE "id" = '84fa48b7-2451-4eb1-968a-28db04ee7f25' AND "yearEstablished" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = '84fa48b7-2451-4eb1-968a-28db04ee7f25' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '84fa48b7-2451-4eb1-968a-28db04ee7f25', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:45', NULL, 'Spanish Class', 'Spanish'),
  (0, '09:45', NULL, 'Sunday School', 'English'),
  (0, '09:45', NULL, 'Youth Adult Class', 'English'),
  (0, '11:00', NULL, 'Sunday Morning Service', 'English'),
  (3, '18:30', NULL, 'Children Service', 'English'),
  (3, '18:30', NULL, 'Wednesday Night Service', 'English'),
  (3, '18:30', NULL, 'Young Adult', 'English'),
  (3, '18:30', NULL, 'Youth Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '84fa48b7-2451-4eb1-968a-28db04ee7f25');

-- Southeast Church of Christ
DELETE FROM "church_services" WHERE "churchId" = 'c4d62a46-4411-41d8-b15c-0aa91908bca3' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'c4d62a46-4411-41d8-b15c-0aa91908bca3', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:00', '09:45', 'Bible Study', 'English'),
  (0, '10:00', '11:00', 'Morning Worship', 'English'),
  (0, '18:00', '19:00', 'Evening Worship', 'English'),
  (3, '10:00', '11:00', 'Ladies Bible Study', 'English'),
  (3, '19:00', '20:00', 'Bible Study', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'c4d62a46-4411-41d8-b15c-0aa91908bca3');

-- Southside Church of God
UPDATE "churches" SET "pastorName" = 'Brady Hacker' WHERE "id" = '165c6e33-5f48-4ade-bb31-8edb3d5d5244' AND "pastorName" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = '165c6e33-5f48-4ade-bb31-8edb3d5d5244' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '165c6e33-5f48-4ade-bb31-8edb3d5d5244', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '08:45', NULL, 'Bible Study', 'English'),
  (0, '10:30', NULL, 'Morning Worship', 'English'),
  (3, '19:15', NULL, 'Midweek Gathering', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '165c6e33-5f48-4ade-bb31-8edb3d5d5244');

-- Southwest Baptist Church
UPDATE "churches" SET "goodForChildren" = true WHERE "id" = 'dba4dd3c-9eec-4e7a-9391-4fdeb944a691' AND "goodForChildren" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = 'dba4dd3c-9eec-4e7a-9391-4fdeb944a691' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'dba4dd3c-9eec-4e7a-9391-4fdeb944a691', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '08:30', '09:30', 'Service', 'English'),
  (0, '09:45', '10:45', 'Spanish Service', 'Spanish'),
  (0, '11:00', '12:00', 'Service', 'English'),
  (3, '19:00', '20:00', 'Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'dba4dd3c-9eec-4e7a-9391-4fdeb944a691');

-- Southwest Church of Christ
UPDATE "churches" SET "pastorName" = 'Adrian Siller' WHERE "id" = 'e93f1bec-5dfb-4666-89b9-33b2115a493b' AND "pastorName" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = 'e93f1bec-5dfb-4666-89b9-33b2115a493b' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'e93f1bec-5dfb-4666-89b9-33b2115a493b', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:45', NULL, 'Bible Study', 'English'),
  (0, '10:45', NULL, 'Sunday Morning Worship', 'English'),
  (3, '12:00', NULL, 'Bible Study', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'e93f1bec-5dfb-4666-89b9-33b2115a493b');

-- St Alphonsus Catholic Church
UPDATE "churches" SET "pastorName" = 'Andy Martinez' WHERE "id" = 'f272ecf4-535b-484d-8783-d6747868d624' AND "pastorName" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = 'f272ecf4-535b-484d-8783-d6747868d624' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'f272ecf4-535b-484d-8783-d6747868d624', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '08:30', NULL, 'Mass', 'Spanish'),
  (0, '11:30', NULL, 'Mass', 'English'),
  (2, '08:00', NULL, 'Daily Mass', 'English'),
  (4, '08:00', NULL, 'Daily Mass', 'English'),
  (6, '17:00', NULL, 'Mass', 'Bilingual')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'f272ecf4-535b-484d-8783-d6747868d624');

-- St Andrew's Episcopal Church
UPDATE "churches" SET "pastorName" = 'David Archibald' WHERE "id" = 'ad912107-addd-460c-bf52-17f76f9e9a7b' AND "pastorName" IS NULL;
UPDATE "churches" SET "email" = 'office@standrewsep.net' WHERE "id" = 'ad912107-addd-460c-bf52-17f76f9e9a7b' AND "email" IS NULL;
UPDATE "churches" SET "description" = 'St. Andrew''s Episcopal Church in San Antonio is an inclusive congregation in the Diocese of West Texas that welcomes people of all backgrounds, including those who believe, doubt, or question. It offers three Sunday worship styles and aims to train disciples of Jesus to transform society through love.' WHERE "id" = 'ad912107-addd-460c-bf52-17f76f9e9a7b' AND "description" IS NULL;
UPDATE "churches" SET "goodForChildren" = true WHERE "id" = 'ad912107-addd-460c-bf52-17f76f9e9a7b' AND "goodForChildren" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = 'ad912107-addd-460c-bf52-17f76f9e9a7b' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'ad912107-addd-460c-bf52-17f76f9e9a7b', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '08:30', NULL, 'Rite I', 'English'),
  (0, '09:45', NULL, 'Rite III', 'English'),
  (0, '11:00', NULL, 'Rite II', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'ad912107-addd-460c-bf52-17f76f9e9a7b');

-- St Anthony Mary Claret Catholic Church
UPDATE "churches" SET "pastorName" = 'Jan P. Klak' WHERE "id" = 'ae7e293c-0d13-41c5-a1d0-4f7f2490c9d0' AND "pastorName" IS NULL;
UPDATE "churches" SET "yearEstablished" = 1988 WHERE "id" = 'ae7e293c-0d13-41c5-a1d0-4f7f2490c9d0' AND "yearEstablished" IS NULL;
UPDATE "churches" SET "goodForChildren" = true WHERE "id" = 'ae7e293c-0d13-41c5-a1d0-4f7f2490c9d0' AND "goodForChildren" IS NULL;
UPDATE "churches" SET "languages" = ARRAY['English', 'Spanish']::text[] WHERE "id" = 'ae7e293c-0d13-41c5-a1d0-4f7f2490c9d0' AND "languages" = ARRAY['English']::text[];
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'ae7e293c-0d13-41c5-a1d0-4f7f2490c9d0', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '08:00', NULL, 'Mass', 'English'),
  (0, '10:00', NULL, 'Mass', 'English'),
  (0, '12:00', NULL, 'Mass', 'English'),
  (0, '15:00', NULL, 'Mass', 'Spanish'),
  (0, '18:00', NULL, 'Mass', 'English'),
  (1, '08:00', NULL, 'Mass', 'English'),
  (1, '18:30', NULL, 'Holy Hour', 'English'),
  (1, '19:30', NULL, 'Mass', 'English'),
  (2, '08:00', NULL, 'Mass', 'English'),
  (3, '08:00', NULL, 'Mass', 'English'),
  (4, '08:00', NULL, 'Mass', 'English'),
  (5, '08:00', NULL, 'Mass', 'English'),
  (6, '17:00', NULL, 'Mass', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'ae7e293c-0d13-41c5-a1d0-4f7f2490c9d0');

-- St Anthony's Catholic Student Center-UTSA
DELETE FROM "church_services" WHERE "churchId" = '7bc4ffa7-ae5c-4db9-8188-cdf0028aac15' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '7bc4ffa7-ae5c-4db9-8188-cdf0028aac15', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '10:00', NULL, 'Mass', 'English'),
  (0, '13:00', NULL, 'Mass', 'Spanish'),
  (0, '19:00', NULL, 'Mass', 'English'),
  (1, '18:00', NULL, 'Communion Service', 'English'),
  (2, '18:00', NULL, 'Mass', 'English'),
  (3, '18:00', NULL, 'Mass', 'English'),
  (3, '19:00', NULL, 'The Gate', 'English'),
  (4, '18:00', NULL, 'Mass', 'English'),
  (5, '12:20', NULL, 'Mass', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '7bc4ffa7-ae5c-4db9-8188-cdf0028aac15');

-- St Bonaventure Church
UPDATE "churches" SET "languages" = ARRAY['English', 'Spanish']::text[] WHERE "id" = 'a4022951-db9b-4913-87ae-7086810c45a3' AND "languages" = ARRAY['English']::text[];
DELETE FROM "church_services" WHERE "churchId" = 'a4022951-db9b-4913-87ae-7086810c45a3' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'a4022951-db9b-4913-87ae-7086810c45a3', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '08:30', NULL, 'Mass', 'English'),
  (0, '10:45', NULL, 'Mass', 'Spanish'),
  (0, '13:00', NULL, 'Mass', 'English'),
  (3, '12:00', NULL, 'Mass', 'English'),
  (5, '12:00', NULL, 'Mass', 'English'),
  (6, '17:00', NULL, 'Mass', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'a4022951-db9b-4913-87ae-7086810c45a3');

-- St Ephraim Orthodox Church
UPDATE "churches" SET "pastorName" = 'Mark Vair' WHERE "id" = 'f6108d35-42dc-446e-b704-a3de6135693b' AND "pastorName" IS NULL;
UPDATE "churches" SET "email" = 'saintephraim@gmail.com' WHERE "id" = 'f6108d35-42dc-446e-b704-a3de6135693b' AND "email" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = 'f6108d35-42dc-446e-b704-a3de6135693b' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'f6108d35-42dc-446e-b704-a3de6135693b', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:00', NULL, 'Matins (Orthros)', 'English'),
  (0, '10:00', NULL, 'Divine Liturgy', 'English'),
  (6, '17:00', NULL, 'Great Vespers', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'f6108d35-42dc-446e-b704-a3de6135693b');

-- St Francis of Assisi Catholic Church
DELETE FROM "church_services" WHERE "churchId" = '0065c850-a8b9-4207-9fc1-62d7e394770a' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '0065c850-a8b9-4207-9fc1-62d7e394770a', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '08:30', NULL, 'Mass', 'English'),
  (0, '11:15', NULL, 'Mass', 'English'),
  (0, '13:30', NULL, 'Spanish Mass', 'Spanish'),
  (0, '17:00', NULL, 'Mass', 'English'),
  (1, '10:00', NULL, 'Mass', 'English'),
  (2, '10:00', NULL, 'Mass', 'English'),
  (3, '10:00', NULL, 'Mass', 'English'),
  (4, '10:00', NULL, 'Mass', 'English'),
  (5, '10:00', NULL, 'Mass', 'English'),
  (6, '17:00', NULL, 'Mass', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '0065c850-a8b9-4207-9fc1-62d7e394770a');

-- St Gabriel Catholic Church
DELETE FROM "church_services" WHERE "churchId" = 'dd50d36d-5aad-457c-b171-3b1ae972b88f' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'dd50d36d-5aad-457c-b171-3b1ae972b88f', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:00', NULL, 'Mass', 'English'),
  (0, '12:00', NULL, 'Mass', 'Spanish'),
  (4, '19:00', NULL, 'Mass', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'dd50d36d-5aad-457c-b171-3b1ae972b88f');

-- St George Maronite Catholic Church
UPDATE "churches" SET "languages" = ARRAY['English', 'Arabic']::text[] WHERE "id" = 'ecba08c3-9048-4b10-a40c-d78a2a8e7ff1' AND "languages" = ARRAY['English']::text[];
DELETE FROM "church_services" WHERE "churchId" = 'ecba08c3-9048-4b10-a40c-d78a2a8e7ff1' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'ecba08c3-9048-4b10-a40c-d78a2a8e7ff1', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '08:00', NULL, 'Divine Liturgy', 'English'),
  (0, '10:15', NULL, 'Rosary', 'English'),
  (0, '11:00', NULL, 'Divine Liturgy', 'English'),
  (2, '11:30', NULL, 'Divine Liturgy', 'English'),
  (3, '11:30', NULL, 'Divine Liturgy', 'English'),
  (4, '11:30', NULL, 'Divine Liturgy', 'English'),
  (5, '11:30', NULL, 'Divine Liturgy', 'English'),
  (6, '17:00', NULL, 'Divine Liturgy', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'ecba08c3-9048-4b10-a40c-d78a2a8e7ff1');

-- St Gerard's Catholic Church
UPDATE "churches" SET "email" = 'parishoffice@saintgerardchurch.org' WHERE "id" = '446ac858-f0e2-48f4-a859-d3194241ce99' AND "email" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = '446ac858-f0e2-48f4-a859-d3194241ce99' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '446ac858-f0e2-48f4-a859-d3194241ce99', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '08:00', NULL, 'Mass', 'English'),
  (0, '10:30', NULL, 'Mass', 'English'),
  (1, '06:30', NULL, 'Mass', 'English'),
  (1, '19:00', NULL, 'Mass', 'Spanish'),
  (2, '06:30', NULL, 'Mass', 'English'),
  (2, '19:00', NULL, 'Mass', 'Spanish'),
  (3, '06:30', NULL, 'Mass', 'English'),
  (3, '19:00', NULL, 'Mass', 'Spanish'),
  (4, '06:30', NULL, 'Mass', 'English'),
  (4, '19:00', NULL, 'Mass', 'Spanish'),
  (5, '06:30', NULL, 'Mass', 'English'),
  (6, '08:00', NULL, 'Mass', 'English'),
  (6, '17:00', NULL, 'Vigil Mass', 'English'),
  (6, '19:00', NULL, 'Vigil Mass', 'Spanish')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '446ac858-f0e2-48f4-a859-d3194241ce99');

-- St Joan of Arc Catholic Church
DELETE FROM "church_services" WHERE "churchId" = '7005665c-6d31-47fd-bb61-8001a14499e3' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '7005665c-6d31-47fd-bb61-8001a14499e3', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:00', NULL, 'Mass', 'English'),
  (0, '11:00', NULL, 'Mass', 'English'),
  (0, '13:00', NULL, 'Mass', 'Spanish'),
  (1, '08:30', NULL, 'Mass', 'Bilingual'),
  (2, '08:30', NULL, 'Mass', 'Bilingual'),
  (3, '08:30', NULL, 'Mass', 'Bilingual'),
  (4, '08:30', NULL, 'Mass', 'Bilingual'),
  (5, '08:30', NULL, 'Mass', 'Bilingual'),
  (6, '17:30', NULL, 'Mass', 'English'),
  (6, '19:00', NULL, 'Mass', 'Spanish')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '7005665c-6d31-47fd-bb61-8001a14499e3');

-- St John Neumann Catholic Church
DELETE FROM "church_services" WHERE "churchId" = 'd269c128-d334-4b3a-aa8e-89f4c1ef4fea' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'd269c128-d334-4b3a-aa8e-89f4c1ef4fea', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '07:30', NULL, 'Mass', 'English'),
  (0, '09:00', NULL, 'Mass', 'Spanish'),
  (0, '11:00', NULL, 'Mass', 'English'),
  (1, '11:30', NULL, 'Mass', 'English'),
  (3, '11:30', NULL, 'Mass', 'English'),
  (4, '11:30', NULL, 'Mass', 'English'),
  (5, '11:30', NULL, 'Mass', 'English'),
  (6, '17:00', NULL, 'Mass', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'd269c128-d334-4b3a-aa8e-89f4c1ef4fea');

-- St Joseph Catholic Church
UPDATE "churches" SET "pastorName" = 'Francisco Ramirez' WHERE "id" = 'd8b3dd13-64fb-46a2-a574-2a4b36f466f3' AND "pastorName" IS NULL;
UPDATE "churches" SET "email" = 'agape@stjosephsouthsan.org' WHERE "id" = 'd8b3dd13-64fb-46a2-a574-2a4b36f466f3' AND "email" IS NULL;

-- St Leonard Catholic Church
UPDATE "churches" SET "pastorName" = 'Brian Garcia' WHERE "id" = '2db0cc14-3c28-428f-93f8-7b37f125201e' AND "pastorName" IS NULL;
UPDATE "churches" SET "email" = 'parishoffice@stleonardsa.org' WHERE "id" = '2db0cc14-3c28-428f-93f8-7b37f125201e' AND "email" IS NULL;
UPDATE "churches" SET "description" = 'St. Leonard Catholic Church is a parish family whose mission is to know Jesus Christ, love Him, and share His love with others through prayer, the sacraments, service, and community. The parish offers Mass, ministries, and faith formation opportunities for English and Spanish speakers.' WHERE "id" = '2db0cc14-3c28-428f-93f8-7b37f125201e' AND "description" IS NULL;

-- St Margarets Episcopal Church
UPDATE "churches" SET "pastorName" = 'Jamie P. George' WHERE "id" = '450cde0c-5f0d-44ad-9bf2-b63182c1c05c' AND "pastorName" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = '450cde0c-5f0d-44ad-9bf2-b63182c1c05c' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '450cde0c-5f0d-44ad-9bf2-b63182c1c05c', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:15', NULL, 'Adult Christian Formation', 'English'),
  (0, '10:30', NULL, 'Contemporary Rite II Holy Eucharist', 'English'),
  (3, '09:30', NULL, 'Book Study', 'English'),
  (3, '11:00', NULL, 'Healing Service with Spoken Rite II Holy Eucharist', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '450cde0c-5f0d-44ad-9bf2-b63182c1c05c');

-- St Mark The Evangelist Catholic Church
UPDATE "churches" SET "description" = 'St. Mark the Evangelist Catholic Church in San Antonio, Texas, has a mission to spread the Good News of Jesus Christ to all God''s people by word and action. The parish welcomes new members and encourages newcomers to serve the community as their gifts direct.' WHERE "id" = '2e1b3857-96ba-4b6f-aa31-fa06fb129cad' AND "description" IS NULL;

-- St Monica Catholic Church
DELETE FROM "church_services" WHERE "churchId" = '6348ded7-bb79-4e72-b9d3-6fa0de307844' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '6348ded7-bb79-4e72-b9d3-6fa0de307844', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '07:30', NULL, 'Mass', 'English'),
  (0, '09:15', NULL, 'Mass', 'English'),
  (0, '11:00', NULL, 'Mass', 'English'),
  (0, '13:00', NULL, 'Mass', 'Spanish'),
  (0, '15:00', NULL, 'Mass', 'Spanish'),
  (0, '17:00', NULL, 'Mass', 'English'),
  (0, '19:00', NULL, 'Mass', 'Spanish'),
  (1, '08:15', NULL, 'Mass', 'English'),
  (2, '08:15', NULL, 'Mass', 'English'),
  (3, '08:15', NULL, 'Mass', 'English'),
  (4, '08:15', NULL, 'Mass', 'English'),
  (5, '08:15', NULL, 'Mass', 'English'),
  (6, '09:30', NULL, 'Mass', 'Bilingual'),
  (6, '17:30', NULL, 'Vigil Mass', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '6348ded7-bb79-4e72-b9d3-6fa0de307844');

-- St Rose of Lima Catholic Church
UPDATE "churches" SET "languages" = ARRAY['English', 'Spanish']::text[] WHERE "id" = '2742f4b5-ce4f-489c-8d1f-8fe571e0eacb' AND "languages" = ARRAY['English']::text[];
DELETE FROM "church_services" WHERE "churchId" = '2742f4b5-ce4f-489c-8d1f-8fe571e0eacb' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '2742f4b5-ce4f-489c-8d1f-8fe571e0eacb', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '08:00', NULL, 'Mass', 'English'),
  (0, '10:00', NULL, 'Mass', 'Spanish'),
  (0, '12:00', NULL, 'Mass', 'English'),
  (0, '14:00', NULL, 'Mass', 'Spanish'),
  (1, '12:00', NULL, 'Mass', 'English'),
  (2, '12:00', NULL, 'Mass', 'English'),
  (3, '12:00', NULL, 'Mass', 'English'),
  (4, '12:00', NULL, 'Mass', 'English'),
  (5, '12:00', NULL, 'Mass', 'English'),
  (6, '16:00', NULL, 'Vigil Mass', 'English'),
  (6, '18:00', NULL, 'Vigil Mass', 'Spanish')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '2742f4b5-ce4f-489c-8d1f-8fe571e0eacb');

-- St Thomas Syro Malabar Catholic Church
UPDATE "churches" SET "goodForChildren" = true WHERE "id" = '9fed0fce-c55a-45de-97e6-08a241517b80' AND "goodForChildren" IS NULL;

-- St. Andrew's Church & School
UPDATE "churches" SET "pastorName" = 'Michael Crocker' WHERE "id" = '1567c969-a910-4999-93e4-cc0edff6e19e' AND "pastorName" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = '1567c969-a910-4999-93e4-cc0edff6e19e' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '1567c969-a910-4999-93e4-cc0edff6e19e', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:30', NULL, 'Blended Worship', 'English'),
  (0, '11:00', NULL, 'Contemporary Worship', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '1567c969-a910-4999-93e4-cc0edff6e19e');

-- St. Anthony Catholic Church & Hall
UPDATE "churches" SET "pastorName" = 'Fidele Dikete' WHERE "id" = 'c51f208a-3b80-4170-bdb8-1a1935085b1a' AND "pastorName" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = 'c51f208a-3b80-4170-bdb8-1a1935085b1a' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'c51f208a-3b80-4170-bdb8-1a1935085b1a', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '08:00', NULL, 'Mass', 'English'),
  (0, '10:00', NULL, 'Mass', 'English'),
  (0, '11:30', NULL, 'Mass', 'English'),
  (0, '13:30', NULL, 'Mass', 'Spanish'),
  (1, '08:00', NULL, 'Communion Service', 'English'),
  (2, '08:00', NULL, 'Mass', 'English'),
  (2, '18:30', '19:30', 'Adoration', 'English'),
  (3, '08:00', NULL, 'Mass', 'English'),
  (4, '08:00', NULL, 'Mass', 'English'),
  (5, '08:00', NULL, 'Mass', 'English'),
  (6, '17:00', NULL, 'Vigil Mass', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'c51f208a-3b80-4170-bdb8-1a1935085b1a');

-- St. Anthony de Padua Catholic Church
UPDATE "churches" SET "pastorName" = 'Kevin Shanahan' WHERE "id" = '8531d532-d23e-4328-b39c-92092d84a36f' AND "pastorName" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = '8531d532-d23e-4328-b39c-92092d84a36f' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '8531d532-d23e-4328-b39c-92092d84a36f', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (3, '19:00', NULL, 'Scriptural Rosary', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '8531d532-d23e-4328-b39c-92092d84a36f');

-- St. Benedict Catholic Church
UPDATE "churches" SET "pastorName" = 'Jose Francisco Puente Flores' WHERE "id" = '458ec288-4289-4e6c-9872-84c197fd9bfd' AND "pastorName" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = '458ec288-4289-4e6c-9872-84c197fd9bfd' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '458ec288-4289-4e6c-9872-84c197fd9bfd', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '08:00', NULL, 'Mass', 'English'),
  (0, '10:00', NULL, 'Mass', 'Bilingual'),
  (0, '12:00', '13:00', 'Bible Study', 'English'),
  (0, '13:00', '14:00', 'Bible Study', 'English'),
  (2, '08:00', NULL, 'Novena Mass of Perpetual Help', 'English'),
  (3, '12:15', NULL, 'Mass', 'English'),
  (4, '08:00', NULL, 'Mass', 'English'),
  (4, '17:00', '19:00', 'Rosary Group', 'English'),
  (6, '17:00', NULL, 'Vigil Mass', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '458ec288-4289-4e6c-9872-84c197fd9bfd');

-- St. Brigid Catholic Church
UPDATE "churches" SET "goodForChildren" = true WHERE "id" = 'dde21194-63a7-4311-922d-e6b1771de1c4' AND "goodForChildren" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = 'dde21194-63a7-4311-922d-e6b1771de1c4' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'dde21194-63a7-4311-922d-e6b1771de1c4', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '08:00', NULL, 'Mass', 'Spanish'),
  (0, '10:30', NULL, 'Mass', 'English'),
  (0, '12:30', NULL, 'Mass', 'English'),
  (2, '12:00', NULL, 'Daily Mass', 'English'),
  (3, '12:00', NULL, 'Daily Mass', 'English'),
  (4, '12:00', NULL, 'Daily Mass', 'English'),
  (4, '19:00', NULL, 'Holy Hour', 'English'),
  (5, '12:00', NULL, 'Daily Mass', 'English'),
  (6, '17:00', NULL, 'Vigil Mass', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'dde21194-63a7-4311-922d-e6b1771de1c4');

-- St. David's Episcopal Church
UPDATE "churches" SET "pastorName" = 'Brian Tarver' WHERE "id" = 'c92cf7c4-bba5-45b5-9833-fb8614f0f8d9' AND "pastorName" IS NULL;
UPDATE "churches" SET "email" = 'briant@saintdavids.net' WHERE "id" = 'c92cf7c4-bba5-45b5-9833-fb8614f0f8d9' AND "email" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = 'c92cf7c4-bba5-45b5-9833-fb8614f0f8d9' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'c92cf7c4-bba5-45b5-9833-fb8614f0f8d9', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '08:00', NULL, 'Rite I Holy Eucharist', 'English'),
  (0, '09:20', NULL, 'Sunday School', 'English'),
  (0, '10:30', NULL, 'Rite II Holy Eucharist', 'English'),
  (2, '07:30', NULL, 'Morning Prayer', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'c92cf7c4-bba5-45b5-9833-fb8614f0f8d9');

-- St. Demiana Coptic Orthodox Church
UPDATE "churches" SET "email" = 'info@stdemianasa.org' WHERE "id" = 'af315b68-0704-437c-b524-c827f5d91732' AND "email" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = 'af315b68-0704-437c-b524-c827f5d91732' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'af315b68-0704-437c-b524-c827f5d91732', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '08:00', '10:30', 'Sunday Liturgy', 'English'),
  (0, '11:00', '12:00', 'Sunday School', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'af315b68-0704-437c-b524-c827f5d91732');

-- St. Dominic Catholic Church
UPDATE "churches" SET "description" = 'Membangun situs 4dslot dan menjadikan sebagai link slot online terbaru anti rungkat & paling gampang menang dijamin cuan terus tanpa rugi, di kamus 4d slot tidak ada kata kalah, wajib menang.' WHERE "id" = '1b02df47-eb12-4cf6-982d-a27377b9c4d1' AND "description" IS NULL;

-- St. Francis Episcopal Church
UPDATE "churches" SET "pastorName" = 'Carrie Guerra' WHERE "id" = '169c3290-e9c2-4a4d-9f94-e86fa1073ca4' AND "pastorName" IS NULL;
UPDATE "churches" SET "email" = 'sfc@sfcsa.org' WHERE "id" = '169c3290-e9c2-4a4d-9f94-e86fa1073ca4' AND "email" IS NULL;
UPDATE "churches" SET "yearEstablished" = 1961 WHERE "id" = '169c3290-e9c2-4a4d-9f94-e86fa1073ca4' AND "yearEstablished" IS NULL;
UPDATE "churches" SET "goodForChildren" = true WHERE "id" = '169c3290-e9c2-4a4d-9f94-e86fa1073ca4' AND "goodForChildren" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = '169c3290-e9c2-4a4d-9f94-e86fa1073ca4' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '169c3290-e9c2-4a4d-9f94-e86fa1073ca4', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '08:00', NULL, 'Holy Eucharist Rite I', 'English'),
  (0, '10:00', NULL, 'Holy Eucharist Rite II', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '169c3290-e9c2-4a4d-9f94-e86fa1073ca4');

-- St. George Episcopal Church
UPDATE "churches" SET "pastorName" = 'Ramiro E. Lopez' WHERE "id" = '820775a7-5b99-4e6c-bc34-6e7acd7d68d1' AND "pastorName" IS NULL;
UPDATE "churches" SET "yearEstablished" = 1954 WHERE "id" = '820775a7-5b99-4e6c-bc34-6e7acd7d68d1' AND "yearEstablished" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = '820775a7-5b99-4e6c-bc34-6e7acd7d68d1' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '820775a7-5b99-4e6c-bc34-6e7acd7d68d1', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '10:00', NULL, 'Holy Eucharist (Rite II)', 'English'),
  (3, '12:00', NULL, 'Holy Eucharist (Rite II) with Healing Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '820775a7-5b99-4e6c-bc34-6e7acd7d68d1');

-- St. George Indian Orthodox Church
UPDATE "churches" SET "pastorName" = 'Sunoj Maliyil Oommen' WHERE "id" = '17945698-a77d-4245-be17-7ddd313fd2bf' AND "pastorName" IS NULL;
UPDATE "churches" SET "email" = 'sasgioc@gmail.com' WHERE "id" = '17945698-a77d-4245-be17-7ddd313fd2bf' AND "email" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = '17945698-a77d-4245-be17-7ddd313fd2bf' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '17945698-a77d-4245-be17-7ddd313fd2bf', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '08:30', NULL, 'Morning Prayer', 'Malayalam'),
  (0, '09:30', NULL, 'Holy Qurbana', 'Malayalam'),
  (0, '12:00', NULL, 'Sunday School', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '17945698-a77d-4245-be17-7ddd313fd2bf');

-- St. Henry Catholic Church
UPDATE "churches" SET "yearEstablished" = 1904 WHERE "id" = '62d87a9b-2ce8-4eab-bdf1-c90e95edb620' AND "yearEstablished" IS NULL;

-- St. John Baptist Church
UPDATE "churches" SET "yearEstablished" = 1910 WHERE "id" = 'e72818e4-3e1c-440a-b32b-7050e129ccf9' AND "yearEstablished" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = 'e72818e4-3e1c-440a-b32b-7050e129ccf9' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'e72818e4-3e1c-440a-b32b-7050e129ccf9', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '08:00', '09:00', 'Early Morning Worship Service', 'English'),
  (0, '09:30', '10:30', 'Sunday School', 'English'),
  (0, '11:00', '12:30', 'Late Morning Worship Service', 'English'),
  (3, '19:00', '20:00', 'Worship on Wednesday (WOW)', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'e72818e4-3e1c-440a-b32b-7050e129ccf9');

-- St. Joseph Capuchin Friary
UPDATE "churches" SET "languages" = ARRAY['English', 'Spanish']::text[] WHERE "id" = 'd86d04dd-7e69-4b87-b7e5-da40b70c639b' AND "languages" = ARRAY['English']::text[];

-- St. Joseph’s Roman Catholic Chapel
UPDATE "churches" SET "yearEstablished" = 1972 WHERE "id" = 'b94ea3e6-9351-4e4c-ae92-f775c122ab21' AND "yearEstablished" IS NULL;

-- St. Jude Catholic Church
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'c9ea37ab-d9f6-481e-bedc-cdab3c3f7b1e', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '08:00', NULL, 'Mass', 'Spanish'),
  (0, '10:00', NULL, 'Mass', 'English'),
  (0, '12:00', NULL, 'Mass', 'English'),
  (0, '17:00', NULL, 'Mass', 'Spanish'),
  (1, '19:00', '21:00', 'Marriage Ministry (St. Jude Matrimonial)', 'Spanish'),
  (3, '19:00', '21:00', 'Prayer Group (Cristo Rey)', 'Spanish'),
  (4, '18:30', '19:30', 'Holy Hour', 'English'),
  (5, '19:00', '20:00', 'Prayer Group (Cenáculo Mariano)', 'Spanish'),
  (6, '18:00', NULL, 'Mass', 'Spanish')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'c9ea37ab-d9f6-481e-bedc-cdab3c3f7b1e');

-- St. Leo the Great
UPDATE "churches" SET "yearEstablished" = 1903 WHERE "id" = 'fae7cd8f-df0b-4d2b-b773-65691c130167' AND "yearEstablished" IS NULL;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'fae7cd8f-df0b-4d2b-b773-65691c130167', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (2, '10:00', NULL, 'Legion of Mary', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'fae7cd8f-df0b-4d2b-b773-65691c130167');

-- St. Luke's Episcopal Church
UPDATE "churches" SET "pastorName" = 'Irv Cutter' WHERE "id" = 'fd8536b2-3b47-421e-9ff1-5f4ece231f3c' AND "pastorName" IS NULL;
UPDATE "churches" SET "wheelchairAccessible" = true WHERE "id" = 'fd8536b2-3b47-421e-9ff1-5f4ece231f3c' AND "wheelchairAccessible" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = 'fd8536b2-3b47-421e-9ff1-5f4ece231f3c' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'fd8536b2-3b47-421e-9ff1-5f4ece231f3c', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '08:00', NULL, 'Holy Eucharist, Rite One', 'English'),
  (0, '09:00', NULL, 'Holy Eucharist, Rite Two', 'English'),
  (0, '11:00', NULL, 'Holy Eucharist, Rite Two', 'English'),
  (0, '18:00', NULL, 'Holy Eucharist, Rite Two', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'fd8536b2-3b47-421e-9ff1-5f4ece231f3c');

-- St. Margaret Mary Catholic Church Sanctuary
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '03e9912a-23ae-40e5-a531-301cc58a5e67', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '08:00', NULL, 'Mass', 'English'),
  (0, '10:00', NULL, 'Mass', 'Spanish'),
  (0, '12:00', NULL, 'Mass', 'English'),
  (1, '18:00', NULL, 'Adoration', 'Spanish'),
  (3, '18:00', NULL, 'Mass', 'English'),
  (4, '12:00', NULL, 'Mass', 'English'),
  (5, '12:00', NULL, 'Mass', 'English'),
  (6, '18:00', NULL, 'Mass', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '03e9912a-23ae-40e5-a531-301cc58a5e67');

-- St. Mark's Episcopal Church
UPDATE "churches" SET "goodForGroups" = true WHERE "id" = '1910b6c8-c9d3-472c-aeb9-e91546e1cd72' AND "goodForGroups" IS NULL;
UPDATE "churches" SET "wheelchairAccessible" = true WHERE "id" = '1910b6c8-c9d3-472c-aeb9-e91546e1cd72' AND "wheelchairAccessible" IS NULL;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '1910b6c8-c9d3-472c-aeb9-e91546e1cd72', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '08:30', NULL, 'Rite I', 'English'),
  (0, '10:30', NULL, 'Rite II', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '1910b6c8-c9d3-472c-aeb9-e91546e1cd72');

-- St. Martin de Porres Catholic Church
UPDATE "churches" SET "pastorName" = 'Joaquin Rojas' WHERE "id" = 'd2bad95d-92b8-4d74-b84f-2cac3b7cc74e' AND "pastorName" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = 'd2bad95d-92b8-4d74-b84f-2cac3b7cc74e' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'd2bad95d-92b8-4d74-b84f-2cac3b7cc74e', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '10:00', NULL, 'Mass', 'Spanish'),
  (0, '13:00', NULL, 'Mass', 'English'),
  (3, '19:00', NULL, 'Eucharistic Adoration: Holy Hour', 'English'),
  (6, '16:00', NULL, 'Mass', 'Bilingual')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'd2bad95d-92b8-4d74-b84f-2cac3b7cc74e');

-- St. Mary Magdalen Catholic Church
UPDATE "churches" SET "goodForChildren" = true WHERE "id" = '60b094ca-eeee-4b98-8b97-2f22f3c0b42e' AND "goodForChildren" IS NULL;
UPDATE "churches" SET "wheelchairAccessible" = true WHERE "id" = '60b094ca-eeee-4b98-8b97-2f22f3c0b42e' AND "wheelchairAccessible" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = '60b094ca-eeee-4b98-8b97-2f22f3c0b42e' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '60b094ca-eeee-4b98-8b97-2f22f3c0b42e', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '07:30', NULL, 'Mass', 'English'),
  (0, '09:00', NULL, 'Mass', 'Spanish'),
  (0, '10:45', NULL, 'Mass', 'English'),
  (0, '12:30', NULL, 'Mass', 'English'),
  (0, '14:30', NULL, 'Mass', 'Spanish'),
  (1, '07:30', NULL, 'Mass', 'English'),
  (1, '18:30', NULL, 'Mass', 'Spanish'),
  (2, '07:30', NULL, 'Mass', 'English'),
  (3, '07:30', NULL, 'Mass', 'English'),
  (4, '07:30', NULL, 'Mass', 'English'),
  (5, '07:30', NULL, 'Mass', 'English'),
  (6, '08:00', NULL, 'Mass', 'Bilingual'),
  (6, '18:00', NULL, 'Vigil Mass', 'Spanish')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '60b094ca-eeee-4b98-8b97-2f22f3c0b42e');

-- St. Matthew's Episcopal Church, Universal City, TX
DELETE FROM "church_services" WHERE "churchId" = 'd2fbbd34-5625-43b4-84c2-522a108bb57f' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'd2fbbd34-5625-43b4-84c2-522a108bb57f', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '08:00', NULL, 'Service', 'English'),
  (0, '10:00', NULL, 'Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'd2fbbd34-5625-43b4-84c2-522a108bb57f');

-- St. Matthew's United Methodist Church
UPDATE "churches" SET "email" = 'info@stmattssa.org' WHERE "id" = 'd11b9197-463c-4147-8e4c-459a52e5e7a5' AND "email" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = 'd11b9197-463c-4147-8e4c-459a52e5e7a5' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'd11b9197-463c-4147-8e4c-459a52e5e7a5', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '10:30', NULL, 'Worship', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'd11b9197-463c-4147-8e4c-459a52e5e7a5');

-- St. Padre Pio Catholic Church
DELETE FROM "church_services" WHERE "churchId" = '8cda5b7b-8257-48a0-9538-1dd9be45dc90' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '8cda5b7b-8257-48a0-9538-1dd9be45dc90', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '08:30', NULL, 'Mass', 'English'),
  (0, '10:30', NULL, 'Mass', 'English'),
  (0, '13:00', NULL, 'Mass', 'Spanish'),
  (1, '09:00', NULL, 'Mass', 'English'),
  (2, '09:00', NULL, 'Mass', 'English'),
  (2, '19:00', '20:45', 'Cenacle of Divine Mercy', 'English'),
  (3, '09:00', NULL, 'Mass', 'English'),
  (4, '09:00', NULL, 'Mass', 'English'),
  (4, '19:00', '20:45', 'Cenacle of Divine Mercy', 'Spanish'),
  (5, '09:00', NULL, 'Mass', 'English'),
  (6, '16:00', NULL, 'Mass', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '8cda5b7b-8257-48a0-9538-1dd9be45dc90');

-- St. Paul Lutheran Church
UPDATE "churches" SET "yearEstablished" = 1913 WHERE "id" = '8592a8fb-8d8e-4b9b-a9d0-fb61df91e8d0' AND "yearEstablished" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = '8592a8fb-8d8e-4b9b-a9d0-fb61df91e8d0' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '8592a8fb-8d8e-4b9b-a9d0-fb61df91e8d0', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '10:00', NULL, 'Divine Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '8592a8fb-8d8e-4b9b-a9d0-fb61df91e8d0');

-- St. Sophia Greek Orthodox Church
DELETE FROM "church_services" WHERE "churchId" = 'b9a8e629-6776-451c-a19d-7451d9ed281b' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'b9a8e629-6776-451c-a19d-7451d9ed281b', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:00', NULL, 'Orthros (Matins)', 'English'),
  (0, '10:00', NULL, 'Divine Liturgy', 'English'),
  (6, '18:00', NULL, 'Great Vespers', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'b9a8e629-6776-451c-a19d-7451d9ed281b');

-- St. Thomas Episcopal Church and School
UPDATE "churches" SET "pastorName" = 'Mike Michie' WHERE "id" = '628f530c-0cf7-405a-9e10-e22cbd755ffe' AND "pastorName" IS NULL;
UPDATE "churches" SET "email" = 'stthomaschurch@tom1604.org' WHERE "id" = '628f530c-0cf7-405a-9e10-e22cbd755ffe' AND "email" IS NULL;
UPDATE "churches" SET "description" = 'St. Thomas Episcopal Church and School is an inclusive and kind church in north San Antonio that learns and serves together. It offers weekly Holy Eucharist services, a children''s ministry, and an affiliated school.' WHERE "id" = '628f530c-0cf7-405a-9e10-e22cbd755ffe' AND "description" IS NULL;
UPDATE "churches" SET "goodForChildren" = true WHERE "id" = '628f530c-0cf7-405a-9e10-e22cbd755ffe' AND "goodForChildren" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = '628f530c-0cf7-405a-9e10-e22cbd755ffe' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '628f530c-0cf7-405a-9e10-e22cbd755ffe', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '08:00', NULL, 'Holy Eucharist Rite I', 'English'),
  (0, '10:00', NULL, 'Holy Eucharist Rite II', 'English'),
  (3, '12:00', NULL, 'Holy Eucharist Rite II', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '628f530c-0cf7-405a-9e10-e22cbd755ffe');

-- St. Thomas More Catholic Church
DELETE FROM "church_services" WHERE "churchId" = 'ad3db569-2894-49e0-93ed-deeed65f8523' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'ad3db569-2894-49e0-93ed-deeed65f8523', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '08:00', NULL, 'Mass', 'English'),
  (0, '10:00', NULL, 'Mass', 'English'),
  (0, '12:00', NULL, 'Mass', 'Spanish'),
  (1, '08:00', NULL, 'Communion Service', 'English'),
  (2, '08:00', NULL, 'Daily Mass', 'English'),
  (2, '19:00', NULL, 'Divine Mercy Cenacle', 'English'),
  (3, '08:00', NULL, 'Daily Mass', 'English'),
  (4, '08:00', NULL, 'Daily Mass', 'English'),
  (5, '08:00', NULL, 'Daily Mass', 'English'),
  (6, '08:00', NULL, 'Communion Service', 'English'),
  (6, '17:00', NULL, 'Vigil Mass', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'ad3db569-2894-49e0-93ed-deeed65f8523');

-- Stone Oak Bible Church
UPDATE "churches" SET "pastorName" = 'Justin Evans' WHERE "id" = '6cb1e1a5-f3de-4ad4-9997-b380bbac192b' AND "pastorName" IS NULL;
UPDATE "churches" SET "goodForChildren" = true WHERE "id" = '6cb1e1a5-f3de-4ad4-9997-b380bbac192b' AND "goodForChildren" IS NULL;
UPDATE "churches" SET "languages" = ARRAY['English', 'Spanish']::text[] WHERE "id" = '6cb1e1a5-f3de-4ad4-9997-b380bbac192b' AND "languages" = ARRAY['English']::text[];

-- Stone Oak Cumberland Presbyterian Church
UPDATE "churches" SET "pastorName" = 'Mark Sontowski' WHERE "id" = 'e7771b5b-0e18-428b-bc20-727c26e797ef' AND "pastorName" IS NULL;
UPDATE "churches" SET "goodForChildren" = true WHERE "id" = 'e7771b5b-0e18-428b-bc20-727c26e797ef' AND "goodForChildren" IS NULL;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'e7771b5b-0e18-428b-bc20-727c26e797ef', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:00', '10:00', 'Sunday School', 'English'),
  (0, '10:30', NULL, 'Worship Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'e7771b5b-0e18-428b-bc20-727c26e797ef');

-- Stonebridge Baptist Church
UPDATE "churches" SET "pastorName" = 'Kevin Prather' WHERE "id" = 'f6893091-893b-4e8c-aadf-55a8b49ac5e2' AND "pastorName" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = 'f6893091-893b-4e8c-aadf-55a8b49ac5e2' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'f6893091-893b-4e8c-aadf-55a8b49ac5e2', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:45', NULL, 'Bible Study', 'English'),
  (0, '09:45', NULL, 'Worship Service', 'English'),
  (0, '11:15', NULL, 'Bible Study', 'English'),
  (0, '11:15', NULL, 'Worship Service', 'English'),
  (2, '18:00', NULL, 'Men''s Bible Study', 'English'),
  (2, '18:00', NULL, 'Women''s Bible Study', 'English'),
  (3, '18:00', NULL, 'Refuel & Recharge', 'English'),
  (6, '17:00', NULL, 'Worship', 'English'),
  (6, '18:15', NULL, 'Small Group', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'f6893091-893b-4e8c-aadf-55a8b49ac5e2');

-- Sunset Ridge Church
UPDATE "churches" SET "goodForChildren" = true WHERE "id" = '5ed2b32e-056c-48ac-a0ef-d90c4bccb2c5' AND "goodForChildren" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = '5ed2b32e-056c-48ac-a0ef-d90c4bccb2c5' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '5ed2b32e-056c-48ac-a0ef-d90c4bccb2c5', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:00', NULL, 'Acapella Worship', 'English'),
  (0, '10:15', NULL, 'Formation', 'English'),
  (0, '11:00', NULL, 'Instrumental Worship', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '5ed2b32e-056c-48ac-a0ef-d90c4bccb2c5');

-- TDN Church
DELETE FROM "church_services" WHERE "churchId" = '5556f752-fcb5-4ccd-a160-de34676a1566' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '5556f752-fcb5-4ccd-a160-de34676a1566', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '10:00', NULL, 'Sunday School', 'English'),
  (0, '11:00', NULL, 'Service', 'English'),
  (0, '17:00', NULL, 'Prayer', 'English'),
  (0, '18:00', NULL, 'Service', 'English'),
  (3, '18:30', NULL, 'Prayer', 'English'),
  (3, '19:30', NULL, 'Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '5556f752-fcb5-4ccd-a160-de34676a1566');

-- Talley Road Baptist Church
UPDATE "churches" SET "pastorName" = 'Myres Drew' WHERE "id" = 'b55f3df6-e631-4684-acb5-c58e26b15d5f' AND "pastorName" IS NULL;
UPDATE "churches" SET "email" = 'trbc@satx.rr.com' WHERE "id" = 'b55f3df6-e631-4684-acb5-c58e26b15d5f' AND "email" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = 'b55f3df6-e631-4684-acb5-c58e26b15d5f' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'b55f3df6-e631-4684-acb5-c58e26b15d5f', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '08:45', '09:45', 'Sunday Morning Worship', 'English'),
  (0, '10:00', '11:00', 'Adult Sunday School', 'English'),
  (0, '11:00', '12:00', 'Sunday Morning Worship', 'English'),
  (0, '18:00', '19:00', 'Sunday Night Service', 'English'),
  (3, '19:00', '20:00', 'Prayer & Bible Study', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'b55f3df6-e631-4684-acb5-c58e26b15d5f');

-- Taproot Church
DELETE FROM "church_services" WHERE "churchId" = '7729c3b8-7fd5-452f-83aa-be07482d65c8' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '7729c3b8-7fd5-452f-83aa-be07482d65c8', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '11:11', '12:30', 'Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '7729c3b8-7fd5-452f-83aa-be07482d65c8');

-- Temple of Praise
DELETE FROM "church_services" WHERE "churchId" = 'dd8e154d-4572-4378-9c2e-78e4a5ebf430' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'dd8e154d-4572-4378-9c2e-78e4a5ebf430', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '10:30', NULL, 'Service', 'English'),
  (3, '18:00', NULL, 'Prayer', 'English'),
  (3, '19:00', NULL, 'Bible Study', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'dd8e154d-4572-4378-9c2e-78e4a5ebf430');

-- Templo Magdiel
UPDATE "churches" SET "pastorName" = 'Ruben O. Gonzalez' WHERE "id" = '88ce5126-02c7-468f-872f-573a41690d32' AND "pastorName" IS NULL;
UPDATE "churches" SET "yearEstablished" = 1989 WHERE "id" = '88ce5126-02c7-468f-872f-573a41690d32' AND "yearEstablished" IS NULL;
UPDATE "churches" SET "description" = 'Templo Magdiel is a Spanish-speaking Pentecostal church in San Antonio that believes in the move and manifestations of the Holy Spirit. Its mission is to reach the lost and hopeless and help them find a home and family where they can develop their gifts and ministries. It serves the surrounding Spanish-speaking community and beyond.' WHERE "id" = '88ce5126-02c7-468f-872f-573a41690d32' AND "description" IS NULL;
UPDATE "churches" SET "goodForChildren" = true WHERE "id" = '88ce5126-02c7-468f-872f-573a41690d32' AND "goodForChildren" IS NULL;
UPDATE "churches" SET "denomination" = 'Pentecostal', "denominationFamily" = 'Pentecostal' WHERE "id" = '88ce5126-02c7-468f-872f-573a41690d32' AND "denomination" IS NULL AND "denominationFamily" IS NULL;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '88ce5126-02c7-468f-872f-573a41690d32', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:00', NULL, 'Prayer', 'Spanish'),
  (0, '10:00', NULL, 'Sunday School', 'Spanish'),
  (0, '11:00', NULL, 'Service', 'Spanish'),
  (3, '18:30', NULL, 'Prayer', 'Spanish'),
  (3, '19:00', NULL, 'Bible Study', 'Spanish')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '88ce5126-02c7-468f-872f-573a41690d32');

-- Texas Baptist Church
UPDATE "churches" SET "pastorName" = 'Keith Bell' WHERE "id" = 'f8efed97-fabf-43c8-9a2f-df7f74a2c844' AND "pastorName" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = 'f8efed97-fabf-43c8-9a2f-df7f74a2c844' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'f8efed97-fabf-43c8-9a2f-df7f74a2c844', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '10:00', NULL, 'Sunday School', 'English'),
  (0, '11:00', NULL, 'Morning Service', 'English'),
  (0, '16:30', NULL, 'Evening Service', 'English'),
  (3, '19:00', NULL, 'Bible Study', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'f8efed97-fabf-43c8-9a2f-df7f74a2c844');

-- The Bridge Community Church
UPDATE "churches" SET "pastorName" = 'Carl Huffaker' WHERE "id" = '7fc29a44-a3df-4c9f-8f03-61f23aa4df4c' AND "pastorName" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = '7fc29a44-a3df-4c9f-8f03-61f23aa4df4c' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '7fc29a44-a3df-4c9f-8f03-61f23aa4df4c', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:00', NULL, 'Bible Study', 'English'),
  (0, '10:30', NULL, 'Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '7fc29a44-a3df-4c9f-8f03-61f23aa4df4c');

-- The CLLXTV Church
UPDATE "churches" SET "email" = 'info@thecllxtv.com' WHERE "id" = 'fe3b475e-43b2-44ea-9ad6-bf52b8a5e9fb' AND "email" IS NULL;

-- The Church of Jesus Christ of Latter-day Saints
UPDATE "churches" SET "goodForChildren" = true WHERE "id" = 'b385ae40-03e4-4065-af42-ecb05c5148bb' AND "goodForChildren" IS NULL;

-- The Church of Jesus Christ of Latter-day Saints
UPDATE "churches" SET "goodForChildren" = true WHERE "id" = '423ebe0c-4458-4bbf-851a-53c5e97ccfb8' AND "goodForChildren" IS NULL;

-- The Church of Jesus Christ of Latter-day Saints
UPDATE "churches" SET "goodForChildren" = true WHERE "id" = '1d686fb7-a08e-444d-a359-44cc41c248a5' AND "goodForChildren" IS NULL;

-- The Church of Jesus Christ of Latter-day Saints
UPDATE "churches" SET "goodForChildren" = true WHERE "id" = '56a932a3-dd57-4fea-96d6-4d38d48f8e00' AND "goodForChildren" IS NULL;

-- The Church of Jesus Christ of Latter-day Saints
UPDATE "churches" SET "goodForChildren" = true WHERE "id" = '8e465cab-27ba-498e-87e6-abda8d26448b' AND "goodForChildren" IS NULL;

-- The Church of Jesus Christ of Latter-day Saints
UPDATE "churches" SET "goodForChildren" = true WHERE "id" = '4ad3e345-fb2d-4b1f-a98b-c534633375e0' AND "goodForChildren" IS NULL;

-- The Church of Jesus Christ of Latter-day Saints
UPDATE "churches" SET "goodForChildren" = true WHERE "id" = '1882a689-cf3f-4a18-b3a4-5d02d6b83d12' AND "goodForChildren" IS NULL;

-- The Church of Jesus Christ of Latter-day Saints
UPDATE "churches" SET "goodForChildren" = true WHERE "id" = 'a8605e03-3b53-443a-aeba-1715eaaa29f5' AND "goodForChildren" IS NULL;

-- The Church of Jesus Christ of Latter-day Saints
UPDATE "churches" SET "goodForChildren" = true WHERE "id" = '7a42a354-6952-483c-acab-d2234e4ba3e4' AND "goodForChildren" IS NULL;

-- The Church of Jesus Christ of Latter-day Saints
UPDATE "churches" SET "goodForChildren" = true WHERE "id" = 'af286d68-45ad-4971-9515-b432d5b617a2' AND "goodForChildren" IS NULL;

-- The Church of Jesus Christ of Latter-day Saints
UPDATE "churches" SET "goodForChildren" = true WHERE "id" = '152cc668-778c-4fea-a5d2-0490c79bec1d' AND "goodForChildren" IS NULL;

-- The Church of Jesus Christ of Latter-day Saints
UPDATE "churches" SET "goodForChildren" = true WHERE "id" = '126397a8-cb7f-438e-8af1-11639f7107a0' AND "goodForChildren" IS NULL;

-- The Church of Jesus Christ of Latter-day Saints
UPDATE "churches" SET "goodForChildren" = true WHERE "id" = '12da8d9e-f938-42e7-b130-0e9a6f59f363' AND "goodForChildren" IS NULL;

-- The Church of Jesus Christ of Latter-day Saints
UPDATE "churches" SET "goodForChildren" = true WHERE "id" = '2bbe8318-1443-45a5-92fd-d5357df9106b' AND "goodForChildren" IS NULL;

-- The Church of Jesus Christ of Latter-day Saints
UPDATE "churches" SET "goodForChildren" = true WHERE "id" = 'a3cd1c99-acfc-4634-a374-fc0c4c1cf5bc' AND "goodForChildren" IS NULL;

-- The Door Christian Fellowship Church Southside San Antonio
UPDATE "churches" SET "pastorName" = 'Willis Gordon' WHERE "id" = '159abd63-fd56-4127-b75c-9e46706fb255' AND "pastorName" IS NULL;
UPDATE "churches" SET "yearEstablished" = 1992 WHERE "id" = '159abd63-fd56-4127-b75c-9e46706fb255' AND "yearEstablished" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = '159abd63-fd56-4127-b75c-9e46706fb255' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '159abd63-fd56-4127-b75c-9e46706fb255', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:45', NULL, 'Sunday School', 'English'),
  (0, '11:00', NULL, 'Sunday Morning', 'English'),
  (0, '18:30', NULL, 'Sunday Evening', 'English'),
  (3, '19:30', NULL, 'Wednesday Night', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '159abd63-fd56-4127-b75c-9e46706fb255');

-- The Door Christian Fellowship Great Northwest
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '12b16cb7-7347-44d1-b2bd-a540e334d47a', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '11:00', NULL, 'Sunday Morning Service', 'English'),
  (0, '19:00', NULL, 'Sunday Night Service', 'English'),
  (3, '19:30', NULL, 'Wednesday Night Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '12b16cb7-7347-44d1-b2bd-a540e334d47a');

-- The Episcopal Church of the Holy Spirit
UPDATE "churches" SET "pastorName" = 'Jason T. Roberts' WHERE "id" = '967f80be-1dba-476c-9e86-a39f683c571d' AND "pastorName" IS NULL;
UPDATE "churches" SET "yearEstablished" = 2009 WHERE "id" = '967f80be-1dba-476c-9e86-a39f683c571d' AND "yearEstablished" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = '967f80be-1dba-476c-9e86-a39f683c571d' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '967f80be-1dba-476c-9e86-a39f683c571d', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '10:00', NULL, 'Holy Eucharist', 'English'),
  (0, '17:30', NULL, 'Holy Eucharist', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '967f80be-1dba-476c-9e86-a39f683c571d');

-- The Garden Church
UPDATE "churches" SET "pastorName" = 'Caleb Saenz' WHERE "id" = '107bf2bf-6a76-4239-9fa0-673cc6accaf2' AND "pastorName" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = '107bf2bf-6a76-4239-9fa0-673cc6accaf2' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '107bf2bf-6a76-4239-9fa0-673cc6accaf2', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '10:00', NULL, 'Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '107bf2bf-6a76-4239-9fa0-673cc6accaf2');

-- The Hills Church
UPDATE "churches" SET "yearEstablished" = 2000 WHERE "id" = 'f74be1c0-9369-4429-ae6d-b7d0371d8151' AND "yearEstablished" IS NULL;
UPDATE "churches" SET "goodForGroups" = true WHERE "id" = 'f74be1c0-9369-4429-ae6d-b7d0371d8151' AND "goodForGroups" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = 'f74be1c0-9369-4429-ae6d-b7d0371d8151' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'f74be1c0-9369-4429-ae6d-b7d0371d8151', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:15', NULL, 'Bible Fellowship', 'English'),
  (0, '10:45', NULL, 'Sunday Worship', 'English'),
  (3, '18:30', NULL, 'Bible Study', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'f74be1c0-9369-4429-ae6d-b7d0371d8151');

-- The Kings Mission Fellowship
DELETE FROM "church_services" WHERE "churchId" = 'd411ca84-4f8e-4931-9388-784b85486ad4' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'd411ca84-4f8e-4931-9388-784b85486ad4', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '10:00', NULL, 'Bible Study', 'English'),
  (0, '11:00', NULL, 'Service', 'English'),
  (3, '19:00', NULL, 'Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'd411ca84-4f8e-4931-9388-784b85486ad4');

-- The Park Community Church
UPDATE "churches" SET "email" = 'familyministries@theparksa.org' WHERE "id" = 'c638250b-b41f-4c8e-bbf1-7863dc8d2157' AND "email" IS NULL;
UPDATE "churches" SET "goodForChildren" = true WHERE "id" = 'c638250b-b41f-4c8e-bbf1-7863dc8d2157' AND "goodForChildren" IS NULL;
UPDATE "churches" SET "goodForGroups" = true WHERE "id" = 'c638250b-b41f-4c8e-bbf1-7863dc8d2157' AND "goodForGroups" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = 'c638250b-b41f-4c8e-bbf1-7863dc8d2157' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'c638250b-b41f-4c8e-bbf1-7863dc8d2157', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '10:00', '11:10', 'Worship gathering', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'c638250b-b41f-4c8e-bbf1-7863dc8d2157');

-- The Potter's House Christian Fellowship
UPDATE "churches" SET "goodForChildren" = true WHERE "id" = 'a127528b-5123-48b6-bd75-a8772cbc05a6' AND "goodForChildren" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = 'a127528b-5123-48b6-bd75-a8772cbc05a6' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'a127528b-5123-48b6-bd75-a8772cbc05a6', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '10:30', NULL, 'Service', 'English'),
  (0, '18:00', NULL, 'Sunday School', 'English'),
  (0, '19:00', NULL, 'Service', 'English'),
  (3, '19:00', NULL, 'Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'a127528b-5123-48b6-bd75-a8772cbc05a6');

-- The Potters House Christian Church of Converse
DELETE FROM "church_services" WHERE "churchId" = '4e1d2a53-7db9-4954-bc99-ba4a1db87fef' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '4e1d2a53-7db9-4954-bc99-ba4a1db87fef', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:30', NULL, 'Sunday School', 'English'),
  (0, '10:30', NULL, 'Sunday Worship', 'English'),
  (0, '18:00', NULL, 'Sunday Worship', 'English'),
  (3, '19:00', NULL, 'Wednesday Worship', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '4e1d2a53-7db9-4954-bc99-ba4a1db87fef');

-- The Potter’s House Christian Fellowship Church - UTSA
DELETE FROM "church_services" WHERE "churchId" = '59eab915-9344-4059-b402-01da5d097702' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '59eab915-9344-4059-b402-01da5d097702', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '11:00', NULL, 'Sunday Morning Service', 'English'),
  (0, '18:00', NULL, 'Sunday Evening Service', 'English'),
  (3, '19:00', NULL, 'Wednesday Evening Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '59eab915-9344-4059-b402-01da5d097702');

-- The Promised Land Church
UPDATE "churches" SET "pastorName" = 'Juan Alonso' WHERE "id" = '8caf1a20-2956-4ccf-b5b9-e86eb0ede23e' AND "pastorName" IS NULL;
UPDATE "churches" SET "languages" = ARRAY['English', 'Spanish']::text[] WHERE "id" = '8caf1a20-2956-4ccf-b5b9-e86eb0ede23e' AND "languages" = ARRAY['English']::text[];

-- The Revelation San Antonio
UPDATE "churches" SET "email" = 'info@revelationinternational.org' WHERE "id" = 'a7df3f5e-1ee0-42c0-bc5e-98dfe33c9277' AND "email" IS NULL;
UPDATE "churches" SET "yearEstablished" = 1990 WHERE "id" = 'a7df3f5e-1ee0-42c0-bc5e-98dfe33c9277' AND "yearEstablished" IS NULL;
UPDATE "churches" SET "description" = 'The Revelation International Ministries is a Christ-centred international ministry that preaches the Gospel, disciples believers, develops leaders and serves communities across nations. It began as a small gathering of believers and has grown to include mission fields, partner churches and leadership networks.' WHERE "id" = 'a7df3f5e-1ee0-42c0-bc5e-98dfe33c9277' AND "description" IS NULL;
UPDATE "churches" SET "goodForChildren" = true WHERE "id" = 'a7df3f5e-1ee0-42c0-bc5e-98dfe33c9277' AND "goodForChildren" IS NULL;
UPDATE "churches" SET "goodForGroups" = true WHERE "id" = 'a7df3f5e-1ee0-42c0-bc5e-98dfe33c9277' AND "goodForGroups" IS NULL;

-- The Rim Church
UPDATE "churches" SET "goodForChildren" = true WHERE "id" = 'a80eb623-f0c7-4f1f-b4eb-57dc0c724166' AND "goodForChildren" IS NULL;
UPDATE "churches" SET "goodForGroups" = true WHERE "id" = 'a80eb623-f0c7-4f1f-b4eb-57dc0c724166' AND "goodForGroups" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = 'a80eb623-f0c7-4f1f-b4eb-57dc0c724166' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'a80eb623-f0c7-4f1f-b4eb-57dc0c724166', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '10:00', '11:30', 'Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'a80eb623-f0c7-4f1f-b4eb-57dc0c724166');

-- The Rock San Antonio
UPDATE "churches" SET "email" = 'info@myrocksanantonio.com' WHERE "id" = '7f11cffc-3a59-4a5d-8d3c-4aedb65009da' AND "email" IS NULL;
UPDATE "churches" SET "phone" = '210-653-9588' WHERE "id" = '7f11cffc-3a59-4a5d-8d3c-4aedb65009da' AND "phone" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = '7f11cffc-3a59-4a5d-8d3c-4aedb65009da' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '7f11cffc-3a59-4a5d-8d3c-4aedb65009da', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:30', NULL, 'Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '7f11cffc-3a59-4a5d-8d3c-4aedb65009da');

-- The Springs Church
UPDATE "churches" SET "pastorName" = 'George Ramirez' WHERE "id" = '24a3d3e4-bc8b-420f-b031-db7eecc0ccd6' AND "pastorName" IS NULL;
UPDATE "churches" SET "yearEstablished" = 2012 WHERE "id" = '24a3d3e4-bc8b-420f-b031-db7eecc0ccd6' AND "yearEstablished" IS NULL;

-- Thousand Oaks Bible Church
UPDATE "churches" SET "pastorName" = 'Chuck Humbert' WHERE "id" = '7ff7f1d4-bbbe-45e3-b107-abd95ee1752f' AND "pastorName" IS NULL;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '7ff7f1d4-bbbe-45e3-b107-abd95ee1752f', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '10:30', NULL, 'Service', 'English'),
  (0, '17:00', NULL, 'Awana', 'English'),
  (3, '18:30', NULL, 'Adult Bible Study', 'English'),
  (3, '18:30', NULL, 'Rooted Student Ministry', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '7ff7f1d4-bbbe-45e3-b107-abd95ee1752f');

-- Three Streams Church
UPDATE "churches" SET "yearEstablished" = 2012 WHERE "id" = '80e49877-1290-44ab-9c95-25873109900a' AND "yearEstablished" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = '80e49877-1290-44ab-9c95-25873109900a' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '80e49877-1290-44ab-9c95-25873109900a', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '10:00', NULL, 'Service', 'English'),
  (0, '11:20', NULL, 'Christian Formation', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '80e49877-1290-44ab-9c95-25873109900a');

-- Town East Baptist Church
UPDATE "churches" SET "email" = 'info@tebc.org' WHERE "id" = '09e24dea-a16a-4d30-84fd-2939ea8c57da' AND "email" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = '09e24dea-a16a-4d30-84fd-2939ea8c57da' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '09e24dea-a16a-4d30-84fd-2939ea8c57da', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:30', NULL, 'Sunday School', 'English'),
  (0, '10:45', NULL, 'Service', 'English'),
  (0, '18:30', NULL, 'Service', 'English'),
  (3, '19:00', NULL, 'Children/Teens Bible Study', 'English'),
  (3, '19:00', NULL, 'Prayer/Bible Study', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '09e24dea-a16a-4d30-84fd-2939ea8c57da');

-- Tree Mount Temple Church
UPDATE "churches" SET "yearEstablished" = 1957 WHERE "id" = '6d4c0c40-bee5-4c67-857c-f17c3dafbe10' AND "yearEstablished" IS NULL;
UPDATE "churches" SET "denomination" = 'Missionary Baptist', "denominationFamily" = 'Baptist' WHERE "id" = '6d4c0c40-bee5-4c67-857c-f17c3dafbe10' AND "denomination" IS NULL AND "denominationFamily" IS NULL;

-- Tried Stone Baptist Church
UPDATE "churches" SET "pastorName" = 'D.W. Brooks' WHERE "id" = '927b5854-5ce0-4d67-b75a-d2a329063e66' AND "pastorName" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = '927b5854-5ce0-4d67-b75a-d2a329063e66' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '927b5854-5ce0-4d67-b75a-d2a329063e66', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:45', NULL, 'Sunday School', 'English'),
  (0, '11:00', NULL, 'Sunday Morning Worship', 'English'),
  (4, '19:00', NULL, 'Choir Rehearsal', 'English'),
  (6, '10:00', NULL, 'Bible Study', 'English'),
  (6, '11:00', NULL, 'Male Choir Rehearsal', 'English'),
  (6, '11:00', NULL, 'Mission Meeting', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '927b5854-5ce0-4d67-b75a-d2a329063e66');

-- Trinity Baptist Church
UPDATE "churches" SET "pastorName" = 'Shaun Leverton' WHERE "id" = '5e7ef510-ded7-4873-b16d-4863b4a1e0b1' AND "pastorName" IS NULL;
UPDATE "churches" SET "yearEstablished" = 2007 WHERE "id" = '5e7ef510-ded7-4873-b16d-4863b4a1e0b1' AND "yearEstablished" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = '5e7ef510-ded7-4873-b16d-4863b4a1e0b1' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '5e7ef510-ded7-4873-b16d-4863b4a1e0b1', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:45', NULL, 'Sunday School', 'English'),
  (0, '11:00', NULL, 'Sunday Worship', 'English'),
  (0, '16:30', '19:00', 'Youth Group', 'English'),
  (3, '18:30', NULL, 'Bible Study', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '5e7ef510-ded7-4873-b16d-4863b4a1e0b1');

-- Trinity Grace Church San Antonio - A PCA Church
DELETE FROM "church_services" WHERE "churchId" = 'ca06e7b1-8512-4f26-8594-1823b038d22c' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'ca06e7b1-8512-4f26-8594-1823b038d22c', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '10:00', NULL, 'Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'ca06e7b1-8512-4f26-8594-1823b038d22c');

-- Trinity San Antonio Lutheran Church
UPDATE "churches" SET "pastorName" = 'Matthew Ballmann' WHERE "id" = '877b4072-5284-4f99-a5b4-45b2f4bdb8f6' AND "pastorName" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = '877b4072-5284-4f99-a5b4-45b2f4bdb8f6' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '877b4072-5284-4f99-a5b4-45b2f4bdb8f6', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:15', NULL, 'Adult Bible Class', 'English'),
  (0, '09:15', NULL, 'Student Confirmation', 'English'),
  (0, '10:30', NULL, 'Divine Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '877b4072-5284-4f99-a5b4-45b2f4bdb8f6');

-- Trinity United Methodist Church
UPDATE "churches" SET "email" = 'TrinityUMCoffice1@gmail.com' WHERE "id" = '2b5650f8-4994-43b5-8ffa-2d5e511164ef' AND "email" IS NULL;
UPDATE "churches" SET "goodForChildren" = true WHERE "id" = '2b5650f8-4994-43b5-8ffa-2d5e511164ef' AND "goodForChildren" IS NULL;
UPDATE "churches" SET "wheelchairAccessible" = true WHERE "id" = '2b5650f8-4994-43b5-8ffa-2d5e511164ef' AND "wheelchairAccessible" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = '2b5650f8-4994-43b5-8ffa-2d5e511164ef' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '2b5650f8-4994-43b5-8ffa-2d5e511164ef', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '10:00', NULL, 'Worship', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '2b5650f8-4994-43b5-8ffa-2d5e511164ef');

-- Triumph Church SATX
UPDATE "churches" SET "description" = 'Triumph Church SATX is a church in San Antonio, Texas, centered on pursuing Jesus through personal devotion, Sunday worship, prayer, discipleship, and community. Its stated aim is transforming hearts, homes, and community.' WHERE "id" = '0fa3ec0e-55be-4646-80a8-7d76a824c867' AND "description" IS NULL;
UPDATE "churches" SET "goodForChildren" = true WHERE "id" = '0fa3ec0e-55be-4646-80a8-7d76a824c867' AND "goodForChildren" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = '0fa3ec0e-55be-4646-80a8-7d76a824c867' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '0fa3ec0e-55be-4646-80a8-7d76a824c867', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '10:30', NULL, 'Service', 'English'),
  (2, '07:00', '08:00', 'Prayer', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '0fa3ec0e-55be-4646-80a8-7d76a824c867');

-- Triumphant Lutheran Church
UPDATE "churches" SET "pastorName" = 'Aaron Richter' WHERE "id" = '5e819dd5-749c-4418-a37a-0d6c7baeaf05' AND "pastorName" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = '5e819dd5-749c-4418-a37a-0d6c7baeaf05' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '5e819dd5-749c-4418-a37a-0d6c7baeaf05', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:00', NULL, 'Traditional', 'English'),
  (0, '11:00', NULL, 'Contemporary', 'English'),
  (3, '17:45', '20:00', 'Wednesday Nite Live', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '5e819dd5-749c-4418-a37a-0d6c7baeaf05');

-- Triumphant Word Christian Center
UPDATE "churches" SET "pastorName" = 'Ed Woodus' WHERE "id" = 'a47a8aa6-536a-4c6b-9d0b-a526be2ac279' AND "pastorName" IS NULL;
UPDATE "churches" SET "yearEstablished" = 2005 WHERE "id" = 'a47a8aa6-536a-4c6b-9d0b-a526be2ac279' AND "yearEstablished" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = 'a47a8aa6-536a-4c6b-9d0b-a526be2ac279' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'a47a8aa6-536a-4c6b-9d0b-a526be2ac279', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '10:30', NULL, 'Sunday Worship', 'English'),
  (3, '18:45', NULL, 'Wednesday Worship', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'a47a8aa6-536a-4c6b-9d0b-a526be2ac279');

-- True Believer's Praise & Worship Sanctuary
UPDATE "churches" SET "yearEstablished" = 2006 WHERE "id" = '791f9512-646d-49ad-9efc-4cf8e3ac1e96' AND "yearEstablished" IS NULL;
UPDATE "churches" SET "goodForChildren" = true WHERE "id" = '791f9512-646d-49ad-9efc-4cf8e3ac1e96' AND "goodForChildren" IS NULL;
UPDATE "churches" SET "goodForGroups" = true WHERE "id" = '791f9512-646d-49ad-9efc-4cf8e3ac1e96' AND "goodForGroups" IS NULL;

-- True Life Church
UPDATE "churches" SET "pastorName" = 'Joe Warren' WHERE "id" = '8076ce42-26eb-4e30-9003-44567e3dbe11' AND "pastorName" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = '8076ce42-26eb-4e30-9003-44567e3dbe11' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '8076ce42-26eb-4e30-9003-44567e3dbe11', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:00', NULL, 'Traditional', 'English'),
  (0, '10:00', NULL, 'Bible Study', 'English'),
  (0, '11:00', NULL, 'Contemporary', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '8076ce42-26eb-4e30-9003-44567e3dbe11');

-- True Vine Baptist Church
UPDATE "churches" SET "pastorName" = 'Jesse L. Grice' WHERE "id" = 'ab2e9157-dad1-453e-97bc-e2556e013bff' AND "pastorName" IS NULL;
UPDATE "churches" SET "yearEstablished" = 1993 WHERE "id" = 'ab2e9157-dad1-453e-97bc-e2556e013bff' AND "yearEstablished" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = 'ab2e9157-dad1-453e-97bc-e2556e013bff' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'ab2e9157-dad1-453e-97bc-e2556e013bff', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '10:30', NULL, 'Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'ab2e9157-dad1-453e-97bc-e2556e013bff');

-- True Vine Church
UPDATE "churches" SET "pastorName" = 'Trevor Alexander' WHERE "id" = '9cfbb56b-1511-4698-bbf9-2e535ba64722' AND "pastorName" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = '9cfbb56b-1511-4698-bbf9-2e535ba64722' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '9cfbb56b-1511-4698-bbf9-2e535ba64722', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:15', NULL, 'Life Application School', 'English'),
  (0, '10:30', NULL, 'Sunday Worship Service', 'English'),
  (3, '19:00', NULL, 'Bible Study', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '9cfbb56b-1511-4698-bbf9-2e535ba64722');

-- True Vision Church NE Campus
UPDATE "churches" SET "description" = 'True Vision Church is a church in San Antonio, Texas with two campuses, Northeast and Lackland. It teaches people to love God, themselves, and their neighbors to the glory of God.' WHERE "id" = 'bf20abe9-0a64-470d-9662-a7ee26f3a0a1' AND "description" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = 'bf20abe9-0a64-470d-9662-a7ee26f3a0a1' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'bf20abe9-0a64-470d-9662-a7ee26f3a0a1', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '08:00', NULL, 'Service', 'English'),
  (0, '09:30', NULL, 'Service', 'English'),
  (0, '11:00', NULL, 'Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'bf20abe9-0a64-470d-9662-a7ee26f3a0a1');

-- Unity of San Antonio
UPDATE "churches" SET "email" = 'office@unityofsa.org' WHERE "id" = '30da03a9-2c86-49f5-a9ef-0734270a954d' AND "email" IS NULL;
UPDATE "churches" SET "description" = 'Unity of San Antonio is an open-hearted, all-inclusive spiritual community that teaches positive, practical spirituality and honors all paths to the Divine. It offers Sunday services, classes, music, and events.' WHERE "id" = '30da03a9-2c86-49f5-a9ef-0734270a954d' AND "description" IS NULL;
UPDATE "churches" SET "goodForChildren" = true WHERE "id" = '30da03a9-2c86-49f5-a9ef-0734270a954d' AND "goodForChildren" IS NULL;
UPDATE "churches" SET "goodForGroups" = true WHERE "id" = '30da03a9-2c86-49f5-a9ef-0734270a954d' AND "goodForGroups" IS NULL;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '30da03a9-2c86-49f5-a9ef-0734270a954d', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '11:00', NULL, 'Sunday Celebration Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '30da03a9-2c86-49f5-a9ef-0734270a954d');

-- Universal City United Methodist Church
UPDATE "churches" SET "email" = 'office@ucumctx.org' WHERE "id" = '074aa1ca-74b7-4cbe-9bf8-baf0168f3056' AND "email" IS NULL;
UPDATE "churches" SET "description" = 'Universal City United Methodist Church is a family-oriented church in northern Bexar County, Texas. It offers Sunday worship in person or by livestream, children''s and youth ministries, and a weekly Wednesday Family Night with dinner and activities.' WHERE "id" = '074aa1ca-74b7-4cbe-9bf8-baf0168f3056' AND "description" IS NULL;
UPDATE "churches" SET "goodForChildren" = true WHERE "id" = '074aa1ca-74b7-4cbe-9bf8-baf0168f3056' AND "goodForChildren" IS NULL;
UPDATE "churches" SET "goodForGroups" = true WHERE "id" = '074aa1ca-74b7-4cbe-9bf8-baf0168f3056' AND "goodForGroups" IS NULL;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '074aa1ca-74b7-4cbe-9bf8-baf0168f3056', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:00', NULL, 'Adult Sunday School', 'English'),
  (0, '10:30', NULL, 'Service', 'English'),
  (3, '17:30', '19:00', 'Youth', 'English'),
  (3, '18:00', '18:30', 'Mid-Week Illumination', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '074aa1ca-74b7-4cbe-9bf8-baf0168f3056');

-- University Baptist Church
UPDATE "churches" SET "yearEstablished" = 1978 WHERE "id" = '854280e1-8572-40b1-ad4c-00a0bad8ffb4' AND "yearEstablished" IS NULL;
UPDATE "churches" SET "goodForGroups" = true WHERE "id" = '854280e1-8572-40b1-ad4c-00a0bad8ffb4' AND "goodForGroups" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = '854280e1-8572-40b1-ad4c-00a0bad8ffb4' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '854280e1-8572-40b1-ad4c-00a0bad8ffb4', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:15', NULL, 'Connect Groups', 'English'),
  (0, '10:30', NULL, 'Worship Service', 'English'),
  (0, '18:00', NULL, 'Men''s Bible Study', 'English'),
  (0, '18:00', NULL, 'University Kids', 'English'),
  (0, '18:00', NULL, 'Women''s Bible Study', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '854280e1-8572-40b1-ad4c-00a0bad8ffb4');

-- University Methodist Church
DELETE FROM "church_services" WHERE "churchId" = '55300b98-025c-453b-96c8-a963f859049e' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '55300b98-025c-453b-96c8-a963f859049e', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '08:15', NULL, 'Traditional Worship', 'English'),
  (0, '09:30', '10:30', 'Sunday School', 'English'),
  (0, '09:30', NULL, 'Traditional Worship', 'English'),
  (0, '11:00', NULL, 'Modern Worship', 'English'),
  (0, '11:00', NULL, 'Traditional Worship', 'English'),
  (0, '12:15', NULL, 'Believer''s Garden', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '55300b98-025c-453b-96c8-a963f859049e');

-- University Methodist Church (North Campus)
DELETE FROM "church_services" WHERE "churchId" = '6bc8d3f0-7a87-4ba9-be12-90e2935847f3' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '6bc8d3f0-7a87-4ba9-be12-90e2935847f3', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '08:15', NULL, 'Traditional', 'English'),
  (0, '09:30', NULL, 'Traditional', 'English'),
  (0, '11:00', NULL, 'Modern Worship', 'English'),
  (0, '11:00', NULL, 'Traditional', 'English'),
  (0, '12:15', NULL, 'Believer''s Garden', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '6bc8d3f0-7a87-4ba9-be12-90e2935847f3');

-- University Oaks Church of Christ
DELETE FROM "church_services" WHERE "churchId" = 'a03df9e2-c3f5-4345-843f-a07857b1a0bf' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'a03df9e2-c3f5-4345-843f-a07857b1a0bf', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:30', NULL, 'Bible Class', 'English'),
  (0, '10:30', NULL, 'Worship', 'English'),
  (0, '17:00', NULL, 'Worship', 'English'),
  (3, '19:30', NULL, 'Bible Class', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'a03df9e2-c3f5-4345-843f-a07857b1a0bf');

-- University Presbyterian Church
UPDATE "churches" SET "email" = 'upcsa@upcsa.org' WHERE "id" = 'f6990e7a-25ed-4acb-8a1b-1372b154a6fd' AND "email" IS NULL;
UPDATE "churches" SET "yearEstablished" = 1950 WHERE "id" = 'f6990e7a-25ed-4acb-8a1b-1372b154a6fd' AND "yearEstablished" IS NULL;
UPDATE "churches" SET "description" = 'University Presbyterian Church is a congregation of the Presbyterian Church (U.S.A.) in San Antonio, organized in 1950 and rooted in the Reformed tradition. It is located next to Trinity University and offers traditional worship, a children''s center, and service and outreach in the community.' WHERE "id" = 'f6990e7a-25ed-4acb-8a1b-1372b154a6fd' AND "description" IS NULL;
UPDATE "churches" SET "goodForGroups" = true WHERE "id" = 'f6990e7a-25ed-4acb-8a1b-1372b154a6fd' AND "goodForGroups" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = 'f6990e7a-25ed-4acb-8a1b-1372b154a6fd' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'f6990e7a-25ed-4acb-8a1b-1372b154a6fd', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '08:00', NULL, 'Meditation', 'English'),
  (0, '09:00', NULL, 'Sunday School', 'English'),
  (0, '10:30', NULL, 'Traditional', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'f6990e7a-25ed-4acb-8a1b-1372b154a6fd');

-- Valley Hi First Baptist Church
DELETE FROM "church_services" WHERE "churchId" = '431496bb-199d-4937-b9c0-82aa782641ee' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '431496bb-199d-4937-b9c0-82aa782641ee', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:30', NULL, 'Family Life Groups', 'English'),
  (0, '10:45', NULL, 'Sunday Worship', 'English'),
  (3, '18:30', NULL, 'Adult Family Groups', 'English'),
  (3, '18:30', NULL, 'Children', 'English'),
  (3, '18:30', NULL, 'Youth Church', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '431496bb-199d-4937-b9c0-82aa782641ee');

-- Vertical Church
DELETE FROM "church_services" WHERE "churchId" = '370d272b-ae69-4361-bd94-e78ea0d9c237' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '370d272b-ae69-4361-bd94-e78ea0d9c237', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '10:00', NULL, 'Service', 'English'),
  (3, '19:00', NULL, 'Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '370d272b-ae69-4361-bd94-e78ea0d9c237');

-- Victorious Faith Baptist Church
DELETE FROM "church_services" WHERE "churchId" = '4a4652f3-fd6f-4308-950b-dfaf28021ecf' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '4a4652f3-fd6f-4308-950b-dfaf28021ecf', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '10:00', NULL, 'Sunday School', 'English'),
  (0, '11:00', NULL, 'Worship & Bible Preaching', 'English'),
  (3, '18:30', NULL, 'Prayer Meeting', 'English'),
  (3, '19:00', NULL, 'Bible Study', 'English'),
  (6, '14:00', NULL, 'Outreach, Soulwinning & Visitation', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '4a4652f3-fd6f-4308-950b-dfaf28021ecf');

-- Victory Assembly Of God
DELETE FROM "church_services" WHERE "churchId" = '8f7ba82e-f3e9-41d0-b6e0-a1d722ac81e3' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '8f7ba82e-f3e9-41d0-b6e0-a1d722ac81e3', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '10:00', NULL, 'Service', 'English'),
  (3, '18:30', NULL, 'Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '8f7ba82e-f3e9-41d0-b6e0-a1d722ac81e3');

-- Victory Gospel Chapel
UPDATE "churches" SET "pastorName" = 'Jackie Banks' WHERE "id" = 'a4ae2ae4-6f57-4533-a0e8-53ec05094162' AND "pastorName" IS NULL;
UPDATE "churches" SET "email" = 'victorygospelchapel412@gmail.com' WHERE "id" = 'a4ae2ae4-6f57-4533-a0e8-53ec05094162' AND "email" IS NULL;
UPDATE "churches" SET "yearEstablished" = 1992 WHERE "id" = 'a4ae2ae4-6f57-4533-a0e8-53ec05094162' AND "yearEstablished" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = 'a4ae2ae4-6f57-4533-a0e8-53ec05094162' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'a4ae2ae4-6f57-4533-a0e8-53ec05094162', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '10:30', NULL, 'Service', 'English'),
  (0, '18:30', NULL, 'Service', 'English'),
  (3, '18:30', NULL, 'Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'a4ae2ae4-6f57-4533-a0e8-53ec05094162');

-- Victory Outreach San Antonio
DELETE FROM "church_services" WHERE "churchId" = 'a0020f5f-2a80-43b9-9010-7dc6ec995ce8' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'a0020f5f-2a80-43b9-9010-7dc6ec995ce8', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '11:00', NULL, 'Service', 'English'),
  (3, '19:30', NULL, 'Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'a0020f5f-2a80-43b9-9010-7dc6ec995ce8');

-- Victory Outreach San Antonio West
UPDATE "churches" SET "pastorName" = 'Juan Andrade' WHERE "id" = 'e797584f-6378-409d-8a58-7e43e1624825' AND "pastorName" IS NULL;
UPDATE "churches" SET "yearEstablished" = 1995 WHERE "id" = 'e797584f-6378-409d-8a58-7e43e1624825' AND "yearEstablished" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = 'e797584f-6378-409d-8a58-7e43e1624825' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'e797584f-6378-409d-8a58-7e43e1624825', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '10:00', NULL, 'Sunday Celebration Service', 'Spanish'),
  (0, '13:00', NULL, 'Sunday Celebration Service', 'English'),
  (3, '19:30', NULL, 'Mid Week Service', 'English'),
  (5, '19:30', NULL, 'Third Wave Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'e797584f-6378-409d-8a58-7e43e1624825');

-- Victory Worship Center
UPDATE "churches" SET "email" = 'vwcsatx@gmail.com' WHERE "id" = '267428d2-ba6d-4381-873a-887ea8a3ee43' AND "email" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = '267428d2-ba6d-4381-873a-887ea8a3ee43' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '267428d2-ba6d-4381-873a-887ea8a3ee43', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '10:00', NULL, 'Sunday School', 'English'),
  (0, '11:00', NULL, 'Sunday Worship Experience', 'English'),
  (2, '19:00', NULL, 'Midweek Refresh', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '267428d2-ba6d-4381-873a-887ea8a3ee43');

-- Vietnamese Christian Church
UPDATE "churches" SET "description" = 'Vietnamese Christian Church (Hội Thánh Tin Lành San Antonio) is a Vietnamese-language congregation in San Antonio, Texas. Its mission is to exalt the Lord, equip the saints, evangelize the lost, and encourage believers.' WHERE "id" = '1e6a2397-d53c-4cf8-8011-01b5fce26668' AND "description" IS NULL;
UPDATE "churches" SET "goodForChildren" = true WHERE "id" = '1e6a2397-d53c-4cf8-8011-01b5fce26668' AND "goodForChildren" IS NULL;
UPDATE "churches" SET "languages" = ARRAY['English', 'Vietnamese']::text[] WHERE "id" = '1e6a2397-d53c-4cf8-8011-01b5fce26668' AND "languages" = ARRAY['English']::text[];
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '1e6a2397-d53c-4cf8-8011-01b5fce26668', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:45', NULL, 'Worship', 'Vietnamese'),
  (0, '12:00', NULL, 'Sunday School', 'Vietnamese')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '1e6a2397-d53c-4cf8-8011-01b5fce26668');

-- Village Parkway Baptist Church
DELETE FROM "church_services" WHERE "churchId" = 'f03693e2-88bf-42d0-88df-06a0186b3c2d' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'f03693e2-88bf-42d0-88df-06a0186b3c2d', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:30', NULL, 'Life Groups', 'English'),
  (0, '10:45', NULL, 'Worship', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'f03693e2-88bf-42d0-88df-06a0186b3c2d');

-- Vineyard Church of San Antonio
UPDATE "churches" SET "pastorName" = 'Obed Badilla' WHERE "id" = 'd16bfe71-4d48-49c8-a2e5-8199706e6de6' AND "pastorName" IS NULL;

-- WORD WAY Ministries International
DELETE FROM "church_services" WHERE "churchId" = 'fa3b15bb-510b-4081-9d3e-5ffecb3dfd49' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'fa3b15bb-510b-4081-9d3e-5ffecb3dfd49', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '10:30', NULL, 'Prayer, Praise, & Worship', 'English'),
  (0, '11:00', NULL, 'WORDs of Life', 'English'),
  (2, '18:30', NULL, 'Community Prayer', 'English'),
  (2, '19:00', NULL, 'Thirst for Truth Bible Study', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'fa3b15bb-510b-4081-9d3e-5ffecb3dfd49');

-- Watershed Church
DELETE FROM "church_services" WHERE "churchId" = 'a98e6724-bd2a-4205-92e1-efc015bf39ab' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'a98e6724-bd2a-4205-92e1-efc015bf39ab', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:30', NULL, 'Service', 'English'),
  (0, '11:15', NULL, 'Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'a98e6724-bd2a-4205-92e1-efc015bf39ab');

-- Wayside Chapel
UPDATE "churches" SET "pastorName" = 'Jason Uptmore' WHERE "id" = '3d3be266-fbfc-4c28-b231-7b67df49ef75' AND "pastorName" IS NULL;
UPDATE "churches" SET "goodForChildren" = true WHERE "id" = '3d3be266-fbfc-4c28-b231-7b67df49ef75' AND "goodForChildren" IS NULL;
UPDATE "churches" SET "wheelchairAccessible" = true WHERE "id" = '3d3be266-fbfc-4c28-b231-7b67df49ef75' AND "wheelchairAccessible" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = '3d3be266-fbfc-4c28-b231-7b67df49ef75' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '3d3be266-fbfc-4c28-b231-7b67df49ef75', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:15', NULL, 'Adult Sunday Studies', 'English'),
  (0, '09:15', NULL, 'Student Ministry', 'English'),
  (0, '09:15', NULL, 'Worship Service', 'English'),
  (0, '11:00', NULL, 'Adult Sunday Studies', 'English'),
  (0, '11:00', NULL, 'Worship Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '3d3be266-fbfc-4c28-b231-7b67df49ef75');

-- West Bexar County Church of Christ
DELETE FROM "church_services" WHERE "churchId" = 'b36090ea-a826-4c36-95d1-881617c68094' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'b36090ea-a826-4c36-95d1-881617c68094', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:30', '10:15', 'Bible Class', 'English'),
  (0, '10:30', '11:30', 'Worship', 'English'),
  (3, '19:00', '20:00', 'Bible Class', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'b36090ea-a826-4c36-95d1-881617c68094');

-- Westover Hills Church
DELETE FROM "church_services" WHERE "churchId" = 'd8de2d41-09a8-4671-b320-ccdb05d10076' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'd8de2d41-09a8-4671-b320-ccdb05d10076', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '08:30', NULL, 'Seniors Classic Service', 'English'),
  (0, '09:00', NULL, 'Service', 'English'),
  (0, '10:30', NULL, 'Service', 'English'),
  (0, '12:00', NULL, 'Service', 'English'),
  (6, '17:00', NULL, 'Service', 'English'),
  (6, '18:30', NULL, 'Service', 'Spanish')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'd8de2d41-09a8-4671-b320-ccdb05d10076');

-- Wildfire Network
UPDATE "churches" SET "yearEstablished" = 2017 WHERE "id" = 'e9c0a505-4f94-4ec1-95aa-7eba0071ec09' AND "yearEstablished" IS NULL;
UPDATE "churches" SET "goodForGroups" = true WHERE "id" = 'e9c0a505-4f94-4ec1-95aa-7eba0071ec09' AND "goodForGroups" IS NULL;

-- Windcrest United Methodist Church
UPDATE "churches" SET "pastorName" = 'Robert Waddle' WHERE "id" = '402adf66-731a-43a1-a10f-aa3f341f8ac8' AND "pastorName" IS NULL;
UPDATE "churches" SET "email" = 'r.waddle@windcrestumc.org' WHERE "id" = '402adf66-731a-43a1-a10f-aa3f341f8ac8' AND "email" IS NULL;
UPDATE "churches" SET "yearEstablished" = 1964 WHERE "id" = '402adf66-731a-43a1-a10f-aa3f341f8ac8' AND "yearEstablished" IS NULL;
UPDATE "churches" SET "description" = 'Windcrest United Methodist Church is a welcoming community of faith in Northeast San Antonio, founded in 1964. Its mission is to make new disciples of Jesus Christ for the transformation of the world, and it offers ministries for children, youth and adults, along with a day school and child development center.' WHERE "id" = '402adf66-731a-43a1-a10f-aa3f341f8ac8' AND "description" IS NULL;
UPDATE "churches" SET "goodForChildren" = true WHERE "id" = '402adf66-731a-43a1-a10f-aa3f341f8ac8' AND "goodForChildren" IS NULL;
UPDATE "churches" SET "goodForGroups" = true WHERE "id" = '402adf66-731a-43a1-a10f-aa3f341f8ac8' AND "goodForGroups" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = '402adf66-731a-43a1-a10f-aa3f341f8ac8' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '402adf66-731a-43a1-a10f-aa3f341f8ac8', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:00', NULL, 'Traditional', 'English'),
  (0, '11:00', NULL, 'Contemporary', 'English'),
  (3, '18:30', NULL, 'Fellowship Dinner', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '402adf66-731a-43a1-a10f-aa3f341f8ac8');

-- Woodlake Baptist Church
UPDATE "churches" SET "description" = 'Woodlake Baptist Church is a Baptist church in San Antonio, Texas, focused on sharing the gospel of Jesus Christ through worship, Sunday School, and Bible study.' WHERE "id" = '0f0d194b-e223-4b04-b273-42f7f3cf6c62' AND "description" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = '0f0d194b-e223-4b04-b273-42f7f3cf6c62' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '0f0d194b-e223-4b04-b273-42f7f3cf6c62', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:45', '10:45', 'Sunday School', 'English'),
  (0, '11:00', NULL, 'Sunday Worship Service', 'English'),
  (0, '18:00', NULL, 'Sunday Evening Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '0f0d194b-e223-4b04-b273-42f7f3cf6c62');

-- Woodland Church
DELETE FROM "church_services" WHERE "churchId" = '18ceba6f-1be6-4843-a748-f5cdeca4fe99' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '18ceba6f-1be6-4843-a748-f5cdeca4fe99', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:45', NULL, 'Sunday School', 'English'),
  (0, '11:00', NULL, 'Worship', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '18ceba6f-1be6-4843-a748-f5cdeca4fe99');

-- Word Of Faith Christian Center
UPDATE "churches" SET "email" = 'tlbrannon@wofsa.com' WHERE "id" = '623c5b93-08ec-4002-bcd4-9aa53644e052' AND "email" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = '623c5b93-08ec-4002-bcd4-9aa53644e052' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '623c5b93-08ec-4002-bcd4-9aa53644e052', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '08:00', NULL, 'Service', 'English'),
  (0, '11:00', NULL, 'Service', 'English'),
  (3, '12:00', '13:30', 'Mid-Day Midweek Service', 'English'),
  (4, '18:45', NULL, 'Midweek Service', 'English'),
  (6, '16:30', NULL, 'Saturday Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '623c5b93-08ec-4002-bcd4-9aa53644e052');

-- Xtreme Harvest Church
DELETE FROM "church_services" WHERE "churchId" = '863492ba-12c0-4013-add3-93ea6e84d160' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '863492ba-12c0-4013-add3-93ea6e84d160', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '11:00', NULL, 'Service', 'English'),
  (0, '19:00', NULL, 'Service', 'English'),
  (1, '19:00', NULL, 'Prayer Night', 'English'),
  (2, '19:00', NULL, 'Bible Study', 'English'),
  (2, '19:00', NULL, 'Youth Night', 'English'),
  (3, '19:00', NULL, 'Midweek Service', 'English'),
  (4, '19:00', NULL, 'Outreach', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '863492ba-12c0-4013-add3-93ea6e84d160');

-- Zion Church San Antonio
DELETE FROM "church_services" WHERE "churchId" = '447f50b6-6526-4924-83cf-296025028c25' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '447f50b6-6526-4924-83cf-296025028c25', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '10:00', NULL, 'Service', 'English'),
  (0, '11:30', NULL, 'Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '447f50b6-6526-4924-83cf-296025028c25');

-- Zion Lutheran Church
UPDATE "churches" SET "pastorName" = 'Al Jensen' WHERE "id" = 'e5c2fe90-404d-49b1-be53-4399dac5b5e6' AND "pastorName" IS NULL;
UPDATE "churches" SET "yearEstablished" = 1904 WHERE "id" = 'e5c2fe90-404d-49b1-be53-4399dac5b5e6' AND "yearEstablished" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = 'e5c2fe90-404d-49b1-be53-4399dac5b5e6' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'e5c2fe90-404d-49b1-be53-4399dac5b5e6', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:00', NULL, 'Worship', 'English'),
  (0, '10:15', '11:15', 'Sunday School', 'English'),
  (0, '11:30', NULL, 'Worship', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'e5c2fe90-404d-49b1-be53-4399dac5b5e6');

-- ct|church (Calvary Temple Assembly of God)
DELETE FROM "church_services" WHERE "churchId" = 'aa7903af-4bdb-4a1d-90c6-2f4c2ea0651a' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'aa7903af-4bdb-4a1d-90c6-2f4c2ea0651a', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '10:00', NULL, 'Weekend Worship', 'English'),
  (3, '19:00', NULL, 'Life Groups', 'English'),
  (3, '19:00', NULL, 'Student Ministry', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'aa7903af-4bdb-4a1d-90c6-2f4c2ea0651a');

-- 샌안토니오 한인침례교회 San Antonio Korean Baptist Church
DELETE FROM "church_services" WHERE "churchId" = '9205b6f2-18be-4c56-87d4-1f89af5e2dec' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '9205b6f2-18be-4c56-87d4-1f89af5e2dec', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:45', NULL, 'English Worship', 'English'),
  (0, '11:00', NULL, 'Sunday School', 'Korean'),
  (0, '11:00', NULL, 'Sunday Worship', 'Korean')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '9205b6f2-18be-4c56-87d4-1f89af5e2dec');
