-- Second website pass, 2026-11-11: sites that render their content with
-- JavaScript (or refuse non-browser clients) were loaded in a real browser
-- and read by the same enrich-website-v2 stage:
--   * 36 churches get a verified weekly schedule (26 had none before).
--     Every time was found written on the church's site; dated announcements,
--     holy-day schedules and office hours were excluded. Replaced rows are
--     backed up in prisma/data-backups/.
--   * fills where production had nothing: 11 descriptions, 18 pastor names,
--     23 emails, 14 founding years, 0 phone numbers
--   * 1 denominations stated on the church's site, 12 language lists
--
-- Guards: fills apply only where the column is still NULL; denomination and
-- language updates only if the row still holds the audited value; service
-- replacement only touches auto-imported rows of churches that exist.

-- CJCLife Church
UPDATE "churches" SET "pastorName" = 'Philip Sundar' WHERE "id" = '94df8463-6f63-457f-ba5c-84693cba7c68' AND "pastorName" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = '94df8463-6f63-457f-ba5c-84693cba7c68' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '94df8463-6f63-457f-ba5c-84693cba7c68', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '08:00', NULL, 'Service', 'Tamil'),
  (0, '10:30', NULL, 'Service', 'English'),
  (6, '09:00', NULL, 'Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '94df8463-6f63-457f-ba5c-84693cba7c68');

-- Christ Life Touch Ministries Inc.
UPDATE "churches" SET "email" = 'saved@christlifetouch.us' WHERE "id" = '7f933472-e8b9-4628-9653-4837e318b48c' AND "email" IS NULL;

-- Communities Under the Bridge with Church Under the Bridge
DELETE FROM "church_services" WHERE "churchId" = '2df64b8e-c872-4dee-a541-eabe97edef44' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '2df64b8e-c872-4dee-a541-eabe97edef44', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '17:00', NULL, 'Service', 'English'),
  (6, '18:00', NULL, 'Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '2df64b8e-c872-4dee-a541-eabe97edef44');

-- Confraternidad de Iglesias Cristianas USA
UPDATE "churches" SET "description" = 'La Confraternidad de Iglesias Cristianas U.S.A. es una asociación de iglesias locales con sede en San Antonio, TX, que sostiene la Biblia como palabra infalible de Dios. Mantiene el avivamiento Pentecostal y busca una iglesia completa con una variedad de ministerios que sirvan a sus asambleas locales.' WHERE "id" = 'b1449404-2f34-4c1b-8719-79a21ac5de64' AND "description" IS NULL;
UPDATE "churches" SET "languages" = ARRAY['English', 'Spanish']::text[] WHERE "id" = 'b1449404-2f34-4c1b-8719-79a21ac5de64' AND "languages" = ARRAY['English']::text[];

-- Cross Church San Antonio
DELETE FROM "church_services" WHERE "churchId" = '3412b4ad-2650-4b93-a867-bce7f47a5c42' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '3412b4ad-2650-4b93-a867-bce7f47a5c42', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '10:00', NULL, 'Service', 'English'),
  (0, '12:00', NULL, 'Service', 'Spanish')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '3412b4ad-2650-4b93-a867-bce7f47a5c42');

-- CrownRidge Ministries
UPDATE "churches" SET "pastorName" = 'Steve Newton' WHERE "id" = '5464d8cd-819b-4bd0-9361-f0b227e41cc1' AND "pastorName" IS NULL;
UPDATE "churches" SET "email" = 'newtsa7777@gmail.com' WHERE "id" = '5464d8cd-819b-4bd0-9361-f0b227e41cc1' AND "email" IS NULL;
UPDATE "churches" SET "yearEstablished" = 2002 WHERE "id" = '5464d8cd-819b-4bd0-9361-f0b227e41cc1' AND "yearEstablished" IS NULL;
UPDATE "churches" SET "description" = 'Crownridge Church is a Bible-believing, mission-giving, family-centered church in northwest San Antonio, founded in 2002. It focuses on family, missions, and Bible teaching and preaching, and supports mission work in Malawi and Israel.' WHERE "id" = '5464d8cd-819b-4bd0-9361-f0b227e41cc1' AND "description" IS NULL;
UPDATE "churches" SET "goodForChildren" = true WHERE "id" = '5464d8cd-819b-4bd0-9361-f0b227e41cc1' AND "goodForChildren" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = '5464d8cd-819b-4bd0-9361-f0b227e41cc1' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '5464d8cd-819b-4bd0-9361-f0b227e41cc1', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:00', NULL, 'Prayer at the Cross', 'English'),
  (0, '09:45', NULL, 'Sunday School', 'English'),
  (0, '10:45', NULL, 'Worship Service', 'English'),
  (3, '19:00', NULL, 'Bible Study', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '5464d8cd-819b-4bd0-9361-f0b227e41cc1');

-- Elevate Ministries
UPDATE "churches" SET "pastorName" = 'Alex Lara' WHERE "id" = '414498b7-71c3-428d-a296-b1c3f04c5ec9' AND "pastorName" IS NULL;
UPDATE "churches" SET "email" = 'janiejoey@gmail.com' WHERE "id" = '414498b7-71c3-428d-a296-b1c3f04c5ec9' AND "email" IS NULL;
UPDATE "churches" SET "yearEstablished" = 2008 WHERE "id" = '414498b7-71c3-428d-a296-b1c3f04c5ec9' AND "yearEstablished" IS NULL;
UPDATE "churches" SET "description" = 'Elevate Ministries is a San Antonio church whose mission is reaching the lost with the love of God, raising them up through discipleship, then releasing them to fulfill their life-long purposes. It offers Sunday services, small groups, and a children''s ministry called E-Kids.' WHERE "id" = '414498b7-71c3-428d-a296-b1c3f04c5ec9' AND "description" IS NULL;
UPDATE "churches" SET "goodForChildren" = true WHERE "id" = '414498b7-71c3-428d-a296-b1c3f04c5ec9' AND "goodForChildren" IS NULL;
UPDATE "churches" SET "goodForGroups" = true WHERE "id" = '414498b7-71c3-428d-a296-b1c3f04c5ec9' AND "goodForGroups" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = '414498b7-71c3-428d-a296-b1c3f04c5ec9' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '414498b7-71c3-428d-a296-b1c3f04c5ec9', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:30', NULL, 'Service', 'English'),
  (0, '11:00', NULL, 'Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '414498b7-71c3-428d-a296-b1c3f04c5ec9');

-- Freedom Life Church SAN ANTONIO
UPDATE "churches" SET "email" = 'saadmin@freedomlifechurch.com' WHERE "id" = '402294d8-c295-48ff-b2c7-c01d4d7a4271' AND "email" IS NULL;
UPDATE "churches" SET "goodForGroups" = true WHERE "id" = '402294d8-c295-48ff-b2c7-c01d4d7a4271' AND "goodForGroups" IS NULL;

-- Generations Family Church (Mission Cristiana Maranatha)
UPDATE "churches" SET "languages" = ARRAY['English', 'Spanish']::text[] WHERE "id" = 'b491cebd-44cb-4206-b648-3c1f8db9eda8' AND "languages" = ARRAY['English']::text[];

-- Grace Church
UPDATE "churches" SET "pastorName" = 'Tim Swan' WHERE "id" = 'dda4509a-579f-4742-9606-6b3a10993f32' AND "pastorName" IS NULL;
UPDATE "churches" SET "email" = 'grace@gracechurchsa.org' WHERE "id" = 'dda4509a-579f-4742-9606-6b3a10993f32' AND "email" IS NULL;

-- Grace Lutheran Church
UPDATE "churches" SET "description" = 'Grace Lutheran Church is a diverse, multi-generational community in downtown San Antonio, Texas, gathered by God''s love. Its mission centers on worship, spiritual formation, service of God and neighbor, and supporting one another in the Body of Christ.' WHERE "id" = '7ed24d15-9f17-4684-bc63-7bfc773937db' AND "description" IS NULL;
UPDATE "churches" SET "goodForChildren" = true WHERE "id" = '7ed24d15-9f17-4684-bc63-7bfc773937db' AND "goodForChildren" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = '7ed24d15-9f17-4684-bc63-7bfc773937db' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '7ed24d15-9f17-4684-bc63-7bfc773937db', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '10:00', NULL, 'Service', 'English'),
  (0, '11:00', NULL, 'Sunday School', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '7ed24d15-9f17-4684-bc63-7bfc773937db');

-- His Grace Church
UPDATE "churches" SET "pastorName" = 'Michael Pilmore' WHERE "id" = '58048784-39ea-4fde-aee8-ebd64cfa3793' AND "pastorName" IS NULL;
UPDATE "churches" SET "email" = 'info@hgc.church' WHERE "id" = '58048784-39ea-4fde-aee8-ebd64cfa3793' AND "email" IS NULL;
UPDATE "churches" SET "description" = 'His Grace Church is a local church in San Antonio, Texas, emphasizing good news, community, family and friendship. It offers shared experiences, pastoral care and practical teaching to promote spiritual, physical and mental well-being.' WHERE "id" = '58048784-39ea-4fde-aee8-ebd64cfa3793' AND "description" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = '58048784-39ea-4fde-aee8-ebd64cfa3793' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '58048784-39ea-4fde-aee8-ebd64cfa3793', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '10:30', '12:30', 'Sunday Morning Worship Celebration', 'English'),
  (2, '10:00', '11:00', 'Prayer', 'English'),
  (4, '19:00', '20:00', 'Amplify', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '58048784-39ea-4fde-aee8-ebd64cfa3793');

-- House of Freedom International Ministries
UPDATE "churches" SET "languages" = ARRAY['English', 'Spanish']::text[] WHERE "id" = '0aeea3d3-f7ef-420c-995c-6d247e1f2a5d' AND "languages" = ARRAY['English']::text[];
DELETE FROM "church_services" WHERE "churchId" = '0aeea3d3-f7ef-420c-995c-6d247e1f2a5d' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '0aeea3d3-f7ef-420c-995c-6d247e1f2a5d', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '10:00', NULL, 'Sunday Service', 'English'),
  (3, '19:00', NULL, 'Community Wednesday', 'English'),
  (3, '19:00', NULL, 'Youth Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '0aeea3d3-f7ef-420c-995c-6d247e1f2a5d');

-- Iglesia Bautista Monte de Las Olivas
UPDATE "churches" SET "pastorName" = 'Julio C. Ledesma' WHERE "id" = 'ca427787-9758-4450-8e98-e1e4587cbbda' AND "pastorName" IS NULL;
UPDATE "churches" SET "yearEstablished" = 1956 WHERE "id" = 'ca427787-9758-4450-8e98-e1e4587cbbda' AND "yearEstablished" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = 'ca427787-9758-4450-8e98-e1e4587cbbda' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'ca427787-9758-4450-8e98-e1e4587cbbda', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '10:00', NULL, 'Sunday School', 'Bilingual'),
  (0, '11:00', NULL, 'Worship Service', 'Bilingual'),
  (0, '18:00', NULL, 'Worship Service', 'Bilingual'),
  (2, '19:00', NULL, 'Teacher''s Meeting', 'Bilingual'),
  (3, '19:00', '20:00', 'Bible Study', 'Bilingual')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'ca427787-9758-4450-8e98-e1e4587cbbda');

-- Iglesia Cristiana Herederos del Reino
UPDATE "churches" SET "pastorName" = 'Francisco Baez' WHERE "id" = '91ae7ff1-8ed0-42fd-9d05-5268a15b9b48' AND "pastorName" IS NULL;
UPDATE "churches" SET "yearEstablished" = 2008 WHERE "id" = '91ae7ff1-8ed0-42fd-9d05-5268a15b9b48' AND "yearEstablished" IS NULL;
UPDATE "churches" SET "description" = 'Herederos Del Reino is a non-denominational ministry in San Antonio, TX that focuses on helping individuals build a relationship with Jesus. It was founded in 2008 by pastors Francisco and Sanjuana Baez and offers Spanish services along with new English services led by Pastors Samuel and Bianca Baez.' WHERE "id" = '91ae7ff1-8ed0-42fd-9d05-5268a15b9b48' AND "description" IS NULL;
UPDATE "churches" SET "goodForChildren" = true WHERE "id" = '91ae7ff1-8ed0-42fd-9d05-5268a15b9b48' AND "goodForChildren" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = '91ae7ff1-8ed0-42fd-9d05-5268a15b9b48' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '91ae7ff1-8ed0-42fd-9d05-5268a15b9b48', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '10:00', NULL, 'Service', 'Spanish')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '91ae7ff1-8ed0-42fd-9d05-5268a15b9b48');

-- Iglesia Cristiana La Mies
UPDATE "churches" SET "pastorName" = 'César Gálvez' WHERE "id" = '0447f238-4052-47f5-8b68-c97eec773bb5' AND "pastorName" IS NULL;
UPDATE "churches" SET "email" = 'webmaster@iglesialamies.org' WHERE "id" = '0447f238-4052-47f5-8b68-c97eec773bb5' AND "email" IS NULL;
UPDATE "churches" SET "yearEstablished" = 2014 WHERE "id" = '0447f238-4052-47f5-8b68-c97eec773bb5' AND "yearEstablished" IS NULL;
UPDATE "churches" SET "description" = 'Iglesia La Mies is a church in San Antonio, Texas, that began in 2013 as a family Bible study in the home of Pastors César and Fátima Gálvez and officially opened in 2014. Its vision is to be and make disciples of Jesus.' WHERE "id" = '0447f238-4052-47f5-8b68-c97eec773bb5' AND "description" IS NULL;
UPDATE "churches" SET "denomination" = 'Assemblies of God', "denominationFamily" = 'Pentecostal' WHERE "id" = '0447f238-4052-47f5-8b68-c97eec773bb5' AND "denomination" IS NULL AND "denominationFamily" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = '0447f238-4052-47f5-8b68-c97eec773bb5' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '0447f238-4052-47f5-8b68-c97eec773bb5', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '10:00', NULL, 'Service', 'Spanish'),
  (3, '19:30', NULL, 'Service', 'Spanish'),
  (5, '19:30', '21:00', 'Discipulado de Jóvenes', 'Spanish'),
  (5, '19:30', '21:00', 'Discipulado de Mujeres', 'Spanish'),
  (5, '19:30', '21:00', 'Discipulado de Varones', 'Spanish')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '0447f238-4052-47f5-8b68-c97eec773bb5');

-- Iglesia Cristiana Manantial de Fe
UPDATE "churches" SET "pastorName" = 'Zoilo Rafael Castaño' WHERE "id" = 'a9a182e3-0d92-495d-b9fd-342452e38bf9' AND "pastorName" IS NULL;
UPDATE "churches" SET "email" = 'zoilorafael@yahoo.com' WHERE "id" = 'a9a182e3-0d92-495d-b9fd-342452e38bf9' AND "email" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = 'a9a182e3-0d92-495d-b9fd-342452e38bf9' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'a9a182e3-0d92-495d-b9fd-342452e38bf9', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '11:30', NULL, 'Evangelical Service', 'Bilingual'),
  (3, '19:30', NULL, 'Bible Study', 'Bilingual'),
  (5, '19:30', NULL, 'Bible Study', 'Bilingual')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'a9a182e3-0d92-495d-b9fd-342452e38bf9');

-- Iglesia Cristiana Reparadores de Portillos
UPDATE "churches" SET "pastorName" = 'Wanda Sánchez' WHERE "id" = '36c1c1cb-0f6f-42eb-a03a-e3e93f3319ad' AND "pastorName" IS NULL;

-- Mighty Fortress Church
UPDATE "churches" SET "email" = 'info@mightyfortress.church' WHERE "id" = '1cb44d8e-7859-434b-9993-f6914efe53c6' AND "email" IS NULL;
UPDATE "churches" SET "yearEstablished" = 2000 WHERE "id" = '1cb44d8e-7859-434b-9993-f6914efe53c6' AND "yearEstablished" IS NULL;

-- New Life Christian Center
UPDATE "churches" SET "yearEstablished" = 1987 WHERE "id" = '48c67f75-909d-4431-af0a-18a374e8793d' AND "yearEstablished" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = '48c67f75-909d-4431-af0a-18a374e8793d' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '48c67f75-909d-4431-af0a-18a374e8793d', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '11:00', NULL, 'Service', 'English'),
  (3, '19:00', NULL, 'Bible Study', 'English'),
  (5, '19:00', NULL, 'Shabbat', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '48c67f75-909d-4431-af0a-18a374e8793d');

-- Our Lady of Good Counsel Church
UPDATE "churches" SET "email" = 'toni.ramirez@archsa.org' WHERE "id" = 'f2be5db1-cadb-4606-a1c2-ea7b4d6509c5' AND "email" IS NULL;

-- Philadelphia Seventh-day Adventist Church
UPDATE "churches" SET "email" = 'philadelphiasda.sa@gmail.com' WHERE "id" = 'a9241a29-d583-483d-823f-95898defcac1' AND "email" IS NULL;
UPDATE "churches" SET "description" = 'Philadelphia SDA Church in San Antonio, Texas is a Seventh-day Adventist congregation whose mission is to love God, love people, and serve the community by spreading fellowship, love, and unity. It offers Sabbath worship in person and online, along with ministries for children, youth, families, women, and music.' WHERE "id" = 'a9241a29-d583-483d-823f-95898defcac1' AND "description" IS NULL;
UPDATE "churches" SET "goodForChildren" = true WHERE "id" = 'a9241a29-d583-483d-823f-95898defcac1' AND "goodForChildren" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = 'a9241a29-d583-483d-823f-95898defcac1' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'a9241a29-d583-483d-823f-95898defcac1', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (6, '10:00', NULL, 'Sabbath School Bible Study', 'English'),
  (6, '11:00', NULL, 'Worship Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'a9241a29-d583-483d-823f-95898defcac1');

-- Rolling Oaks Baptist Church
UPDATE "churches" SET "email" = 'job_robc@sbcglobal.net' WHERE "id" = '659750df-ec44-4bf6-9de9-0da2892649d6' AND "email" IS NULL;

-- Saint Philip of Jesus Catholic Church
UPDATE "churches" SET "pastorName" = 'Godfrey Mwansa' WHERE "id" = 'aabf5f95-4761-4e6a-9e6c-a92b872a2966' AND "pastorName" IS NULL;
UPDATE "churches" SET "email" = 'parishinfo@saintphilipofjesus.org' WHERE "id" = 'aabf5f95-4761-4e6a-9e6c-a92b872a2966' AND "email" IS NULL;
UPDATE "churches" SET "yearEstablished" = 1914 WHERE "id" = 'aabf5f95-4761-4e6a-9e6c-a92b872a2966' AND "yearEstablished" IS NULL;
UPDATE "churches" SET "description" = 'St. Philip of Jesus was established as a parish in 1914 to serve the needs of Mexican American Catholics on the southside of San Antonio. The parish offers Masses in English and Spanish, faith formation, and ministries for service and community.' WHERE "id" = 'aabf5f95-4761-4e6a-9e6c-a92b872a2966' AND "description" IS NULL;
UPDATE "churches" SET "goodForChildren" = true WHERE "id" = 'aabf5f95-4761-4e6a-9e6c-a92b872a2966' AND "goodForChildren" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = 'aabf5f95-4761-4e6a-9e6c-a92b872a2966' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'aabf5f95-4761-4e6a-9e6c-a92b872a2966', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:30', NULL, 'Mass', 'Spanish'),
  (0, '11:30', NULL, 'Mass', 'English'),
  (3, '08:30', NULL, 'Mass', 'English'),
  (4, '18:00', NULL, 'Mass', 'English'),
  (4, '19:00', '21:00', 'Grupo de Oración', 'Spanish'),
  (5, '08:30', NULL, 'Mass', 'English'),
  (6, '17:00', NULL, 'Mass', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'aabf5f95-4761-4e6a-9e6c-a92b872a2966');

-- Salvation Army Mission Corps
UPDATE "churches" SET "yearEstablished" = 1865 WHERE "id" = '2cc2bec9-6f34-408d-9042-d9fa1d99fa7a' AND "yearEstablished" IS NULL;
UPDATE "churches" SET "goodForChildren" = true WHERE "id" = '2cc2bec9-6f34-408d-9042-d9fa1d99fa7a' AND "goodForChildren" IS NULL;

-- Schoenstatt Movement of San Antonio
UPDATE "churches" SET "languages" = ARRAY['English', 'Spanish']::text[] WHERE "id" = '2eefd611-9377-4fae-8603-b38899b743d5' AND "languages" = ARRAY['English']::text[];

-- Shenandoah Community of Christ
UPDATE "churches" SET "pastorName" = 'Richard Cole' WHERE "id" = 'd5858f5d-a973-49c1-ac53-677c0d866639' AND "pastorName" IS NULL;
UPDATE "churches" SET "email" = 'cofchrist.sa@gmail.com' WHERE "id" = 'd5858f5d-a973-49c1-ac53-677c0d866639' AND "email" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = 'd5858f5d-a973-49c1-ac53-677c0d866639' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'd5858f5d-a973-49c1-ac53-677c0d866639', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '10:00', NULL, 'Children''s Church School', 'English'),
  (0, '11:00', NULL, 'Sunday Worship', 'English'),
  (1, '07:00', NULL, 'Coffee Chat', 'English'),
  (1, '19:00', NULL, 'Adult Bible Class', 'English'),
  (2, '18:30', NULL, 'Adult Theology Class', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'd5858f5d-a973-49c1-ac53-677c0d866639');

-- St Paul Baptist Church
UPDATE "churches" SET "email" = 'derichawkins@gmail.com' WHERE "id" = '5b7187ee-9ea5-42ee-9271-0459803970b2' AND "email" IS NULL;

-- St. Anthony's Knanaya Catholic Church
UPDATE "churches" SET "pastorName" = 'Binoy Naramangalathu' WHERE "id" = '0463f326-d0c7-4b57-9898-b51028884f84' AND "pastorName" IS NULL;
UPDATE "churches" SET "email" = 'nkbinoy@gmail.com' WHERE "id" = '0463f326-d0c7-4b57-9898-b51028884f84' AND "email" IS NULL;
UPDATE "churches" SET "yearEstablished" = 2009 WHERE "id" = '0463f326-d0c7-4b57-9898-b51028884f84' AND "yearEstablished" IS NULL;
UPDATE "churches" SET "goodForChildren" = true WHERE "id" = '0463f326-d0c7-4b57-9898-b51028884f84' AND "goodForChildren" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = '0463f326-d0c7-4b57-9898-b51028884f84' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '0463f326-d0c7-4b57-9898-b51028884f84', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '10:30', NULL, 'Mass', 'English'),
  (1, '19:45', NULL, 'Mass', 'English'),
  (2, '19:45', NULL, 'Mass', 'English'),
  (3, '19:45', NULL, 'Mass', 'English'),
  (4, '19:45', NULL, 'Mass', 'English'),
  (5, '19:45', NULL, 'Mass', 'English'),
  (6, '19:45', NULL, 'Mass', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '0463f326-d0c7-4b57-9898-b51028884f84');

-- St. John the Evangelist Catholic Church
UPDATE "churches" SET "email" = 'st-john@sbcglobal.net' WHERE "id" = 'eee31aef-9d74-46e3-9e06-9bbd317da32d' AND "email" IS NULL;

-- St. Joseph Capuchin Friary
UPDATE "churches" SET "email" = 'contact@capuchins.org' WHERE "id" = 'd86d04dd-7e69-4b87-b7e5-da40b70c639b' AND "email" IS NULL;

-- St. Mary’s Indian Orthodox Church
UPDATE "churches" SET "pastorName" = 'Bijoy Sakariah' WHERE "id" = '27b572bc-8f27-4e8d-b1fd-4629827cdb8b' AND "pastorName" IS NULL;
UPDATE "churches" SET "email" = 'tpooovathoor@gmail.com' WHERE "id" = '27b572bc-8f27-4e8d-b1fd-4629827cdb8b' AND "email" IS NULL;
UPDATE "churches" SET "yearEstablished" = 2010 WHERE "id" = '27b572bc-8f27-4e8d-b1fd-4629827cdb8b' AND "yearEstablished" IS NULL;
UPDATE "churches" SET "description" = 'St. Mary''s Indian Orthodox Church is a parish of the Diocese of South-West America of the Malankara Orthodox Syrian Church, rooted in ancient Christian traditions dating back to the Apostle St. Thomas. Established in 2010 as a small chapel, it became a full parish in 2011 and holds worship in the liturgical tradition of the Malankara Orthodox Church.' WHERE "id" = '27b572bc-8f27-4e8d-b1fd-4629827cdb8b' AND "description" IS NULL;
UPDATE "churches" SET "languages" = ARRAY['English', 'Malayalam']::text[] WHERE "id" = '27b572bc-8f27-4e8d-b1fd-4629827cdb8b' AND "languages" = ARRAY['English']::text[];
DELETE FROM "church_services" WHERE "churchId" = '27b572bc-8f27-4e8d-b1fd-4629827cdb8b' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '27b572bc-8f27-4e8d-b1fd-4629827cdb8b', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '08:30', NULL, 'Holy Qurbana', 'Bilingual')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '27b572bc-8f27-4e8d-b1fd-4629827cdb8b');

-- Sts. Joachim and Anna Orthodox Church
UPDATE "churches" SET "pastorName" = 'Christopher Allen' WHERE "id" = 'd4174f30-8efe-4070-91bc-76202da2f5c1' AND "pastorName" IS NULL;
UPDATE "churches" SET "email" = 'info@stsjoachimandannaorthodox.org' WHERE "id" = 'd4174f30-8efe-4070-91bc-76202da2f5c1' AND "email" IS NULL;
UPDATE "churches" SET "yearEstablished" = 2012 WHERE "id" = 'd4174f30-8efe-4070-91bc-76202da2f5c1' AND "yearEstablished" IS NULL;
UPDATE "churches" SET "description" = 'Sts. Joachim and Anna is a growing ROCOR Orthodox parish in San Antonio, Texas, founded as a mission in 2012 under the Diocese of Chicago and Mid-America. The parish welcomes visitors and those looking for an Orthodox church home.' WHERE "id" = 'd4174f30-8efe-4070-91bc-76202da2f5c1' AND "description" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = 'd4174f30-8efe-4070-91bc-76202da2f5c1' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'd4174f30-8efe-4070-91bc-76202da2f5c1', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:15', NULL, '3rd and 6th Hours', 'English'),
  (0, '09:30', NULL, 'Divine Liturgy', 'English'),
  (6, '17:00', NULL, '9th Hour and Great Vespers', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'd4174f30-8efe-4070-91bc-76202da2f5c1');

-- The Church of Jesus Christ of Latter-day Saints
UPDATE "churches" SET "languages" = ARRAY['English', 'Spanish']::text[] WHERE "id" = '126397a8-cb7f-438e-8af1-11639f7107a0' AND "languages" = ARRAY['English']::text[];
DELETE FROM "church_services" WHERE "churchId" = '126397a8-cb7f-438e-8af1-11639f7107a0' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '126397a8-cb7f-438e-8af1-11639f7107a0', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:00', NULL, 'Worship Service', 'Spanish'),
  (0, '12:00', NULL, 'Worship Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '126397a8-cb7f-438e-8af1-11639f7107a0');

-- The Church of Jesus Christ of Latter-day Saints
DELETE FROM "church_services" WHERE "churchId" = 'b385ae40-03e4-4065-af42-ecb05c5148bb' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'b385ae40-03e4-4065-af42-ecb05c5148bb', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:00', NULL, 'Worship Service', 'English'),
  (0, '11:30', NULL, 'Worship Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'b385ae40-03e4-4065-af42-ecb05c5148bb');

-- The Church of Jesus Christ of Latter-day Saints
DELETE FROM "church_services" WHERE "churchId" = '423ebe0c-4458-4bbf-851a-53c5e97ccfb8' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '423ebe0c-4458-4bbf-851a-53c5e97ccfb8', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:00', NULL, 'Worship Service', 'English'),
  (0, '10:30', NULL, 'Worship Service', 'English'),
  (0, '12:00', NULL, 'Worship Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '423ebe0c-4458-4bbf-851a-53c5e97ccfb8');

-- The Church of Jesus Christ of Latter-day Saints
UPDATE "churches" SET "languages" = ARRAY['English', 'Spanish']::text[] WHERE "id" = '1d686fb7-a08e-444d-a359-44cc41c248a5' AND "languages" = ARRAY['English']::text[];
DELETE FROM "church_services" WHERE "churchId" = '1d686fb7-a08e-444d-a359-44cc41c248a5' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '1d686fb7-a08e-444d-a359-44cc41c248a5', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:00', NULL, 'Worship Service', 'English'),
  (0, '10:30', NULL, 'Worship Service', 'English'),
  (0, '12:00', NULL, 'Worship Service', 'English'),
  (0, '13:30', NULL, 'Worship Service', 'Spanish')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '1d686fb7-a08e-444d-a359-44cc41c248a5');

-- The Church of Jesus Christ of Latter-day Saints
UPDATE "churches" SET "languages" = ARRAY['English', 'Spanish']::text[] WHERE "id" = '56a932a3-dd57-4fea-96d6-4d38d48f8e00' AND "languages" = ARRAY['English']::text[];
DELETE FROM "church_services" WHERE "churchId" = '56a932a3-dd57-4fea-96d6-4d38d48f8e00' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '56a932a3-dd57-4fea-96d6-4d38d48f8e00', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:00', NULL, 'Worship Service', 'English'),
  (0, '10:30', NULL, 'Worship Service', 'Spanish'),
  (0, '12:00', NULL, 'Worship Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '56a932a3-dd57-4fea-96d6-4d38d48f8e00');

-- The Church of Jesus Christ of Latter-day Saints
DELETE FROM "church_services" WHERE "churchId" = '8e465cab-27ba-498e-87e6-abda8d26448b' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '8e465cab-27ba-498e-87e6-abda8d26448b', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:00', NULL, 'Worship Service', 'English'),
  (0, '10:30', NULL, 'Worship Service', 'English'),
  (0, '12:00', NULL, 'Worship Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '8e465cab-27ba-498e-87e6-abda8d26448b');

-- The Church of Jesus Christ of Latter-day Saints
DELETE FROM "church_services" WHERE "churchId" = '4ad3e345-fb2d-4b1f-a98b-c534633375e0' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '4ad3e345-fb2d-4b1f-a98b-c534633375e0', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:00', NULL, '1st Worship Service', 'English'),
  (0, '10:30', NULL, '2nd Worship Service', 'English'),
  (0, '12:00', NULL, '3rd Worship Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '4ad3e345-fb2d-4b1f-a98b-c534633375e0');

-- The Church of Jesus Christ of Latter-day Saints
DELETE FROM "church_services" WHERE "churchId" = '1882a689-cf3f-4a18-b3a4-5d02d6b83d12' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '1882a689-cf3f-4a18-b3a4-5d02d6b83d12', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:00', NULL, 'Worship Service', 'English'),
  (0, '10:30', NULL, 'Worship Service', 'English'),
  (0, '12:00', NULL, 'Worship Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '1882a689-cf3f-4a18-b3a4-5d02d6b83d12');

-- The Church of Jesus Christ of Latter-day Saints
DELETE FROM "church_services" WHERE "churchId" = 'a8605e03-3b53-443a-aeba-1715eaaa29f5' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'a8605e03-3b53-443a-aeba-1715eaaa29f5', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:00', NULL, 'Worship Service', 'English'),
  (0, '10:30', NULL, 'Worship Service', 'English'),
  (0, '12:00', NULL, 'Worship Service', 'English'),
  (0, '13:30', NULL, 'Worship Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'a8605e03-3b53-443a-aeba-1715eaaa29f5');

-- The Church of Jesus Christ of Latter-day Saints
UPDATE "churches" SET "languages" = ARRAY['English', 'Spanish']::text[] WHERE "id" = '7a42a354-6952-483c-acab-d2234e4ba3e4' AND "languages" = ARRAY['English']::text[];
DELETE FROM "church_services" WHERE "churchId" = '7a42a354-6952-483c-acab-d2234e4ba3e4' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '7a42a354-6952-483c-acab-d2234e4ba3e4', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:00', NULL, 'Worship Service', 'English'),
  (0, '10:30', NULL, 'Worship Service', 'Spanish'),
  (0, '12:00', NULL, 'Worship Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '7a42a354-6952-483c-acab-d2234e4ba3e4');

-- The Church of Jesus Christ of Latter-day Saints
DELETE FROM "church_services" WHERE "churchId" = 'af286d68-45ad-4971-9515-b432d5b617a2' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'af286d68-45ad-4971-9515-b432d5b617a2', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:00', NULL, 'Worship Service', 'English'),
  (0, '10:30', NULL, 'Worship Service', 'English'),
  (0, '12:00', NULL, 'Worship Service', 'English'),
  (0, '13:30', NULL, 'Worship Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'af286d68-45ad-4971-9515-b432d5b617a2');

-- The Church of Jesus Christ of Latter-day Saints
DELETE FROM "church_services" WHERE "churchId" = '152cc668-778c-4fea-a5d2-0490c79bec1d' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '152cc668-778c-4fea-a5d2-0490c79bec1d', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:00', NULL, 'Worship Service', 'English'),
  (0, '11:30', NULL, 'Worship Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '152cc668-778c-4fea-a5d2-0490c79bec1d');

-- The Church of Jesus Christ of Latter-day Saints
UPDATE "churches" SET "languages" = ARRAY['English', 'Spanish']::text[] WHERE "id" = '12da8d9e-f938-42e7-b130-0e9a6f59f363' AND "languages" = ARRAY['English']::text[];
DELETE FROM "church_services" WHERE "churchId" = '12da8d9e-f938-42e7-b130-0e9a6f59f363' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '12da8d9e-f938-42e7-b130-0e9a6f59f363', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:00', NULL, 'Worship Service', 'English'),
  (0, '10:30', NULL, 'Worship Service', 'Spanish'),
  (0, '12:00', NULL, 'Worship Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '12da8d9e-f938-42e7-b130-0e9a6f59f363');

-- The Church of Jesus Christ of Latter-day Saints
UPDATE "churches" SET "languages" = ARRAY['English', 'Spanish']::text[] WHERE "id" = '2bbe8318-1443-45a5-92fd-d5357df9106b' AND "languages" = ARRAY['English']::text[];
DELETE FROM "church_services" WHERE "churchId" = '2bbe8318-1443-45a5-92fd-d5357df9106b' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '2bbe8318-1443-45a5-92fd-d5357df9106b', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:00', NULL, 'Worship Service', 'Spanish'),
  (0, '10:30', NULL, 'Worship Service', 'English'),
  (0, '12:00', NULL, 'Worship Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '2bbe8318-1443-45a5-92fd-d5357df9106b');

-- The Church of Jesus Christ of Latter-day Saints
DELETE FROM "church_services" WHERE "churchId" = 'a3cd1c99-acfc-4634-a374-fc0c4c1cf5bc' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'a3cd1c99-acfc-4634-a374-fc0c4c1cf5bc', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:00', NULL, 'Worship Service', 'English'),
  (0, '10:30', NULL, 'Worship Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'a3cd1c99-acfc-4634-a374-fc0c4c1cf5bc');

-- The Door Christian Fellowship San Antonio
UPDATE "churches" SET "pastorName" = 'Richard Rubi' WHERE "id" = 'c8fd182c-a2a6-45fe-8d82-a0cab53ceb24' AND "pastorName" IS NULL;
UPDATE "churches" SET "yearEstablished" = 1983 WHERE "id" = 'c8fd182c-a2a6-45fe-8d82-a0cab53ceb24' AND "yearEstablished" IS NULL;
UPDATE "churches" SET "goodForGroups" = true WHERE "id" = 'c8fd182c-a2a6-45fe-8d82-a0cab53ceb24' AND "goodForGroups" IS NULL;
UPDATE "churches" SET "languages" = ARRAY['English', 'Spanish']::text[] WHERE "id" = 'c8fd182c-a2a6-45fe-8d82-a0cab53ceb24' AND "languages" = ARRAY['English']::text[];
DELETE FROM "church_services" WHERE "churchId" = 'c8fd182c-a2a6-45fe-8d82-a0cab53ceb24' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'c8fd182c-a2a6-45fe-8d82-a0cab53ceb24', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '11:00', NULL, 'Service', 'English'),
  (0, '19:00', NULL, 'Service', 'English'),
  (3, '19:30', NULL, 'Service', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = 'c8fd182c-a2a6-45fe-8d82-a0cab53ceb24');

-- The Potters House Christian Church
UPDATE "churches" SET "pastorName" = 'TJ Morales' WHERE "id" = 'b6e5f6a2-30e7-4452-b10e-a608e8ebbdb4' AND "pastorName" IS NULL;

-- Travis Park United Methodist Church
UPDATE "churches" SET "pastorName" = 'Cynthia Engstrom' WHERE "id" = '48c2f681-4448-46c0-94ce-d33f62121fbe' AND "pastorName" IS NULL;
UPDATE "churches" SET "email" = 'info@travispark.org' WHERE "id" = '48c2f681-4448-46c0-94ce-d33f62121fbe' AND "email" IS NULL;
UPDATE "churches" SET "yearEstablished" = 1846 WHERE "id" = '48c2f681-4448-46c0-94ce-d33f62121fbe' AND "yearEstablished" IS NULL;
DELETE FROM "church_services" WHERE "churchId" = '48c2f681-4448-46c0-94ce-d33f62121fbe' AND "isAutoImported" = true;
INSERT INTO "church_services" ("id", "churchId", "dayOfWeek", "startTime", "endTime", "serviceType", "language", "isAutoImported", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '48c2f681-4448-46c0-94ce-d33f62121fbe', v.d, v.s, v.e, v.t, v.l, true, now(), now()
FROM (VALUES
  (0, '09:45', '11:00', 'Worship', 'English')
) AS v(d, s, e, t, l)
WHERE EXISTS (SELECT 1 FROM "churches" WHERE "id" = '48c2f681-4448-46c0-94ce-d33f62121fbe');

-- True Believer's Praise & Worship Sanctuary
UPDATE "churches" SET "email" = 'tbpwschurch@gmail.com' WHERE "id" = '791f9512-646d-49ad-9efc-4cf8e3ac1e96' AND "email" IS NULL;

-- United For Christ Fellowship
UPDATE "churches" SET "email" = 'ufcfchurch@gmail.com' WHERE "id" = 'f97d632a-37b6-43ad-ac7d-94b6e6fe3ae8' AND "email" IS NULL;
