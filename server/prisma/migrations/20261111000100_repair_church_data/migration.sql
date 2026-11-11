-- Data repair for the production church catalogue, generated from an audit
-- of all 955 live listings on 2026-11-11 using the enrich-details modules
-- (denomination-classifier, listing-quality, neighborhood-mapper,
-- service-cleaner). The same repairs are reproduced by:
--   npm run enrich:church-details -- --reclassify-denominations --remap-neighborhoods
--
-- What it fixes:
--   1. 51 listings that are not places of worship (parish offices, schools,
--      cemeteries, food pantries, gyms) or are duplicates → hidden.
--   2. 225 wrong or missing denominations. An old classifier rule labelled
--      every "... San Antonio" church as Catholic (e.g. First Baptist Church
--      of San Antonio); those are corrected, or cleared where unknown.
--   3. 446 neighborhood labels (wrong zip mapping, suburbs, duplicate spellings).
--   4. 75 churches listed as offering Spanish only because "San Antonio" is
--      in their name.
--   5. 835 "service times" at 107 churches that are really office hours
--      or other import artifacts.
--
-- Safe to run anywhere: every statement targets rows by id, and updates are
-- guarded by the audited value, so rows edited since the audit — and
-- databases that do not hold these rows — are left untouched.

-- ── 1. Hide listings that are not places of worship, and duplicates ──
UPDATE "churches" SET "isHidden" = true, "hiddenReason" = 'school' WHERE "id" = 'd165c948-1bdc-4f5c-8bb0-5b854f30ac44'; -- Blue Roof School
UPDATE "churches" SET "isHidden" = true, "hiddenReason" = 'not_a_congregation' WHERE "id" = 'b4095d6c-5eb4-4ff1-a6a6-68f1c3f9380a'; -- Bythel Hagee Life Center
UPDATE "churches" SET "isHidden" = true, "hiddenReason" = 'charity' WHERE "id" = 'a020a784-91f8-494a-b870-a50961db596d'; -- Christian Assistance Ministry
UPDATE "churches" SET "isHidden" = true, "hiddenReason" = 'facility' WHERE "id" = '030ec39c-de7e-48f3-ac90-f023053635dc'; -- Coker Scout Lodge
UPDATE "churches" SET "isHidden" = true, "hiddenReason" = 'not_a_congregation' WHERE "id" = 'f2775b50-1071-4c32-a74e-58f6fe11709d'; -- Concordia’s Best Practices
UPDATE "churches" SET "isHidden" = true, "hiddenReason" = 'not_a_congregation' WHERE "id" = '0fe40348-038b-4489-9b1f-52066d4f2b7d'; -- CRC
UPDATE "churches" SET "isHidden" = true, "hiddenReason" = 'facility' WHERE "id" = '17f2adcd-5c18-4ef3-853b-633b1144859e'; -- CYO Gym St. Mark the Evangelist
UPDATE "churches" SET "isHidden" = true, "hiddenReason" = 'cemetery' WHERE "id" = '1d8e26b1-bf10-454c-9850-ba46f9aad814'; -- El Carmen Cemetery
UPDATE "churches" SET "isHidden" = true, "hiddenReason" = 'office' WHERE "id" = 'd2bd5cbe-b60e-466d-ab0f-b31bd4ffcc8a'; -- Episcopal Diocese-West Texas
UPDATE "churches" SET "isHidden" = true, "hiddenReason" = 'duplicate' WHERE "id" = 'ead7b9f3-9b4d-4c0d-b19a-ffface1fda3b'; -- First Korean Presbyterian Church
UPDATE "churches" SET "isHidden" = true, "hiddenReason" = 'not_a_congregation' WHERE "id" = '40681ff4-b6e7-4352-8e6b-fac51f9b408c'; -- Fuse Student Ministries
UPDATE "churches" SET "isHidden" = true, "hiddenReason" = 'charity' WHERE "id" = '5425156c-e1e7-43f3-bcd3-1453539ce138'; -- Gardendale Community Dev Center
UPDATE "churches" SET "isHidden" = true, "hiddenReason" = 'duplicate' WHERE "id" = 'a95887a4-b378-4dec-8167-55c9b7d06b1c'; -- Gateway Chapel
UPDATE "churches" SET "isHidden" = true, "hiddenReason" = 'facility' WHERE "id" = 'd4e8a525-c698-4921-8cf2-a42dbbe1a2f7'; -- Henke Hall
UPDATE "churches" SET "isHidden" = true, "hiddenReason" = 'not_a_congregation' WHERE "id" = 'b30fbe98-380d-4899-bc24-97caaeed37d4'; -- Hesch Family Ministry
UPDATE "churches" SET "isHidden" = true, "hiddenReason" = 'residence' WHERE "id" = '49b79482-64e6-4b2a-88fd-b5d381e4b07b'; -- Holy Rosary Convent
UPDATE "churches" SET "isHidden" = true, "hiddenReason" = 'school' WHERE "id" = '5f87b2a5-eec2-46e6-89d9-35543ff1b852'; -- Holy Spirit Catholic School
UPDATE "churches" SET "isHidden" = true, "hiddenReason" = 'facility' WHERE "id" = '812834cb-cb46-4b7d-9024-cabd2a214dad'; -- Korean American Cultural Center of San Antonio
UPDATE "churches" SET "isHidden" = true, "hiddenReason" = 'not_a_congregation' WHERE "id" = '1d80a128-1650-415c-9648-42f5d127eaf9'; -- La Casa Bonita
UPDATE "churches" SET "isHidden" = true, "hiddenReason" = 'manual' WHERE "id" = 'f10c2649-cf74-4b08-99a9-318ed5649f8f'; -- Lake fork Baptist church
UPDATE "churches" SET "isHidden" = true, "hiddenReason" = 'charity' WHERE "id" = '9bc5dae7-e73b-4bb8-bb67-fba0b46f4ae1'; -- Last Chance Ministries - Food Distribution Center
UPDATE "churches" SET "isHidden" = true, "hiddenReason" = 'not_a_congregation' WHERE "id" = 'bb418d10-0a6d-422b-ac35-20b81eafe00c'; -- Latinas woman of faith
UPDATE "churches" SET "isHidden" = true, "hiddenReason" = 'charity' WHERE "id" = 'defda871-dee1-4f97-8925-20a2ef4946d1'; -- Methodist Healthcare Ministries (fitch)
UPDATE "churches" SET "isHidden" = true, "hiddenReason" = 'not_a_congregation' WHERE "id" = 'd503c9a7-e0fb-4cd8-8bd7-f0fdf975ff8b'; -- Mission
UPDATE "churches" SET "isHidden" = true, "hiddenReason" = 'office' WHERE "id" = '3b91a4f9-4d51-48f8-815a-347931a3c117'; -- Mission San Jose Church Parish Offices
UPDATE "churches" SET "isHidden" = true, "hiddenReason" = 'office' WHERE "id" = 'f9a6e23d-77a0-4ae8-8b66-78556dc25e39'; -- National Church Corporation Office
UPDATE "churches" SET "isHidden" = true, "hiddenReason" = 'charity' WHERE "id" = 'd13354af-4aa3-4ed6-8336-5f94231f794d'; -- Northern Hills Community Ministry Food Pantry
UPDATE "churches" SET "isHidden" = true, "hiddenReason" = 'business' WHERE "id" = '3043ebaf-c752-4c9f-bc80-736fad69f2c7'; -- O Z Monuments
UPDATE "churches" SET "isHidden" = true, "hiddenReason" = 'residence' WHERE "id" = 'a41888c4-0eee-4cdf-bad0-6774425d5a2e'; -- Oblate Madonna Residence
UPDATE "churches" SET "isHidden" = true, "hiddenReason" = 'facility' WHERE "id" = '5e937258-4179-4d7f-a790-bdf7d1e4a5e9'; -- Redland Oaks Pavillion
UPDATE "churches" SET "isHidden" = true, "hiddenReason" = 'not_a_congregation' WHERE "id" = '0c23e9fb-d176-4d84-8dce-107cede31cdb'; -- Rua jacinto pinto
UPDATE "churches" SET "isHidden" = true, "hiddenReason" = 'not_a_congregation' WHERE "id" = 'aebf2053-5eb3-4598-b641-c76d4a62d17e'; -- S3
UPDATE "churches" SET "isHidden" = true, "hiddenReason" = 'facility' WHERE "id" = '6abac489-f9c4-4a6c-ab27-5588797a1a5d'; -- San Damiano Bldg
UPDATE "churches" SET "isHidden" = true, "hiddenReason" = 'facility' WHERE "id" = 'bcc60638-bd92-45f6-90fe-679b1b477550'; -- Scottish Rite Cathedral (San Antonio, Texas)
UPDATE "churches" SET "isHidden" = true, "hiddenReason" = 'office' WHERE "id" = '9d9273b9-ddae-41b3-8eb0-45234adc3483'; -- Shearer Hills Baptist Church Office
UPDATE "churches" SET "isHidden" = true, "hiddenReason" = 'school' WHERE "id" = '99427dcf-c9e4-46b0-a4bc-533204ffef54'; -- Shearer Hills Early Learning Center
UPDATE "churches" SET "isHidden" = true, "hiddenReason" = 'office' WHERE "id" = 'f8faad5f-e336-4971-95b6-a96e5b4720dc'; -- St Pius X Parish Office
UPDATE "churches" SET "isHidden" = true, "hiddenReason" = 'school' WHERE "id" = 'cd1d3561-91f9-42d8-a125-f64a96637bef'; -- St. George Episcopal School
UPDATE "churches" SET "isHidden" = true, "hiddenReason" = 'facility' WHERE "id" = '34fac1cf-3289-448d-8def-26fea404f00d'; -- St. Mark the Evangelist West Campus Entrance
UPDATE "churches" SET "isHidden" = true, "hiddenReason" = 'facility' WHERE "id" = '453d3635-c9d5-4f6f-89f7-8b0960d3edd7'; -- St. Mark's Catholic Main Gym
UPDATE "churches" SET "isHidden" = true, "hiddenReason" = 'school' WHERE "id" = '7408e022-bae4-4efc-a3ea-c57ea08e6a68'; -- St. Matthew's UMC Day School
UPDATE "churches" SET "isHidden" = true, "hiddenReason" = 'school' WHERE "id" = 'c30ad5d2-1c70-4227-bb93-ae4d3bcd7f0f'; -- St. Paul's Episcopal Montessori School
UPDATE "churches" SET "isHidden" = true, "hiddenReason" = 'charity' WHERE "id" = '7f9ab24a-e56f-41cd-8563-1c446c739c42'; -- St. Vincent de Paul Food Pantry
UPDATE "churches" SET "isHidden" = true, "hiddenReason" = 'charity' WHERE "id" = 'ce32dec1-7064-4123-9aeb-6db375410427'; -- St. Vincent De Paul Ministry
UPDATE "churches" SET "isHidden" = true, "hiddenReason" = 'charity' WHERE "id" = '070c51b5-80e0-44d8-9ecc-69ac7fed108b'; -- St. Vincent de Paul Society
UPDATE "churches" SET "isHidden" = true, "hiddenReason" = 'charity' WHERE "id" = 'fca89c6b-80d8-4378-b806-cc92e409c084'; -- St. Vincent de Paul Society - El Carmen
UPDATE "churches" SET "isHidden" = true, "hiddenReason" = 'office' WHERE "id" = 'f68aab09-9d8d-4c0f-a36b-d4cd5c0fad89'; -- Texas San Antonio Mission Office
UPDATE "churches" SET "isHidden" = true, "hiddenReason" = 'not_a_congregation' WHERE "id" = '5ff01562-835a-43ef-a846-e675eaed9671'; -- TRU2dagaM3
UPDATE "churches" SET "isHidden" = true, "hiddenReason" = 'not_a_congregation' WHERE "id" = '44b321f6-aa5c-44ff-9d34-3ec5917c6353'; -- Villa Coronado
UPDATE "churches" SET "isHidden" = true, "hiddenReason" = 'not_a_congregation' WHERE "id" = '5e6c0e35-3d3f-4018-a77f-eac7cf5a4b5d'; -- W.W.white road
UPDATE "churches" SET "isHidden" = true, "hiddenReason" = 'not_a_congregation' WHERE "id" = '2e842a00-ed57-4263-b36d-cec4a7fd4e1d'; -- Weekly Bible Study

-- ── 2. Denominations: re-derived; each UPDATE applies only if the row still holds the value it had when audited ──
UPDATE "churches" SET "denomination" = 'Apostolic Assembly', "denominationFamily" = 'Pentecostal' WHERE "id" = 'bed37fd5-c01d-45a3-a1af-57a10d870505' AND "denomination" IS NULL AND "denominationFamily" IS NULL; -- 2a Iglesia Apostolica de la Fe en Cristo Jesus
UPDATE "churches" SET "denomination" = 'Apostolic Assembly', "denominationFamily" = 'Pentecostal' WHERE "id" = 'b026afbc-4c1c-4ec8-8340-e7fed7183afc' AND "denomination" = 'Catholic' AND "denominationFamily" = 'Catholic'; -- 3ra IAFCJ San Antonio, Tx
UPDATE "churches" SET "denomination" = 'United Methodist', "denominationFamily" = 'Methodist' WHERE "id" = 'c76f0765-c433-4c67-915c-421b827a6e37' AND "denomination" = 'Methodist' AND "denominationFamily" = 'Methodist'; -- Alamo Heights United Methodist Church
UPDATE "churches" SET "denomination" = 'United Methodist', "denominationFamily" = 'Methodist' WHERE "id" = '53f40746-25e3-4cbb-bfc5-a95051c22dd4' AND "denomination" = 'Methodist' AND "denominationFamily" = 'Methodist'; -- Alamo United Methodist Church
UPDATE "churches" SET "denomination" = 'Assemblies of God', "denominationFamily" = 'Pentecostal' WHERE "id" = '6899702f-66a2-4c9f-b1a4-003ebdeeee18' AND "denomination" IS NULL AND "denominationFamily" IS NULL; -- Alfa y Omega Asamblea De Dios
UPDATE "churches" SET "denomination" = NULL, "denominationFamily" = NULL WHERE "id" = '853b5c8f-ae91-4df9-9427-946a49b6d9b3' AND "denomination" = 'Catholic' AND "denominationFamily" = 'Catholic'; -- All Nations Church - San Antonio
UPDATE "churches" SET "denomination" = 'Catholic', "denominationFamily" = 'Catholic' WHERE "id" = 'dd376ece-94cb-4d29-a7d1-a848feebb392' AND "denomination" IS NULL AND "denominationFamily" IS NULL; -- Annunciation of Mary
UPDATE "churches" SET "denomination" = 'Baptist', "denominationFamily" = 'Baptist' WHERE "id" = '4b4ba42c-d5ce-4930-94ca-7038a50b5a9a' AND "denomination" = 'Catholic' AND "denominationFamily" = 'Catholic'; -- ARABIC BAPTIST CHURCH OF SAN ANTONIO
UPDATE "churches" SET "denomination" = 'Catholic', "denominationFamily" = 'Catholic' WHERE "id" = '6e300d60-bab3-4c2f-a8ed-9506d1494b9d' AND "denomination" = 'Roman Catholic' AND "denominationFamily" = 'Catholic'; -- Assumption Chapel
UPDATE "churches" SET "denomination" = 'Messianic Jewish', "denominationFamily" = 'Other' WHERE "id" = '3ab43eae-26ab-4868-b024-47be4af969e4' AND "denomination" = 'Messianic Jewish' AND "denominationFamily" IS NULL; -- Baruch Hashem Congregation
UPDATE "churches" SET "denomination" = 'Catholic', "denominationFamily" = 'Catholic' WHERE "id" = '4d4ddfbb-b4f1-476f-856f-d2bcee72e5a4' AND "denomination" IS NULL AND "denominationFamily" IS NULL; -- Basilica of the National Shrine of the Little Flower
UPDATE "churches" SET "denomination" = 'United Methodist', "denominationFamily" = 'Methodist' WHERE "id" = 'a9e5f6f9-1c3b-4ba9-95e5-f9bfc33c9310' AND "denomination" = 'Methodist' AND "denominationFamily" = 'Methodist'; -- Bethany United Methodist Church
UPDATE "churches" SET "denomination" = 'Assemblies of God', "denominationFamily" = 'Pentecostal' WHERE "id" = '9cfbaf96-be0b-4be7-a028-f1d07d96fb37' AND "denomination" = 'Evangelical Covenant' AND "denominationFamily" = 'Evangelical'; -- Bethel Covenant AG
UPDATE "churches" SET "denomination" = 'United Methodist', "denominationFamily" = 'Methodist' WHERE "id" = '30c97732-812e-4c19-9bc5-6ed4b6e5a73f' AND "denomination" = 'Methodist' AND "denominationFamily" = 'Methodist'; -- Bethel United Methodist Church
UPDATE "churches" SET "denomination" = NULL, "denominationFamily" = NULL WHERE "id" = '1c0adaf3-b4b3-41a5-991d-9bbd76642cdf' AND "denomination" = 'Catholic' AND "denominationFamily" = 'Catholic'; -- Born Again Ministries of San Antonio
UPDATE "churches" SET "denomination" = 'Calvary Chapel', "denominationFamily" = 'Non-denominational' WHERE "id" = '6b397e1d-2914-48d7-9aa2-29a53437468f' AND "denomination" = 'Catholic' AND "denominationFamily" = 'Catholic'; -- Calvary Chapel of San Antonio
UPDATE "churches" SET "denomination" = NULL, "denominationFamily" = NULL WHERE "id" = '0e847bec-2d1c-4367-a1b3-1049df31b5bf' AND "denomination" = 'Catholic' AND "denominationFamily" = 'Catholic'; -- Calvary New Life San Antonio
UPDATE "churches" SET "denomination" = NULL, "denominationFamily" = NULL WHERE "id" = '6ee7d9bd-f433-4008-9c87-9a29f80ece8b' AND "denomination" = 'Catholic' AND "denominationFamily" = 'Catholic'; -- Casa de Oración San Antonio
UPDATE "churches" SET "denomination" = NULL, "denominationFamily" = NULL WHERE "id" = '49f641db-ba54-4f4f-90d6-c1ec02263c33' AND "denomination" = 'Catholic' AND "denominationFamily" = 'Catholic'; -- Cathedral of Faith
UPDATE "churches" SET "denomination" = 'Celestial Church of Christ', "denominationFamily" = 'Other' WHERE "id" = '486f46c9-0b6b-495a-bdf1-ddefaf76741a' AND "denomination" = 'Catholic' AND "denominationFamily" = 'Catholic'; -- Celestial Church of Christ Light of Glory Parish SA 1
UPDATE "churches" SET "denomination" = 'Jehovah''s Witnesses', "denominationFamily" = 'Jehovah''s Witnesses' WHERE "id" = 'aae9f480-5d7e-40a5-be0e-b475da7709f2' AND "denomination" = 'Catholic' AND "denominationFamily" = 'Catholic'; -- Central Texas/San Antonio Assembly Hall of Jehovah's Witnesses
UPDATE "churches" SET "denomination" = 'United Methodist', "denominationFamily" = 'Methodist' WHERE "id" = '3855529f-a906-428a-af4a-3039d9404de4' AND "denomination" = 'Methodist' AND "denominationFamily" = 'Methodist'; -- Chapel Hill United Methodist Church
UPDATE "churches" SET "denomination" = 'Catholic', "denominationFamily" = 'Catholic' WHERE "id" = 'a49a268a-c934-424f-ac7f-b95a8d5f234d' AND "denomination" = 'Roman Catholic' AND "denominationFamily" = 'Catholic'; -- Chapel of the Incarnate Word
UPDATE "churches" SET "denomination" = NULL, "denominationFamily" = NULL WHERE "id" = '6a7413b7-9935-4226-98f0-1426af4dc292' AND "denomination" = 'Catholic' AND "denominationFamily" = 'Catholic'; -- Chase Oaks Church - San Antonio
UPDATE "churches" SET "denomination" = 'United Methodist', "denominationFamily" = 'Methodist' WHERE "id" = 'e22a4c84-706b-496d-b64b-88a2fbaa4b0b' AND "denomination" = 'Catholic' AND "denominationFamily" = 'Catholic'; -- Chinese United Methodist Church of San Antonio
UPDATE "churches" SET "denomination" = NULL, "denominationFamily" = NULL WHERE "id" = 'a9b637ef-2ba3-4aee-a92f-34f8b219e3de' AND "denomination" = 'Catholic' AND "denominationFamily" = 'Catholic'; -- Christ Church San Antonio
UPDATE "churches" SET "denomination" = 'United Methodist', "denominationFamily" = 'Methodist' WHERE "id" = '14b6cc40-5e66-43a5-877a-f9f7b96a65b1' AND "denomination" = 'Methodist' AND "denominationFamily" = 'Methodist'; -- Christ Fellowship United Methodist Church
UPDATE "churches" SET "denomination" = NULL, "denominationFamily" = NULL WHERE "id" = '247aa8c5-8bcf-4870-82ac-eab178be88c0' AND "denomination" = 'Catholic' AND "denominationFamily" = 'Catholic'; -- Christian Family Church San Antonio
UPDATE "churches" SET "denomination" = 'Church of God (Seventh Day)', "denominationFamily" = 'Adventist' WHERE "id" = 'b85a5de1-e752-4c47-bf05-57646bad4079' AND "denomination" = 'Church of God' AND "denominationFamily" = 'Pentecostal'; -- Church of God (Seventh-Day)
UPDATE "churches" SET "denomination" = 'Catholic', "denominationFamily" = 'Catholic' WHERE "id" = 'b0145d14-939e-408a-a59f-b3668f065cb6' AND "denomination" = 'Roman Catholic' AND "denominationFamily" = 'Catholic'; -- Church of the Blessed Sacrament
UPDATE "churches" SET "denomination" = NULL, "denominationFamily" = NULL WHERE "id" = '89180069-75af-4f24-bf3b-3a2a05b70f0a' AND "denomination" = 'Catholic' AND "denominationFamily" = 'Catholic'; -- CityChurch San Antonio
UPDATE "churches" SET "denomination" = 'United Methodist', "denominationFamily" = 'Methodist' WHERE "id" = '63fd7e0a-eeef-4dea-85c0-ba36221de823' AND "denomination" = 'Methodist' AND "denominationFamily" = 'Methodist'; -- Colonial Hills United Methodist Church
UPDATE "churches" SET "denomination" = NULL, "denominationFamily" = NULL WHERE "id" = '86b71000-e39b-4688-83d2-6182061f2df0' AND "denomination" = 'Catholic' AND "denominationFamily" = 'Catholic'; -- Compass Church San Antonio
UPDATE "churches" SET "denomination" = 'Messianic', "denominationFamily" = 'Other' WHERE "id" = '4943e542-1b47-41f8-ae3d-22ac65ebc30c' AND "denomination" IS NULL AND "denominationFamily" IS NULL; -- Congregacion Mesianica Ruach HaMila
UPDATE "churches" SET "denomination" = 'Messianic Jewish', "denominationFamily" = 'Other' WHERE "id" = '795c1e8e-52de-43c2-bee1-530e3c5e73ae' AND "denomination" = 'Messianic Jewish' AND "denominationFamily" = 'Evangelical'; -- Congregation Beth Simcha
UPDATE "churches" SET "denomination" = 'Non-denominational', "denominationFamily" = 'Non-denominational' WHERE "id" = '222161ef-118c-4e88-ba62-11a9f7e7ddcf' AND "denomination" IS NULL AND "denominationFamily" IS NULL; -- Cornerstone church
UPDATE "churches" SET "denomination" = 'Non-denominational', "denominationFamily" = 'Non-denominational' WHERE "id" = '74d11d4e-5908-45c1-a7fc-38559bedbd5f' AND "denomination" IS NULL AND "denominationFamily" IS NULL; -- Cornerstone Church
UPDATE "churches" SET "denomination" = NULL, "denominationFamily" = NULL WHERE "id" = '3412b4ad-2650-4b93-a867-bce7f47a5c42' AND "denomination" = 'Catholic' AND "denominationFamily" = 'Catholic'; -- Cross Church San Antonio
UPDATE "churches" SET "denomination" = 'Orthodox', "denominationFamily" = 'Orthodox' WHERE "id" = '888668cd-f780-4aae-8fad-9e5e10dd56e8' AND "denomination" = 'Catholic' AND "denominationFamily" = 'Catholic'; -- Debre Genet Kidist Dingil Mariyam Ethiopian Orthodox Tewahedo Church San Antonio
UPDATE "churches" SET "denomination" = 'Catholic', "denominationFamily" = 'Catholic' WHERE "id" = 'ce5ea492-c93e-4de9-9574-bfea0c8599e5' AND "denomination" IS NULL AND "denominationFamily" IS NULL; -- Discalced Carmelite Monastery
UPDATE "churches" SET "denomination" = 'Church of God in Christ', "denominationFamily" = 'Pentecostal' WHERE "id" = '2a3777f4-ea2a-4ee2-8b70-62dbcd05a2b6' AND "denomination" IS NULL AND "denominationFamily" IS NULL; -- Dominion Church-God In Christ
UPDATE "churches" SET "denomination" = 'United Methodist', "denominationFamily" = 'Methodist' WHERE "id" = 'a3fa1d32-ed2e-4618-a376-2b97da891eb9' AND "denomination" = 'Methodist' AND "denominationFamily" = 'Methodist'; -- E T Dixon United Methodist Church
UPDATE "churches" SET "denomination" = 'Catholic', "denominationFamily" = 'Catholic' WHERE "id" = '9c7bb987-da36-435d-8fee-a0289ad35582' AND "denomination" IS NULL AND "denominationFamily" IS NULL; -- El Carmen Church
UPDATE "churches" SET "denomination" = 'United Methodist', "denominationFamily" = 'Methodist' WHERE "id" = '9b2fa3ca-3da3-4c7f-a921-cd6c10ab3ca9' AND "denomination" = 'Methodist' AND "denominationFamily" = 'Methodist'; -- Emanuel United Methodist Church
UPDATE "churches" SET "denomination" = NULL, "denominationFamily" = NULL WHERE "id" = '3d851042-4d4e-42ed-bd12-bef9df082d1d' AND "denomination" = 'Catholic' AND "denominationFamily" = 'Catholic'; -- Embrace! Church of San Antonio
UPDATE "churches" SET "denomination" = NULL, "denominationFamily" = NULL WHERE "id" = '8674870e-45e6-4ea2-904f-f8bf8d259dc7' AND "denomination" = 'Catholic' AND "denominationFamily" = 'Catholic'; -- Emmanuel Worship Center of San Antonio
UPDATE "churches" SET "denomination" = 'United Methodist', "denominationFamily" = 'Methodist' WHERE "id" = 'b3703103-9bdb-43d4-8379-bc5a5ba56156' AND "denomination" = 'Methodist' AND "denominationFamily" = 'Methodist'; -- Epworth United Methodist Church
UPDATE "churches" SET "denomination" = 'Christian Church', "denominationFamily" = 'Restoration Movement' WHERE "id" = '714e1939-0de2-4799-8ed2-bc00761f81c7' AND "denomination" = 'Catholic' AND "denominationFamily" = 'Catholic'; -- Evers Road Christian Church San Antonio
UPDATE "churches" SET "denomination" = 'Non-denominational', "denominationFamily" = 'Non-denominational' WHERE "id" = '539b61c6-96c4-4e0e-91ad-987d7cfdf03f' AND "denomination" = 'Non-Denominational' AND "denominationFamily" = 'Non-denominational'; -- Faith Outreach Center international
UPDATE "churches" SET "denomination" = 'Assemblies of God', "denominationFamily" = 'Pentecostal' WHERE "id" = 'a5656037-a95b-48d1-b1a2-b5283dbc0b48' AND "denomination" = 'Catholic' AND "denominationFamily" = 'Catholic'; -- First Assembly of God San Antonio
UPDATE "churches" SET "denomination" = 'Baptist', "denominationFamily" = 'Baptist' WHERE "id" = 'b8bd6a11-7eb6-4713-9e3b-008b944a0600' AND "denomination" = 'Catholic' AND "denominationFamily" = 'Catholic'; -- First Baptist Church of San Antonio
UPDATE "churches" SET "denomination" = 'Baptist', "denominationFamily" = 'Baptist' WHERE "id" = '1e6fd358-cdab-40a9-9150-b2143e438880' AND "denomination" = 'Catholic' AND "denominationFamily" = 'Catholic'; -- First Mexican Baptist Church of San Antonio
UPDATE "churches" SET "denomination" = 'Independent Baptist', "denominationFamily" = 'Baptist' WHERE "id" = 'eb652a1f-0a41-4d5a-a84a-fafc059b9c38' AND "denomination" = 'Baptist' AND "denominationFamily" = 'Baptist'; -- First Mexican Fundamental Baptist
UPDATE "churches" SET "denomination" = 'Unitarian Universalist', "denominationFamily" = 'Other' WHERE "id" = 'e098435b-c8b5-40f1-aa06-0d14ede7655e' AND "denomination" = 'Catholic' AND "denominationFamily" = 'Catholic'; -- First Unitarian Universalist Church of San Antonio
UPDATE "churches" SET "denomination" = 'United Pentecostal', "denominationFamily" = 'Pentecostal' WHERE "id" = '29eaa7ad-956d-4b77-a122-49aa93240cf4' AND "denomination" = 'Pentecostal' AND "denominationFamily" = 'Pentecostal'; -- First United Pentecostal Church
UPDATE "churches" SET "denomination" = NULL, "denominationFamily" = NULL WHERE "id" = '78a0e89b-38e2-4ac6-bc88-76c6077ea353' AND "denomination" = 'Catholic' AND "denominationFamily" = 'Catholic'; -- Fountain of Truth Church San Antonio
UPDATE "churches" SET "denomination" = 'Southern Baptist', "denominationFamily" = 'Baptist' WHERE "id" = '312a959b-711f-442f-bee2-b8a0448ae47b' AND "denomination" = 'SEND Network' AND "denominationFamily" = 'Baptist'; -- Freedom Hill Church
UPDATE "churches" SET "denomination" = NULL, "denominationFamily" = NULL WHERE "id" = '402294d8-c295-48ff-b2c7-c01d4d7a4271' AND "denomination" = 'Catholic' AND "denominationFamily" = 'Catholic'; -- Freedom Life Church SAN ANTONIO
UPDATE "churches" SET "denomination" = 'Full Gospel', "denominationFamily" = 'Pentecostal' WHERE "id" = '06b51ff4-c10b-4496-8082-63712a962ddf' AND "denomination" = 'Pentecostal' AND "denominationFamily" = 'Pentecostal'; -- Full Gospel Pentecostal Church
UPDATE "churches" SET "denomination" = NULL, "denominationFamily" = NULL WHERE "id" = '9551dc38-75f0-4a31-a2fd-f4d12d038916' AND "denomination" = 'Catholic' AND "denominationFamily" = 'Catholic'; -- Good News San Antonio Church
UPDATE "churches" SET "denomination" = 'Orthodox Presbyterian', "denominationFamily" = 'Presbyterian/Reformed' WHERE "id" = 'fb1977b7-af8e-4318-bda9-8bcfd48feb58' AND "denomination" = 'Orthodox' AND "denominationFamily" = 'Orthodox'; -- Grace Orthodox Presbyterian Church
UPDATE "churches" SET "denomination" = NULL, "denominationFamily" = NULL WHERE "id" = '522a2b91-121b-4e23-b8f9-3c7b93aedb2e' AND "denomination" = 'Greater Works Ministries' AND "denominationFamily" IS NULL; -- Greater Works Ministries Church - SA
UPDATE "churches" SET "denomination" = NULL, "denominationFamily" = NULL WHERE "id" = 'd8c99eb4-51d4-4754-9cc7-765b0876f21d' AND "denomination" = 'Catholic' AND "denominationFamily" = 'Catholic'; -- Harvest Intercontinental Church, San Antonio
UPDATE "churches" SET "denomination" = 'Church of Jesus Christ of Latter-day Saints', "denominationFamily" = 'Latter-day Saints' WHERE "id" = '533c75b3-1d61-496d-9d19-1dff75db98c6' AND "denomination" IS NULL AND "denominationFamily" IS NULL; -- Helotes Building
UPDATE "churches" SET "denomination" = 'United Methodist', "denominationFamily" = 'Methodist' WHERE "id" = '877a909d-c801-473a-8aa1-a11dcf6f3206' AND "denomination" = 'Methodist' AND "denominationFamily" = 'Methodist'; -- Helotes Hills United Methodist Church
UPDATE "churches" SET "denomination" = 'Independent Baptist', "denominationFamily" = 'Baptist' WHERE "id" = '56e51c92-6740-4170-9754-ba4c9b44b9d1' AND "denomination" = 'Baptist' AND "denominationFamily" = 'Baptist'; -- Helotes Independent Baptist Church
UPDATE "churches" SET "denomination" = NULL, "denominationFamily" = NULL WHERE "id" = 'd4e8a525-c698-4921-8cf2-a42dbbe1a2f7' AND "denomination" = 'Catholic' AND "denominationFamily" = 'Catholic'; -- Henke Hall
UPDATE "churches" SET "denomination" = 'Catholic', "denominationFamily" = 'Catholic' WHERE "id" = '49b79482-64e6-4b2a-88fd-b5d381e4b07b' AND "denomination" IS NULL AND "denominationFamily" IS NULL; -- Holy Rosary Convent
UPDATE "churches" SET "denomination" = 'Presbyterian', "denominationFamily" = 'Presbyterian/Reformed' WHERE "id" = '000a8630-18e8-44ab-82a3-c39c32a54044' AND "denomination" = 'Catholic' AND "denominationFamily" = 'Catholic'; -- Holy Trinity Presbyterian Church
UPDATE "churches" SET "denomination" = NULL, "denominationFamily" = NULL WHERE "id" = '0c2d0e36-efad-4278-afc9-79061ed4f184' AND "denomination" = 'Catholic' AND "denominationFamily" = 'Catholic'; -- Home Church San Antonio
UPDATE "churches" SET "denomination" = NULL, "denominationFamily" = NULL WHERE "id" = '13422e66-d73b-47b3-9a50-252e18f95370' AND "denomination" = 'Catholic' AND "denominationFamily" = 'Catholic'; -- Hope Church San Antonio
UPDATE "churches" SET "denomination" = NULL, "denominationFamily" = NULL WHERE "id" = 'b6c17b12-6d96-4feb-9cc3-630b42997011' AND "denomination" = 'Catholic' AND "denominationFamily" = 'Catholic'; -- HOUSE OF WORSHIP SAN ANTONIO
UPDATE "churches" SET "denomination" = 'Seventh-day Adventist', "denominationFamily" = 'Adventist' WHERE "id" = 'e11e7c70-de83-4bb6-889b-dfd7b012d3fc' AND "denomination" = 'Catholic' AND "denominationFamily" = 'Catholic'; -- Iglesia Adventista del Séptimo Día Hispana de San Antonio
UPDATE "churches" SET "denomination" = 'Seventh-day Adventist', "denominationFamily" = 'Adventist' WHERE "id" = 'c3fe34cc-4819-4f51-94f0-358bdf7977c0' AND "denomination" = 'Catholic' AND "denominationFamily" = 'Catholic'; -- Iglesia Adventista del Séptimo Día Hispana de San Antonio North / San Antonio North Spanish Seventh-day Adventist Church
UPDATE "churches" SET "denomination" = 'Baptist', "denominationFamily" = 'Baptist' WHERE "id" = '15e13c76-b695-4444-a9a9-9c65852b8aa7' AND "denomination" = 'Non-denominational' AND "denominationFamily" = 'Non-denominational'; -- Iglesia Bautista Cristo Rey
UPDATE "churches" SET "denomination" = 'Baptist', "denominationFamily" = 'Baptist' WHERE "id" = '87dc6ea6-e00e-4157-b282-a3d30493aa08' AND "denomination" = 'Non-denominational' AND "denominationFamily" = 'Non-denominational'; -- Iglesia Bautista La Nueva Jerusalem
UPDATE "churches" SET "denomination" = 'Baptist', "denominationFamily" = 'Baptist' WHERE "id" = '71be1a69-3596-44dc-b6b4-ecd02fbdae18' AND "denomination" = 'Non-denominational' AND "denominationFamily" = 'Non-denominational'; -- Iglesia Bautista Mision Camino al Cielo
UPDATE "churches" SET "denomination" = 'Baptist', "denominationFamily" = 'Baptist' WHERE "id" = 'ca427787-9758-4450-8e98-e1e4587cbbda' AND "denomination" = 'Non-denominational' AND "denominationFamily" = 'Non-denominational'; -- Iglesia Bautista Monte de Las Olivas
UPDATE "churches" SET "denomination" = 'Baptist', "denominationFamily" = 'Baptist' WHERE "id" = 'e654980b-320c-48bf-9eed-29bc801ed263' AND "denomination" = 'Non-denominational' AND "denominationFamily" = 'Non-denominational'; -- Iglesia Bautista Sur Zarzamora
UPDATE "churches" SET "denomination" = 'Non-denominational', "denominationFamily" = 'Non-denominational' WHERE "id" = 'e916d9ca-c017-442a-bd1f-9971fde4d916' AND "denomination" IS NULL AND "denominationFamily" IS NULL; -- Iglesia Biblica La Puerta
UPDATE "churches" SET "denomination" = 'Free Methodist', "denominationFamily" = 'Methodist' WHERE "id" = 'd861f6aa-3e04-422f-ad53-5ff42bed0479' AND "denomination" IS NULL AND "denominationFamily" IS NULL; -- Iglesia Cristiana Metodista Libre
UPDATE "churches" SET "denomination" = 'Pentecostal', "denominationFamily" = 'Pentecostal' WHERE "id" = '44fa4696-3615-4572-8b49-c261dc0a1902' AND "denomination" IS NULL AND "denominationFamily" IS NULL; -- Iglesia Cristiana Pentecostes Movimiento Misionero Mundial (MMM)
UPDATE "churches" SET "denomination" = 'Church of Christ', "denominationFamily" = 'Restoration Movement' WHERE "id" = '3839aee8-f47a-4f1e-b73a-ca4943e632a3' AND "denomination" = 'Non-denominational' AND "denominationFamily" = 'Non-denominational'; -- Iglesia de Cristo
UPDATE "churches" SET "denomination" = 'Church of Christ', "denominationFamily" = 'Restoration Movement' WHERE "id" = '8b417985-c860-4c10-b667-db0373581ecc' AND "denomination" = 'Non-denominational' AND "denominationFamily" = 'Non-denominational'; -- Iglesia de Cristo Atascosa
UPDATE "churches" SET "denomination" = 'Church of God', "denominationFamily" = 'Pentecostal' WHERE "id" = 'bfe9bfeb-6336-4dd1-b3ff-c6ab3d2e9e06' AND "denomination" IS NULL AND "denominationFamily" IS NULL; -- Iglesia De Dios Puerta Del Cielo
UPDATE "churches" SET "denomination" = NULL, "denominationFamily" = NULL WHERE "id" = 'c421858c-0d82-45e5-8653-f4bd43ee0540' AND "denomination" = 'Catholic' AND "denominationFamily" = 'Catholic'; -- Iglesia Embajadores de Cristo - San Antonio
UPDATE "churches" SET "denomination" = 'Non-denominational', "denominationFamily" = 'Non-denominational' WHERE "id" = 'aea00df7-843e-4993-933f-03c35ad53f73' AND "denomination" = 'Interdenominacional' AND "denominationFamily" = 'Non-denominational'; -- Iglesia Familia Cristiana
UPDATE "churches" SET "denomination" = 'La Luz del Mundo', "denominationFamily" = 'Other' WHERE "id" = '3b306965-75ff-48bb-af50-7c0cd7b46a2a' AND "denomination" IS NULL AND "denominationFamily" IS NULL; -- Iglesia La Luz del Mundo
UPDATE "churches" SET "denomination" = NULL, "denominationFamily" = NULL WHERE "id" = 'f912a6a4-f20e-41d5-a9d6-24d527f8c1cd' AND "denomination" = 'Catholic' AND "denominationFamily" = 'Catholic'; -- IGLESIA MISIÓN CRISTIANA EL RENUEVO SAN ANTONIO
UPDATE "churches" SET "denomination" = NULL, "denominationFamily" = NULL WHERE "id" = 'b21212ed-a14a-47bf-8e6e-2155cd2df2db' AND "denomination" = 'Catholic' AND "denominationFamily" = 'Catholic'; -- Iglesia San Antonio Casa De Alabanza
UPDATE "churches" SET "denomination" = NULL, "denominationFamily" = NULL WHERE "id" = 'fcf9bc3a-e2ee-4e73-937e-811880dbba41' AND "denomination" = 'Catholic' AND "denominationFamily" = 'Catholic'; -- Iglesia Verbo San Antonio
UPDATE "churches" SET "denomination" = NULL, "denominationFamily" = NULL WHERE "id" = '582f5081-7aeb-4677-b430-18a25fa43dc7' AND "denomination" = 'Catholic' AND "denominationFamily" = 'Catholic'; -- Iglesia Vida Abundante San Antonio
UPDATE "churches" SET "denomination" = 'Baptist', "denominationFamily" = 'Baptist' WHERE "id" = '78d13b8d-73bf-47fa-88ae-da3542166148' AND "denomination" = 'Catholic' AND "denominationFamily" = 'Catholic'; -- Igreja Batista Atitude em San Antonio
UPDATE "churches" SET "denomination" = 'Catholic', "denominationFamily" = 'Catholic' WHERE "id" = '3765f826-9eb6-41bd-833e-28c9d6d2ae6f' AND "denomination" IS NULL AND "denominationFamily" IS NULL; -- Immaculate Conception
UPDATE "churches" SET "denomination" = 'Catholic', "denominationFamily" = 'Catholic' WHERE "id" = 'c77ec6eb-ff36-4567-910c-3a46351b701c' AND "denomination" IS NULL AND "denominationFamily" IS NULL; -- Immaculate Heart Of Mary Chapel
UPDATE "churches" SET "denomination" = 'United Pentecostal', "denominationFamily" = 'Pentecostal' WHERE "id" = '06506c8c-800f-4870-963e-6999580d0dec' AND "denomination" = 'Catholic' AND "denominationFamily" = 'Catholic'; -- IPUH San Antonio #1
UPDATE "churches" SET "denomination" = 'United Pentecostal', "denominationFamily" = 'Pentecostal' WHERE "id" = '47c91202-3c0a-4315-b4c7-35e4cd8274ea' AND "denomination" IS NULL AND "denominationFamily" IS NULL; -- IPUL - Avivamiento (Revival Church)
UPDATE "churches" SET "denomination" = NULL, "denominationFamily" = NULL WHERE "id" = '364581c5-9d82-4091-a1b5-f772631ea526' AND "denomination" = 'Catholic' AND "denominationFamily" = 'Catholic'; -- IUIC San Antonio
UPDATE "churches" SET "denomination" = 'Baptist', "denominationFamily" = 'Baptist' WHERE "id" = '8f8ff57b-5ef4-4b42-93b5-115e5a20cf72' AND "denomination" = 'Catholic' AND "denominationFamily" = 'Catholic'; -- Jesus Baptist San Antonio Church
UPDATE "churches" SET "denomination" = NULL, "denominationFamily" = NULL WHERE "id" = '3d5b1e18-71da-47c2-9fbd-fb09323681ae' AND "denomination" = 'Catholic' AND "denominationFamily" = 'Catholic'; -- Journey Church San Antonio
UPDATE "churches" SET "denomination" = 'Jehovah''s Witnesses', "denominationFamily" = 'Jehovah''s Witnesses' WHERE "id" = '7486c3e4-7c32-4a2a-815b-28327222f1e2' AND "denomination" = 'Catholic' AND "denominationFamily" = 'Catholic'; -- Kingdom Hall of Jehovah's Witnesses--Denver Heights, San Antonio Central Tagalog, & Encino Spanish
UPDATE "churches" SET "denomination" = 'Jehovah''s Witnesses', "denominationFamily" = 'Jehovah''s Witnesses' WHERE "id" = '1f4235cf-2840-4ba0-95f6-aa2d59587482' AND "denomination" = 'Catholic' AND "denominationFamily" = 'Catholic'; -- Kingdom Hall of Jehovah's Witnesses--Garden Ridge, San Antonio Northeast, Thousand Oaks, & Valencia Spanish
UPDATE "churches" SET "denomination" = 'Jehovah''s Witnesses', "denominationFamily" = 'Jehovah''s Witnesses' WHERE "id" = 'eff16302-77a2-42e5-88b3-6b12e19ec847' AND "denomination" = 'Catholic' AND "denominationFamily" = 'Catholic'; -- Kingdom Hall of Jehovah's Witnesses--Riverside, San Antonio South Spanish, & Villa Coronado Spanish
UPDATE "churches" SET "denomination" = 'Jehovah''s Witnesses', "denominationFamily" = 'Jehovah''s Witnesses' WHERE "id" = '854c2e67-7696-459b-b3e3-3191cff8416d' AND "denomination" = 'Catholic' AND "denominationFamily" = 'Catholic'; -- Kingdom Hall of Jehovah's Witnesses--San Antonio Central English, Columbia Heights Spsh, Nogalitos Spsh, & Pleasanton Spsh
UPDATE "churches" SET "denomination" = 'Jehovah''s Witnesses', "denominationFamily" = 'Jehovah''s Witnesses' WHERE "id" = '0e0bb7aa-3b9b-4700-81cf-341cd20826da' AND "denomination" = 'Catholic' AND "denominationFamily" = 'Catholic'; -- Kingdom Hall of Jehovah's Witnesses--San Antonio South English & Price Spanish
UPDATE "churches" SET "denomination" = NULL, "denominationFamily" = NULL WHERE "id" = '812834cb-cb46-4b7d-9024-cabd2a214dad' AND "denomination" = 'Catholic' AND "denominationFamily" = 'Catholic'; -- Korean American Cultural Center of San Antonio
UPDATE "churches" SET "denomination" = NULL, "denominationFamily" = NULL WHERE "id" = 'd90ccb19-bf7f-4874-958e-d76372cb396f' AND "denomination" = 'Catholic' AND "denominationFamily" = 'Catholic'; -- La Fe San Antonio
UPDATE "churches" SET "denomination" = 'Church of God', "denominationFamily" = 'Pentecostal' WHERE "id" = '13ad5312-4ab8-4c38-b715-198ccabc1761' AND "denomination" IS NULL AND "denominationFamily" IS NULL; -- La Iglesia De Dios, Inc. Casa de Adoración
UPDATE "churches" SET "denomination" = 'La Luz del Mundo', "denominationFamily" = 'Other' WHERE "id" = 'dc1fad8c-de2e-4548-9c1a-668be1e6e9fb' AND "denomination" = 'La Luz del Mundo' AND "denominationFamily" IS NULL; -- La Luz del Mundo
UPDATE "churches" SET "denomination" = 'United Methodist', "denominationFamily" = 'Methodist' WHERE "id" = '6040dee7-5300-4ea7-9323-b2dcf1100724' AND "denomination" = 'Methodist' AND "denominationFamily" = 'Methodist'; -- Laurel Heights United Methodist Church
UPDATE "churches" SET "denomination" = NULL, "denominationFamily" = NULL WHERE "id" = '3ed39f61-6bdd-45f4-a645-ddc16c4893ce' AND "denomination" = 'Catholic' AND "denominationFamily" = 'Catholic'; -- Life Church of San Antonio
UPDATE "churches" SET "denomination" = NULL, "denominationFamily" = NULL WHERE "id" = '4cf8d34e-d24a-4e04-b98b-1ffe948e96e4' AND "denomination" = 'Catholic' AND "denominationFamily" = 'Catholic'; -- little church la villita san antonio tx
UPDATE "churches" SET "denomination" = NULL, "denominationFamily" = NULL WHERE "id" = 'a71e5d0d-68b6-48b2-bdd4-2e2162a02b45' AND "denomination" = 'Catholic' AND "denominationFamily" = 'Catholic'; -- Local Church San Antonio
UPDATE "churches" SET "denomination" = 'Pentecostal', "denominationFamily" = 'Pentecostal' WHERE "id" = '2029b2d5-d47f-4539-9524-3892c60d714e' AND "denomination" = 'Catholic' AND "denominationFamily" = 'Catholic'; -- Los pentecostales de San antonio
UPDATE "churches" SET "denomination" = 'Mar Thoma', "denominationFamily" = 'Orthodox' WHERE "id" = '6b98295a-5651-458f-8d1f-4fafc9c7448c' AND "denomination" = 'Catholic' AND "denominationFamily" = 'Catholic'; -- Mar Thoma Congregation of San Antonio
UPDATE "churches" SET "denomination" = 'Catholic', "denominationFamily" = 'Catholic' WHERE "id" = 'fc4ce817-685f-4ab3-a473-5c1a3b91795e' AND "denomination" = 'Roman Catholic' AND "denominationFamily" = 'Catholic'; -- Mary Mother of the Church
UPDATE "churches" SET "denomination" = NULL, "denominationFamily" = NULL WHERE "id" = '6a91449d-2f91-41b8-9075-fb7720bee809' AND "denomination" = 'Catholic' AND "denominationFamily" = 'Catholic'; -- Mercy Church San Antonio
UPDATE "churches" SET "denomination" = NULL, "denominationFamily" = NULL WHERE "id" = '9364788a-3e1e-4cb5-ae54-aab1df6671da' AND "denomination" = 'Catholic' AND "denominationFamily" = 'Catholic'; -- Ministerio de Jesucristo Alfa y Omega San Antonio Texas
UPDATE "churches" SET "denomination" = NULL, "denominationFamily" = NULL WHERE "id" = '91850c06-ed99-4a01-911c-5ea6934148b9' AND "denomination" = 'Catholic' AND "denominationFamily" = 'Catholic'; -- Ministerios Ebenezer San Antonio TX
UPDATE "churches" SET "denomination" = 'Apostolic', "denominationFamily" = 'Pentecostal' WHERE "id" = '114a0682-ab22-4964-a55f-15be58bf52fa' AND "denomination" IS NULL AND "denominationFamily" IS NULL; -- Mision Apostolica Rios De Agua
UPDATE "churches" SET "denomination" = NULL, "denominationFamily" = NULL WHERE "id" = 'aa31c73f-13dc-4e5d-abf0-7e71fe1f0777' AND "denomination" = 'Catholic' AND "denominationFamily" = 'Catholic'; -- Mission Church San Antonio
UPDATE "churches" SET "denomination" = 'Missionary Baptist', "denominationFamily" = 'Baptist' WHERE "id" = '955977cf-3e0b-410e-b625-b67c7ee18516' AND "denomination" = 'Catholic' AND "denominationFamily" = 'Catholic'; -- Missionary Baptist Church of San Antonio
UPDATE "churches" SET "denomination" = 'Non-denominational', "denominationFamily" = 'Non-denominational' WHERE "id" = 'd8c8200a-115b-489f-9d7e-769d5a8169ce' AND "denomination" = 'Non-Denominational' AND "denominationFamily" = 'Non-denominational'; -- New Creation Christian Fellowship Windcrest
UPDATE "churches" SET "denomination" = 'Church of God (Seventh Day)', "denominationFamily" = 'Adventist' WHERE "id" = '60a0e5bf-4806-4b60-bbaa-adc375756f4e' AND "denomination" = 'Church of God' AND "denominationFamily" = 'Pentecostal'; -- New Hope United Church of God (Seventh Day)
UPDATE "churches" SET "denomination" = NULL, "denominationFamily" = NULL WHERE "id" = 'c1c6d946-e2ef-4216-a32c-363c22874321' AND "denomination" = 'Catholic' AND "denominationFamily" = 'Catholic'; -- New Life Outreach San Antonio
UPDATE "churches" SET "denomination" = 'New Testament Christian Churches', "denominationFamily" = 'Pentecostal' WHERE "id" = 'de079b6f-d630-4e5e-9c84-9bfe930c0d4e' AND "denomination" = 'Christian Church' AND "denominationFamily" = 'Restoration Movement'; -- New Testament Christian Church
UPDATE "churches" SET "denomination" = 'United Methodist', "denominationFamily" = 'Methodist' WHERE "id" = '007fa8fd-d64e-4aa5-b50b-4f76c8a04106' AND "denomination" = 'Methodist' AND "denominationFamily" = 'Methodist'; -- Northern Hills United Methodist Church
UPDATE "churches" SET "denomination" = 'Global Methodist', "denominationFamily" = 'Methodist' WHERE "id" = 'fc431140-af81-4b4d-9118-74f4bbf2aebf' AND "denomination" = 'Methodist' AND "denominationFamily" = 'Methodist'; -- Northwest Hills Global Methodist Church
UPDATE "churches" SET "denomination" = 'Global Methodist', "denominationFamily" = 'Methodist' WHERE "id" = '09aa95fc-2041-4401-a409-db986d8b51ea' AND "denomination" = 'Methodist' AND "denominationFamily" = 'Methodist'; -- Oak Island Methodist Church, A Global Methodist Congregation
UPDATE "churches" SET "denomination" = 'United Methodist', "denominationFamily" = 'Methodist' WHERE "id" = 'fa541c2c-8ac6-44b5-a274-48b8c14d9cfa' AND "denomination" = 'Methodist' AND "denominationFamily" = 'Methodist'; -- Oak Meadow United Methodist
UPDATE "churches" SET "denomination" = 'Catholic', "denominationFamily" = 'Catholic' WHERE "id" = 'a41888c4-0eee-4cdf-bad0-6774425d5a2e' AND "denomination" IS NULL AND "denominationFamily" IS NULL; -- Oblate Madonna Residence
UPDATE "churches" SET "denomination" = 'Catholic', "denominationFamily" = 'Catholic' WHERE "id" = '9e38c052-9aeb-4176-a295-40891f25910a' AND "denomination" IS NULL AND "denominationFamily" IS NULL; -- Oblate Missions
UPDATE "churches" SET "denomination" = NULL, "denominationFamily" = NULL WHERE "id" = '4741e806-c103-4980-8641-7bdc8052d853' AND "denomination" = 'Catholic' AND "denominationFamily" = 'Catholic'; -- Pillar Church of San Antonio
UPDATE "churches" SET "denomination" = 'United Methodist', "denominationFamily" = 'Methodist' WHERE "id" = 'a8b954d7-3b05-4cf3-bb01-9ca391c1c1bc' AND "denomination" = 'Methodist' AND "denominationFamily" = 'Methodist'; -- Pollard Memorial United Methodist church
UPDATE "churches" SET "denomination" = 'Christian Fellowship Ministries', "denominationFamily" = 'Pentecostal' WHERE "id" = '502c3178-bbf3-4947-a272-dbd577235dcb' AND "denomination" = 'Christian Church' AND "denominationFamily" = 'Restoration Movement'; -- Potter's House Christian Church
UPDATE "churches" SET "denomination" = 'Church of God in Christ', "denominationFamily" = 'Pentecostal' WHERE "id" = '99e3941b-f935-49c1-8f4a-26705ffdfa18' AND "denomination" = 'Catholic' AND "denominationFamily" = 'Catholic'; -- Praise Cathedral Church Of God In Christ
UPDATE "churches" SET "denomination" = 'Church of God in Christ', "denominationFamily" = 'Pentecostal' WHERE "id" = '6d45cb7a-8a60-424e-b262-2939e2c8b5b6' AND "denomination" = 'Catholic' AND "denominationFamily" = 'Catholic'; -- Praise Cathedral Cogic
UPDATE "churches" SET "denomination" = NULL, "denominationFamily" = NULL WHERE "id" = '45bc7169-873c-4a40-bc2e-69300109fcd7' AND "denomination" = 'Catholic' AND "denominationFamily" = 'Catholic'; -- Praise Chapel San Antonio
UPDATE "churches" SET "denomination" = 'United Pentecostal', "denominationFamily" = 'Pentecostal' WHERE "id" = 'd9ab0b85-15b5-4478-9e73-834677d46d8a' AND "denomination" = 'Catholic' AND "denominationFamily" = 'Catholic'; -- Primera Iglesia Pentecostal Unida San Antonio
UPDATE "churches" SET "denomination" = 'Redeemed Christian Church of God', "denominationFamily" = 'Pentecostal' WHERE "id" = 'b7b76073-d237-47b1-945b-f7de19cf9c71' AND "denomination" = 'Catholic' AND "denominationFamily" = 'Catholic'; -- RCCG Restoration Chapel San Antonio
UPDATE "churches" SET "denomination" = 'Redeemed Christian Church of God', "denominationFamily" = 'Pentecostal' WHERE "id" = '955fa170-bfe2-4ae4-b70a-bdaa1e4dd6d6' AND "denomination" = 'Catholic' AND "denominationFamily" = 'Catholic'; -- RCCG, Salvation Center San Antonio
UPDATE "churches" SET "denomination" = NULL, "denominationFamily" = NULL WHERE "id" = '00823fac-afef-41b4-9fd6-878a8aa30d50' AND "denomination" = 'Catholic' AND "denominationFamily" = 'Catholic'; -- Recovery Church San Antonio
UPDATE "churches" SET "denomination" = NULL, "denominationFamily" = NULL WHERE "id" = 'b6b7b766-a3e3-443c-aa00-9e16d7bd586e' AND "denomination" = 'Catholic' AND "denominationFamily" = 'Catholic'; -- Restoration Church of San Antonio
UPDATE "churches" SET "denomination" = 'Catholic', "denominationFamily" = 'Catholic' WHERE "id" = '7715e74e-fd50-4cae-9155-bfc860db36f0' AND "denomination" = 'Roman Catholic' AND "denominationFamily" = 'Catholic'; -- Resurrection of the Lord
UPDATE "churches" SET "denomination" = NULL, "denominationFamily" = NULL WHERE "id" = 'e4a21bfa-bc67-4eba-8c48-87cd33b38db8' AND "denomination" = 'Catholic' AND "denominationFamily" = 'Catholic'; -- Revelation Church San Antonio
UPDATE "churches" SET "denomination" = NULL, "denominationFamily" = NULL WHERE "id" = '14cb6be8-76ca-4f9f-b714-0b8f73503c93' AND "denomination" = 'Catholic' AND "denominationFamily" = 'Catholic'; -- Revive Ministries San Antonio Church
UPDATE "churches" SET "denomination" = 'Catholic', "denominationFamily" = 'Catholic' WHERE "id" = '55af3008-e1bc-4543-bc24-1d87d015083c' AND "denomination" = 'Roman Catholic' AND "denominationFamily" = 'Catholic'; -- Saint Frances Cabrini Church
UPDATE "churches" SET "denomination" = 'Jehovah''s Witnesses', "denominationFamily" = 'Jehovah''s Witnesses' WHERE "id" = 'fc501eb1-4717-4e71-9b1e-8dd1e9dfd62c' AND "denomination" IS NULL AND "denominationFamily" IS NULL; -- Salon Del Reino De Los Testigos De Jehova--Apple Valley Spanish & Sky Harbor Spanish
UPDATE "churches" SET "denomination" = NULL, "denominationFamily" = NULL WHERE "id" = '5aaf87f9-aad6-4e6e-a5d4-cdf553010701' AND "denomination" = 'Catholic' AND "denominationFamily" = 'Catholic'; -- San Antonio Bilingual Church: In His Word Church, Inc.
UPDATE "churches" SET "denomination" = 'Seventh-day Adventist', "denominationFamily" = 'Adventist' WHERE "id" = '78c1783a-acff-4118-a8fc-3a9e63b442a0' AND "denomination" = 'Catholic' AND "denominationFamily" = 'Catholic'; -- San Antonio Breath of Life SDA Church
UPDATE "churches" SET "denomination" = 'Baptist', "denominationFamily" = 'Baptist' WHERE "id" = 'ce9a5186-3467-480e-a03d-c237eaac2354' AND "denomination" = 'Catholic' AND "denominationFamily" = 'Catholic'; -- San Antonio Chin Baptist Church
UPDATE "churches" SET "denomination" = NULL, "denominationFamily" = NULL WHERE "id" = '676ccfdf-f585-4b38-b255-4cf528fe4825' AND "denomination" = 'Catholic' AND "denominationFamily" = 'Catholic'; -- San Antonio Chinese Church
UPDATE "churches" SET "denomination" = NULL, "denominationFamily" = NULL WHERE "id" = '3450abbb-d65b-4ad7-ad2f-dff0f7f3626d' AND "denomination" = 'Catholic' AND "denominationFamily" = 'Catholic'; -- San Antonio Christian Church
UPDATE "churches" SET "denomination" = NULL, "denominationFamily" = NULL WHERE "id" = 'dd46b505-7d3f-40e1-90a4-9337c2781bd7' AND "denomination" = 'Catholic' AND "denominationFamily" = 'Catholic'; -- San Antonio First Church (SAF Church)
UPDATE "churches" SET "denomination" = NULL, "denominationFamily" = NULL WHERE "id" = 'b997b88c-19a1-4a66-87b3-3fcb57777133' AND "denomination" = 'Catholic' AND "denominationFamily" = 'Catholic'; -- San Antonio For Christ
UPDATE "churches" SET "denomination" = 'Quaker', "denominationFamily" = 'Other' WHERE "id" = '0440952b-16ed-44f4-8212-bd814a20d694' AND "denomination" = 'Catholic' AND "denominationFamily" = 'Catholic'; -- San Antonio Friends Meeting (Quaker)
UPDATE "churches" SET "denomination" = NULL, "denominationFamily" = NULL WHERE "id" = 'c067e5d3-ea9f-466b-b262-d324fa16398b' AND "denomination" = 'Catholic' AND "denominationFamily" = 'Catholic'; -- San Antonio Han-Ma-Eum Korean Church
UPDATE "churches" SET "denomination" = 'Seventh-day Adventist', "denominationFamily" = 'Adventist' WHERE "id" = 'd7e454c1-b78e-498c-a415-11cd2625a52b' AND "denomination" = 'Catholic' AND "denominationFamily" = 'Catholic'; -- San Antonio Highland Hills Seventh-day Adventist Church
UPDATE "churches" SET "denomination" = 'Pentecostal', "denominationFamily" = 'Pentecostal' WHERE "id" = 'dd089f90-9182-498b-bc19-1575b894e4f2' AND "denomination" = 'Catholic' AND "denominationFamily" = 'Catholic'; -- San Antonio Pentecostal Church (SAPC)
UPDATE "churches" SET "denomination" = 'Seventh-day Adventist', "denominationFamily" = 'Adventist' WHERE "id" = 'f07fe433-3b34-4946-8787-9bc02ba67535' AND "denomination" = 'Catholic' AND "denominationFamily" = 'Catholic'; -- San Antonio Scenic Hills Seventh-day Adventist Church
UPDATE "churches" SET "denomination" = 'Seventh-day Adventist', "denominationFamily" = 'Adventist' WHERE "id" = 'c01340da-7f77-42fe-9caf-4adb4525099a' AND "denomination" = 'Catholic' AND "denominationFamily" = 'Catholic'; -- San Antonio Southeast Spanish Seventh-day Adventist Church
UPDATE "churches" SET "denomination" = 'Seventh-day Adventist', "denominationFamily" = 'Adventist' WHERE "id" = '22e00aae-adee-401e-8ca8-82f5ac9c5932' AND "denomination" = 'Catholic' AND "denominationFamily" = 'Catholic'; -- San Antonio Spanish Durango SDA Church
UPDATE "churches" SET "denomination" = 'Church of Jesus Christ of Latter-day Saints', "denominationFamily" = 'Latter-day Saints' WHERE "id" = 'bc5c58d0-795a-4e30-9291-011a09892e3f' AND "denomination" = 'Catholic' AND "denominationFamily" = 'Catholic'; -- San Antonio Texas Temple
UPDATE "churches" SET "denomination" = 'Seventh-day Adventist', "denominationFamily" = 'Adventist' WHERE "id" = '3582a644-ad0c-4a0c-9272-095cb696728d' AND "denomination" = 'Catholic' AND "denominationFamily" = 'Catholic'; -- San Antonio Valley View Seventh-day Adventist Church
UPDATE "churches" SET "denomination" = 'Church of Christ', "denominationFamily" = 'Restoration Movement' WHERE "id" = '5a0886c5-9506-4060-8ccb-234259ce94ac' AND "denomination" = 'Catholic' AND "denominationFamily" = 'Catholic'; -- San Pedro Church of Christ
UPDATE "churches" SET "denomination" = 'Episcopal', "denominationFamily" = 'Anglican/Episcopal' WHERE "id" = '00ec90a8-7376-40be-85f9-e83af813b8ab' AND "denomination" = 'Catholic' AND "denominationFamily" = 'Catholic'; -- Santa Fe Episcopal Church
UPDATE "churches" SET "denomination" = NULL, "denominationFamily" = NULL WHERE "id" = 'bcc60638-bd92-45f6-90fe-679b1b477550' AND "denomination" = 'Catholic' AND "denominationFamily" = 'Catholic'; -- Scottish Rite Cathedral (San Antonio, Texas)
UPDATE "churches" SET "denomination" = 'Community of Christ', "denominationFamily" = 'Other' WHERE "id" = 'd5858f5d-a973-49c1-ac53-677c0d866639' AND "denomination" = 'Community of Christ' AND "denominationFamily" = 'Restoration Movement'; -- Shenandoah Community of Christ
UPDATE "churches" SET "denomination" = 'Baptist', "denominationFamily" = 'Baptist' WHERE "id" = '05f4a294-4de2-436a-a1e4-b40edc4136ed' AND "denomination" = 'Catholic' AND "denominationFamily" = 'Catholic'; -- South San Antonio Baptist Church
UPDATE "churches" SET "denomination" = 'Catholic', "denominationFamily" = 'Catholic' WHERE "id" = 'a4022951-db9b-4913-87ae-7086810c45a3' AND "denomination" = 'Roman Catholic' AND "denominationFamily" = 'Catholic'; -- St Bonaventure Church
UPDATE "churches" SET "denomination" = 'Catholic', "denominationFamily" = 'Catholic' WHERE "id" = 'b199cd39-0314-4e0e-8b72-f86b930dcee0' AND "denomination" = 'Roman Catholic' AND "denominationFamily" = 'Catholic'; -- St Clare Church
UPDATE "churches" SET "denomination" = 'Anglican Catholic', "denominationFamily" = 'Anglican/Episcopal' WHERE "id" = '1c000013-81c3-4e64-bdde-bed806b1351d' AND "denomination" = 'Catholic' AND "denominationFamily" = 'Catholic'; -- St Edward the Confessor Holy Catholic Church Western Rite
UPDATE "churches" SET "denomination" = 'Catholic', "denominationFamily" = 'Catholic' WHERE "id" = 'b5d9578f-92d6-4bd1-aa70-c9b45b052c03' AND "denomination" IS NULL AND "denominationFamily" IS NULL; -- st francis of assisi
UPDATE "churches" SET "denomination" = 'Eastern Catholic', "denominationFamily" = 'Catholic' WHERE "id" = 'ecba08c3-9048-4b10-a40c-d78a2a8e7ff1' AND "denomination" = 'Catholic' AND "denominationFamily" = 'Catholic'; -- St George Maronite Catholic Church
UPDATE "churches" SET "denomination" = 'Catholic', "denominationFamily" = 'Catholic' WHERE "id" = 'ed459105-925a-4cf6-b3ff-4e94bf591459' AND "denomination" IS NULL AND "denominationFamily" IS NULL; -- St John Berchmans Church
UPDATE "churches" SET "denomination" = 'United Methodist', "denominationFamily" = 'Methodist' WHERE "id" = '4e5841ff-4d84-4386-87b9-036bc3f0edc6' AND "denomination" = 'Methodist' AND "denominationFamily" = 'Methodist'; -- St Mark's United Methodist Church
UPDATE "churches" SET "denomination" = 'Catholic', "denominationFamily" = 'Catholic' WHERE "id" = '5d5e38d9-dd03-4d2a-9091-5009793dbf63' AND "denomination" = 'Roman Catholic' AND "denominationFamily" = 'Catholic'; -- St Mary's Church
UPDATE "churches" SET "denomination" = 'United Methodist', "denominationFamily" = 'Methodist' WHERE "id" = '9bcd8787-1732-4fc0-9082-9bc7582123cf' AND "denomination" = 'Methodist' AND "denominationFamily" = 'Methodist'; -- St Paul United Methodist Church
UPDATE "churches" SET "denomination" = 'Eastern Catholic', "denominationFamily" = 'Catholic' WHERE "id" = '9fed0fce-c55a-45de-97e6-08a241517b80' AND "denomination" = 'Catholic' AND "denominationFamily" = 'Catholic'; -- St Thomas Syro Malabar Catholic Church
UPDATE "churches" SET "denomination" = 'Eastern Catholic', "denominationFamily" = 'Catholic' WHERE "id" = '0463f326-d0c7-4b57-9898-b51028884f84' AND "denomination" = 'Catholic' AND "denominationFamily" = 'Catholic'; -- St. Anthony's Knanaya Catholic Church
UPDATE "churches" SET "denomination" = 'Catholic', "denominationFamily" = 'Catholic' WHERE "id" = 'd86d04dd-7e69-4b87-b7e5-da40b70c639b' AND "denomination" = 'Roman Catholic' AND "denominationFamily" = 'Catholic'; -- St. Joseph Capuchin Friary
UPDATE "churches" SET "denomination" = 'Catholic', "denominationFamily" = 'Catholic' WHERE "id" = 'ddbff4c9-35ca-4db5-aef2-b4e43a1cdb92' AND "denomination" IS NULL AND "denominationFamily" IS NULL; -- St. Joseph’s Chapel at Cordi-Marian
UPDATE "churches" SET "denomination" = 'Catholic', "denominationFamily" = 'Catholic' WHERE "id" = '34fac1cf-3289-448d-8def-26fea404f00d' AND "denomination" IS NULL AND "denominationFamily" IS NULL; -- St. Mark the Evangelist West Campus Entrance
UPDATE "churches" SET "denomination" = 'United Methodist', "denominationFamily" = 'Methodist' WHERE "id" = 'd11b9197-463c-4147-8e4c-459a52e5e7a5' AND "denomination" = 'Methodist' AND "denominationFamily" = 'Methodist'; -- St. Matthew's United Methodist Church
UPDATE "churches" SET "denomination" = 'Catholic', "denominationFamily" = 'Catholic' WHERE "id" = '7f9ab24a-e56f-41cd-8563-1c446c739c42' AND "denomination" IS NULL AND "denominationFamily" IS NULL; -- St. Vincent de Paul Food Pantry
UPDATE "churches" SET "denomination" = 'Catholic', "denominationFamily" = 'Catholic' WHERE "id" = 'ce32dec1-7064-4123-9aeb-6db375410427' AND "denomination" IS NULL AND "denominationFamily" IS NULL; -- St. Vincent De Paul Ministry
UPDATE "churches" SET "denomination" = 'Catholic', "denominationFamily" = 'Catholic' WHERE "id" = '070c51b5-80e0-44d8-9ecc-69ac7fed108b' AND "denomination" IS NULL AND "denominationFamily" IS NULL; -- St. Vincent de Paul Society
UPDATE "churches" SET "denomination" = 'Catholic', "denominationFamily" = 'Catholic' WHERE "id" = 'fca89c6b-80d8-4378-b806-cc92e409c084' AND "denomination" IS NULL AND "denominationFamily" IS NULL; -- St. Vincent de Paul Society - El Carmen
UPDATE "churches" SET "denomination" = 'Non-denominational', "denominationFamily" = 'Non-denominational' WHERE "id" = '7729c3b8-7fd5-452f-83aa-be07482d65c8' AND "denomination" = 'Non-denominational (Collegiate Church Network)' AND "denominationFamily" = 'Non-denominational'; -- Taproot Church
UPDATE "churches" SET "denomination" = 'Church of Jesus Christ of Latter-day Saints', "denominationFamily" = 'Latter-day Saints' WHERE "id" = 'f68aab09-9d8d-4c0f-a36b-d4cd5c0fad89' AND "denomination" = 'Catholic' AND "denominationFamily" = 'Catholic'; -- Texas San Antonio Mission Office
UPDATE "churches" SET "denomination" = NULL, "denominationFamily" = NULL WHERE "id" = 'b40e810e-a921-463c-b075-bc54bfc936cd' AND "denomination" = 'Catholic' AND "denominationFamily" = 'Catholic'; -- The church in San Antonio Meeting Hall
UPDATE "churches" SET "denomination" = 'Church of Pentecost', "denominationFamily" = 'Pentecostal' WHERE "id" = '93660b67-f733-40bb-900f-0c02126672dd' AND "denomination" = 'Catholic' AND "denominationFamily" = 'Catholic'; -- The Church of Pentecost - San Antonio
UPDATE "churches" SET "denomination" = 'Christian Fellowship Ministries', "denominationFamily" = 'Pentecostal' WHERE "id" = '159abd63-fd56-4127-b75c-9e46706fb255' AND "denomination" = 'Catholic' AND "denominationFamily" = 'Catholic'; -- The Door Christian Fellowship Church Southside San Antonio
UPDATE "churches" SET "denomination" = 'Christian Fellowship Ministries', "denominationFamily" = 'Pentecostal' WHERE "id" = '12b16cb7-7347-44d1-b2bd-a540e334d47a' AND "denomination" IS NULL AND "denominationFamily" IS NULL; -- The Door Christian Fellowship Great Northwest
UPDATE "churches" SET "denomination" = 'Christian Fellowship Ministries', "denominationFamily" = 'Pentecostal' WHERE "id" = 'c8fd182c-a2a6-45fe-8d82-a0cab53ceb24' AND "denomination" = 'Catholic' AND "denominationFamily" = 'Catholic'; -- The Door Christian Fellowship San Antonio
UPDATE "churches" SET "denomination" = 'Episcopal', "denominationFamily" = 'Anglican/Episcopal' WHERE "id" = '967f80be-1dba-476c-9e86-a39f683c571d' AND "denomination" = 'Catholic' AND "denominationFamily" = 'Catholic'; -- The Episcopal Church of the Holy Spirit
UPDATE "churches" SET "denomination" = 'La Luz del Mundo', "denominationFamily" = 'Other' WHERE "id" = '066399db-9d7c-4e54-8366-83963438527f' AND "denomination" IS NULL AND "denominationFamily" IS NULL; -- The Light of the World Church
UPDATE "churches" SET "denomination" = NULL, "denominationFamily" = NULL WHERE "id" = '10f94df4-caeb-4b6b-935c-a7e1695cde4e' AND "denomination" = 'Catholic' AND "denominationFamily" = 'Catholic'; -- The Movement Church of San Antonio
UPDATE "churches" SET "denomination" = 'The Potter''s House Christian Fellowship', "denominationFamily" = 'Pentecostal' WHERE "id" = '59eab915-9344-4059-b402-01da5d097702' AND "denomination" = 'The Potter''s House Christian Fellowship' AND "denominationFamily" = 'Non-denominational'; -- The Potter’s House Christian Fellowship Church - UTSA
UPDATE "churches" SET "denomination" = 'Christian Fellowship Ministries', "denominationFamily" = 'Pentecostal' WHERE "id" = 'b6e5f6a2-30e7-4452-b10e-a608e8ebbdb4' AND "denomination" = 'Christian Church' AND "denominationFamily" = 'Restoration Movement'; -- The Potters House Christian Church
UPDATE "churches" SET "denomination" = 'Christian Fellowship Ministries', "denominationFamily" = 'Pentecostal' WHERE "id" = '4e1d2a53-7db9-4954-bc99-ba4a1db87fef' AND "denomination" = 'Christian Church' AND "denominationFamily" = 'Restoration Movement'; -- The Potters House Christian Church of Converse
UPDATE "churches" SET "denomination" = 'Non-denominational', "denominationFamily" = 'Non-denominational' WHERE "id" = '8caf1a20-2956-4ccf-b5b9-e86eb0ede23e' AND "denomination" = 'Non-denominational' AND "denominationFamily" = 'Pentecostal'; -- The Promised Land Church
UPDATE "churches" SET "denomination" = NULL, "denominationFamily" = NULL WHERE "id" = 'a7df3f5e-1ee0-42c0-bc5e-98dfe33c9277' AND "denomination" = 'Catholic' AND "denominationFamily" = 'Catholic'; -- The Revelation San Antonio
UPDATE "churches" SET "denomination" = NULL, "denominationFamily" = NULL WHERE "id" = '7f11cffc-3a59-4a5d-8d3c-4aedb65009da' AND "denomination" = 'Catholic' AND "denominationFamily" = 'Catholic'; -- The Rock San Antonio
UPDATE "churches" SET "denomination" = 'Eastern Catholic', "denominationFamily" = 'Catholic' WHERE "id" = 'e048da26-1bd8-4462-baed-570bc512366b' AND "denomination" = 'Catholic' AND "denominationFamily" = 'Catholic'; -- Three Hierarchs Byzantine Melkite Catholic Church
UPDATE "churches" SET "denomination" = 'Native American Church', "denominationFamily" = 'Other' WHERE "id" = '9e3fd1db-9024-4c0e-a9a7-a27bc0e7073e' AND "denomination" IS NULL AND "denominationFamily" IS NULL; -- Tlecuauhtlacupeuh Native American Church of the Americas
UPDATE "churches" SET "denomination" = 'United Methodist', "denominationFamily" = 'Methodist' WHERE "id" = '48c2f681-4448-46c0-94ce-d33f62121fbe' AND "denomination" = 'Methodist' AND "denominationFamily" = 'Methodist'; -- Travis Park United Methodist Church
UPDATE "churches" SET "denomination" = 'Presbyterian', "denominationFamily" = 'Presbyterian/Reformed' WHERE "id" = 'ca06e7b1-8512-4f26-8594-1823b038d22c' AND "denomination" = 'Catholic' AND "denominationFamily" = 'Catholic'; -- Trinity Grace Church San Antonio - A PCA Church
UPDATE "churches" SET "denomination" = 'Lutheran', "denominationFamily" = 'Lutheran' WHERE "id" = '877b4072-5284-4f99-a5b4-45b2f4bdb8f6' AND "denomination" = 'Catholic' AND "denominationFamily" = 'Catholic'; -- Trinity San Antonio Lutheran Church
UPDATE "churches" SET "denomination" = 'United Methodist', "denominationFamily" = 'Methodist' WHERE "id" = '2b5650f8-4994-43b5-8ffa-2d5e511164ef' AND "denomination" = 'Methodist' AND "denominationFamily" = 'Methodist'; -- Trinity United Methodist Church
UPDATE "churches" SET "denomination" = 'Unity', "denominationFamily" = 'Other' WHERE "id" = '30da03a9-2c86-49f5-a9ef-0734270a954d' AND "denomination" = 'Catholic' AND "denominationFamily" = 'Catholic'; -- Unity of San Antonio
UPDATE "churches" SET "denomination" = 'United Methodist', "denominationFamily" = 'Methodist' WHERE "id" = '074aa1ca-74b7-4cbe-9bf8-baf0168f3056' AND "denomination" = 'Methodist' AND "denominationFamily" = 'Methodist'; -- Universal City United Methodist Church
UPDATE "churches" SET "denomination" = 'Baptist', "denominationFamily" = 'Baptist' WHERE "id" = 'db99b910-59b3-41e3-aba9-c7a9168cae98' AND "denomination" = 'Non-denominational' AND "denominationFamily" = 'Non-denominational'; -- Ven A El Iglesia Bautista
UPDATE "churches" SET "denomination" = 'Independent Baptist', "denominationFamily" = 'Baptist' WHERE "id" = 'a81a30ab-24ba-4c43-9cbf-6135c8dd6842' AND "denomination" = 'Baptist' AND "denominationFamily" = 'Baptist'; -- Victory Independent Baptist
UPDATE "churches" SET "denomination" = 'Victory Outreach', "denominationFamily" = 'Pentecostal' WHERE "id" = 'a0020f5f-2a80-43b9-9010-7dc6ec995ce8' AND "denomination" = 'Catholic' AND "denominationFamily" = 'Catholic'; -- Victory Outreach San Antonio
UPDATE "churches" SET "denomination" = 'Victory Outreach', "denominationFamily" = 'Pentecostal' WHERE "id" = 'e797584f-6378-409d-8a58-7e43e1624825' AND "denomination" = 'Catholic' AND "denominationFamily" = 'Catholic'; -- Victory Outreach San Antonio West
UPDATE "churches" SET "denomination" = 'Vineyard', "denominationFamily" = 'Evangelical' WHERE "id" = 'd16bfe71-4d48-49c8-a2e5-8199706e6de6' AND "denomination" = 'Catholic' AND "denominationFamily" = 'Catholic'; -- Vineyard Church of San Antonio
UPDATE "churches" SET "denomination" = 'Christian Science', "denominationFamily" = 'Other' WHERE "id" = '35b8a774-cd93-442b-94b6-bb336065ed3b' AND "denomination" = 'Christian Science' AND "denominationFamily" IS NULL; -- Wellspring Gardens
UPDATE "churches" SET "denomination" = 'United Methodist', "denominationFamily" = 'Methodist' WHERE "id" = '12cc065c-fe9b-4381-af78-57bd3f4ab62e' AND "denomination" = 'Methodist' AND "denominationFamily" = 'Methodist'; -- Westlawn United Methodist
UPDATE "churches" SET "denomination" = 'United Methodist', "denominationFamily" = 'Methodist' WHERE "id" = '402adf66-731a-43a1-a10f-aa3f341f8ac8' AND "denomination" = 'Methodist' AND "denominationFamily" = 'Methodist'; -- Windcrest United Methodist Church
UPDATE "churches" SET "denomination" = 'United Methodist', "denominationFamily" = 'Methodist' WHERE "id" = '008657a3-c28b-49fb-80f0-00a6ab2efc80' AND "denomination" IS NULL AND "denominationFamily" IS NULL; -- Windsong Christian Center UMC
UPDATE "churches" SET "denomination" = NULL, "denominationFamily" = NULL WHERE "id" = '447f50b6-6526-4924-83cf-296025028c25' AND "denomination" = 'Catholic' AND "denominationFamily" = 'Catholic'; -- Zion Church San Antonio
UPDATE "churches" SET "denomination" = NULL, "denominationFamily" = NULL WHERE "id" = '4944ef88-c8cc-4d01-8a32-494406afca6b' AND "denomination" = 'Catholic' AND "denominationFamily" = 'Catholic'; -- 샌안토니오 사랑의 교회 San Antonio Sarang Church
UPDATE "churches" SET "denomination" = 'Global Methodist', "denominationFamily" = 'Methodist' WHERE "id" = '335b951d-2bc5-40b8-8c40-efd69e1ca4a7' AND "denomination" = 'Catholic' AND "denominationFamily" = 'Catholic'; -- 샌안토니오 한인감리교회 Korean Global Methodist Church of San Antonio
UPDATE "churches" SET "denomination" = 'Baptist', "denominationFamily" = 'Baptist' WHERE "id" = '9205b6f2-18be-4c56-87d4-1f89af5e2dec' AND "denomination" = 'Catholic' AND "denominationFamily" = 'Catholic'; -- 샌안토니오 한인침례교회 San Antonio Korean Baptist Church

-- ── 3. Neighborhoods: corrected zip map, incorporated suburbs, one spelling per area ──
UPDATE "churches" SET "neighborhood" = 'West Side' WHERE "id" = '76154ae7-546f-414f-8068-872c3673dac2' AND "neighborhood" = 'Culebra';
UPDATE "churches" SET "neighborhood" = 'Thousand Oaks' WHERE "id" = '96db25f0-f219-4f16-8b26-48b056ab66a8' AND "neighborhood" = 'Stone Oak';
UPDATE "churches" SET "neighborhood" = 'Highland Park' WHERE "id" = 'b9c58598-ddc9-40d2-ae06-a518edd0c389' AND "neighborhood" = 'South Side';
UPDATE "churches" SET "neighborhood" = 'Westover Hills' WHERE "id" = '7596ba36-4111-4511-9ae4-5eeb53a909ed' AND "neighborhood" = 'Sea World';
UPDATE "churches" SET "neighborhood" = 'Northwest Side' WHERE "id" = 'df8d5de8-55a0-43c1-80ea-362726216ef8' AND "neighborhood" = 'Westover Hills';
UPDATE "churches" SET "neighborhood" = 'Northwest Side' WHERE "id" = 'cae0c50a-b249-4d8b-bcb5-a46984045bec' AND "neighborhood" = 'Alamo Ranch';
UPDATE "churches" SET "neighborhood" = 'Northeast Side' WHERE "id" = 'ada343ec-ea2c-434d-9b18-7bb447523aa8' AND "neighborhood" = 'Thousand Oaks';
UPDATE "churches" SET "neighborhood" = 'Jefferson' WHERE "id" = 'c8200707-672c-4c05-bffe-613e24d9a350' AND "neighborhood" = 'Prospect Hill';
UPDATE "churches" SET "neighborhood" = 'Northwest Side' WHERE "id" = '1a61765f-8b4c-4f0f-a952-159c572bd491' AND "neighborhood" = 'Westover Hills';
UPDATE "churches" SET "neighborhood" = 'Northeast Side' WHERE "id" = '3b8ce273-ba97-434b-b979-16ff36e98c82' AND "neighborhood" = 'Terrell Hills';
UPDATE "churches" SET "neighborhood" = 'Alamo Heights' WHERE "id" = 'ee1b9988-dcac-447b-89ab-37a9d08dd999' AND "neighborhood" IS NULL;
UPDATE "churches" SET "neighborhood" = 'Alamo Heights' WHERE "id" = '36d2c3b8-472d-4d6b-b538-30fc8f8ed11d' AND "neighborhood" IS NULL;
UPDATE "churches" SET "neighborhood" = 'Alamo Heights' WHERE "id" = 'cdaa99cc-a860-4329-8cae-a990024ab00c' AND "neighborhood" IS NULL;
UPDATE "churches" SET "neighborhood" = 'Alamo Heights' WHERE "id" = 'c76f0765-c433-4c67-915c-421b827a6e37' AND "neighborhood" IS NULL;
UPDATE "churches" SET "neighborhood" = 'Westover Hills' WHERE "id" = 'eb57d3cb-7386-41c5-8744-d98c6dd8f081' AND "neighborhood" = 'Sea World';
UPDATE "churches" SET "neighborhood" = 'Westover Hills' WHERE "id" = '6899702f-66a2-4c9f-b1a4-003ebdeeee18' AND "neighborhood" = 'Sea World';
UPDATE "churches" SET "neighborhood" = 'Northeast Side' WHERE "id" = '853b5c8f-ae91-4df9-9427-946a49b6d9b3' AND "neighborhood" = 'Terrell Hills';
UPDATE "churches" SET "neighborhood" = 'Castle Hills' WHERE "id" = '6aab5ec7-c662-4383-a8a7-6253ba7a3563' AND "neighborhood" = 'Balcones Heights';
UPDATE "churches" SET "neighborhood" = 'Alamo Ranch' WHERE "id" = '92b2acfd-132a-4b71-8308-77a40394fe4d' AND "neighborhood" = 'Helotes';
UPDATE "churches" SET "neighborhood" = 'East Side' WHERE "id" = '9d37df9e-964c-4f4a-99de-30bcea6a7081' AND "neighborhood" = 'Eastside';
UPDATE "churches" SET "neighborhood" = 'West Side' WHERE "id" = '6e300d60-bab3-4c2f-a8ed-9506d1494b9d' AND "neighborhood" = 'Culebra';
UPDATE "churches" SET "neighborhood" = 'Northwest Side' WHERE "id" = '74028cc3-b30a-45ce-9905-4a322aaead5a' AND "neighborhood" = 'USAA / Northwest';
UPDATE "churches" SET "neighborhood" = 'Highland Park' WHERE "id" = '3d9897ea-b317-4b4e-9918-7325e688d8c0' AND "neighborhood" = 'South Side';
UPDATE "churches" SET "neighborhood" = 'North Central' WHERE "id" = '3ab43eae-26ab-4868-b024-47be4af969e4' AND "neighborhood" = 'North Side';
UPDATE "churches" SET "neighborhood" = 'Jefferson' WHERE "id" = '4d4ddfbb-b4f1-476f-856f-d2bcee72e5a4' AND "neighborhood" = 'Prospect Hill';
UPDATE "churches" SET "neighborhood" = 'Northeast Side' WHERE "id" = '291736ff-1f62-4a12-9e75-ee339fc96684' AND "neighborhood" = 'Terrell Hills';
UPDATE "churches" SET "neighborhood" = 'Northeast Side' WHERE "id" = 'b2eee541-4722-4335-b3b9-51218fe67d1b' AND "neighborhood" = 'Thousand Oaks';
UPDATE "churches" SET "neighborhood" = 'Northwest Side' WHERE "id" = 'a7a45e2a-0485-4bac-b475-1d3afea67fd8' AND "neighborhood" = 'Westover Hills';
UPDATE "churches" SET "neighborhood" = 'North Central' WHERE "id" = 'a001666a-b320-4eb7-af26-6cabc0d316c1' AND "neighborhood" = 'North Side';
UPDATE "churches" SET "neighborhood" = 'Northeast Side' WHERE "id" = 'a9e5f6f9-1c3b-4ba9-95e5-f9bfc33c9310' AND "neighborhood" = 'Terrell Hills';
UPDATE "churches" SET "neighborhood" = 'Northwest Side' WHERE "id" = '9cfbaf96-be0b-4be7-a028-f1d07d96fb37' AND "neighborhood" = 'Alamo Ranch';
UPDATE "churches" SET "neighborhood" = 'North Central' WHERE "id" = 'd165c948-1bdc-4f5c-8bb0-5b854f30ac44' AND "neighborhood" = 'North Side';
UPDATE "churches" SET "neighborhood" = 'Thousand Oaks' WHERE "id" = '9ffa1aea-482e-4c5c-98c8-f7f65568d5c8' AND "neighborhood" = 'Stone Oak';
UPDATE "churches" SET "neighborhood" = 'Westover Hills' WHERE "id" = 'f2aab93d-5d1d-4925-aceb-588ffe10be2d' AND "neighborhood" = 'Sea World';
UPDATE "churches" SET "neighborhood" = 'Northwest Side' WHERE "id" = '0e847bec-2d1c-4367-a1b3-1049df31b5bf' AND "neighborhood" = 'Alamo Ranch';
UPDATE "churches" SET "neighborhood" = 'Castle Hills' WHERE "id" = '256423b2-cb7e-4a1a-8e09-663dd31f7f2b' AND "neighborhood" = 'Balcones Heights';
UPDATE "churches" SET "neighborhood" = 'Northeast Side' WHERE "id" = '7a02c560-3ce2-42b1-b6b3-7a6f27ad4e7e' AND "neighborhood" = 'Terrell Hills';
UPDATE "churches" SET "neighborhood" = 'Jefferson' WHERE "id" = '6ee7d9bd-f433-4008-9c87-9a29f80ece8b' AND "neighborhood" = 'Prospect Hill';
UPDATE "churches" SET "neighborhood" = 'Northeast Side' WHERE "id" = '0eb9bbbd-6c3c-4b35-83e4-8db395fc777d' AND "neighborhood" = 'Terrell Hills';
UPDATE "churches" SET "neighborhood" = 'West Side' WHERE "id" = '61583ab2-12d1-4fa3-988e-431e0538ee08' AND "neighborhood" = 'Culebra';
UPDATE "churches" SET "neighborhood" = 'Castle Hills' WHERE "id" = '7e921d3e-6809-447c-9ee3-1a164e42be93' AND "neighborhood" = 'Balcones Heights';
UPDATE "churches" SET "neighborhood" = 'Northwest Side' WHERE "id" = 'e8aa6c61-4c8a-44ee-814b-dcedd6fb7d62' AND "neighborhood" = 'USAA / Northwest';
UPDATE "churches" SET "neighborhood" = 'Garden Ridge' WHERE "id" = '3596cd76-301a-4c47-b258-491ceb29ea1a' AND "neighborhood" = 'Bulverde';
UPDATE "churches" SET "neighborhood" = 'Windcrest' WHERE "id" = 'aae9f480-5d7e-40a5-be0e-b475da7709f2' AND "neighborhood" = 'Northeast Side';
UPDATE "churches" SET "neighborhood" = 'West Side' WHERE "id" = '96bef148-c11f-4577-8e38-674db7d6d04f' AND "neighborhood" = 'Culebra';
UPDATE "churches" SET "neighborhood" = 'Southwest Side' WHERE "id" = '3855529f-a906-428a-af4a-3039d9404de4' AND "neighborhood" = 'Marbach';
UPDATE "churches" SET "neighborhood" = 'Alamo Heights' WHERE "id" = 'a49a268a-c934-424f-ac7f-b95a8d5f234d' AND "neighborhood" IS NULL;
UPDATE "churches" SET "neighborhood" = 'North Central' WHERE "id" = '49041299-51c9-481e-8392-6e87ea55eb50' AND "neighborhood" = 'North Side';
UPDATE "churches" SET "neighborhood" = 'Thousand Oaks' WHERE "id" = 'a9b637ef-2ba3-4aee-a92f-34f8b219e3de' AND "neighborhood" = 'Stone Oak';
UPDATE "churches" SET "neighborhood" = 'Northwest Side' WHERE "id" = '14b6cc40-5e66-43a5-877a-f9f7b96a65b1' AND "neighborhood" = 'Alamo Ranch';
UPDATE "churches" SET "neighborhood" = 'Selma' WHERE "id" = '7f933472-e8b9-4628-9653-4837e318b48c' AND "neighborhood" = 'Schertz';
UPDATE "churches" SET "neighborhood" = 'Alamo Heights' WHERE "id" = '65a34b9c-316b-479a-a67d-795773aaa977' AND "neighborhood" IS NULL;
UPDATE "churches" SET "neighborhood" = 'La Cantera' WHERE "id" = 'f4a0638a-4a61-4241-9e44-ac66166ddca2' AND "neighborhood" = 'Shavano Park';
UPDATE "churches" SET "neighborhood" = 'Thousand Oaks' WHERE "id" = '247aa8c5-8bcf-4870-82ac-eab178be88c0' AND "neighborhood" = 'Stone Oak';
UPDATE "churches" SET "neighborhood" = 'Windcrest' WHERE "id" = 'f796e11f-1d73-4882-965a-120f62931b57' AND "neighborhood" = 'Northeast Side';
UPDATE "churches" SET "neighborhood" = 'Windcrest' WHERE "id" = '8d5fae84-89ef-4bbb-b54c-9a1234569ee4' AND "neighborhood" = 'Terrell Hills';
UPDATE "churches" SET "neighborhood" = 'Shavano Park' WHERE "id" = 'b53c972f-02e6-42ef-a787-ab45e94f4054' AND "neighborhood" = 'Northwest Side';
UPDATE "churches" SET "neighborhood" = 'Northeast Side' WHERE "id" = '3d59bc76-fe58-40c0-80b0-e21241ea5736' AND "neighborhood" = 'Windcrest';
UPDATE "churches" SET "neighborhood" = 'Northwest Side' WHERE "id" = '89180069-75af-4f24-bf3b-3a2a05b70f0a' AND "neighborhood" = 'Westover Hills';
UPDATE "churches" SET "neighborhood" = 'Northeast Side' WHERE "id" = '3b6e915d-573f-428f-987f-cc44bbadc113' AND "neighborhood" = 'Terrell Hills';
UPDATE "churches" SET "neighborhood" = 'Northwest Side' WHERE "id" = 'b3d13304-3422-4a63-85a5-a1638ec68048' AND "neighborhood" = 'USAA / Northwest';
UPDATE "churches" SET "neighborhood" = 'East Side' WHERE "id" = '2df64b8e-c872-4dee-a541-eabe97edef44' AND "neighborhood" = 'Eastside';
UPDATE "churches" SET "neighborhood" = 'Brooks' WHERE "id" = '6b8a5b81-3a77-41bd-9b68-de44d78293a1' AND "neighborhood" = 'Kelly';
UPDATE "churches" SET "neighborhood" = 'Northwest Side' WHERE "id" = '795c1e8e-52de-43c2-bee1-530e3c5e73ae' AND "neighborhood" = 'USAA / Northwest';
UPDATE "churches" SET "neighborhood" = 'Shavano Park' WHERE "id" = 'c84cae3f-cfd8-49eb-ac59-838bf14f4684' AND "neighborhood" = 'Northwest Side';
UPDATE "churches" SET "neighborhood" = 'Garden Ridge' WHERE "id" = 'bfc291e8-f321-4ea2-a2de-fc06bdd7f4dd' AND "neighborhood" = 'Bulverde';
UPDATE "churches" SET "neighborhood" = 'Thousand Oaks' WHERE "id" = '1145e932-9472-4409-a430-6c91a5f6272a' AND "neighborhood" = 'Stone Oak';
UPDATE "churches" SET "neighborhood" = 'Castle Hills' WHERE "id" = 'f646dd40-c774-4f1e-bcb0-31f5adc66b38' AND "neighborhood" = 'Balcones Heights';
UPDATE "churches" SET "neighborhood" = 'East Side' WHERE "id" = '0fe40348-038b-4489-9b1f-52066d4f2b7d' AND "neighborhood" = 'East Terrell Hills';
UPDATE "churches" SET "neighborhood" = 'Windcrest' WHERE "id" = '2e908a4b-c9ab-4609-b857-4c5292f744b0' AND "neighborhood" = 'Northeast Side';
UPDATE "churches" SET "neighborhood" = 'Windcrest' WHERE "id" = 'da87ca5e-8b22-45cb-b350-dc8115cfe180' AND "neighborhood" = 'Northeast Side';
UPDATE "churches" SET "neighborhood" = 'Southwest Side' WHERE "id" = 'f564af0e-1ddf-49d6-acc2-d5a74d3aed5a' AND "neighborhood" = 'Marbach';
UPDATE "churches" SET "neighborhood" = 'Windcrest' WHERE "id" = '2d1e9236-7e94-4991-adfa-b7adafe22919' AND "neighborhood" = 'Northeast Side';
UPDATE "churches" SET "neighborhood" = 'Northwest Side' WHERE "id" = 'd6414987-8d82-4b82-9b68-11ea764b5fec' AND "neighborhood" = 'Westover Hills';
UPDATE "churches" SET "neighborhood" = 'Northwest Side' WHERE "id" = 'b21e798c-3382-4df3-8e45-f7238d878ba8' AND "neighborhood" = 'Alamo Ranch';
UPDATE "churches" SET "neighborhood" = 'Thousand Oaks' WHERE "id" = 'aa7903af-4bdb-4a1d-90c6-2f4c2ea0651a' AND "neighborhood" = 'Stone Oak';
UPDATE "churches" SET "neighborhood" = 'Windcrest' WHERE "id" = '2b533342-5147-44e9-8430-b9264ed1f88b' AND "neighborhood" = 'Northeast Side';
UPDATE "churches" SET "neighborhood" = 'West Side' WHERE "id" = '888668cd-f780-4aae-8fad-9e5e10dd56e8' AND "neighborhood" = 'Culebra';
UPDATE "churches" SET "neighborhood" = 'Westover Hills' WHERE "id" = 'ff16aa6a-4968-4889-814d-f5a2b9084864' AND "neighborhood" = 'Sea World';
UPDATE "churches" SET "neighborhood" = 'Alamo Ranch' WHERE "id" = '7e382629-b7f5-416b-a456-687eb74991e1' AND "neighborhood" = 'Helotes';
UPDATE "churches" SET "neighborhood" = 'Southwest Side' WHERE "id" = 'f7c37576-f5e3-49fb-b4d8-4477f806367b' AND "neighborhood" = 'Lackland';
UPDATE "churches" SET "neighborhood" = 'Northwest Side' WHERE "id" = '6ed12e00-1d00-4a41-aacd-94ff0184c3f7' AND "neighborhood" = 'USAA / Northwest';
UPDATE "churches" SET "neighborhood" = 'East Side' WHERE "id" = 'fbbdb40c-f707-4cf4-821b-c21065b9e86d' AND "neighborhood" = 'East Terrell Hills';
UPDATE "churches" SET "neighborhood" = 'West Side' WHERE "id" = '9b2fa3ca-3da3-4c7f-a921-cd6c10ab3ca9' AND "neighborhood" = 'Culebra';
UPDATE "churches" SET "neighborhood" = 'Balcones Heights' WHERE "id" = '3d851042-4d4e-42ed-bd12-bef9df082d1d' AND "neighborhood" = 'Prospect Hill';
UPDATE "churches" SET "neighborhood" = 'North Central' WHERE "id" = '8674870e-45e6-4ea2-904f-f8bf8d259dc7' AND "neighborhood" = 'North Side';
UPDATE "churches" SET "neighborhood" = 'Northwest Side' WHERE "id" = 'be4c8244-384a-482a-8b4c-1c8c8f2e4c75' AND "neighborhood" = 'Westover Hills';
UPDATE "churches" SET "neighborhood" = 'Southwest Side' WHERE "id" = 'f68a7e1f-aee3-46da-85d3-011270bd0754' AND "neighborhood" = 'Marbach';
UPDATE "churches" SET "neighborhood" = 'Northeast Side' WHERE "id" = '460e910e-5b2e-439f-8e68-08763255eb4c' AND "neighborhood" = 'Windcrest';
UPDATE "churches" SET "neighborhood" = 'Alamo Heights' WHERE "id" = 'd2bd5cbe-b60e-466d-ab0f-b31bd4ffcc8a' AND "neighborhood" IS NULL;
UPDATE "churches" SET "neighborhood" = 'Selma' WHERE "id" = '7a91131f-86ca-4f02-afb0-cc760b62c6bb' AND "neighborhood" = 'Schertz';
UPDATE "churches" SET "neighborhood" = 'Northwest Side' WHERE "id" = '2e11b26e-d95d-43e5-addd-ba168f748cea' AND "neighborhood" = 'USAA / Northwest';
UPDATE "churches" SET "neighborhood" = 'Thousand Oaks' WHERE "id" = '50d87e97-c9fd-44fa-8d8e-f22dcba208db' AND "neighborhood" = 'Stone Oak';
UPDATE "churches" SET "neighborhood" = 'West Side' WHERE "id" = '539b61c6-96c4-4e0e-91ad-987d7cfdf03f' AND "neighborhood" = 'Culebra';
UPDATE "churches" SET "neighborhood" = 'North Central' WHERE "id" = 'a9dc5c7a-c756-48ef-a28e-e3db553b3dc1' AND "neighborhood" = 'North Side';
UPDATE "churches" SET "neighborhood" = 'Northeast Side' WHERE "id" = 'a167de35-a69d-45fc-bedd-d1eaefef9db6' AND "neighborhood" = 'Terrell Hills';
UPDATE "churches" SET "neighborhood" = 'Northwest Side' WHERE "id" = '5902bb8d-7f5a-48a8-9a59-c727bfa9892e' AND "neighborhood" = 'USAA / Northwest';
UPDATE "churches" SET "neighborhood" = 'Northwest Side' WHERE "id" = '2fa03a4f-19b6-42e7-9e2c-4eb90be38c8a' AND "neighborhood" = 'USAA / Northwest';
UPDATE "churches" SET "neighborhood" = 'Northwest Side' WHERE "id" = 'd9b0f47b-a42c-4a59-a015-78d42c9d5d44' AND "neighborhood" = 'USAA / Northwest';
UPDATE "churches" SET "neighborhood" = 'Northeast Side' WHERE "id" = 'ff303473-298e-4b08-95c6-0971f0ae3c4e' AND "neighborhood" = 'Terrell Hills';
UPDATE "churches" SET "neighborhood" = 'Northeast Side' WHERE "id" = 'ead7b9f3-9b4d-4c0d-b19a-ffface1fda3b' AND "neighborhood" = 'Terrell Hills';
UPDATE "churches" SET "neighborhood" = 'West Side' WHERE "id" = '1e6fd358-cdab-40a9-9150-b2143e438880' AND "neighborhood" = 'Culebra';
UPDATE "churches" SET "neighborhood" = 'Highland Park' WHERE "id" = 'eb652a1f-0a41-4d5a-a84a-fafc059b9c38' AND "neighborhood" = 'South Side';
UPDATE "churches" SET "neighborhood" = 'Castle Hills' WHERE "id" = 'e098435b-c8b5-40f1-aa06-0d14ede7655e' AND "neighborhood" = 'Balcones Heights';
UPDATE "churches" SET "neighborhood" = 'Westover Hills' WHERE "id" = '0b62ce65-379c-4a80-84d2-084b9c2e6c8b' AND "neighborhood" = 'Sea World';
UPDATE "churches" SET "neighborhood" = 'Northeast Side' WHERE "id" = 'f5ab525e-b007-42c3-8d31-c0b3efeeab03' AND "neighborhood" = 'Windcrest';
UPDATE "churches" SET "neighborhood" = 'Northeast Side' WHERE "id" = '312a959b-711f-442f-bee2-b8a0448ae47b' AND "neighborhood" = 'Terrell Hills';
UPDATE "churches" SET "neighborhood" = 'Northwest Side' WHERE "id" = '402294d8-c295-48ff-b2c7-c01d4d7a4271' AND "neighborhood" = 'Alamo Ranch';
UPDATE "churches" SET "neighborhood" = 'West Side' WHERE "id" = '2c558721-281d-4518-a907-e556d7d99e4a' AND "neighborhood" = 'Culebra';
UPDATE "churches" SET "neighborhood" = 'Castle Hills' WHERE "id" = '40681ff4-b6e7-4352-8e6b-fac51f9b408c' AND "neighborhood" = 'Balcones Heights';
UPDATE "churches" SET "neighborhood" = 'East Side' WHERE "id" = '4bc11e9d-ecf7-454d-abcf-09319f270ab8' AND "neighborhood" = 'Eastside';
UPDATE "churches" SET "neighborhood" = 'Garden Ridge' WHERE "id" = '625c600b-5c2b-4c9f-9d25-3609bbbe22e7' AND "neighborhood" = 'Bulverde';
UPDATE "churches" SET "neighborhood" = 'Southwest Side' WHERE "id" = 'ae49475e-ec10-42df-a3a4-2c62e1a4fc23' AND "neighborhood" = 'Lackland';
UPDATE "churches" SET "neighborhood" = 'Highland Park' WHERE "id" = 'de4dd651-3e1e-44b3-803c-b4eb3ab1a3a4' AND "neighborhood" = 'South Side';
UPDATE "churches" SET "neighborhood" = 'Northeast Side' WHERE "id" = 'b491cebd-44cb-4206-b648-3c1f8db9eda8' AND "neighborhood" = 'Windcrest';
UPDATE "churches" SET "neighborhood" = 'Northeast Side' WHERE "id" = 'fc4a76b0-03ac-4107-861e-bbbb3fa167e9' AND "neighborhood" = 'Thousand Oaks';
UPDATE "churches" SET "neighborhood" = 'Northwest Side' WHERE "id" = '98352fc1-2133-4ee9-9246-28a3e5e0af0b' AND "neighborhood" = 'Alamo Ranch';
UPDATE "churches" SET "neighborhood" = 'Northeast Side' WHERE "id" = '5203e41c-410a-4146-a1a5-aa447e085810' AND "neighborhood" = 'Terrell Hills';
UPDATE "churches" SET "neighborhood" = 'Thousand Oaks' WHERE "id" = '18f0e6d1-d573-4af5-8814-da568909733d' AND "neighborhood" = 'Stone Oak';
UPDATE "churches" SET "neighborhood" = 'Southwest Side' WHERE "id" = '37394758-ac55-41d3-a5e2-26b9340239b4' AND "neighborhood" = 'Lackland';
UPDATE "churches" SET "neighborhood" = 'Northeast Side' WHERE "id" = '528db041-2a18-4551-a9b5-c26a0f739c90' AND "neighborhood" = 'Windcrest';
UPDATE "churches" SET "neighborhood" = 'Highland Park' WHERE "id" = '639da2af-93cf-47ce-8368-4710714e31c3' AND "neighborhood" = 'South Side';
UPDATE "churches" SET "neighborhood" = 'Westover Hills' WHERE "id" = '71d1928d-9a36-4520-b0a4-bac5b1f4bd22' AND "neighborhood" = 'Sea World';
UPDATE "churches" SET "neighborhood" = 'Live Oak' WHERE "id" = '396e3f61-8013-423e-83d5-06ac95eb7a62' AND "neighborhood" = 'Thousand Oaks';
UPDATE "churches" SET "neighborhood" = 'Southwest Side' WHERE "id" = '16170ed1-6b90-481b-96b6-b4b22e0b6781' AND "neighborhood" = 'Marbach';
UPDATE "churches" SET "neighborhood" = 'Alamo Heights' WHERE "id" = '83500030-a68b-44c5-b709-00ae947a1966' AND "neighborhood" IS NULL;
UPDATE "churches" SET "neighborhood" = 'Northwest Side' WHERE "id" = '76927500-a3d9-4314-9005-b5f5c875e346' AND "neighborhood" = 'USAA / Northwest';
UPDATE "churches" SET "neighborhood" = 'Northeast Side' WHERE "id" = '12a24a82-f9d8-4db4-b841-1db573087d38' AND "neighborhood" = 'Windcrest';
UPDATE "churches" SET "neighborhood" = 'Northwest Side' WHERE "id" = 'a5908bc1-3690-4f7e-935f-4c69b48fb8c1' AND "neighborhood" = 'Westover Hills';
UPDATE "churches" SET "neighborhood" = 'Westover Hills' WHERE "id" = '6f3cf640-5aee-49a1-8257-6d4a6fe634d1' AND "neighborhood" = 'Sea World';
UPDATE "churches" SET "neighborhood" = 'Alamo Ranch' WHERE "id" = '5e4be366-df86-4136-a96c-0ee58755c12d' AND "neighborhood" = 'Helotes';
UPDATE "churches" SET "neighborhood" = 'Northwest Side' WHERE "id" = '15be8f5a-afa3-4f97-b4c1-ed09fb83bba0' AND "neighborhood" = 'Alamo Ranch';
UPDATE "churches" SET "neighborhood" = 'Northeast Side' WHERE "id" = '5d4c1312-a7ed-4703-b2ed-f69fd855599c' AND "neighborhood" = 'Thousand Oaks';
UPDATE "churches" SET "neighborhood" = 'Highland Park' WHERE "id" = 'd724f3e0-7da1-4399-a298-b96973eb5366' AND "neighborhood" = 'South Side';
UPDATE "churches" SET "neighborhood" = 'Northeast Side' WHERE "id" = 'f4212ca4-445d-4db7-a63a-837bccc512d1' AND "neighborhood" = 'Windcrest';
UPDATE "churches" SET "neighborhood" = 'Windcrest' WHERE "id" = 'e814f276-a26f-4366-849d-af330e353e7c' AND "neighborhood" = 'Northeast Side';
UPDATE "churches" SET "neighborhood" = 'Northwest Side' WHERE "id" = 'd8c99eb4-51d4-4754-9cc7-765b0876f21d' AND "neighborhood" = 'Alamo Ranch';
UPDATE "churches" SET "neighborhood" = 'Garden Ridge' WHERE "id" = 'baf392dd-7959-4798-97a0-bffdb1efd4a8' AND "neighborhood" = 'Bulverde';
UPDATE "churches" SET "neighborhood" = 'Southwest Side' WHERE "id" = 'f737e9c4-909d-4eff-a79d-e4131d9781f0' AND "neighborhood" = 'Lackland';
UPDATE "churches" SET "neighborhood" = 'Selma' WHERE "id" = 'b987d7a1-06b4-4163-92f1-c1f833656899' AND "neighborhood" = 'Schertz';
UPDATE "churches" SET "neighborhood" = 'West Side' WHERE "id" = '6d93b00e-bebe-4bd0-a277-7606b88ea573' AND "neighborhood" = 'Culebra';
UPDATE "churches" SET "neighborhood" = 'West Side' WHERE "id" = 'e9605ff7-5d6d-4471-8c74-3851d108d79c' AND "neighborhood" = 'Culebra';
UPDATE "churches" SET "neighborhood" = 'Alamo Heights' WHERE "id" = '49b79482-64e6-4b2a-88fd-b5d381e4b07b' AND "neighborhood" IS NULL;
UPDATE "churches" SET "neighborhood" = 'Thousand Oaks' WHERE "id" = '000a8630-18e8-44ab-82a3-c39c32a54044' AND "neighborhood" = 'Stone Oak';
UPDATE "churches" SET "neighborhood" = 'Thousand Oaks' WHERE "id" = '946bdfeb-1d45-475b-abed-ed917c8f60f5' AND "neighborhood" = 'Stone Oak';
UPDATE "churches" SET "neighborhood" = 'Westover Hills' WHERE "id" = '199ee642-5637-45e3-9ddf-412eda8c53db' AND "neighborhood" = 'Sea World';
UPDATE "churches" SET "neighborhood" = 'Northeast Side' WHERE "id" = 'b6c17b12-6d96-4feb-9cc3-630b42997011' AND "neighborhood" = 'Terrell Hills';
UPDATE "churches" SET "neighborhood" = 'Jefferson' WHERE "id" = '3c7e6070-5f48-40da-9511-1df234bde0cc' AND "neighborhood" = 'Prospect Hill';
UPDATE "churches" SET "neighborhood" = 'East Side' WHERE "id" = 'e11e7c70-de83-4bb6-889b-dfd7b012d3fc' AND "neighborhood" = 'East Terrell Hills';
UPDATE "churches" SET "neighborhood" = 'North Central' WHERE "id" = 'c3fe34cc-4819-4f51-94f0-358bdf7977c0' AND "neighborhood" = 'North Side';
UPDATE "churches" SET "neighborhood" = 'Jefferson' WHERE "id" = '5d0a8058-6780-487f-a44b-a24b0563e133' AND "neighborhood" = 'Prospect Hill';
UPDATE "churches" SET "neighborhood" = 'Port San Antonio' WHERE "id" = '15e13c76-b695-4444-a9a9-9c65852b8aa7' AND "neighborhood" = 'Lackland';
UPDATE "churches" SET "neighborhood" = 'North Central' WHERE "id" = 'e916d9ca-c017-442a-bd1f-9971fde4d916' AND "neighborhood" = 'North Side';
UPDATE "churches" SET "neighborhood" = 'Northeast Side' WHERE "id" = 'd1979b87-432d-42c5-a34a-567ea05169aa' AND "neighborhood" = 'Windcrest';
UPDATE "churches" SET "neighborhood" = 'Northwest Side' WHERE "id" = 'afd8b884-fc9c-41cd-95dd-6eb781d78412' AND "neighborhood" = 'Westover Hills';
UPDATE "churches" SET "neighborhood" = 'Westover Hills' WHERE "id" = 'a209d467-cc04-47a7-ba5f-3972e45a6153' AND "neighborhood" = 'Sea World';
UPDATE "churches" SET "neighborhood" = 'Northwest Side' WHERE "id" = '0447f238-4052-47f5-8b68-c97eec773bb5' AND "neighborhood" = 'Westover Hills';
UPDATE "churches" SET "neighborhood" = 'East Side' WHERE "id" = 'a9a182e3-0d92-495d-b9fd-342452e38bf9' AND "neighborhood" = 'East Terrell Hills';
UPDATE "churches" SET "neighborhood" = 'Northeast Side' WHERE "id" = '18f025c3-d149-47d1-9c65-7155e5205c63' AND "neighborhood" = 'Terrell Hills';
UPDATE "churches" SET "neighborhood" = 'Atascosa' WHERE "id" = '8b417985-c860-4c10-b667-db0373581ecc' AND "neighborhood" IS NULL;
UPDATE "churches" SET "neighborhood" = 'Kirby' WHERE "id" = 'bb01ade7-79ca-4d60-ad6e-c01bf4bdc3ec' AND "neighborhood" = 'East Terrell Hills';
UPDATE "churches" SET "neighborhood" = 'Westover Hills' WHERE "id" = '3e96b2f2-bcc9-4d4e-9fff-ec3a82489bf0' AND "neighborhood" = 'Sea World';
UPDATE "churches" SET "neighborhood" = 'Alamo Heights' WHERE "id" = 'c421858c-0d82-45e5-8653-f4bd43ee0540' AND "neighborhood" IS NULL;
UPDATE "churches" SET "neighborhood" = 'East Side' WHERE "id" = '15c92d83-132b-42b8-a608-64010f7694e0' AND "neighborhood" = 'East Terrell Hills';
UPDATE "churches" SET "neighborhood" = 'Windcrest' WHERE "id" = 'cd804b06-ecf7-4872-abed-97285c8a671e' AND "neighborhood" = 'Northeast Side';
UPDATE "churches" SET "neighborhood" = 'Southwest Side' WHERE "id" = 'f6a3da47-bf29-4287-ae52-f1320412687b' AND "neighborhood" = 'Marbach';
UPDATE "churches" SET "neighborhood" = 'Selma' WHERE "id" = '09ae1db7-3c2e-4238-956c-29c8579e4869' AND "neighborhood" = 'Schertz';
UPDATE "churches" SET "neighborhood" = 'Northeast Side' WHERE "id" = '18183f47-27c2-4cb0-867d-e3cfc66ed3ec' AND "neighborhood" = 'Thousand Oaks';
UPDATE "churches" SET "neighborhood" = 'Windcrest' WHERE "id" = 'f912a6a4-f20e-41d5-a9d6-24d527f8c1cd' AND "neighborhood" = 'Northeast Side';
UPDATE "churches" SET "neighborhood" = 'Southwest Side' WHERE "id" = '590f5cfd-f503-49bf-b105-f1a1e5de219e' AND "neighborhood" = 'Marbach';
UPDATE "churches" SET "neighborhood" = 'Windcrest' WHERE "id" = '3d93d410-9f1e-41ad-a2de-7c81637eb3de' AND "neighborhood" = 'Northeast Side';
UPDATE "churches" SET "neighborhood" = 'Northeast Side' WHERE "id" = '997aedd9-bc96-43be-8fa4-39588430670c' AND "neighborhood" = 'Windcrest';
UPDATE "churches" SET "neighborhood" = 'Windcrest' WHERE "id" = 'ff0291ac-a49a-4c2e-a610-60656b774c94' AND "neighborhood" = 'Northeast Side';
UPDATE "churches" SET "neighborhood" = 'Southwest Side' WHERE "id" = 'fe81645f-4a56-4c6b-9731-b5fcaa436b6b' AND "neighborhood" = 'Marbach';
UPDATE "churches" SET "neighborhood" = 'Northwest Side' WHERE "id" = '1567abe4-85dc-407f-a629-d1ce61b536ff' AND "neighborhood" = 'USAA / Northwest';
UPDATE "churches" SET "neighborhood" = 'Northwest Side' WHERE "id" = '8e87800d-1d01-4f49-a023-a115e7bc5210' AND "neighborhood" = 'Alamo Ranch';
UPDATE "churches" SET "neighborhood" = 'North Central' WHERE "id" = '1d546294-55f3-4296-81f8-220bc526237e' AND "neighborhood" = 'North Side';
UPDATE "churches" SET "neighborhood" = 'Jefferson' WHERE "id" = '5b987c0f-a96a-465a-afd4-9e85a3afcb39' AND "neighborhood" = 'Prospect Hill';
UPDATE "churches" SET "neighborhood" = 'West Side' WHERE "id" = 'ae736be4-bdae-48ce-918b-9df4699f6906' AND "neighborhood" = 'Culebra';
UPDATE "churches" SET "neighborhood" = 'Northeast Side' WHERE "id" = '582f5081-7aeb-4677-b430-18a25fa43dc7' AND "neighborhood" = 'Windcrest';
UPDATE "churches" SET "neighborhood" = 'Alamo Ranch' WHERE "id" = 'c77ec6eb-ff36-4567-910c-3a46351b701c' AND "neighborhood" = 'Helotes';
UPDATE "churches" SET "neighborhood" = 'Northeast Side' WHERE "id" = '95fd39c3-bc4c-400c-bbb6-4fa552874fa6' AND "neighborhood" = 'Terrell Hills';
UPDATE "churches" SET "neighborhood" = 'West Side' WHERE "id" = '1a80df38-3d8b-428c-9bdf-4a6d7838616f' AND "neighborhood" = 'Culebra';
UPDATE "churches" SET "neighborhood" = 'Westover Hills' WHERE "id" = '47c91202-3c0a-4315-b4c7-35e4cd8274ea' AND "neighborhood" = 'Sea World';
UPDATE "churches" SET "neighborhood" = 'Thousand Oaks' WHERE "id" = '364581c5-9d82-4091-a1b5-f772631ea526' AND "neighborhood" = 'Stone Oak';
UPDATE "churches" SET "neighborhood" = 'Westover Hills' WHERE "id" = 'd445d9d4-9529-49f6-ae9c-f1a10b819b27' AND "neighborhood" = 'Sea World';
UPDATE "churches" SET "neighborhood" = 'Northeast Side' WHERE "id" = '8f8ff57b-5ef4-4b42-93b5-115e5a20cf72' AND "neighborhood" = 'Thousand Oaks';
UPDATE "churches" SET "neighborhood" = 'Atascosa' WHERE "id" = '3e2a1bb6-52be-465c-ace4-ce0a48ca18fe' AND "neighborhood" IS NULL;
UPDATE "churches" SET "neighborhood" = 'Selma' WHERE "id" = '63a76b08-999b-4607-b4f0-69c7dde582ce' AND "neighborhood" = 'Schertz';
UPDATE "churches" SET "neighborhood" = 'Northeast Side' WHERE "id" = '73c1b743-e6e1-479b-9def-627c99eeaf03' AND "neighborhood" = 'Thousand Oaks';
UPDATE "churches" SET "neighborhood" = 'Northeast Side' WHERE "id" = '20f8fd57-55d4-4ba3-a5bb-449d885e6174' AND "neighborhood" = 'Thousand Oaks';
UPDATE "churches" SET "neighborhood" = 'Northwest Side' WHERE "id" = '290f6ef8-7619-4f8c-ace0-ea9ff639df3f' AND "neighborhood" = 'Westover Hills';
UPDATE "churches" SET "neighborhood" = 'Port San Antonio' WHERE "id" = 'e0bdbfe7-8990-43de-8d2e-79f1c6b2c41c' AND "neighborhood" = 'Lackland';
UPDATE "churches" SET "neighborhood" = 'Alamo Heights' WHERE "id" = 'e3d8a2ae-818d-4bf7-8c6c-49574044bddb' AND "neighborhood" IS NULL;
UPDATE "churches" SET "neighborhood" = 'Northwest Side' WHERE "id" = 'ce197a6b-59d7-43bd-aa17-a20f071853d2' AND "neighborhood" = 'Alamo Ranch';
UPDATE "churches" SET "neighborhood" = 'West Side' WHERE "id" = '331075df-3697-4fc3-a60b-e98ca3e0cd07' AND "neighborhood" = 'Culebra';
UPDATE "churches" SET "neighborhood" = 'Northwest Side' WHERE "id" = '238bacab-c254-4d9c-981c-635d5b148c07' AND "neighborhood" = 'USAA / Northwest';
UPDATE "churches" SET "neighborhood" = 'Northeast Side' WHERE "id" = '1f4235cf-2840-4ba0-95f6-aa2d59587482' AND "neighborhood" = 'Windcrest';
UPDATE "churches" SET "neighborhood" = 'Highland Park' WHERE "id" = '698bf27b-dd3c-4575-aa74-ab9805a7446b' AND "neighborhood" = 'South Side';
UPDATE "churches" SET "neighborhood" = 'Shavano Park' WHERE "id" = '12892c70-2f2d-4bd3-b20e-530351411cf4' AND "neighborhood" = 'Northwest Side';
UPDATE "churches" SET "neighborhood" = 'Northeast Side' WHERE "id" = 'c05eb96e-9e25-49ed-9b04-b19cd62b69d0' AND "neighborhood" = 'Thousand Oaks';
UPDATE "churches" SET "neighborhood" = 'East Side' WHERE "id" = '07a5fb3b-6830-45d6-b189-3a75ff987e7c' AND "neighborhood" = 'East Terrell Hills';
UPDATE "churches" SET "neighborhood" = 'Northeast Side' WHERE "id" = '812834cb-cb46-4b7d-9024-cabd2a214dad' AND "neighborhood" = 'Terrell Hills';
UPDATE "churches" SET "neighborhood" = 'Northeast Side' WHERE "id" = 'f14517e8-b43e-4449-9c9d-27f93f01b104' AND "neighborhood" = 'Thousand Oaks';
UPDATE "churches" SET "neighborhood" = 'Southwest Side' WHERE "id" = '1d80a128-1650-415c-9648-42f5d127eaf9' AND "neighborhood" = 'Lackland';
UPDATE "churches" SET "neighborhood" = 'Northeast Side' WHERE "id" = 'd90ccb19-bf7f-4874-958e-d76372cb396f' AND "neighborhood" = 'Thousand Oaks';
UPDATE "churches" SET "neighborhood" = 'Castle Hills' WHERE "id" = 'af69e618-67d2-40ec-bf95-120eb92b4709' AND "neighborhood" = 'Balcones Heights';
UPDATE "churches" SET "neighborhood" = 'Southwest Side' WHERE "id" = '1fc6c3c9-4236-4ce6-9e2f-72f7734d15af' AND "neighborhood" = 'Marbach';
UPDATE "churches" SET "neighborhood" = 'Southwest Side' WHERE "id" = 'bd636a8f-7475-443d-bc91-bcec7fb68a60' AND "neighborhood" = 'Marbach';
UPDATE "churches" SET "neighborhood" = 'Southwest Side' WHERE "id" = 'bb418d10-0a6d-422b-ac35-20b81eafe00c' AND "neighborhood" = 'Lackland';
UPDATE "churches" SET "neighborhood" = 'Jefferson' WHERE "id" = '2b93fc6f-43a5-4c89-9ac4-f3e31c45e165' AND "neighborhood" = 'Prospect Hill';
UPDATE "churches" SET "neighborhood" = 'Westover Hills' WHERE "id" = 'ca989c9f-be31-4caa-b0e7-8714e38b66de' AND "neighborhood" = 'Sea World';
UPDATE "churches" SET "neighborhood" = 'Southwest Side' WHERE "id" = '7f56b0ee-d4e3-4132-a86c-aef35765561b' AND "neighborhood" = 'Marbach';
UPDATE "churches" SET "neighborhood" = 'Thousand Oaks' WHERE "id" = 'ade0b70f-f212-43ac-a83b-d40f522ac35c' AND "neighborhood" = 'Stone Oak';
UPDATE "churches" SET "neighborhood" = 'Northwest Side' WHERE "id" = 'ed3febbb-8774-47b9-b375-7c687e6b750d' AND "neighborhood" = 'Alamo Ranch';
UPDATE "churches" SET "neighborhood" = 'Northeast Side' WHERE "id" = '49423b87-5fae-4672-ad36-abedc5d2d920' AND "neighborhood" = 'Windcrest';
UPDATE "churches" SET "neighborhood" = 'Northeast Side' WHERE "id" = 'ffcc919f-8402-439c-b953-ba166991d312' AND "neighborhood" = 'Thousand Oaks';
UPDATE "churches" SET "neighborhood" = 'Southwest Side' WHERE "id" = '9a9e1e8e-08d9-417a-9735-a1d0d882fe65' AND "neighborhood" = 'Marbach';
UPDATE "churches" SET "neighborhood" = 'Northwest Side' WHERE "id" = '4cf8d34e-d24a-4e04-b98b-1ffe948e96e4' AND "neighborhood" = 'Alamo Ranch';
UPDATE "churches" SET "neighborhood" = 'Live Oak' WHERE "id" = '7b94fe03-38d8-4ca1-8ca4-60cb2d8cf621' AND "neighborhood" = 'Thousand Oaks';
UPDATE "churches" SET "neighborhood" = 'Southwest Side' WHERE "id" = 'f00ec0e0-8639-45f6-b049-5b3ba3a31212' AND "neighborhood" = 'Marbach';
UPDATE "churches" SET "neighborhood" = 'Alamo Ranch' WHERE "id" = '85eb2c8b-a009-481c-95cb-b58b004b60d5' AND "neighborhood" = 'Helotes';
UPDATE "churches" SET "neighborhood" = 'Timberwood Park' WHERE "id" = '732873be-d6eb-4ef7-90c8-1e5967d4c43b' AND "neighborhood" = 'Stone Oak';
UPDATE "churches" SET "neighborhood" = 'Northwest Side' WHERE "id" = '53a5ea1c-4b17-4226-b0e0-893b6b2f8fc9' AND "neighborhood" = 'Alamo Ranch';
UPDATE "churches" SET "neighborhood" = 'Northeast Side' WHERE "id" = 'ac6a9509-39eb-4be4-b54f-fbb8fdd84de1' AND "neighborhood" = 'Thousand Oaks';
UPDATE "churches" SET "neighborhood" = 'Live Oak' WHERE "id" = '4d66f63b-908a-49a9-a982-e61cd79937fc' AND "neighborhood" = 'Thousand Oaks';
UPDATE "churches" SET "neighborhood" = 'Alamo Ranch' WHERE "id" = 'a71e5d0d-68b6-48b2-bdd4-2e2162a02b45' AND "neighborhood" = 'Helotes';
UPDATE "churches" SET "neighborhood" = 'Northeast Side' WHERE "id" = 'e14bc299-8f4d-44dd-805a-3bb11416375b' AND "neighborhood" = 'Windcrest';
UPDATE "churches" SET "neighborhood" = 'Northeast Side' WHERE "id" = '1aa82404-160b-47ee-af32-2b2bf6bd1de4' AND "neighborhood" = 'Windcrest';
UPDATE "churches" SET "neighborhood" = 'Thousand Oaks' WHERE "id" = 'fd65e348-d174-4b8e-9a73-d89be8972385' AND "neighborhood" = 'Stone Oak';
UPDATE "churches" SET "neighborhood" = 'Westover Hills' WHERE "id" = '6b98295a-5651-458f-8d1f-4fafc9c7448c' AND "neighborhood" = 'Sea World';
UPDATE "churches" SET "neighborhood" = 'Southwest Side' WHERE "id" = 'daff9ef1-d3dc-4fb2-9269-8201e654b43e' AND "neighborhood" = 'Marbach';
UPDATE "churches" SET "neighborhood" = 'Westover Hills' WHERE "id" = 'fc4ce817-685f-4ab3-a473-5c1a3b91795e' AND "neighborhood" = 'Sea World';
UPDATE "churches" SET "neighborhood" = 'Westover Hills' WHERE "id" = '819a9ea4-7960-4c25-8e09-7674a98b7d60' AND "neighborhood" = 'Sea World';
UPDATE "churches" SET "neighborhood" = 'Southwest Side' WHERE "id" = '1cb44d8e-7859-434b-9993-f6914efe53c6' AND "neighborhood" = 'Marbach';
UPDATE "churches" SET "neighborhood" = 'Westover Hills' WHERE "id" = '91850c06-ed99-4a01-911c-5ea6934148b9' AND "neighborhood" = 'Sea World';
UPDATE "churches" SET "neighborhood" = 'Thousand Oaks' WHERE "id" = '572ab642-c9a8-42d0-85ab-f03a560cd68b' AND "neighborhood" = 'Stone Oak';
UPDATE "churches" SET "neighborhood" = 'Northeast Side' WHERE "id" = 'c33f26cc-5b8f-44c1-ac26-d59b41e3195d' AND "neighborhood" = 'Windcrest';
UPDATE "churches" SET "neighborhood" = 'Castle Hills' WHERE "id" = 'f1c0c1a4-ae15-4973-8b3d-be98c39c8a59' AND "neighborhood" = 'Balcones Heights';
UPDATE "churches" SET "neighborhood" = 'Highland Park' WHERE "id" = 'b9f4f6cc-c3c7-4366-b14d-741cd9a539fd' AND "neighborhood" = 'South Side';
UPDATE "churches" SET "neighborhood" = 'Northeast Side' WHERE "id" = '955977cf-3e0b-410e-b625-b67c7ee18516' AND "neighborhood" = 'Windcrest';
UPDATE "churches" SET "neighborhood" = 'Southwest Side' WHERE "id" = '5370890f-9dff-4267-bd08-348ce9c6bbad' AND "neighborhood" = 'Marbach';
UPDATE "churches" SET "neighborhood" = 'Northwest Side' WHERE "id" = 'bf9f5aca-9b17-4c2f-a572-bc2383fb1afc' AND "neighborhood" = 'Alamo Ranch';
UPDATE "churches" SET "neighborhood" = 'Alamo Heights' WHERE "id" = 'fef8d6d7-2e9e-4886-ae63-6920776b14d2' AND "neighborhood" IS NULL;
UPDATE "churches" SET "neighborhood" = 'East Side' WHERE "id" = '6ff05179-3b1d-42df-b76a-557ccd380576' AND "neighborhood" = 'Eastside';
UPDATE "churches" SET "neighborhood" = 'West Side' WHERE "id" = '5e524572-1bfa-4379-9a30-77198365b944' AND "neighborhood" = 'Culebra';
UPDATE "churches" SET "neighborhood" = 'Northeast Side' WHERE "id" = 'c338cb9e-0d65-4713-9981-2f003a8c29f2' AND "neighborhood" = 'Windcrest';
UPDATE "churches" SET "neighborhood" = 'Southwest Side' WHERE "id" = 'ed481522-bcda-48f4-ad8c-ae7904da54c1' AND "neighborhood" = 'Lackland';
UPDATE "churches" SET "neighborhood" = 'Northeast Side' WHERE "id" = '52ca1ef4-39b2-40e4-abed-44d21e4fd6dd' AND "neighborhood" = 'Windcrest';
UPDATE "churches" SET "neighborhood" = 'Thousand Oaks' WHERE "id" = 'aca84b3d-9a68-4870-97de-7b0813f9149a' AND "neighborhood" = 'Stone Oak';
UPDATE "churches" SET "neighborhood" = 'Live Oak' WHERE "id" = '6cf305ef-b8f4-42a4-bcee-2d29135585ca' AND "neighborhood" = 'Thousand Oaks';
UPDATE "churches" SET "neighborhood" = 'Windcrest' WHERE "id" = 'd8c8200a-115b-489f-9d7e-769d5a8169ce' AND "neighborhood" = 'Northeast Side';
UPDATE "churches" SET "neighborhood" = 'Northeast Side' WHERE "id" = '6b6c4f8a-d086-477c-a49d-0351bad4c695' AND "neighborhood" = 'Thousand Oaks';
UPDATE "churches" SET "neighborhood" = 'Northeast Side' WHERE "id" = '60a0e5bf-4806-4b60-bbaa-adc375756f4e' AND "neighborhood" = 'Windcrest';
UPDATE "churches" SET "neighborhood" = 'Southwest Side' WHERE "id" = '48c67f75-909d-4431-af0a-18a374e8793d' AND "neighborhood" = 'Marbach';
UPDATE "churches" SET "neighborhood" = 'Northeast Side' WHERE "id" = '9b8daf08-200a-410a-94b2-244947677085' AND "neighborhood" = 'Terrell Hills';
UPDATE "churches" SET "neighborhood" = 'West Side' WHERE "id" = 'c1ffda5d-7c83-46d9-9240-6a1efa6fc526' AND "neighborhood" = 'Culebra';
UPDATE "churches" SET "neighborhood" = 'Southwest Side' WHERE "id" = 'f1643681-4b87-4130-bd00-20b1679ff983' AND "neighborhood" = 'Marbach';
UPDATE "churches" SET "neighborhood" = 'Thousand Oaks' WHERE "id" = '7b884380-09c7-4a65-b202-4e5d0380c639' AND "neighborhood" = 'Stone Oak';
UPDATE "churches" SET "neighborhood" = 'Windcrest' WHERE "id" = '942c3b65-1f99-4b9c-991f-85e63f9f511e' AND "neighborhood" = 'Northeast Side';
UPDATE "churches" SET "neighborhood" = 'Garden Ridge' WHERE "id" = 'f9b42878-621d-4203-8039-f5df3eb8d0ad' AND "neighborhood" = 'Bulverde';
UPDATE "churches" SET "neighborhood" = 'Northeast Side' WHERE "id" = 'd13354af-4aa3-4ed6-8336-5f94231f794d' AND "neighborhood" = 'Windcrest';
UPDATE "churches" SET "neighborhood" = 'Thousand Oaks' WHERE "id" = '007fa8fd-d64e-4aa5-b50b-4f76c8a04106' AND "neighborhood" = 'Stone Oak';
UPDATE "churches" SET "neighborhood" = 'Thousand Oaks' WHERE "id" = 'ddce6543-4624-4c6d-9af0-048ed19062fa' AND "neighborhood" = 'Stone Oak';
UPDATE "churches" SET "neighborhood" = 'Northwest Side' WHERE "id" = 'fa321427-107e-4554-988a-b3c6d7b7fc6f' AND "neighborhood" = 'Westover Hills';
UPDATE "churches" SET "neighborhood" = 'Shavano Park' WHERE "id" = '19c447e7-28f8-44fd-92c3-55037df4f46f' AND "neighborhood" = 'Northwest Side';
UPDATE "churches" SET "neighborhood" = 'Northwest Side' WHERE "id" = 'c6dfb386-a337-481a-8e51-a9e3d6e924d6' AND "neighborhood" = 'Alamo Ranch';
UPDATE "churches" SET "neighborhood" = 'Northwest Side' WHERE "id" = '0e141ca3-b94f-43ff-b825-9d67a6c7190d' AND "neighborhood" = 'Westover Hills';
UPDATE "churches" SET "neighborhood" = 'Northwest Side' WHERE "id" = '30c35e14-3b05-4307-aa38-aa7a5ac17372' AND "neighborhood" = 'Westover Hills';
UPDATE "churches" SET "neighborhood" = 'Westover Hills' WHERE "id" = '1ead9bce-6f12-46d4-8dea-6bd70b50d2c9' AND "neighborhood" = 'Sea World';
UPDATE "churches" SET "neighborhood" = 'Northwest Side' WHERE "id" = 'fc431140-af81-4b4d-9118-74f4bbf2aebf' AND "neighborhood" = 'Westover Hills';
UPDATE "churches" SET "neighborhood" = 'Northwest Side' WHERE "id" = 'afa7660d-082d-4341-9f66-59a3f95efbce' AND "neighborhood" = 'Westover Hills';
UPDATE "churches" SET "neighborhood" = 'Alamo Heights' WHERE "id" = '852370b2-54f6-411b-8c0a-26c5cf0b6c69' AND "neighborhood" IS NULL;
UPDATE "churches" SET "neighborhood" = 'Northeast Side' WHERE "id" = '9c3bbeb1-2712-4022-979f-637e5f101e14' AND "neighborhood" = 'Windcrest';
UPDATE "churches" SET "neighborhood" = 'Northeast Side' WHERE "id" = '35f1681c-5a04-405b-a80c-f9cec3595f15' AND "neighborhood" = 'Thousand Oaks';
UPDATE "churches" SET "neighborhood" = 'Shavano Park' WHERE "id" = 'fa541c2c-8ac6-44b5-a274-48b8c14d9cfa' AND "neighborhood" = 'Northwest Side';
UPDATE "churches" SET "neighborhood" = 'China Grove' WHERE "id" = 'b93ca945-358f-4116-907d-dd77aff7d95f' AND "neighborhood" = 'Far East Side';
UPDATE "churches" SET "neighborhood" = 'Westover Hills' WHERE "id" = 'a2dc6ac6-58d4-4031-bdcf-4281aba4968c' AND "neighborhood" = 'Sea World';
UPDATE "churches" SET "neighborhood" = 'Northeast Side' WHERE "id" = '583baf8d-7020-49c5-96f8-42e04656e57f' AND "neighborhood" = 'Windcrest';
UPDATE "churches" SET "neighborhood" = 'Selma' WHERE "id" = '09bf35b9-9090-4d8d-9037-82934050cf94' AND "neighborhood" = 'Schertz';
UPDATE "churches" SET "neighborhood" = 'Leon Springs' WHERE "id" = '36d57a8c-94c6-4526-a02a-f5a0f8f07565' AND "neighborhood" = 'The Dominion';
UPDATE "churches" SET "neighborhood" = 'Atascosa' WHERE "id" = '22574bad-0cac-436c-b346-bfa0391433e2' AND "neighborhood" IS NULL;
UPDATE "churches" SET "neighborhood" = 'Alamo Ranch' WHERE "id" = 'a8d89035-f4a6-429c-b379-5f63680c9981' AND "neighborhood" = 'Helotes';
UPDATE "churches" SET "neighborhood" = 'East Side' WHERE "id" = '555e8d33-a2d9-465e-b8e8-f50d23bec928' AND "neighborhood" = 'Eastside';
UPDATE "churches" SET "neighborhood" = 'Hollywood Park' WHERE "id" = 'b3df812b-2e09-4baf-9a15-718232ced6fb' AND "neighborhood" = 'North Central';
UPDATE "churches" SET "neighborhood" = 'Southwest Side' WHERE "id" = '26db5f77-b0fc-45d9-861e-3d7fa90465dd' AND "neighborhood" = 'Lackland';
UPDATE "churches" SET "neighborhood" = 'North Central' WHERE "id" = '550a51d9-f951-49a2-8a8a-d94a726be2f2' AND "neighborhood" = 'North Side';
UPDATE "churches" SET "neighborhood" = 'Westover Hills' WHERE "id" = '99274c37-4838-4442-9bae-ee60533a1036' AND "neighborhood" = 'Sea World';
UPDATE "churches" SET "neighborhood" = 'Westover Hills' WHERE "id" = '4741e806-c103-4980-8641-7bdc8052d853' AND "neighborhood" = 'Sea World';
UPDATE "churches" SET "neighborhood" = 'Northeast Side' WHERE "id" = '77253b89-19da-4093-9fab-9a3ee19c359a' AND "neighborhood" = 'Windcrest';
UPDATE "churches" SET "neighborhood" = 'Northeast Side' WHERE "id" = '502c3178-bbf3-4947-a272-dbd577235dcb' AND "neighborhood" = 'Windcrest';
UPDATE "churches" SET "neighborhood" = 'East Side' WHERE "id" = '6d45cb7a-8a60-424e-b262-2939e2c8b5b6' AND "neighborhood" = 'East Terrell Hills';
UPDATE "churches" SET "neighborhood" = 'Southwest Side' WHERE "id" = 'db4298f5-b469-489f-bc4d-668a436ca9d7' AND "neighborhood" = 'Marbach';
UPDATE "churches" SET "neighborhood" = 'Westover Hills' WHERE "id" = '50eb7216-132f-4d73-a633-173829e279f9' AND "neighborhood" = 'Sea World';
UPDATE "churches" SET "neighborhood" = 'Southwest Side' WHERE "id" = '866c4888-1886-4dbe-9484-4c8d2a393ed2' AND "neighborhood" = 'Marbach';
UPDATE "churches" SET "neighborhood" = 'Northeast Side' WHERE "id" = 'b7b76073-d237-47b1-945b-f7de19cf9c71' AND "neighborhood" = 'Windcrest';
UPDATE "churches" SET "neighborhood" = 'Jefferson' WHERE "id" = 'cb7a7080-00e0-44d6-964f-56dbb8f12cc3' AND "neighborhood" = 'Prospect Hill';
UPDATE "churches" SET "neighborhood" = 'Northwest Side' WHERE "id" = '23b330a8-78b4-4159-a02d-30acac685ceb' AND "neighborhood" = 'Westover Hills';
UPDATE "churches" SET "neighborhood" = 'Thousand Oaks' WHERE "id" = '5e937258-4179-4d7f-a790-bdf7d1e4a5e9' AND "neighborhood" = 'Stone Oak';
UPDATE "churches" SET "neighborhood" = 'Southwest Side' WHERE "id" = 'a8e6fa66-0e38-41e2-9d40-b8cc1219f466' AND "neighborhood" = 'Lackland';
UPDATE "churches" SET "neighborhood" = 'Thousand Oaks' WHERE "id" = 'b6b7b766-a3e3-443c-aa00-9e16d7bd586e' AND "neighborhood" = 'Stone Oak';
UPDATE "churches" SET "neighborhood" = 'Thousand Oaks' WHERE "id" = 'b625edae-2735-4679-9cc1-bc0d2bdb97f6' AND "neighborhood" = 'Stone Oak';
UPDATE "churches" SET "neighborhood" = 'Southwest Side' WHERE "id" = '7715e74e-fd50-4cae-9155-bfc860db36f0' AND "neighborhood" = 'Marbach';
UPDATE "churches" SET "neighborhood" = 'Garden Ridge' WHERE "id" = 'e4a21bfa-bc67-4eba-8c48-87cd33b38db8' AND "neighborhood" = 'Bulverde';
UPDATE "churches" SET "neighborhood" = 'North Central' WHERE "id" = '4181d7c1-ddb3-49dd-a852-9abc6364d19e' AND "neighborhood" = 'North Side';
UPDATE "churches" SET "neighborhood" = 'Selma' WHERE "id" = '2466bf1e-cd4e-4f25-8f9f-1436a7d19e2b' AND "neighborhood" = 'Schertz';
UPDATE "churches" SET "neighborhood" = 'Selma' WHERE "id" = '410fe632-12d8-4f01-851c-8afb6518047a' AND "neighborhood" = 'Schertz';
UPDATE "churches" SET "neighborhood" = 'Northeast Side' WHERE "id" = '659750df-ec44-4bf6-9de9-0da2892649d6' AND "neighborhood" = 'Thousand Oaks';
UPDATE "churches" SET "neighborhood" = 'Southwest Side' WHERE "id" = 'b8e81a44-b2e5-4425-b0e4-5ba75779984d' AND "neighborhood" = 'Marbach';
UPDATE "churches" SET "neighborhood" = 'Westover Hills' WHERE "id" = '704808ae-ef9c-4446-b64b-f2a2ffe8f8de' AND "neighborhood" = 'Sea World';
UPDATE "churches" SET "neighborhood" = 'Jefferson' WHERE "id" = '3fc98a4f-2731-432e-8e92-642c438ffdb9' AND "neighborhood" = 'Prospect Hill';
UPDATE "churches" SET "neighborhood" = 'Highland Park' WHERE "id" = '640eef54-3941-465c-99a7-85d33015baa7' AND "neighborhood" = 'South Side';
UPDATE "churches" SET "neighborhood" = 'Jefferson' WHERE "id" = '0df86f88-e427-4164-9ef8-bee2a0b135e1' AND "neighborhood" = 'Prospect Hill';
UPDATE "churches" SET "neighborhood" = 'Northwest Side' WHERE "id" = 'c52957fc-23cb-4765-989d-4f4cbe082340' AND "neighborhood" = 'Westover Hills';
UPDATE "churches" SET "neighborhood" = 'Southwest Side' WHERE "id" = 'fc501eb1-4717-4e71-9b1e-8dd1e9dfd62c' AND "neighborhood" = 'Lackland';
UPDATE "churches" SET "neighborhood" = 'Northwest Side' WHERE "id" = '676ccfdf-f585-4b38-b255-4cf528fe4825' AND "neighborhood" = 'USAA / Northwest';
UPDATE "churches" SET "neighborhood" = 'Northwest Side' WHERE "id" = '3450abbb-d65b-4ad7-ad2f-dff0f7f3626d' AND "neighborhood" = 'USAA / Northwest';
UPDATE "churches" SET "neighborhood" = 'Castle Hills' WHERE "id" = 'dd46b505-7d3f-40e1-90a4-9337c2781bd7' AND "neighborhood" = 'Balcones Heights';
UPDATE "churches" SET "neighborhood" = 'Alamo Heights' WHERE "id" = '0440952b-16ed-44f4-8212-bd814a20d694' AND "neighborhood" IS NULL;
UPDATE "churches" SET "neighborhood" = 'Westover Hills' WHERE "id" = 'c067e5d3-ea9f-466b-b262-d324fa16398b' AND "neighborhood" = 'Sea World';
UPDATE "churches" SET "neighborhood" = 'Southwest Side' WHERE "id" = 'dd089f90-9182-498b-bc19-1575b894e4f2' AND "neighborhood" = 'Marbach';
UPDATE "churches" SET "neighborhood" = 'Northwest Side' WHERE "id" = 'f07fe433-3b34-4946-8787-9bc02ba67535' AND "neighborhood" = 'Westover Hills';
UPDATE "churches" SET "neighborhood" = 'Northwest Side' WHERE "id" = '7d026556-13c0-4c6b-a1b7-f8fe85cfc89f' AND "neighborhood" = 'USAA / Northwest';
UPDATE "churches" SET "neighborhood" = 'East Side' WHERE "id" = 'cc2e49b3-efc8-4ad9-932b-9a6793c8835e' AND "neighborhood" = 'East Terrell Hills';
UPDATE "churches" SET "neighborhood" = 'Northwest Side' WHERE "id" = 'bf29edff-a36f-48fd-97ac-bb2247cabac7' AND "neighborhood" = 'Alamo Ranch';
UPDATE "churches" SET "neighborhood" = 'Jefferson' WHERE "id" = 'ffb86c7d-67aa-4023-87ff-53771f55e142' AND "neighborhood" = 'Prospect Hill';
UPDATE "churches" SET "neighborhood" = 'Alamo Ranch' WHERE "id" = 'ae7e293c-0d13-41c5-a1d0-4f7f2490c9d0' AND "neighborhood" = 'Helotes';
UPDATE "churches" SET "neighborhood" = 'Highland Park' WHERE "id" = '01437e57-055c-4670-8d59-773673016815' AND "neighborhood" = 'South Side';
UPDATE "churches" SET "neighborhood" = 'Northeast Side' WHERE "id" = '1c000013-81c3-4e64-bdde-bed806b1351d' AND "neighborhood" = 'Windcrest';
UPDATE "churches" SET "neighborhood" = 'Northwest Side' WHERE "id" = 'ecba08c3-9048-4b10-a40c-d78a2a8e7ff1' AND "neighborhood" = 'USAA / Northwest';
UPDATE "churches" SET "neighborhood" = 'Thousand Oaks' WHERE "id" = 'ee26eb04-75cd-4699-99f2-a14d0b341c0e' AND "neighborhood" = 'Stone Oak';
UPDATE "churches" SET "neighborhood" = 'Kirby' WHERE "id" = '7005665c-6d31-47fd-bb61-8001a14499e3' AND "neighborhood" = 'East Terrell Hills';
UPDATE "churches" SET "neighborhood" = 'Port San Antonio' WHERE "id" = 'ed459105-925a-4cf6-b3ff-4e94bf591459' AND "neighborhood" = 'Lackland';
UPDATE "churches" SET "neighborhood" = 'Windcrest' WHERE "id" = 'd269c128-d334-4b3a-aa8e-89f4c1ef4fea' AND "neighborhood" = 'Northeast Side';
UPDATE "churches" SET "neighborhood" = 'Thousand Oaks' WHERE "id" = '450cde0c-5f0d-44ad-9bf2-b63182c1c05c' AND "neighborhood" = 'Stone Oak';
UPDATE "churches" SET "neighborhood" = 'Castle Hills' WHERE "id" = '4e5841ff-4d84-4386-87b9-036bc3f0edc6' AND "neighborhood" = 'Balcones Heights';
UPDATE "churches" SET "neighborhood" = 'East Side' WHERE "id" = '9bcd8787-1732-4fc0-9082-9bc7582123cf' AND "neighborhood" = 'Eastside';
UPDATE "churches" SET "neighborhood" = 'Highland Park' WHERE "id" = 'bd0e2676-c69a-45e3-b982-7f9ed29c8089' AND "neighborhood" = 'South Side';
UPDATE "churches" SET "neighborhood" = 'Alamo Heights' WHERE "id" = '610925e7-7b8e-4440-9be7-8617d4c81b24' AND "neighborhood" IS NULL;
UPDATE "churches" SET "neighborhood" = 'Alamo Heights' WHERE "id" = 'f8faad5f-e336-4971-95b6-a96e5b4720dc' AND "neighborhood" IS NULL;
UPDATE "churches" SET "neighborhood" = 'Northwest Side' WHERE "id" = '9fed0fce-c55a-45de-97e6-08a241517b80' AND "neighborhood" = 'Alamo Ranch';
UPDATE "churches" SET "neighborhood" = 'Southwest Side' WHERE "id" = '95ca4064-e018-4f88-9d05-9a8edc7b5452' AND "neighborhood" = 'Marbach';
UPDATE "churches" SET "neighborhood" = 'Alamo Heights' WHERE "id" = '1567c969-a910-4999-93e4-cc0edff6e19e' AND "neighborhood" IS NULL;
UPDATE "churches" SET "neighborhood" = 'Alamo Heights' WHERE "id" = '8531d532-d23e-4328-b39c-92092d84a36f' AND "neighborhood" IS NULL;
UPDATE "churches" SET "neighborhood" = 'Northwest Side' WHERE "id" = '0463f326-d0c7-4b57-9898-b51028884f84' AND "neighborhood" = 'USAA / Northwest';
UPDATE "churches" SET "neighborhood" = 'Northwest Side' WHERE "id" = 'dde21194-63a7-4311-922d-e6b1771de1c4' AND "neighborhood" = 'USAA / Northwest';
UPDATE "churches" SET "neighborhood" = 'Alamo Heights' WHERE "id" = 'c92cf7c4-bba5-45b5-9833-fb8614f0f8d9' AND "neighborhood" IS NULL;
UPDATE "churches" SET "neighborhood" = 'West Side' WHERE "id" = '1b02df47-eb12-4cf6-982d-a27377b9c4d1' AND "neighborhood" = 'Culebra';
UPDATE "churches" SET "neighborhood" = 'Northwest Side' WHERE "id" = '169c3290-e9c2-4a4d-9f94-e86fa1073ca4' AND "neighborhood" = 'USAA / Northwest';
UPDATE "churches" SET "neighborhood" = 'Castle Hills' WHERE "id" = '820775a7-5b99-4e6c-bc34-6e7acd7d68d1' AND "neighborhood" = 'Balcones Heights';
UPDATE "churches" SET "neighborhood" = 'Castle Hills' WHERE "id" = 'cd1d3561-91f9-42d8-a125-f64a96637bef' AND "neighborhood" = 'Balcones Heights';
UPDATE "churches" SET "neighborhood" = 'Northwest Side' WHERE "id" = '17945698-a77d-4245-be17-7ddd313fd2bf' AND "neighborhood" = 'USAA / Northwest';
UPDATE "churches" SET "neighborhood" = 'Castle Hills' WHERE "id" = 'd81b935e-c516-49c2-8c34-6072c7bbca6a' AND "neighborhood" = 'Balcones Heights';
UPDATE "churches" SET "neighborhood" = 'Northwest Side' WHERE "id" = 'e72818e4-3e1c-440a-b32b-7050e129ccf9' AND "neighborhood" = 'USAA / Northwest';
UPDATE "churches" SET "neighborhood" = 'Timberwood Park' WHERE "id" = '5d9c6c08-624f-4ba5-91b6-52a4968f924c' AND "neighborhood" = 'Stone Oak';
UPDATE "churches" SET "neighborhood" = 'Alamo Ranch' WHERE "id" = 'ddbff4c9-35ca-4db5-aef2-b4e43a1cdb92' AND "neighborhood" = 'Helotes';
UPDATE "churches" SET "neighborhood" = 'Castle Hills' WHERE "id" = 'b94ea3e6-9351-4e4c-ae92-f775c122ab21' AND "neighborhood" = 'Balcones Heights';
UPDATE "churches" SET "neighborhood" = 'West Side' WHERE "id" = 'e68a587f-50ed-4b84-b430-1ece12bb887b' AND "neighborhood" = 'Culebra';
UPDATE "churches" SET "neighborhood" = 'Alamo Heights' WHERE "id" = 'fd8536b2-3b47-421e-9ff1-5f4ece231f3c' AND "neighborhood" IS NULL;
UPDATE "churches" SET "neighborhood" = 'Jefferson' WHERE "id" = '60b094ca-eeee-4b98-8b97-2f22f3c0b42e' AND "neighborhood" = 'Prospect Hill';
UPDATE "churches" SET "neighborhood" = 'West Side' WHERE "id" = '27b572bc-8f27-4e8d-b1fd-4629827cdb8b' AND "neighborhood" = 'Culebra';
UPDATE "churches" SET "neighborhood" = 'Northeast Side' WHERE "id" = '7408e022-bae4-4efc-a3ea-c57ea08e6a68' AND "neighborhood" = 'Windcrest';
UPDATE "churches" SET "neighborhood" = 'Northeast Side' WHERE "id" = 'd11b9197-463c-4147-8e4c-459a52e5e7a5' AND "neighborhood" = 'Windcrest';
UPDATE "churches" SET "neighborhood" = 'West Side' WHERE "id" = '1bb876b2-1d1b-4f90-867c-8cf244852cf9' AND "neighborhood" = 'Culebra';
UPDATE "churches" SET "neighborhood" = 'Highland Park' WHERE "id" = '8592a8fb-8d8e-4b9b-a9d0-fb61df91e8d0' AND "neighborhood" = 'South Side';
UPDATE "churches" SET "neighborhood" = 'Northeast Side' WHERE "id" = 'ad3db569-2894-49e0-93ed-deeed65f8523' AND "neighborhood" = 'Terrell Hills';
UPDATE "churches" SET "neighborhood" = 'Alamo Heights' WHERE "id" = '7f9ab24a-e56f-41cd-8563-1c446c739c42' AND "neighborhood" IS NULL;
UPDATE "churches" SET "neighborhood" = 'Alamo Ranch' WHERE "id" = 'f6893091-893b-4e8c-aadf-55a8b49ac5e2' AND "neighborhood" = 'Helotes';
UPDATE "churches" SET "neighborhood" = 'Northwest Side' WHERE "id" = 'd4174f30-8efe-4070-91bc-76202da2f5c1' AND "neighborhood" = 'USAA / Northwest';
UPDATE "churches" SET "neighborhood" = 'Alamo Heights' WHERE "id" = '5ed2b32e-056c-48ac-a0ef-d90c4bccb2c5' AND "neighborhood" IS NULL;
UPDATE "churches" SET "neighborhood" = 'Alamo Ranch' WHERE "id" = 'b55f3df6-e631-4684-acb5-c58e26b15d5f' AND "neighborhood" = 'Helotes';
UPDATE "churches" SET "neighborhood" = 'Southwest Side' WHERE "id" = 'dd8e154d-4572-4378-9c2e-78e4a5ebf430' AND "neighborhood" = 'Marbach';
UPDATE "churches" SET "neighborhood" = 'Northeast Side' WHERE "id" = '18350599-0b36-4704-9830-aa0752970756' AND "neighborhood" = 'Thousand Oaks';
UPDATE "churches" SET "neighborhood" = 'Northeast Side' WHERE "id" = 'f8efed97-fabf-43c8-9a2f-df7f74a2c844' AND "neighborhood" = 'Terrell Hills';
UPDATE "churches" SET "neighborhood" = 'Thousand Oaks' WHERE "id" = 'f68aab09-9d8d-4c0f-a36b-d4cd5c0fad89' AND "neighborhood" = 'Stone Oak';
UPDATE "churches" SET "neighborhood" = 'Northwest Side' WHERE "id" = '7fc29a44-a3df-4c9f-8f03-61f23aa4df4c' AND "neighborhood" = 'Westover Hills';
UPDATE "churches" SET "neighborhood" = 'Northwest Side' WHERE "id" = 'b40e810e-a921-463c-b075-bc54bfc936cd' AND "neighborhood" = 'USAA / Northwest';
UPDATE "churches" SET "neighborhood" = 'Windcrest' WHERE "id" = '12da8d9e-f938-42e7-b130-0e9a6f59f363' AND "neighborhood" = 'Northeast Side';
UPDATE "churches" SET "neighborhood" = 'Northwest Side' WHERE "id" = '56a932a3-dd57-4fea-96d6-4d38d48f8e00' AND "neighborhood" = 'Westover Hills';
UPDATE "churches" SET "neighborhood" = 'Leon Valley' WHERE "id" = 'a3cd1c99-acfc-4634-a374-fc0c4c1cf5bc' AND "neighborhood" = 'USAA / Northwest';
UPDATE "churches" SET "neighborhood" = 'West Side' WHERE "id" = '2bbe8318-1443-45a5-92fd-d5357df9106b' AND "neighborhood" = 'Culebra';
UPDATE "churches" SET "neighborhood" = 'Alamo Ranch' WHERE "id" = '8e465cab-27ba-498e-87e6-abda8d26448b' AND "neighborhood" = 'Helotes';
UPDATE "churches" SET "neighborhood" = 'Westover Hills' WHERE "id" = '1882a689-cf3f-4a18-b3a4-5d02d6b83d12' AND "neighborhood" = 'Sea World';
UPDATE "churches" SET "neighborhood" = 'Thousand Oaks' WHERE "id" = 'b385ae40-03e4-4065-af42-ecb05c5148bb' AND "neighborhood" = 'Stone Oak';
UPDATE "churches" SET "neighborhood" = 'Thousand Oaks' WHERE "id" = 'af286d68-45ad-4971-9515-b432d5b617a2' AND "neighborhood" = 'Stone Oak';
UPDATE "churches" SET "neighborhood" = 'Westover Hills' WHERE "id" = '93660b67-f733-40bb-900f-0c02126672dd' AND "neighborhood" = 'Sea World';
UPDATE "churches" SET "neighborhood" = 'Thousand Oaks' WHERE "id" = '9998b08b-904d-4556-9895-97f1cdca4ec3' AND "neighborhood" = 'Stone Oak';
UPDATE "churches" SET "neighborhood" = 'Northwest Side' WHERE "id" = '12b16cb7-7347-44d1-b2bd-a540e334d47a' AND "neighborhood" = 'Westover Hills';
UPDATE "churches" SET "neighborhood" = 'Southwest Side' WHERE "id" = 'c8fd182c-a2a6-45fe-8d82-a0cab53ceb24' AND "neighborhood" = 'Marbach';
UPDATE "churches" SET "neighborhood" = 'Northwest Side' WHERE "id" = '967f80be-1dba-476c-9e86-a39f683c571d' AND "neighborhood" = 'Westover Hills';
UPDATE "churches" SET "neighborhood" = 'Northwest Side' WHERE "id" = '107bf2bf-6a76-4239-9fa0-673cc6accaf2' AND "neighborhood" = 'USAA / Northwest';
UPDATE "churches" SET "neighborhood" = 'Live Oak' WHERE "id" = '18ab1698-3043-4834-86d7-11301c5179a8' AND "neighborhood" = 'Thousand Oaks';
UPDATE "churches" SET "neighborhood" = 'La Cantera' WHERE "id" = '6c39c0f5-6f91-4da4-a2e6-05c40d9be0d8' AND "neighborhood" = 'Shavano Park';
UPDATE "churches" SET "neighborhood" = 'Southwest Side' WHERE "id" = 'f74be1c0-9369-4429-ae6d-b7d0371d8151' AND "neighborhood" = 'Marbach';
UPDATE "churches" SET "neighborhood" = 'East Side' WHERE "id" = '9aae6d30-8993-471f-9ef3-4977cc8636d2' AND "neighborhood" = 'East Terrell Hills';
UPDATE "churches" SET "neighborhood" = 'Kirby' WHERE "id" = '066399db-9d7c-4e54-8366-83963438527f' AND "neighborhood" = 'East Terrell Hills';
UPDATE "churches" SET "neighborhood" = 'North Central' WHERE "id" = '10f94df4-caeb-4b6b-935c-a7e1695cde4e' AND "neighborhood" = 'North Side';
UPDATE "churches" SET "neighborhood" = 'Castle Hills' WHERE "id" = 'c638250b-b41f-4c8e-bbf1-7863dc8d2157' AND "neighborhood" = 'Balcones Heights';
UPDATE "churches" SET "neighborhood" = 'Castle Hills' WHERE "id" = 'a127528b-5123-48b6-bd75-a8772cbc05a6' AND "neighborhood" = 'Balcones Heights';
UPDATE "churches" SET "neighborhood" = 'Live Oak' WHERE "id" = 'fa1e0390-e31e-4de0-be37-9b8d6e8939cb' AND "neighborhood" = 'Thousand Oaks';
UPDATE "churches" SET "neighborhood" = 'Northwest Side' WHERE "id" = '59eab915-9344-4059-b402-01da5d097702' AND "neighborhood" = 'USAA / Northwest';
UPDATE "churches" SET "neighborhood" = 'Windcrest' WHERE "id" = '4e1d2a53-7db9-4954-bc99-ba4a1db87fef' AND "neighborhood" = 'Northeast Side';
UPDATE "churches" SET "neighborhood" = 'Garden Ridge' WHERE "id" = '5090ce06-b401-4bec-b4db-4b9b53eb250e' AND "neighborhood" = 'Bulverde';
UPDATE "churches" SET "neighborhood" = 'Northeast Side' WHERE "id" = '7f11cffc-3a59-4a5d-8d3c-4aedb65009da' AND "neighborhood" = 'Terrell Hills';
UPDATE "churches" SET "neighborhood" = 'Thousand Oaks' WHERE "id" = '7ff7f1d4-bbbe-45e3-b107-abd95ee1752f' AND "neighborhood" = 'Stone Oak';
UPDATE "churches" SET "neighborhood" = 'Thousand Oaks' WHERE "id" = '6e3e454e-0b3d-4a1d-a1f6-769b124db098' AND "neighborhood" = 'Stone Oak';
UPDATE "churches" SET "neighborhood" = 'Garden Ridge' WHERE "id" = '80e49877-1290-44ab-9c95-25873109900a' AND "neighborhood" = 'Bulverde';
UPDATE "churches" SET "neighborhood" = 'Atascosa' WHERE "id" = '9e3fd1db-9024-4c0e-a9a7-a27bc0e7073e' AND "neighborhood" IS NULL;
UPDATE "churches" SET "neighborhood" = 'East Side' WHERE "id" = '6d4c0c40-bee5-4c67-857c-f17c3dafbe10' AND "neighborhood" = 'East Terrell Hills';
UPDATE "churches" SET "neighborhood" = 'East Side' WHERE "id" = '927b5854-5ce0-4d67-b75a-d2a329063e66' AND "neighborhood" = 'Eastside';
UPDATE "churches" SET "neighborhood" = 'Leon Springs' WHERE "id" = 'ca06e7b1-8512-4f26-8594-1823b038d22c' AND "neighborhood" = 'The Dominion';
UPDATE "churches" SET "neighborhood" = 'Northwest Side' WHERE "id" = '2b5650f8-4994-43b5-8ffa-2d5e511164ef' AND "neighborhood" = 'USAA / Northwest';
UPDATE "churches" SET "neighborhood" = 'Alamo Ranch' WHERE "id" = '0fa3ec0e-55be-4646-80a8-7d76a824c867' AND "neighborhood" = 'Helotes';
UPDATE "churches" SET "neighborhood" = 'Garden Ridge' WHERE "id" = '5e819dd5-749c-4418-a37a-0d6c7baeaf05' AND "neighborhood" = 'Bulverde';
UPDATE "churches" SET "neighborhood" = 'Highland Park' WHERE "id" = '5ff01562-835a-43ef-a846-e675eaed9671' AND "neighborhood" = 'South Side';
UPDATE "churches" SET "neighborhood" = 'Westover Hills' WHERE "id" = '7ce68afa-8b5c-41b3-856b-56bdd0589d8e' AND "neighborhood" = 'Sea World';
UPDATE "churches" SET "neighborhood" = 'Jefferson' WHERE "id" = '8e025f54-913c-416b-8ebc-09cd28bd4e43' AND "neighborhood" = 'Prospect Hill';
UPDATE "churches" SET "neighborhood" = 'East Side' WHERE "id" = 'bf20abe9-0a64-470d-9662-a7ee26f3a0a1' AND "neighborhood" = 'East Terrell Hills';
UPDATE "churches" SET "neighborhood" = 'West Side' WHERE "id" = '64ae5340-3a6d-4de7-b4a1-6de0ba878a19' AND "neighborhood" = 'Culebra';
UPDATE "churches" SET "neighborhood" = 'Alamo Heights' WHERE "id" = '30da03a9-2c86-49f5-a9ef-0734270a954d' AND "neighborhood" IS NULL;
UPDATE "churches" SET "neighborhood" = 'Southwest Side' WHERE "id" = '431496bb-199d-4937-b9c0-82aa782641ee' AND "neighborhood" = 'Marbach';
UPDATE "churches" SET "neighborhood" = 'Northeast Side' WHERE "id" = '370d272b-ae69-4361-bd94-e78ea0d9c237' AND "neighborhood" = 'Windcrest';
UPDATE "churches" SET "neighborhood" = 'Highland Park' WHERE "id" = 'a0020f5f-2a80-43b9-9010-7dc6ec995ce8' AND "neighborhood" = 'South Side';
UPDATE "churches" SET "neighborhood" = 'West Side' WHERE "id" = 'e797584f-6378-409d-8a58-7e43e1624825' AND "neighborhood" = 'Culebra';
UPDATE "churches" SET "neighborhood" = 'Southwest Side' WHERE "id" = '267428d2-ba6d-4381-873a-887ea8a3ee43' AND "neighborhood" = 'Marbach';
UPDATE "churches" SET "neighborhood" = 'Northeast Side' WHERE "id" = '1e6a2397-d53c-4cf8-8011-01b5fce26668' AND "neighborhood" = 'Thousand Oaks';
UPDATE "churches" SET "neighborhood" = 'Northeast Side' WHERE "id" = '8dbcb74f-9c47-4b3c-bd70-5d5ec878f331' AND "neighborhood" = 'Windcrest';
UPDATE "churches" SET "neighborhood" = 'Westover Hills' WHERE "id" = 'f03693e2-88bf-42d0-88df-06a0186b3c2d' AND "neighborhood" = 'Sea World';
UPDATE "churches" SET "neighborhood" = 'Northwest Side' WHERE "id" = 'd16bfe71-4d48-49c8-a2e5-8199706e6de6' AND "neighborhood" = 'Westover Hills';
UPDATE "churches" SET "neighborhood" = 'Northeast Side' WHERE "id" = 'a98e6724-bd2a-4205-92e1-efc015bf39ab' AND "neighborhood" = 'Windcrest';
UPDATE "churches" SET "neighborhood" = 'Castle Hills' WHERE "id" = '3d3be266-fbfc-4c28-b231-7b67df49ef75' AND "neighborhood" = 'Balcones Heights';
UPDATE "churches" SET "neighborhood" = 'Thousand Oaks' WHERE "id" = '2e842a00-ed57-4263-b36d-cec4a7fd4e1d' AND "neighborhood" = 'Stone Oak';
UPDATE "churches" SET "neighborhood" = 'Westover Hills' WHERE "id" = 'b36090ea-a826-4c36-95d1-881617c68094' AND "neighborhood" = 'Sea World';
UPDATE "churches" SET "neighborhood" = 'Northwest Side' WHERE "id" = 'a128ded5-0036-4b24-90f2-a8a01040afa1' AND "neighborhood" = 'USAA / Northwest';
UPDATE "churches" SET "neighborhood" = 'Westover Hills' WHERE "id" = 'd8de2d41-09a8-4671-b320-ccdb05d10076' AND "neighborhood" = 'Sea World';
UPDATE "churches" SET "neighborhood" = 'East Side' WHERE "id" = '489284d9-2e18-42a3-8364-c5e46f1364e9' AND "neighborhood" = 'East Terrell Hills';
UPDATE "churches" SET "neighborhood" = 'Northeast Side' WHERE "id" = 'e9c0a505-4f94-4ec1-95aa-7eba0071ec09' AND "neighborhood" = 'Terrell Hills';
UPDATE "churches" SET "neighborhood" = 'Windcrest' WHERE "id" = '402adf66-731a-43a1-a10f-aa3f341f8ac8' AND "neighborhood" = 'Northeast Side';
UPDATE "churches" SET "neighborhood" = 'North Central' WHERE "id" = '18ceba6f-1be6-4843-a748-f5cdeca4fe99' AND "neighborhood" = 'North Side';
UPDATE "churches" SET "neighborhood" = 'Jefferson' WHERE "id" = 'f796ff48-e7f2-4abc-8b66-18cdd42aed22' AND "neighborhood" = 'Prospect Hill';
UPDATE "churches" SET "neighborhood" = 'Castle Hills' WHERE "id" = '623c5b93-08ec-4002-bcd4-9aa53644e052' AND "neighborhood" = 'Balcones Heights';
UPDATE "churches" SET "neighborhood" = 'Castle Hills' WHERE "id" = 'fa3b15bb-510b-4081-9d3e-5ffecb3dfd49' AND "neighborhood" = 'Balcones Heights';
UPDATE "churches" SET "neighborhood" = 'Southwest Side' WHERE "id" = '2d7e1a0f-db93-46a6-a592-ce91225eddff' AND "neighborhood" = 'Lackland';
UPDATE "churches" SET "neighborhood" = 'Northwest Side' WHERE "id" = 'e5c2fe90-404d-49b1-be53-4399dac5b5e6' AND "neighborhood" = 'Alamo Ranch';
UPDATE "churches" SET "neighborhood" = 'Northeast Side' WHERE "id" = '4944ef88-c8cc-4d01-8a32-494406afca6b' AND "neighborhood" = 'Thousand Oaks';
UPDATE "churches" SET "neighborhood" = 'Northeast Side' WHERE "id" = '9205b6f2-18be-4c56-87d4-1f89af5e2dec' AND "neighborhood" = 'Windcrest';

-- ── 4. Languages: drop "Spanish" where its only source was the city name "San Antonio" in the church name ──
UPDATE "churches" SET "languages" = ARRAY['English']::text[] WHERE "id" = 'b026afbc-4c1c-4ec8-8340-e7fed7183afc' AND "languages" = ARRAY['English', 'Spanish']::text[]; -- 3ra IAFCJ San Antonio, Tx
UPDATE "churches" SET "languages" = ARRAY['English']::text[] WHERE "id" = '853b5c8f-ae91-4df9-9427-946a49b6d9b3' AND "languages" = ARRAY['English', 'Spanish']::text[]; -- All Nations Church - San Antonio
UPDATE "churches" SET "languages" = ARRAY['English']::text[] WHERE "id" = '4b4ba42c-d5ce-4930-94ca-7038a50b5a9a' AND "languages" = ARRAY['English', 'Spanish']::text[]; -- ARABIC BAPTIST CHURCH OF SAN ANTONIO
UPDATE "churches" SET "languages" = ARRAY['English']::text[] WHERE "id" = '1c0adaf3-b4b3-41a5-991d-9bbd76642cdf' AND "languages" = ARRAY['English', 'Spanish']::text[]; -- Born Again Ministries of San Antonio
UPDATE "churches" SET "languages" = ARRAY['English']::text[] WHERE "id" = '6b397e1d-2914-48d7-9aa2-29a53437468f' AND "languages" = ARRAY['English', 'Spanish']::text[]; -- Calvary Chapel of San Antonio
UPDATE "churches" SET "languages" = ARRAY['English']::text[] WHERE "id" = '0e847bec-2d1c-4367-a1b3-1049df31b5bf' AND "languages" = ARRAY['English', 'Spanish']::text[]; -- Calvary New Life San Antonio
UPDATE "churches" SET "languages" = ARRAY['English']::text[] WHERE "id" = 'aae9f480-5d7e-40a5-be0e-b475da7709f2' AND "languages" = ARRAY['English', 'Spanish']::text[]; -- Central Texas/San Antonio Assembly Hall of Jehovah's Witnesses
UPDATE "churches" SET "languages" = ARRAY['English']::text[] WHERE "id" = 'e22a4c84-706b-496d-b64b-88a2fbaa4b0b' AND "languages" = ARRAY['English', 'Spanish']::text[]; -- Chinese United Methodist Church of San Antonio
UPDATE "churches" SET "languages" = ARRAY['English']::text[] WHERE "id" = 'a9b637ef-2ba3-4aee-a92f-34f8b219e3de' AND "languages" = ARRAY['English', 'Spanish']::text[]; -- Christ Church San Antonio
UPDATE "churches" SET "languages" = ARRAY['English']::text[] WHERE "id" = '247aa8c5-8bcf-4870-82ac-eab178be88c0' AND "languages" = ARRAY['English', 'Spanish']::text[]; -- Christian Family Church San Antonio
UPDATE "churches" SET "languages" = ARRAY['English']::text[] WHERE "id" = '89180069-75af-4f24-bf3b-3a2a05b70f0a' AND "languages" = ARRAY['English', 'Spanish']::text[]; -- CityChurch San Antonio
UPDATE "churches" SET "languages" = ARRAY['English']::text[] WHERE "id" = '86b71000-e39b-4688-83d2-6182061f2df0' AND "languages" = ARRAY['English', 'Spanish']::text[]; -- Compass Church San Antonio
UPDATE "churches" SET "languages" = ARRAY['English']::text[] WHERE "id" = '888668cd-f780-4aae-8fad-9e5e10dd56e8' AND "languages" = ARRAY['English', 'Spanish']::text[]; -- Debre Genet Kidist Dingil Mariyam Ethiopian Orthodox Tewahedo Church San Antonio
UPDATE "churches" SET "languages" = ARRAY['English']::text[] WHERE "id" = '3d851042-4d4e-42ed-bd12-bef9df082d1d' AND "languages" = ARRAY['English', 'Spanish']::text[]; -- Embrace! Church of San Antonio
UPDATE "churches" SET "languages" = ARRAY['English']::text[] WHERE "id" = '8674870e-45e6-4ea2-904f-f8bf8d259dc7' AND "languages" = ARRAY['English', 'Spanish']::text[]; -- Emmanuel Worship Center of San Antonio
UPDATE "churches" SET "languages" = ARRAY['English']::text[] WHERE "id" = '714e1939-0de2-4799-8ed2-bc00761f81c7' AND "languages" = ARRAY['English', 'Spanish']::text[]; -- Evers Road Christian Church San Antonio
UPDATE "churches" SET "languages" = ARRAY['English']::text[] WHERE "id" = 'a5656037-a95b-48d1-b1a2-b5283dbc0b48' AND "languages" = ARRAY['English', 'Spanish']::text[]; -- First Assembly of God San Antonio
UPDATE "churches" SET "languages" = ARRAY['English']::text[] WHERE "id" = 'b8bd6a11-7eb6-4713-9e3b-008b944a0600' AND "languages" = ARRAY['English', 'Spanish']::text[]; -- First Baptist Church of San Antonio
UPDATE "churches" SET "languages" = ARRAY['English']::text[] WHERE "id" = '1e6fd358-cdab-40a9-9150-b2143e438880' AND "languages" = ARRAY['English', 'Spanish']::text[]; -- First Mexican Baptist Church of San Antonio
UPDATE "churches" SET "languages" = ARRAY['English']::text[] WHERE "id" = 'e098435b-c8b5-40f1-aa06-0d14ede7655e' AND "languages" = ARRAY['English', 'Spanish']::text[]; -- First Unitarian Universalist Church of San Antonio
UPDATE "churches" SET "languages" = ARRAY['English']::text[] WHERE "id" = '78a0e89b-38e2-4ac6-bc88-76c6077ea353' AND "languages" = ARRAY['English', 'Spanish']::text[]; -- Fountain of Truth Church San Antonio
UPDATE "churches" SET "languages" = ARRAY['English']::text[] WHERE "id" = '402294d8-c295-48ff-b2c7-c01d4d7a4271' AND "languages" = ARRAY['English', 'Spanish']::text[]; -- Freedom Life Church SAN ANTONIO
UPDATE "churches" SET "languages" = ARRAY['English']::text[] WHERE "id" = '9551dc38-75f0-4a31-a2fd-f4d12d038916' AND "languages" = ARRAY['English', 'Spanish']::text[]; -- Good News San Antonio Church
UPDATE "churches" SET "languages" = ARRAY['English']::text[] WHERE "id" = 'd8c99eb4-51d4-4754-9cc7-765b0876f21d' AND "languages" = ARRAY['English', 'Spanish']::text[]; -- Harvest Intercontinental Church, San Antonio
UPDATE "churches" SET "languages" = ARRAY['English']::text[] WHERE "id" = '0c2d0e36-efad-4278-afc9-79061ed4f184' AND "languages" = ARRAY['English', 'Spanish']::text[]; -- Home Church San Antonio
UPDATE "churches" SET "languages" = ARRAY['English']::text[] WHERE "id" = 'b6c17b12-6d96-4feb-9cc3-630b42997011' AND "languages" = ARRAY['English', 'Spanish']::text[]; -- HOUSE OF WORSHIP SAN ANTONIO
UPDATE "churches" SET "languages" = ARRAY['English']::text[] WHERE "id" = '06506c8c-800f-4870-963e-6999580d0dec' AND "languages" = ARRAY['English', 'Spanish']::text[]; -- IPUH San Antonio #1
UPDATE "churches" SET "languages" = ARRAY['English']::text[] WHERE "id" = '364581c5-9d82-4091-a1b5-f772631ea526' AND "languages" = ARRAY['English', 'Spanish']::text[]; -- IUIC San Antonio
UPDATE "churches" SET "languages" = ARRAY['English']::text[] WHERE "id" = '8f8ff57b-5ef4-4b42-93b5-115e5a20cf72' AND "languages" = ARRAY['English', 'Spanish']::text[]; -- Jesus Baptist San Antonio Church
UPDATE "churches" SET "languages" = ARRAY['English']::text[] WHERE "id" = '3d5b1e18-71da-47c2-9fbd-fb09323681ae' AND "languages" = ARRAY['English', 'Spanish']::text[]; -- Journey Church San Antonio
UPDATE "churches" SET "languages" = ARRAY['English', 'Korean']::text[] WHERE "id" = '812834cb-cb46-4b7d-9024-cabd2a214dad' AND "languages" = ARRAY['English', 'Spanish', 'Korean']::text[]; -- Korean American Cultural Center of San Antonio
UPDATE "churches" SET "languages" = ARRAY['English']::text[] WHERE "id" = 'a71e5d0d-68b6-48b2-bdd4-2e2162a02b45' AND "languages" = ARRAY['English', 'Spanish']::text[]; -- Local Church San Antonio
UPDATE "churches" SET "languages" = ARRAY['English', 'Malayalam']::text[] WHERE "id" = '6b98295a-5651-458f-8d1f-4fafc9c7448c' AND "languages" = ARRAY['English', 'Spanish', 'Malayalam']::text[]; -- Mar Thoma Congregation of San Antonio
UPDATE "churches" SET "languages" = ARRAY['English']::text[] WHERE "id" = 'aa31c73f-13dc-4e5d-abf0-7e71fe1f0777' AND "languages" = ARRAY['English', 'Spanish']::text[]; -- Mission Church San Antonio
UPDATE "churches" SET "languages" = ARRAY['English']::text[] WHERE "id" = '955977cf-3e0b-410e-b625-b67c7ee18516' AND "languages" = ARRAY['English', 'Spanish']::text[]; -- Missionary Baptist Church of San Antonio
UPDATE "churches" SET "languages" = ARRAY['English']::text[] WHERE "id" = 'c1c6d946-e2ef-4216-a32c-363c22874321' AND "languages" = ARRAY['English', 'Spanish']::text[]; -- New Life Outreach San Antonio
UPDATE "churches" SET "languages" = ARRAY['English']::text[] WHERE "id" = '4741e806-c103-4980-8641-7bdc8052d853' AND "languages" = ARRAY['English', 'Spanish']::text[]; -- Pillar Church of San Antonio
UPDATE "churches" SET "languages" = ARRAY['English']::text[] WHERE "id" = '45bc7169-873c-4a40-bc2e-69300109fcd7' AND "languages" = ARRAY['English', 'Spanish']::text[]; -- Praise Chapel San Antonio
UPDATE "churches" SET "languages" = ARRAY['English']::text[] WHERE "id" = 'b7b76073-d237-47b1-945b-f7de19cf9c71' AND "languages" = ARRAY['English', 'Spanish']::text[]; -- RCCG Restoration Chapel San Antonio
UPDATE "churches" SET "languages" = ARRAY['English']::text[] WHERE "id" = '955fa170-bfe2-4ae4-b70a-bdaa1e4dd6d6' AND "languages" = ARRAY['English', 'Spanish']::text[]; -- RCCG, Salvation Center San Antonio
UPDATE "churches" SET "languages" = ARRAY['English']::text[] WHERE "id" = '00823fac-afef-41b4-9fd6-878a8aa30d50' AND "languages" = ARRAY['English', 'Spanish']::text[]; -- Recovery Church San Antonio
UPDATE "churches" SET "languages" = ARRAY['English']::text[] WHERE "id" = 'b6b7b766-a3e3-443c-aa00-9e16d7bd586e' AND "languages" = ARRAY['English', 'Spanish']::text[]; -- Restoration Church of San Antonio
UPDATE "churches" SET "languages" = ARRAY['English']::text[] WHERE "id" = 'e4a21bfa-bc67-4eba-8c48-87cd33b38db8' AND "languages" = ARRAY['English', 'Spanish']::text[]; -- Revelation Church San Antonio
UPDATE "churches" SET "languages" = ARRAY['English']::text[] WHERE "id" = '78c1783a-acff-4118-a8fc-3a9e63b442a0' AND "languages" = ARRAY['English', 'Spanish']::text[]; -- San Antonio Breath of Life SDA Church
UPDATE "churches" SET "languages" = ARRAY['English']::text[] WHERE "id" = 'ce9a5186-3467-480e-a03d-c237eaac2354' AND "languages" = ARRAY['English', 'Spanish']::text[]; -- San Antonio Chin Baptist Church
UPDATE "churches" SET "languages" = ARRAY['English']::text[] WHERE "id" = '3450abbb-d65b-4ad7-ad2f-dff0f7f3626d' AND "languages" = ARRAY['English', 'Spanish']::text[]; -- San Antonio Christian Church
UPDATE "churches" SET "languages" = ARRAY['English']::text[] WHERE "id" = 'dd46b505-7d3f-40e1-90a4-9337c2781bd7' AND "languages" = ARRAY['English', 'Spanish']::text[]; -- San Antonio First Church (SAF Church)
UPDATE "churches" SET "languages" = ARRAY['English']::text[] WHERE "id" = 'b997b88c-19a1-4a66-87b3-3fcb57777133' AND "languages" = ARRAY['English', 'Spanish']::text[]; -- San Antonio For Christ
UPDATE "churches" SET "languages" = ARRAY['English']::text[] WHERE "id" = '0440952b-16ed-44f4-8212-bd814a20d694' AND "languages" = ARRAY['English', 'Spanish']::text[]; -- San Antonio Friends Meeting (Quaker)
UPDATE "churches" SET "languages" = ARRAY['English', 'Korean']::text[] WHERE "id" = 'c067e5d3-ea9f-466b-b262-d324fa16398b' AND "languages" = ARRAY['English', 'Spanish', 'Korean']::text[]; -- San Antonio Han-Ma-Eum Korean Church
UPDATE "churches" SET "languages" = ARRAY['English']::text[] WHERE "id" = 'd7e454c1-b78e-498c-a415-11cd2625a52b' AND "languages" = ARRAY['English', 'Spanish']::text[]; -- San Antonio Highland Hills Seventh-day Adventist Church
UPDATE "churches" SET "languages" = ARRAY['English']::text[] WHERE "id" = 'dd089f90-9182-498b-bc19-1575b894e4f2' AND "languages" = ARRAY['English', 'Spanish']::text[]; -- San Antonio Pentecostal Church (SAPC)
UPDATE "churches" SET "languages" = ARRAY['English']::text[] WHERE "id" = 'f07fe433-3b34-4946-8787-9bc02ba67535' AND "languages" = ARRAY['English', 'Spanish']::text[]; -- San Antonio Scenic Hills Seventh-day Adventist Church
UPDATE "churches" SET "languages" = ARRAY['English']::text[] WHERE "id" = 'bc5c58d0-795a-4e30-9291-011a09892e3f' AND "languages" = ARRAY['English', 'Spanish']::text[]; -- San Antonio Texas Temple
UPDATE "churches" SET "languages" = ARRAY['English']::text[] WHERE "id" = '3582a644-ad0c-4a0c-9272-095cb696728d' AND "languages" = ARRAY['English', 'Spanish']::text[]; -- San Antonio Valley View Seventh-day Adventist Church
UPDATE "churches" SET "languages" = ARRAY['English']::text[] WHERE "id" = '2eefd611-9377-4fae-8603-b38899b743d5' AND "languages" = ARRAY['English', 'Spanish']::text[]; -- Schoenstatt Movement of San Antonio
UPDATE "churches" SET "languages" = ARRAY['English']::text[] WHERE "id" = 'bcc60638-bd92-45f6-90fe-679b1b477550' AND "languages" = ARRAY['English', 'Spanish']::text[]; -- Scottish Rite Cathedral (San Antonio, Texas)
UPDATE "churches" SET "languages" = ARRAY['English']::text[] WHERE "id" = '05f4a294-4de2-436a-a1e4-b40edc4136ed' AND "languages" = ARRAY['English', 'Spanish']::text[]; -- South San Antonio Baptist Church
UPDATE "churches" SET "languages" = ARRAY['English']::text[] WHERE "id" = 'f68aab09-9d8d-4c0f-a36b-d4cd5c0fad89' AND "languages" = ARRAY['English', 'Spanish']::text[]; -- Texas San Antonio Mission Office
UPDATE "churches" SET "languages" = ARRAY['English']::text[] WHERE "id" = 'b40e810e-a921-463c-b075-bc54bfc936cd' AND "languages" = ARRAY['English', 'Spanish']::text[]; -- The church in San Antonio Meeting Hall
UPDATE "churches" SET "languages" = ARRAY['English']::text[] WHERE "id" = '93660b67-f733-40bb-900f-0c02126672dd' AND "languages" = ARRAY['English', 'Spanish']::text[]; -- The Church of Pentecost - San Antonio
UPDATE "churches" SET "languages" = ARRAY['English']::text[] WHERE "id" = '159abd63-fd56-4127-b75c-9e46706fb255' AND "languages" = ARRAY['English', 'Spanish']::text[]; -- The Door Christian Fellowship Church Southside San Antonio
UPDATE "churches" SET "languages" = ARRAY['English']::text[] WHERE "id" = 'c8fd182c-a2a6-45fe-8d82-a0cab53ceb24' AND "languages" = ARRAY['English', 'Spanish']::text[]; -- The Door Christian Fellowship San Antonio
UPDATE "churches" SET "languages" = ARRAY['English']::text[] WHERE "id" = '10f94df4-caeb-4b6b-935c-a7e1695cde4e' AND "languages" = ARRAY['English', 'Spanish']::text[]; -- The Movement Church of San Antonio
UPDATE "churches" SET "languages" = ARRAY['English']::text[] WHERE "id" = 'a7df3f5e-1ee0-42c0-bc5e-98dfe33c9277' AND "languages" = ARRAY['English', 'Spanish']::text[]; -- The Revelation San Antonio
UPDATE "churches" SET "languages" = ARRAY['English']::text[] WHERE "id" = '7f11cffc-3a59-4a5d-8d3c-4aedb65009da' AND "languages" = ARRAY['English', 'Spanish']::text[]; -- The Rock San Antonio
UPDATE "churches" SET "languages" = ARRAY['English']::text[] WHERE "id" = 'ca06e7b1-8512-4f26-8594-1823b038d22c' AND "languages" = ARRAY['English', 'Spanish']::text[]; -- Trinity Grace Church San Antonio - A PCA Church
UPDATE "churches" SET "languages" = ARRAY['English']::text[] WHERE "id" = '877b4072-5284-4f99-a5b4-45b2f4bdb8f6' AND "languages" = ARRAY['English', 'Spanish']::text[]; -- Trinity San Antonio Lutheran Church
UPDATE "churches" SET "languages" = ARRAY['English']::text[] WHERE "id" = '30da03a9-2c86-49f5-a9ef-0734270a954d' AND "languages" = ARRAY['English', 'Spanish']::text[]; -- Unity of San Antonio
UPDATE "churches" SET "languages" = ARRAY['English']::text[] WHERE "id" = 'a0020f5f-2a80-43b9-9010-7dc6ec995ce8' AND "languages" = ARRAY['English', 'Spanish']::text[]; -- Victory Outreach San Antonio
UPDATE "churches" SET "languages" = ARRAY['English']::text[] WHERE "id" = 'd16bfe71-4d48-49c8-a2e5-8199706e6de6' AND "languages" = ARRAY['English', 'Spanish']::text[]; -- Vineyard Church of San Antonio
UPDATE "churches" SET "languages" = ARRAY['English']::text[] WHERE "id" = '447f50b6-6526-4924-83cf-296025028c25' AND "languages" = ARRAY['English', 'Spanish']::text[]; -- Zion Church San Antonio
UPDATE "churches" SET "languages" = ARRAY['English']::text[] WHERE "id" = '4944ef88-c8cc-4d01-8a32-494406afca6b' AND "languages" = ARRAY['English', 'Spanish']::text[]; -- 샌안토니오 사랑의 교회 San Antonio Sarang Church
UPDATE "churches" SET "languages" = ARRAY['English']::text[] WHERE "id" = '335b951d-2bc5-40b8-8c40-efd69e1ca4a7' AND "languages" = ARRAY['English', 'Spanish']::text[]; -- 샌안토니오 한인감리교회 Korean Global Methodist Church of San Antonio
UPDATE "churches" SET "languages" = ARRAY['English', 'Korean']::text[] WHERE "id" = '9205b6f2-18be-4c56-87d4-1f89af5e2dec' AND "languages" = ARRAY['English', 'Spanish', 'Korean']::text[]; -- 샌안토니오 한인침례교회 San Antonio Korean Baptist Church

-- ── 5. Service times: delete auto-imported rows that are office hours or other import artifacts ──
-- Bethel Covenant AG: 9 of 13 rows
DELETE FROM "church_services" WHERE "isAutoImported" = true AND "id" IN ('9de6bdd4-5124-4b9d-9d23-9c61ab8d9ee7', '1fba7170-a11a-4e9f-90f1-85f58bbe2d51', 'd0b23697-2ec9-44b2-9100-58964e35c0f4', '9033baf6-0554-46c4-bb98-d32291cbbb93', '98ca1a61-e1e3-4c3c-bb58-d46e8743a593', '30011622-d8ff-48d9-81ae-06d8ffaf9960', '1fb7a613-f2ea-4e67-8ef2-a43fe984f06c', 'd4d335fb-dcd6-4386-9570-92a880e2856e', '233e999d-dc9d-49ee-afd6-2af1654b34e2');
-- Calvary Chapel of San Antonio: 4 of 5 rows
DELETE FROM "church_services" WHERE "isAutoImported" = true AND "id" IN ('f8cbd292-097e-4e9b-aa6f-642f7084b255', '27f7b56d-e156-4979-ba7b-df9c9c61eeab', '15bb296b-a595-4cfb-8bcb-e1a26d5517ea', '6711b452-91ef-4a63-8a41-fd23246b5fa7');
-- Calvary Church: 10 of 17 rows
DELETE FROM "church_services" WHERE "isAutoImported" = true AND "id" IN ('a31f41e1-2616-4645-8010-7e63bc608f45', '4e352cbb-68ce-460c-8a22-310b9046448d', 'bdf27832-b8f1-41d1-b49b-4759a67d15a9', '23719852-e419-4869-81e7-b7bc4acbab01', 'abef6427-e109-45a9-9708-75dfa609f5d9', 'f5de4ee6-2cfc-4154-b19d-522002e5522d', '68422cbb-4710-4791-b61b-efef2d9012fc', '76980dd5-c975-4167-8e90-b7ce8057fc5b', '40f828fc-ad0f-47c5-a18e-2a599d8e3640', '5f286d14-120b-4659-a7f4-be45942e57b2');
-- Calvary Hills Baptist Church: 13 of 22 rows
DELETE FROM "church_services" WHERE "isAutoImported" = true AND "id" IN ('42389c5b-e967-4f3f-a641-c38601e6eb1c', '55618103-72ac-4c8a-819c-cee67232d65d', 'cd36a341-5aaa-4a8b-abdc-8be14c9a6d75', 'df9498b3-e442-4895-9ee3-afde27da6b04', '9e91d094-4997-4bc4-94f6-8ed5fbada867', '61e29a4d-77bf-43e9-8551-839c2b53c979', '1f5d97e1-8c3c-4f81-ab91-0414882c5fda', '0e64c31f-cffb-4522-bdb9-7557a15913e6', '4ebcf76f-3c19-47f6-81a8-7087a534b36a', '8a54186e-bde7-4618-9cb7-4f0fefa105fd', '791a52dc-cae0-42d1-ac02-491a676c62c0', 'c2b34bd1-a1c0-4dc5-abaf-8194fc498745', '0665e230-cf5a-4c43-8bd5-aed1969fef9b');
-- Christ Episcopal Church: 6 of 8 rows
DELETE FROM "church_services" WHERE "isAutoImported" = true AND "id" IN ('dc634389-fecc-45c4-97a0-3bd934bbc96f', '5273156a-da3b-43c4-81d0-1653e99877b4', 'f3509772-11e8-4908-b1c4-b8abb2de1726', '49cf4766-ec7e-429d-bd99-206aabb51529', '68bc1ec9-16e4-4b83-b2fd-6f74ed8f96e9', '099925fd-7195-4e6d-a0f7-0e89c30550a6');
-- Christ the King Catholic Church: 5 of 14 rows
DELETE FROM "church_services" WHERE "isAutoImported" = true AND "id" IN ('e26fca52-bd24-49c6-918b-4ea57ecdcc00', 'db956979-a46d-4269-80a1-7c4e7f3165d6', 'b15a3929-dc14-4c8d-bed9-120aa7a75aaa', 'e45d3096-610e-46f5-a7ce-5d960f16ddbc', '744efb06-5958-46a2-bf70-cd15196b55ae');
-- Church of the Blessed Sacrament: 7 of 20 rows
DELETE FROM "church_services" WHERE "isAutoImported" = true AND "id" IN ('b0811443-43da-4cdb-bdfb-d22c84a14f5f', 'bc617273-393c-42d3-8412-681fe2ae69f0', '8faff44c-ec18-446c-8f51-ce457cb38ae4', '347c05ae-32b9-4e02-a25c-6963438cc93f', '244294f1-5cd9-42d2-b211-b763e70290f7', 'c3dd311a-83c5-4056-9f1f-252f4ac3b0ac', '9ba55471-fb00-4d2f-9624-36251c1e7f4f');
-- City On A Hill: 12 of 14 rows
DELETE FROM "church_services" WHERE "isAutoImported" = true AND "id" IN ('8409c85f-810c-4011-9920-7aca7f6144e2', '6f689b48-2b6e-4d64-873a-aceaf09c1c0e', '04b8c791-f37d-4ecd-b734-04aa3f1b644b', '8e1d1fc8-1965-458d-b73b-acc54f9c6a41', 'd34d1fd4-05f7-4cfe-b318-efc7a6160a4f', '276bb8ab-f9cc-4afc-a7c8-45ed42ec738a', 'c6f1cca7-3262-437a-b3f2-7db4a360f730', '42093b0a-2397-43d4-8ed1-8aaf15b9cb62', '79235152-dab7-47f3-81f5-abee076328bd', '6c1ad1bd-8176-444e-84a6-62c33965110f', 'eb4910eb-1904-476b-ad0f-a04b8247122b', 'f9174d21-c41c-4c3f-83ad-2746d42dd4f1');
-- Cross Roads Church: 9 of 13 rows
DELETE FROM "church_services" WHERE "isAutoImported" = true AND "id" IN ('57b3cd19-edd0-4292-9c85-73d77325d388', '1135cf78-5b8d-4417-9b7c-8ac507b6ab83', '414200dd-58ac-4d64-a9ae-95e64e588c52', '29b16709-ea39-45ae-aae7-605e051af2c8', '4ffbef1d-edcc-4199-92fc-93c82cd4a9d2', '6e2e04bd-82c3-48c1-9767-0e889dc239fc', 'd2917fda-a58a-4d5d-8f55-f5b0dc4de122', '0d4b5265-0dea-4f80-af80-4fb7468e9b9c', '6e8c6a9c-a5c3-4a9a-bd45-f2fa69e7e3e5');
-- Crown of Life Lutheran Church: 15 of 26 rows
DELETE FROM "church_services" WHERE "isAutoImported" = true AND "id" IN ('480c9194-30a1-4bca-858b-67b1ea8003b9', '343f1851-726f-44aa-9331-8302e9dd8b63', '104ee3e8-1ca0-432f-9808-d68ad2a719d3', 'd3d3b549-e99a-4069-b4ca-79c08b1a9c39', '2f5af1ed-4d6e-4905-8212-af1494812194', '6158982b-eec1-4036-94e5-e9d3817e31b5', '1cd5724c-2ba5-4e0a-a599-2271ea264501', '503726db-ae45-44df-9149-5c0386749028', 'ac4935d8-08b5-44d0-8416-7820d36710d6', '7fbae173-0a96-41bc-8db6-4858c7d11cce', '38b50874-481d-45b6-94a2-a9ca5364531d', 'f5cb138d-d12d-4052-a242-68349143c5cf', 'ab9d623f-4907-406c-b7eb-ac8c6f5f3c6c', '2aa44f1b-2ae5-4bda-a7bd-5a1e6f11bcef', '96266f2b-ad3d-4647-9bd5-f590ca620661');
-- Divine Providence Catholic Church: 3 of 11 rows
DELETE FROM "church_services" WHERE "isAutoImported" = true AND "id" IN ('a711cf6f-978c-4cb5-b567-145d03bb509e', '2a52f019-103a-49ac-b34b-1499ddf3d357', 'e0b0fa61-b6b5-4de2-ae77-b8c26591c32b');
-- Exchange Life Church: 1 of 2 rows
DELETE FROM "church_services" WHERE "isAutoImported" = true AND "id" IN ('56738214-5124-4e4d-a38e-d63f7165c5c4');
-- Fellowship Bible Church: 1 of 4 rows
DELETE FROM "church_services" WHERE "isAutoImported" = true AND "id" IN ('47e91026-c0ec-4e46-bf6a-602eb9f47c00');
-- First Baptist Church of Helotes: 9 of 12 rows
DELETE FROM "church_services" WHERE "isAutoImported" = true AND "id" IN ('fc7956cb-09e9-400b-b06d-b11c606df0b5', 'd0d5a2ea-0d8e-4c2d-9597-766a3e0567fa', 'bf4eb25e-6f54-419c-9456-051b8ec6ca05', '24fd8621-c6aa-4d0f-a0ba-bce56bc94c19', '39ed5a50-f340-4dc0-bea0-2f4356d57c73', '71b8a72f-f0a1-4ee3-becc-548c323d11e3', '16148e0b-0a46-46d0-8171-c53698eefda6', '31dff3fa-6806-4f96-80d8-0db7fb1422c8', 'd3d0f4ef-588f-4fde-b55d-f549c8194449');
-- Forest Hills Presbyterian Church: 8 of 9 rows
DELETE FROM "church_services" WHERE "isAutoImported" = true AND "id" IN ('e5e9e15f-5995-470d-9d98-9cb9954caa04', '1d96109c-f8c3-4e1b-a860-946ae6d6971b', 'd90b871e-65e9-45e9-8b54-6e10093726ef', '91dd7780-7d87-49bc-a65c-8723da6fb42b', 'd1ebe1e6-b3f5-47d9-8063-6713fcbc0853', '1d138b42-cfeb-4598-ae72-0c1878e6d984', 'fcdc134d-49db-40fe-b64c-2c04ede1ce23', 'cbbc8251-1270-482f-b133-5210d7ef7375');
-- Grace Community Church: 2 of 7 rows
DELETE FROM "church_services" WHERE "isAutoImported" = true AND "id" IN ('693a88c9-ac30-4823-914c-f31542e76965', 'd1df1f93-8fac-4be8-b450-c9cedf5ac8d1');
-- Grace Point Church: 1 of 3 rows
DELETE FROM "church_services" WHERE "isAutoImported" = true AND "id" IN ('3a31d5d7-f7f1-4df9-be66-ea2fff9e10b6');
-- Grace Tabernacle Church: 4 of 8 rows
DELETE FROM "church_services" WHERE "isAutoImported" = true AND "id" IN ('b8e5fc9c-ebdd-4262-9411-1d28c83ef748', '08c08d1a-0701-4e07-bd8b-ffec2d70899c', 'ef31f58b-c9d8-44a9-bd4a-f1e7b7ac08c8', 'ce26128e-2b02-4280-a640-f3545971e8fb');
-- Greater Randolph Seventh-day Adventist Church: 1 of 8 rows
DELETE FROM "church_services" WHERE "isAutoImported" = true AND "id" IN ('783dc2d6-f7aa-4202-802b-d7f1e58bd2eb');
-- Henke Hall: 11 of 22 rows
DELETE FROM "church_services" WHERE "isAutoImported" = true AND "id" IN ('3571dc5d-cf02-45fc-ab45-523f6e029631', '6884a1b7-518a-4876-b298-9f17fd8f4584', 'b89e35d7-0337-46d2-b748-f1102dd735ee', '72c4a80f-ebbe-4e19-906c-3ab2f0d68ce0', '6d8238df-acf3-4309-b1d4-d8b037bba4e1', '6eeabcb5-70e3-4648-8b77-76a815e2678b', '12a2e3a0-ebd2-4cc2-afcd-dd5c06908d59', '73a5dbdb-d34c-4971-8813-32f37ebe6150', '17f971b1-b089-4fc6-b11b-e827375f6d58', 'f895d134-807a-49f3-82de-b700fcfbeb5a', 'ed3a4ce9-2c97-4af9-a69a-0a13a84d8208');
-- Holy Family Parish Church: 24 of 30 rows
DELETE FROM "church_services" WHERE "isAutoImported" = true AND "id" IN ('d5798375-810e-4391-9069-2d8d2d4e0564', 'f079d8f7-2991-4a4a-868d-e391130f0bdd', '42cd4c60-8686-4181-835c-dd188601dba5', '14ac0228-4d10-4112-b4b0-901d43624899', 'c0f7d588-ea70-4700-9505-819bb2bd2417', '60e1ea7e-0e40-4dd6-9259-cafd5bda5f5e', '87ef233f-429a-4be2-b95f-173ed5c3356f', '3b23d163-8043-4ae2-8d7e-c1ba0fe2ac75', '497f4c3a-27be-4c40-973e-d75efc95c49e', '86059a87-4cf1-4d97-a6dc-7225e06783bc', '8fba1d49-83da-4394-948d-d11301f525d8', 'b3914741-f46f-41d2-bd35-c43a4cf9714a', 'f3f44c90-bccb-49e8-a697-4c4d38bee6c9', '438df7fb-0c76-4a81-a681-30c4777cb12b', '6afaa649-140c-4ecc-9e2e-8579445baaca', 'c6f0544a-0659-4c2e-b962-5252b775c0be', '9e8ed4a4-aec3-46d6-8825-484ee21ee98c', '61d443b9-5a63-44fb-9166-b4e17511a854', 'edef926b-0106-4800-8888-5ca48553be7c', '2de29d4f-f687-49e9-85ed-8c44b533ef7d', '930a7c48-2b91-419a-a704-3011443b77b5', '45b4bd8b-6ad8-4bdb-8d48-6f451d6d064d', '0a520e7c-85e3-4f2f-8a8b-a9063a5614f0', '24212791-f364-40c6-b934-85423f41ea0d');
-- Holy Redeemer Catholic Church: 3 of 9 rows
DELETE FROM "church_services" WHERE "isAutoImported" = true AND "id" IN ('e20464c9-4a53-465a-a82f-1137449cb137', '3d727013-44d1-4e4b-8084-8fcb6461177f', 'bb81ad23-cbed-4295-ba83-7e807b90dccd');
-- Holy Rosary Catholic Church: 12 of 14 rows
DELETE FROM "church_services" WHERE "isAutoImported" = true AND "id" IN ('39b467ef-55ac-49ae-a0a5-2e9e038d7324', '7f46263b-8107-4d29-aaaa-fdc57f72740b', '34939e32-034d-4834-8907-506f9486d443', '6d8bb785-39ed-4263-9e04-faca4e4d9f6b', '3a547023-faf6-48ab-bfe0-999115e16cf1', '45b6f7f0-b0ff-492b-bb07-12ffa2bb394a', 'd0821774-5926-4c89-87e9-d7b95eebb134', 'bc8eda85-f6b2-405c-bafa-aeef3ff64eff', 'fc2caa89-4a30-4074-89cf-c914021fa028', 'c86b321e-43d9-4f69-af9b-c69fbc8530c1', '1a1870ce-22e5-4f62-893f-c7481ee41ba1', '20f5cfa7-10cf-4461-8832-71c99ea4616c');
-- Holy Spirit Catholic Church: 9 of 25 rows
DELETE FROM "church_services" WHERE "isAutoImported" = true AND "id" IN ('d3d4b3b8-e542-413a-9a60-dbdf32f87f35', '000fd98a-59ae-4f57-b117-71c453a53ac8', 'b9d89cff-0325-4797-b3fb-3922819f8b72', 'dbf0a085-4dfe-4dac-9d0f-c001061e4dc0', '5f30edd4-1660-4416-8478-b13d7ec17651', '934924ef-d469-4f33-b341-c63e2f297b26', '7607ec94-3ad4-4f87-933b-0e377ad0b80d', '0afe7e3d-6d9b-41f1-b26f-0e87f4113fc3', 'e2146446-4ab7-44a1-8eb4-02b291377ab7');
-- Hope Church San Antonio: 3 of 6 rows
DELETE FROM "church_services" WHERE "isAutoImported" = true AND "id" IN ('08d1343a-9031-44e6-ab90-8e68978a15c3', '8b9eb0fc-f732-466a-8478-82060e2681f1', 'b251a20c-d87b-4dfc-a712-0ff8b278feb7');
-- Hosanna Assembly of God: 1 of 6 rows
DELETE FROM "church_services" WHERE "isAutoImported" = true AND "id" IN ('f47b3096-b241-4def-a01e-3c707cf44e48');
-- Huisache Avenue Baptist Church: 13 of 25 rows
DELETE FROM "church_services" WHERE "isAutoImported" = true AND "id" IN ('733dd4c0-185f-4b51-a994-65ebee9278c8', '0c9f4337-1707-49b0-9539-792b20c42d97', '2e355f00-69d8-4b0a-a168-e23fe5b3dcae', '60419742-630b-41c1-b50d-d48ba2a78d83', 'b951530d-0a39-437a-a41a-10da9c2dc5a5', '8c694c7e-d011-4648-9401-e2efb127443a', 'fbfe3eda-88e1-47c6-8b10-591eb55cb2f0', '7e5640a8-b596-429f-92e8-8525509a2175', 'db3cb487-5fb9-4a23-a57a-e958bdd44619', '7064fbac-6c8a-4c9c-88b8-b07626a6e63a', '79785787-19b8-4c63-a3a7-65e5cf6a629e', 'bce6214e-7f30-44e0-8513-76ad252d3a3e', '3b4043a4-460e-4703-affe-cdd23eb0508f');
-- Iglesia Biblica La Puerta: 1 of 3 rows
DELETE FROM "church_services" WHERE "isAutoImported" = true AND "id" IN ('67f8336b-66aa-4b51-b519-173b49e77054');
-- Iglesia Cristiana Emanuel: 2 of 12 rows
DELETE FROM "church_services" WHERE "isAutoImported" = true AND "id" IN ('5140e93e-bce0-4c43-8f55-227611ec4e18', '6f2d9154-b168-4049-a6a7-c564a986fb6d');
-- Iglesia Cristiana Triunfante: 14 of 18 rows
DELETE FROM "church_services" WHERE "isAutoImported" = true AND "id" IN ('c544ae57-fd80-43d6-96f2-3076783bcf4e', 'fd5019bd-3d58-47b2-bf03-31f177b1d22e', '1d3d5ffd-74ec-43d0-9838-f5bba4c6134e', '1aa0ec47-800a-4c27-931e-d491ed60a2e9', '968dd551-b888-460c-9736-8fb7d8eea962', '6336d1ab-8f8a-4215-8c7d-1dc8674af403', '23c4b941-500c-4c7a-8801-6e1989cb547a', '2da37a37-f5c4-46a0-8a10-14a5b234e175', '31667f1f-1b5f-4c2f-9ef3-ef9f19c9e425', '8ca7530c-e343-4256-84b1-8d2710ffe5fd', '1d71a494-67cf-4ea2-a941-6f9ab3d2bf38', '26d4b50d-0c20-434c-89a3-7bb2a09a4f1b', '0c91772d-353c-4f7a-84e2-44f8174d159e', 'd84403ed-affc-45ce-9c81-2e2e20b92b76');
-- Immaculate Conception: 5 of 15 rows
DELETE FROM "church_services" WHERE "isAutoImported" = true AND "id" IN ('d6a85a79-da00-453d-876c-04bf99da2726', '53755ed1-ab3c-4931-b8af-3c3f5d09c199', '3607f363-45b6-4f9f-8624-cbc2536f7135', '7960009e-bdcf-4826-9500-f3d852d2aa07', '4eb18b44-ebf4-4c3e-a0c9-ad9961563aa0');
-- Immaculate Conception Chapel - Oblate School of Theology: 28 of 34 rows
DELETE FROM "church_services" WHERE "isAutoImported" = true AND "id" IN ('e36868f2-ffbe-429e-8ae2-e288208d24fc', '0a792dcb-d0a2-4e25-99c3-fa10cbad86c0', '94edc0cd-a398-42e0-bc00-60994d8b1e45', '97573ba7-b468-426e-8fa5-b23bca733dae', '113681b2-12df-404c-bcec-a21626469440', 'c4cd6e40-3ad7-4ee2-a2e2-81c7db704b9b', '6d49d778-6166-4552-9b63-a28116f5a8bf', '5bda9883-c33d-4fa6-8ce1-007447526396', '58988305-af8a-4f31-b9d5-c7074bd2f94c', '7806cba6-9406-4092-9cfa-5d149dd44e5e', '28078dfb-c17a-4a66-8974-593343e5de79', '3ae3fb5e-de9c-42e8-9d86-e02399a6d83c', 'fa4c2251-5457-44f3-9dcc-013d0ce03f11', '8a4ab9d0-6b5f-4337-a67b-e0a6e0486418', '2322ca29-91d8-400b-a41b-ffda734067be', 'd2c1c233-864a-4dc3-be95-4f1ca7b064eb', '2d781d4f-769f-4616-ad0f-fa863eeb6baf', 'b23df75d-7710-4b36-8675-237c373a4a33', 'a9f1a130-d877-4bf6-a94c-9a7ae2358089', 'b9a28997-fa49-4ff3-918c-84b105ddaecd', '611bf73a-e6dc-43d6-8209-f1c2b85fc5ca', '1ab8f7d7-94b7-40cd-a975-c361a6f5a0b3', 'ac115d39-db09-4135-bebb-5d761fb99abf', 'f7d93604-59e7-40f5-bb7a-916007654215', 'e107d93c-a5c8-4166-a50a-57ef368c7af6', '77f4eadc-7f06-4975-a61e-81654200f0ea', '69ee38d2-fbd0-404f-b746-9d25e36beb3c', '86293783-cbab-4aaf-89be-9756e4dd9c9a');
-- Japanese Megumi International Church: 1 of 2 rows
DELETE FROM "church_services" WHERE "isAutoImported" = true AND "id" IN ('1e5ae7df-3728-44fd-9086-5c6e39acdddc');
-- Kingdom Builders Transformation Ministries: 4 of 8 rows
DELETE FROM "church_services" WHERE "isAutoImported" = true AND "id" IN ('783e3062-e4de-4bfd-b6a7-32ac645b627a', '3269be15-998b-4965-8d80-ff48df029c5d', '76f6355f-2e8c-4f2f-a2b5-a3b154f7ab06', 'a41710a3-04e7-457e-b2dc-4abacb83e2fe');
-- Laurel Heights United Methodist Church: 1 of 3 rows
DELETE FROM "church_services" WHERE "isAutoImported" = true AND "id" IN ('2d84464a-975b-41c4-b8be-a3c68f1722f1');
-- Mac Arthur Park Lutheran Church: 1 of 1 rows
DELETE FROM "church_services" WHERE "isAutoImported" = true AND "id" IN ('93e261ca-638a-44da-809d-4819be4ced8c');
-- Mission Concepción: 2 of 4 rows
DELETE FROM "church_services" WHERE "isAutoImported" = true AND "id" IN ('cd278539-ec59-4748-b8fe-bba52c38f3ba', 'f989af60-d6f8-418f-8be5-86d5d917496d');
-- Mission San Jose Catholic Church: 14 of 20 rows
DELETE FROM "church_services" WHERE "isAutoImported" = true AND "id" IN ('7ae1bd4c-bec7-4e10-9e43-7bacf36157d2', 'a1126624-0036-4e23-b868-3d9628b264e4', 'de750ea9-1e24-4cfa-9092-d9b04cd8a16b', 'e8ffe8c9-8e75-465a-b4e6-6f4cd0466e0c', 'f4ad3a1e-00ba-44c0-9791-f21b20df3a7b', 'c8f0ff92-744c-460f-a6f2-e50732cf5722', 'e1bb53ff-9725-4102-8c87-ce29d706181a', 'b7868ca2-a995-40a5-aa5c-11239045140a', '0f61eebb-5156-4cdd-9b3d-51912d8cc6d9', '88951c03-8cf0-428b-bc77-d22550867fc7', '1aee2c15-2d93-49c0-be0e-c7a059258bdc', '1a4daedf-1dbf-43b5-a562-9b609a4e57f7', '08b61a06-a977-42c8-9070-170a22e791f1', 'ec2b4a3a-83fd-4a39-beb2-5c2f5f94a6e7');
-- Mission San Jose Church Parish Offices: 13 of 20 rows
DELETE FROM "church_services" WHERE "isAutoImported" = true AND "id" IN ('01542965-a4b6-4535-bd76-2e691b15d309', '8d470aa3-f8b1-435e-b5cf-a32863556fc0', 'c7008516-0f83-4d65-8047-29913c1e873d', 'd1c63921-6000-4df2-b364-b8a9ae746cd8', 'ee7bdb5c-f696-4b07-b3c8-8e5c4fe7cf9a', '83970075-6be8-4285-b7e2-332990e5b67a', 'beacf51c-45f4-4459-b1c9-745100ea38d7', '29b8043f-1d6d-4a4a-b9d9-bd7a10dc3335', 'b8d489c5-12db-4e03-af92-082be14e44da', 'fa99d718-e1d1-4709-a1c7-cec255d240fc', 'c727bded-104c-4009-87c5-180ee1b265ec', 'b0461791-9767-4f77-b5a3-9edad954e87f', '4a8f5112-4378-4004-bf15-06f7b1bbb843');
-- New Hope United Church of God (Seventh Day): 1 of 2 rows
DELETE FROM "church_services" WHERE "isAutoImported" = true AND "id" IN ('d80242bc-c203-48e0-8edc-665cc478dcb3');
-- Oak Island Methodist Church, A Global Methodist Congregation: 1 of 5 rows
DELETE FROM "church_services" WHERE "isAutoImported" = true AND "id" IN ('0f252fd9-0fe4-4dff-8cd1-edb7d0856a6a');
-- Oak Ridge Baptist Church: 1 of 10 rows
DELETE FROM "church_services" WHERE "isAutoImported" = true AND "id" IN ('8c0fd56c-36c2-4a40-9aea-b5dcdf40469f');
-- Our Lady of Grace Church: 47 of 57 rows
DELETE FROM "church_services" WHERE "isAutoImported" = true AND "id" IN ('377e8444-424a-4df8-9fb8-8d72f4d46ef8', '81470f57-2ca6-4258-9cdb-347ff7950464', '6455c02c-038b-46eb-a588-afd159bee373', 'e5953723-e723-42b4-8788-d163904a198a', '2e374e0d-0d16-4f41-9ded-b11fe0cfcb69', 'fd842db8-f07b-4418-8013-9488fd9b8ecf', 'f0520853-cc20-4c63-8b6e-d1292dabd738', '0c3f9159-5a64-4ca1-b11e-12d303eeefdf', '8d3af598-0bd6-4538-ac4f-483260f62d5e', '18c9b08e-97c7-44be-b447-6a7dc4672a89', '8c9bb7a6-9c42-4a29-acfa-49fc6a7f5514', '49e34c3a-f8a0-4edf-a27e-a3d824864fd7', '6cd1dbec-cffe-451e-9fd3-8fefc8ac0e69', 'ed5deb14-0bb7-4dae-ada6-1878478cdc77', '18465bd0-b5d9-4984-81ff-2f0390f6a02d', '1ef51fda-e98a-40d2-9e0b-5f0494324823', '774150ca-4f9e-4513-91a9-4772c6894489', '924cc045-51d8-4b04-9bea-10b3cf2086b3', '8c7c7d3d-c5cc-43e4-972b-ba1cb0ccbdc8', '65689e2c-04d3-4179-a9a1-d5a8ead7e67e', '736129a9-b500-46c1-a52d-d10807e7c10b', '5a7fb0cd-48ff-4a79-be7c-13f96fafcd62', 'e2bce1e6-5964-47f8-802f-1a5d62b0c69c', '5d659bcc-2c2c-4cfc-8c7f-fbeca02dc0cc', '202f4615-65d0-46f0-882c-58704c13491b', '1a88247c-7b5e-4511-b6b0-dbf84ed1a590', 'f4f6bfc4-f8d0-43ce-b468-e46a27aeebba', '579eceef-3b1e-4624-8821-b200ed258836', '9ebc898d-0ea7-48b1-99ee-a6a62c867a27', 'ceb2ea0e-0046-4740-aea0-e1fcbe1dc7e7', '40b8781c-c6ed-4b07-9b28-9180920c38ce', '24fbe224-a3ce-472c-a45b-a4b825e61243', '98add989-0134-431b-abe3-f444b34b5a65', 'e481ac81-22c9-45a5-ae6d-b06fc249fe3c', '8056fadb-c0c1-4005-bbf9-dde55250b31a', '11e8eaac-4e3c-43b3-85c6-5e8f091c1502', 'df81ab8a-fa7c-4689-8916-2207d8517034', '3e8c2936-81fe-445a-b858-d2eea9a4c608', 'be14c547-4e88-45ac-bebb-96b33d51cc6d', '4a3f33d6-1b77-45e8-89cf-4f737f45c447', 'b8a0cc1f-3d19-4b27-b706-cb6002b51a97', '01d7f133-cca8-409a-b6d3-2b241af7b253', '9ebd30dd-d64f-4f34-ac5e-4227faaa2a6b', 'd5c000ba-67fa-4a74-84b0-06a99390a82c', '8610732a-ebcf-4c75-8b31-952486e13722', '3d594dcf-ac22-43b4-a0af-b77d354e9a0d', '78862d5d-36b8-41f6-89df-3f9de5abb3f4');
-- Our Lady of Guadalupe Catholic Church: 20 of 35 rows
DELETE FROM "church_services" WHERE "isAutoImported" = true AND "id" IN ('5411eebc-05d4-475b-903a-4f6fab28514e', '9dda160c-852e-4433-9b0d-dd0bd78e6003', 'a67e7515-44e2-4e99-b30e-c78009d2b834', '5ceb0526-30e7-415e-bc8f-5be2b0933fd2', 'b60dd7d3-37c0-45b5-90e9-1863fd641c56', '15e01c46-4d68-412b-a970-85ed1b504a22', '9889178d-5cb9-431a-aa57-a62b85d03aa4', 'a463f248-2b52-48a6-85aa-8b11928f00d5', '5bcc29ba-eb4e-4a78-af35-5e7590f865cb', '33d1af8c-f43a-4f04-a1c6-782a6c2e85bd', '036c3cdd-7dbb-4b09-b125-68c8c338730c', 'eab4cb35-ad72-4af0-af2d-b74a3fff8038', '6e648594-4382-4625-9a46-7d2fb65fb37e', 'af88df49-6486-42b5-93ad-bd374cc1e9c4', 'eb892603-4a6b-4be7-92fb-cb320d3a12e9', 'c46a3f23-791c-4ba5-a1c4-ab05a1cf264f', '81126d90-01a7-4ca5-8ea7-4119f71b973a', '76d2444c-1cc8-444b-98ee-7abc5497e3ba', '965bbd57-19bc-44e5-8361-9b7691125bad', 'cd7d35e1-d811-409c-8ad1-c0f21ec1214c');
-- Our Lady of Guadalupe Shrine: 10 of 15 rows
DELETE FROM "church_services" WHERE "isAutoImported" = true AND "id" IN ('e2dd4782-3034-43a3-8fbc-1ca0fca6174d', 'e050d910-f004-487b-b19a-7f223e27babc', 'effb4cbf-1bce-4735-8b30-0bce20c68228', 'ec1dacc7-904b-476c-87b4-c0eca5fbd680', '108d87da-cd08-4a13-9775-7b1bd7b213f9', '42c6481d-ac15-4c54-99fb-85cc13142cc1', '3b75f461-4225-4d24-bd38-ce8a4ed760ae', '386f7ab2-d355-46fa-96d0-2d74a0d62d70', '5f57641b-2c92-4796-9ea7-8a2201789132', '1a3dec3c-e1bd-4553-989a-40b8a646dfe4');
-- Our Lady of Perpetual Help Catholic Church: 9 of 25 rows
DELETE FROM "church_services" WHERE "isAutoImported" = true AND "id" IN ('e81c3088-2f38-4eca-adb3-7042e6195580', 'd8e37d17-a2d5-4ceb-8b0c-f044a85401ee', '011210c8-88c7-4146-9eb8-4cfda0e9c134', 'b29aee38-3eee-481d-90f0-cc10e16e1483', '8032bd76-f73c-4ea1-8322-5874f91f6364', '6dd9ba3e-a884-4f5e-89ff-2438582c8751', '0427beef-4491-4da1-9f87-d610832d7bd2', 'cfdd59a5-60ae-46e7-8cb6-16d2489cd76c', 'f43c329a-083c-4cb2-a6b5-32e6961b07ca');
-- Our Lady of Perpetual Help Church: 3 of 10 rows
DELETE FROM "church_services" WHERE "isAutoImported" = true AND "id" IN ('7742f1b6-c92e-489b-882d-f69504651aa0', '763201c3-c6e3-44ed-8a12-6116fcf1301d', '49c0e534-0a14-4640-a67d-1948d77d79f9');
-- Our Lady of the Angels Church: 6 of 16 rows
DELETE FROM "church_services" WHERE "isAutoImported" = true AND "id" IN ('d35866b0-be6d-49df-82ea-8f68428f01d9', 'b5b2d4dd-0332-4f20-b978-ed089cfb11d3', '499836aa-1c53-47e4-bfe4-53055401a48e', 'c79d5343-e15f-4281-944e-ea9b3afe7d9b', '70d82a3e-c7be-4b53-86fa-cecaaef94071', '53d98df4-dacf-4ecc-b97a-ef61c0db11bb');
-- Our Lady of the Atonement Catholic Church: 7 of 32 rows
DELETE FROM "church_services" WHERE "isAutoImported" = true AND "id" IN ('e0a18689-82d4-47e7-856e-747cda015936', 'f5e5109e-ea62-48a7-a20b-c63803393f4a', '8af5e2bd-4903-44cd-9ffd-320679dfb476', '589f7cab-66a9-4160-a29a-1053c849e936', '8e128d5b-afe6-4a1a-aedf-b064d8163206', '5db09144-1a65-49a8-a974-be9e35159d91', 'a31aae9f-7df5-4400-8575-6c2e24f59573');
-- Outer West Community Church: 16 of 22 rows
DELETE FROM "church_services" WHERE "isAutoImported" = true AND "id" IN ('ea6fd906-d60c-4130-92f8-87a7867ff89c', 'e28e89eb-4d4f-4426-af6a-01845e349326', '85c0a1ae-df73-40b9-b65a-49008ffb0bf5', 'b3e2813e-20af-40cc-8b89-2f830f7154d9', '0005022a-295b-4af0-bcaf-a3a304139a1a', '7162e817-c1fb-4686-b05f-5c9da69adbee', '4c510e91-fab8-4bd7-b943-623c1b115fd5', '700ef9e7-5161-485d-a814-ebebc40cfa77', '90e83fd4-908e-44d2-b1bb-f068df12021e', '7977afce-0659-44c7-b4b4-ec5c611005e3', '77e3eff6-9f2c-4f52-8aea-079740e5964f', '2c8661b5-12bb-4ac6-9eb0-93680beb5e7c', '4f7defb7-1da8-41a2-b6ec-09f8a9dd5136', '29c6b8e7-e094-4255-8079-ad899a035c93', 'f6b507d2-a048-49af-9912-76069ab33db4', 'd11e1bb4-29be-4d15-8b75-5afe7e57ac77');
-- Place of Grace Fellowship: 1 of 7 rows
DELETE FROM "church_services" WHERE "isAutoImported" = true AND "id" IN ('b438b539-576a-4de6-a09d-dca823226414');
-- Redeemer Lutheran Church: 1 of 3 rows
DELETE FROM "church_services" WHERE "isAutoImported" = true AND "id" IN ('ea5d8260-eda5-429e-9945-7e32a60c4a35');
-- Redeeming Grace Christian Church: 21 of 35 rows
DELETE FROM "church_services" WHERE "isAutoImported" = true AND "id" IN ('29fb8a85-feca-4539-953b-46bf8474790d', '38c447a7-d304-4626-99ee-61857f9c986c', '69a41cbb-ec1c-4475-97ad-c0b2cd8740c4', '53a56e89-0a57-4570-bf64-688e424eaa1f', 'db85b2ae-83af-42a9-abbf-0c2d4097d9cb', 'e18c1b60-8276-47cc-954e-32749e244840', 'eb375a69-39de-432a-81af-a3681c4b8ebc', 'c7ee7f89-36cd-4fe9-9568-55539c2b1d99', 'c75b5ca4-8c2c-42d9-b38f-0c459d774562', '6349cc56-13d7-493a-9a4e-2cf7ee8787ec', 'a854495d-8b37-4fe9-88d5-e9f4d6cbc6b8', '341d0db9-ca57-45a1-93a5-c297cdfd062d', 'ba554053-4721-49cc-9965-39edbfcdecee', '74563029-8af0-47c1-8c85-51b70ddc9ef7', 'cfdc798f-d95c-44bc-b130-c8f3965aeb02', '8d8a2c8a-6964-4bc7-b94e-9ef7e8304a16', '26bcba1e-141b-44a3-895a-9d4b0fac783b', '93501f80-80d8-4987-a0dd-40cc7073b228', '9b9eb1d5-9d52-4ab2-939c-5ead49b7743f', '53f880b8-83c0-43a7-91dc-82ceed3dbf9a', '0e59b317-9d1c-407d-ac0f-4594e22d5601');
-- Resurrection of the Lord: 26 of 37 rows
DELETE FROM "church_services" WHERE "isAutoImported" = true AND "id" IN ('26a93b02-50e3-4134-a7b3-f2c1224178a9', 'b5188443-a7a9-4293-b5b2-74548214925c', '3e34596c-21d1-42d5-a85e-0dc92100d656', '66eb8787-b330-4fc9-ac6a-60ce898147c6', '40eaa0dd-41f6-4019-a285-08e7e5ab676e', '756beb2e-ecc9-47cc-867b-34b9560f4501', '2073dbe8-c1a8-425d-bb6c-b365e078e870', 'b545f575-e511-4400-8c2e-f6c8a31c4bac', '0d1ee6eb-767d-478f-b062-2b4059297af2', '57ddd2d7-df84-4c68-949f-6d40c1d1b980', '75b43297-cf15-40aa-a41d-757c5f4fcd4d', '4cd03034-1286-4d25-adad-3a336ab8ded2', '716dc430-83a4-409b-9de3-424e2b2de207', '93d01e33-d87a-4938-939b-82d1d09521a8', 'c4f21431-3915-42e5-a3f0-f522535a968b', '0caed3a3-2762-4292-add2-5394d0c2210c', 'efe10350-bca3-4f7b-b978-fd96ed13e843', '2b7cf6a0-17f8-4ce0-849c-a073f6cdcccb', 'aa14fcb5-fedb-477d-a638-dff3cb9f6229', 'b639ef82-87f5-4a75-a9f9-253507c383ec', 'fe375a15-2b8f-4b87-a127-5756d95d7a20', '1c1b49b0-f7ca-42d4-ba7d-14ffedcb5f59', '4df0fe85-e1e5-4c9b-b097-d69922178bdf', '443b4325-8931-47a0-a2f2-2cdd1d9f7312', '21495e65-225a-4602-80d6-f3236d568dee', '7888c31c-8c22-4c77-93d0-61af71dd1787');
-- River of Life Church: 1 of 6 rows
DELETE FROM "church_services" WHERE "isAutoImported" = true AND "id" IN ('aad3c83d-dac8-4449-a831-4aad59b65da2');
-- Salem Sayers Baptist Church: 1 of 5 rows
DELETE FROM "church_services" WHERE "isAutoImported" = true AND "id" IN ('380ff4d8-b50d-4ee3-a0fa-2525d662d3c7');
-- San Antonio Friends Meeting (Quaker): 2 of 7 rows
DELETE FROM "church_services" WHERE "isAutoImported" = true AND "id" IN ('14c8b16f-92c4-4fbb-84c9-2a6f349303c8', '5d8b023b-4224-40ee-90d1-3bdb3d44381d');
-- San Damiano Bldg: 11 of 22 rows
DELETE FROM "church_services" WHERE "isAutoImported" = true AND "id" IN ('08f1cd65-6f90-4f04-a56f-17f286f2f697', 'b80700b9-c83d-444b-aba4-95d5c097ba43', '5b03b326-c582-4859-ad94-bd2add2bcf9c', '8c338e65-29ea-465e-a2fd-23c370f8309b', '0a3f1884-6b73-4f6c-8a45-17706e362e80', '464f99eb-8848-4b7c-afa6-7ca8eda149dd', 'e1649a4a-48cb-42b5-bac5-8b8607d71b33', '1add1617-ced7-4ca1-b126-24aeea5358c1', '8e3cd6ce-4b37-4c1b-8c95-3c580adf73ce', '870ae17f-1105-48a5-8ed1-50bd7e264cbb', 'd6488817-a82d-43e9-8260-3bf2e6a3da18');
-- Shepherd's Own Church: 1 of 2 rows
DELETE FROM "church_services" WHERE "isAutoImported" = true AND "id" IN ('b09078e2-9d08-4685-8483-c797e2060b7a');
-- Sion Romanian Baptist Church: 2 of 6 rows
DELETE FROM "church_services" WHERE "isAutoImported" = true AND "id" IN ('7f58dd01-9bbb-44a8-8f94-929ad008845d', 'dbfff8a8-041f-4c82-a736-3624c40383c8');
-- Skybridge Community Church: 1 of 2 rows
DELETE FROM "church_services" WHERE "isAutoImported" = true AND "id" IN ('b0c2aad9-9fd4-44d9-aba5-4c945596d484');
-- Southeast Church of Christ: 1 of 10 rows
DELETE FROM "church_services" WHERE "isAutoImported" = true AND "id" IN ('b0d88448-a66b-4550-af1d-0c3912be7572');
-- St Alphonsus Catholic Church: 10 of 15 rows
DELETE FROM "church_services" WHERE "isAutoImported" = true AND "id" IN ('477b015d-dd54-4ca2-8c51-946fac1da247', '57a9b94a-b601-4357-8d03-27a55dddc4e2', 'c01af3e6-4e4d-4691-b3de-a456eaaea281', '97ae5ba5-a7e4-4a91-b7e0-90813efa122f', '55dfefd9-a9b7-428c-80f5-a3d85e73f2d8', 'abb25ed4-dc3d-4f0f-b397-7250929d4703', '5a31a12c-75f7-4f6b-a274-43f49755805e', '53b68b50-7e3b-47fb-8bcb-b6a013b6669a', 'c784cc45-5947-4385-bffe-294af3786569', 'c5872439-b44f-478f-be71-090305a8afa8');
-- St Ann's Catholic Church: 9 of 18 rows
DELETE FROM "church_services" WHERE "isAutoImported" = true AND "id" IN ('ef682d0a-9534-4c2a-aca7-5e9c3381bc17', '6f902ed4-42d8-4852-b8f2-ca79285bb8db', '35a4cc8c-340a-4a4f-a332-1f80a3fa914f', '10a2d052-dede-40a7-a053-498375b4fc5a', '509c03af-20e1-4387-a79a-156cf669ed9e', '0923952d-910a-4e09-98c0-4b08ee7d8e18', '217980ef-b141-4c75-8b50-af646267b438', '3738b909-2b13-4d1c-bd62-edf11b6372c2', '6b8a2b3e-4669-4568-bcc2-bc8b8056fcd6');
-- St Anthony's Catholic Student Center-UTSA: 15 of 34 rows
DELETE FROM "church_services" WHERE "isAutoImported" = true AND "id" IN ('74f50d72-0723-404f-9100-8c4c414e30d5', '68918d1b-d1c1-4e89-a2af-28b98b8a881e', 'e7d074a0-7f82-4638-bdc2-09af1da75bf6', '6cc06d7c-3ebe-400e-9990-2708c750feb0', '13132477-faa0-4b1e-a0e6-1204242f40a2', 'a20cdf7a-83af-4c86-a6b0-1f3e0e0f7660', 'abdca5cb-b2ea-4aed-a934-2ad5502555e7', 'd92de338-6eb8-47af-b120-dab456e1d54d', 'f2e261d2-f0db-4c01-aea8-0f9b393f85d8', 'ae2cb55c-8309-4838-bad2-d5fef6a64968', 'e0b3c02d-9289-4ace-af60-6aaa886d1226', 'f56062e2-9459-4e7e-afda-e2fcf3d6aee0', '415db042-62b8-4ff6-8b49-21b67128e81e', '8b0a4bc2-ef24-4b28-9f88-79f0ec06dd1a', '06367f07-b460-4bed-896f-42912ee2496a');
-- St Clare Church: 15 of 25 rows
DELETE FROM "church_services" WHERE "isAutoImported" = true AND "id" IN ('423a185c-5746-4ffd-bbf6-343ca4f20a59', 'b608aa4e-05c7-4c41-912a-d05cd6037a6b', 'a5c16ca5-d43f-425b-84f7-ca531b5ff261', '3cd50b5c-3525-4bc6-b331-14cfca6d30ce', 'e11e085e-1567-4937-88ef-6305d301a2ae', 'd03177d1-3478-4ac1-a154-8dee41a4ce6c', '3937c83e-f01c-419c-9394-fa124548ae12', '77efa258-55b5-485e-bc03-7a726a2adebd', 'bff6c9cf-5a47-454a-9e90-6c3437604271', '99ad4622-20ea-43e5-a980-9cef41b0993c', '22c31857-b712-49c2-8bcf-262746f024ce', '45c90487-054b-46e8-893e-32b9a911868f', '5a3fb3f4-3e4d-43f6-8d18-60eed79c24e7', 'c2087bdc-487f-4c48-bde4-cb254dd54f75', 'ce474958-f911-4e3b-84d6-3f903b9fc205');
-- St Francis of Assisi Catholic Church: 11 of 22 rows
DELETE FROM "church_services" WHERE "isAutoImported" = true AND "id" IN ('8789da3e-97c7-4a62-bc78-37c5e22cca7e', 'bec48c89-6ae6-4cae-8931-efb1a33cceb0', '51bbf9ba-46c7-4970-ae62-83c46607ea8f', '03b2e543-6550-45c1-9467-6d386c031746', '3196846f-81c1-4b00-a811-2a715723ebb9', '0dc3f049-634a-4472-af13-518cb1151620', 'dbc020a9-a95d-401b-9325-6396b170ffe3', '5735b55f-3c64-4d09-921e-1f4c6a6cce7a', '0a8050e8-1bd5-4b6e-89de-040fe93858cc', '42bd26c8-139b-4ae1-9f43-02e4c6c6164a', '6d418da6-4a9a-431a-8abf-a6273e618047');
-- St Gabriel Catholic Church: 3 of 7 rows
DELETE FROM "church_services" WHERE "isAutoImported" = true AND "id" IN ('982cdb00-8629-4ad7-a30e-6b6d3e4c0b85', '34737a44-f5e6-44b7-902f-559075046bc3', '498e2002-dcae-4458-a9b8-7b3a020991c6');
-- St Gerard's Catholic Church: 4 of 18 rows
DELETE FROM "church_services" WHERE "isAutoImported" = true AND "id" IN ('b488a637-9915-42b4-a4bf-097c72880f89', '4a9dbd13-a74c-45cb-b8b2-93f8a2baacda', 'cd2cf2eb-5291-4a30-92ab-27ed36bf7dc6', '7796dafd-b4f4-464f-85aa-0f08096dc94c');
-- St James Apostle Catholic Church: 7 of 15 rows
DELETE FROM "church_services" WHERE "isAutoImported" = true AND "id" IN ('c11e48e5-5bf1-434e-b304-56e21a73cc1f', 'cfaf19fd-a252-4dd8-8ba8-d21fbaae3a00', 'ed06e7aa-c853-4300-9710-fe373d84c8aa', 'ca646e5a-fc65-46a4-a92f-14f52ad5e560', '8a4c4a56-3d44-47c6-9be0-7c96139ffd13', 'e57cd8b0-d9f5-4a2d-b3b7-18cfd9d74d88', '64127f37-911f-4b51-b754-e17e2838a163');
-- St Jerome Catholic Church: 4 of 8 rows
DELETE FROM "church_services" WHERE "isAutoImported" = true AND "id" IN ('a3891e8f-db53-4ffd-b2c1-64574f8eab69', '83336535-c009-4fcc-a497-7b7170dfa479', '804fde6c-b2fd-42b1-9583-f1d98d931fe6', 'f050a0b3-442b-454a-92e5-7c681c0a5cac');
-- St Joan of Arc Catholic Church: 4 of 15 rows
DELETE FROM "church_services" WHERE "isAutoImported" = true AND "id" IN ('b91efad1-6ad5-469c-8455-67f15239bba8', '089ac5a9-b517-44db-a855-f222dc313cbb', '3768b724-e609-46e6-894d-4d1ef1edc274', '0c1552ed-e092-47ca-8217-e059bd868b09');
-- St John Neumann Catholic Church: 10 of 20 rows
DELETE FROM "church_services" WHERE "isAutoImported" = true AND "id" IN ('379a984f-071c-411a-b0cf-633b5ea27506', 'a209c9e0-bde1-43c7-980f-f5e54d89a87f', '2e458c45-940d-46a6-b048-84dbd3ca2b6b', 'd53142d8-d2fd-40e5-89dc-d9a91c0d7acc', 'f6562532-847b-41fe-9441-ff6094bcb499', '4a627d44-7448-4508-b8a8-02d5fc503a7f', 'ccfc73a3-effd-44ac-aa5f-5a263c15aace', '92a58faf-68e7-4bc7-8b1d-0eb46a5cf1c1', '47d716a8-8539-4ed0-b497-eb104d59ed22', '4391a3e3-1b7d-4073-9af3-13a14340c103');
-- St Lawrence Catholic Church: 25 of 36 rows
DELETE FROM "church_services" WHERE "isAutoImported" = true AND "id" IN ('6335bf04-3197-450d-9200-075e3f8a6da7', '0aed9799-dbb2-4316-bcbd-a2031556aabd', '08b7cb98-68aa-4152-9496-0a946015bf7e', '5a7c6ac0-ff64-4a16-98f5-c3294b1fb417', 'df3b29a6-2c56-48f6-b561-e295e4225c3d', '4c610468-97fc-4d74-9962-344a6db5ef03', '9bb15f62-f2fe-40b3-87bc-2b304ed1b297', 'e6a7225d-5006-475b-a334-680f7a91d0dc', '06acc7c6-e392-4749-870c-cfe408cd493b', 'ad7eefe4-72ed-4585-9284-60eda45660a5', 'e893da4e-a92a-4981-ad52-8d8c96d97c6a', '1f2d3bb9-282e-4b05-98cc-b106c7a9aa7e', 'fb9da58a-411f-4a5e-abf4-2d8d355a444d', 'ac792b54-0993-4dbd-82b8-01133485acc3', '279531bb-d7d1-47b3-92b0-20849c4958f3', '5af10204-2462-4e6f-95c7-5444fcce5f13', '1fc5283d-57bb-41a0-94f9-b1eb64293056', '34f31189-337e-48a8-9c68-9482543c2ed0', '8b18384a-9ccc-477a-8d1e-2e0a87d63b96', 'bb8d2056-1fd6-4297-aec7-21d82472f5e0', 'de9b68a0-5181-4522-ba8b-f80e7e7a67f7', 'ccd3b0dd-9cab-4fbf-9130-258af66127a0', '4f6dd43d-bd1f-473f-8445-e95631377fdb', '28f84d9f-ba21-4d3e-af07-4d4126d289f8', '879fa4d6-d68f-4769-9666-36c9c1079c34');
-- St Leonard Catholic Church: 11 of 11 rows
DELETE FROM "church_services" WHERE "isAutoImported" = true AND "id" IN ('7a23e292-dc67-4474-90c7-76336de4c32d', '0294aaba-95a2-4b51-9bfd-caa3ee887a64', 'e52d282e-6d64-4557-a83b-3855a6ccc7ee', 'cc49dd9a-a29a-4b2b-a3b3-c8abeb5e6397', '96d126c5-01f0-4ce8-b36b-1a8c0b018732', 'e54de342-25fb-4588-95e1-75a249eb6568', 'de886ff6-d5e9-4610-9329-3b228d8fd9af', '376cd186-9adc-418a-ae44-a31dc4b46552', 'f0a9c8d0-713f-41b2-8762-4852f5b17b34', '695a6126-7f05-4ade-90f9-bfdafb6dba02', 'd0443cbb-ecbb-4cca-85a0-62da9a8cb8b9');
-- St Mary's Church: 9 of 15 rows
DELETE FROM "church_services" WHERE "isAutoImported" = true AND "id" IN ('f6c0dd11-7dbb-45ae-a246-217fc05caeb9', 'be1380e8-044a-4d04-a59f-02d26710096a', '0263dd0f-3bcd-4560-9e51-f7e4343f6a86', '7ceee73d-76c7-4232-a4f9-d8fc2a17dd86', 'be270c0c-5789-4e59-997e-aaf5bba679be', '0d6d75dd-c12d-4f49-b806-69482aaaaa16', '2f715852-d577-42a5-99a2-a040f1d535d3', '6468de84-5a52-455e-af6d-e2265a8a7d32', '399b2768-6ee2-4b43-896f-8709c34da3bd');
-- St Monica Catholic Church: 32 of 46 rows
DELETE FROM "church_services" WHERE "isAutoImported" = true AND "id" IN ('16e3527e-803e-47b0-b205-bf145b4e0b8e', 'e47a7e85-5f30-4d84-9a98-2f09dfdea168', 'f8ed071a-8e7f-4874-8e0c-0cae5830fd23', '53874707-8981-4071-8b94-830395949c1b', '2180354b-adf0-4d24-9df3-070da2561f57', 'b2c21b03-508a-4652-a87b-ae8220b51443', '86a470fe-f541-45d5-84f5-e8220e45a1a3', '43886c1e-4857-4c1b-9daa-0287e5fe44a4', 'bcad3563-ac41-4da9-9028-7dbae8ff1723', '188b3a81-fed5-4ed6-a4a4-706fd6de3bf7', '9af2a9f6-40cf-4568-827e-a6fc6d26797f', '9c1f0834-f326-4fe9-bf86-8beb8152c531', 'eb95d42b-efdd-4e8e-a980-a4f4ab776d4f', '1282fe3f-aa54-4743-8064-5bdb592c051d', 'f057ea91-ac58-459a-a906-3e24ee6a08df', 'a32adb44-e8a7-4037-95e1-80f20fe58e66', '93c3b851-e491-4751-88e3-539c9ac90b18', 'a33206ed-619f-41c5-85b0-10ea9e9b86db', 'c602a028-5f84-4acc-99d9-f0e49a68edcc', '9b69ff00-2d4b-4692-982d-0a48e895773c', '0e518f05-d7eb-4f48-a064-4e521885a642', '9dfe59bb-32dc-4f84-ab97-405bcafa0de0', 'ca747203-a2a3-4ab0-9a7f-a7658d29069e', '23d127a1-fdcc-4ff1-a281-3c265650f182', '372372d5-7aec-4640-b22d-d397e5a15e09', 'b2dec146-3af5-4151-be7b-7c9c13fe265b', 'b3dc014e-7cd0-4721-9367-90e3b1925c59', '3941efa1-b850-4a74-97b5-f7be67fa3e7c', '306aaa7d-faa5-4204-9f72-0b06960a21dc', '933053da-c309-42d3-8d14-8284425bbdbb', '8b3b62e0-38ae-4329-b131-3c1aaca3bbc2', '246e4a88-5c6d-4f9b-b215-b1fd4b3a0957');
-- St Rose of Lima Catholic Church: 13 of 21 rows
DELETE FROM "church_services" WHERE "isAutoImported" = true AND "id" IN ('20dec52c-5817-4a39-af65-d3d0219e8fce', '399862bd-7e68-4e43-aa8e-707cb3bbf20e', '904f7187-77a4-4f52-bf01-3d45bdb3e085', '0dc0c73d-f9b5-4e62-8442-5e4868eaf715', 'e6bdf4e4-d05c-4765-928f-1150b4f10e26', '0c846060-9d60-4f14-9c91-9b05a2c24915', '6795432b-f7d4-441e-9556-7ef380349598', 'e1d05100-62b2-4eb0-85f2-e429ea03e719', '0ac8893c-b2a2-4121-b524-2733c3c3adae', 'f0600986-e567-45e4-89cc-a3a7fd7bab86', '72e8ea40-514c-4a04-a803-0e54d2c3cdcc', '8d116b2c-bfb9-4938-bdab-7f6820890fd3', 'f7d39ad5-bf3c-402a-a87f-bcd35a7a4d08');
-- St Thomas Syro Malabar Catholic Church: 1 of 2 rows
DELETE FROM "church_services" WHERE "isAutoImported" = true AND "id" IN ('dc31eb11-ce81-435d-b6ba-999a0c44acfb');
-- St Timothy Catholic Church: 5 of 13 rows
DELETE FROM "church_services" WHERE "isAutoImported" = true AND "id" IN ('aa946783-9167-433a-904a-8a945e895102', 'bb772f3a-3980-4bda-adeb-c830a519014f', '404eab1b-0f1b-4a0e-8c42-443c7abc3f64', '5cc14ca9-c48a-493b-a5c5-c7837ed84932', '05bc0266-590d-47d0-8e4a-055280f58c9a');
-- St Vincent De Paul Catholic Church: 7 of 19 rows
DELETE FROM "church_services" WHERE "isAutoImported" = true AND "id" IN ('c6a303d7-3a5c-40ea-aab8-e0426a661f7d', 'fe14bdfa-54bb-491e-ba4c-5fb82a3369f8', '492eb130-aac2-4912-8c0f-fea32f7b7db0', '78936e22-b1bf-4f14-8e82-90689e5729cf', '0016c004-0f15-4228-8268-2f9f6cfad074', '8197483a-7892-4e4c-937a-d76851924c81', '74acfd11-037b-41fa-8f0b-924db27a46a7');
-- St. Anthony Catholic Church & Hall: 5 of 15 rows
DELETE FROM "church_services" WHERE "isAutoImported" = true AND "id" IN ('c41bc968-ece6-4402-aff2-d845ea0b0c60', '6e3a6b0d-a0f4-4bde-be93-2091b99e77ec', 'fa46c767-ac73-47e4-9427-093f061fb3d0', '49f63653-69e0-4645-b458-74876767d67b', '233642f1-1685-4cf4-898d-4e48ace1ff52');
-- St. Anthony de Padua Catholic Church: 5 of 13 rows
DELETE FROM "church_services" WHERE "isAutoImported" = true AND "id" IN ('dc2b80e4-61e6-4c06-b8f5-3e647cc60257', '305906fd-a04e-4a3d-a14a-4d5513727b73', '503643b4-b4ec-4f88-8882-a3984dc6a982', '740fff73-212c-4f90-9f14-0ade8fed1ea4', '37d4e068-7d5b-4e28-b209-c7e23a633cd3');
-- St. Benedict Catholic Church: 19 of 31 rows
DELETE FROM "church_services" WHERE "isAutoImported" = true AND "id" IN ('04aa2234-1bf6-4789-a226-8671fd61aa6a', '29b6f024-cbac-4626-98a2-077c8fd840ef', '0bfd7793-7474-481d-9281-9a8f92135a7c', 'fa6eb81e-d1c0-48e6-9f45-9d005072b5db', 'fb7ba0ae-b7c3-4a8f-b4fc-b56a19f7d7d2', 'bace63ac-b234-49d9-b9e3-fe70592f77b0', 'b41dfeaf-758f-46c9-94cf-8323ef56d83c', '04c115a9-5314-4685-a06f-1034a3f3e7e9', '3b788fd1-056b-4c09-8a93-bcff7fbe2e96', '3de1a675-9ccd-4731-841b-e67aa4efc84d', 'd7965a0a-3da8-4905-b149-62d44c502109', '4a5e7783-f7cf-4469-afe3-a7893d3b3b28', '9447a944-2ac2-46d3-8ba0-8a5d1540280c', 'afbd71da-b3e2-4508-8bb3-9c1b27deb6bf', 'fd457ac0-1de1-418d-b942-a36536b1fcb5', 'bc4cf02e-a318-4d7b-b6c9-be242fabf3d1', 'ceb2245e-5c66-423f-9c89-48da2381d8f8', '162cac89-b9d7-4ef0-a3fe-c0b921448f0f', '88e85a13-9877-4f9a-8ebe-a8b52bf6203b');
-- St. Brigid Catholic Church: 17 of 26 rows
DELETE FROM "church_services" WHERE "isAutoImported" = true AND "id" IN ('dd0f8b00-1aa8-4540-af1d-ddcb1d4b9d42', '94429dc8-f813-400a-a00a-aeea1dd54853', '9bce0a81-a7ed-48b6-b2fe-be5eacb5d7e0', 'c21b5012-c571-432a-b4c1-f22634f099f4', '8aa83ff1-194e-4baa-aa05-83112eed4a86', '475485e0-3ab0-46de-ab61-3f257ec5fc56', '1ec621fb-b938-4635-afe1-e949b8a720d5', '8a5f441d-b4f8-481f-8057-78419a0ad9c2', '56a366bc-7956-40d6-b85b-fba15cd2ba85', '46bef3ca-1790-4cef-a1ad-2aab013dc0e7', '88b2beac-f306-4033-a65e-32d6df07b8c5', '265b18d2-7518-4b9a-b897-42c639bb541a', '5584c431-8d78-4f33-ac80-17e46833e899', 'eb847b7f-af43-4fd7-a0ae-8cc10a651441', '24cca9c3-207c-45c5-891b-02651dc3ee1d', 'f959ee08-fdeb-495f-ab6c-c373ca54f4bc', 'a240e83e-53d9-4fb9-8282-ae15d95b8e16');
-- St. David's Episcopal Church: 4 of 7 rows
DELETE FROM "church_services" WHERE "isAutoImported" = true AND "id" IN ('6ba92580-613e-4a86-bb77-7de19082c8bd', 'e49a976e-1eed-4767-94c0-f11cd110c91a', '2e8003da-0a66-4e90-9bf6-63c098060c2c', 'a0f88a6d-53ac-4a37-9b24-32ea0118f7c8');
-- St. Demiana Coptic Orthodox Church: 1 of 2 rows
DELETE FROM "church_services" WHERE "isAutoImported" = true AND "id" IN ('c6721ba1-6fc2-4d0c-bd3b-6c4968e83975');
-- St. Gregory the Great Catholic Church: 10 of 20 rows
DELETE FROM "church_services" WHERE "isAutoImported" = true AND "id" IN ('dec4fd46-81bd-4976-b193-b309e34855bd', 'ca9948c2-3c7f-4ee7-ac4e-c3c66ab04154', 'f1b8e7fd-872b-410c-b21c-631792ffa5b1', '14cf6ab9-f752-4aa6-8f66-4bd806ca282a', 'b0791dd1-92c5-4942-b4fa-8c4cb804d28b', 'd8665112-74ef-46d9-97e9-255767e5a016', '75e7b52a-7d80-4572-8392-078311ec9db5', '4bad8c07-6107-4b61-a211-28d42822fa90', '8469f6c5-fa3d-4e62-963d-9f38e1076f3f', 'fac0fe1f-5c90-450d-8c38-07072165b57b');
-- St. Henry Catholic Church: 15 of 23 rows
DELETE FROM "church_services" WHERE "isAutoImported" = true AND "id" IN ('d8bc8069-2e78-411f-ae33-b17263a27afc', '70d9b451-1838-43a4-9826-a050611cf127', 'c3948d35-d771-4c41-a41a-3425425561bf', 'ad4595b5-b186-423d-bbf9-c0905dd8da66', 'd93e8054-4346-4e30-bb58-46cbd02ec567', '45540cf4-e874-4737-bef5-3d0a8bc186d1', '1328f5c6-4a37-4422-ad97-06596e62cf95', 'b0ead976-346e-494b-9f08-51a06cf46471', '06b31840-14a5-415e-bf3d-d5e39f376675', 'be303387-4fef-4c74-b16c-9abed5831e97', '9c320bd0-32ec-446c-b1e9-09be6321ae41', 'f04ae56a-a2ec-402e-9316-c39593667eb4', 'be023f99-9eae-41a0-9f7e-586efe9f4084', '1baaa0c2-8fb2-4af6-9131-e1fea2d93c2d', 'c86fe7f0-4cd0-4f66-82be-067ba9f33f77');
-- St. John Baptist Church: 1 of 6 rows
DELETE FROM "church_services" WHERE "isAutoImported" = true AND "id" IN ('2bd722d7-bc65-4dca-bd3a-008fe3508511');
-- St. José Luis Sánchez del Río Catholic Church: 6 of 16 rows
DELETE FROM "church_services" WHERE "isAutoImported" = true AND "id" IN ('e73196f4-cd7d-47bd-94f4-780ccffd39fd', 'c8b3f7b1-ab81-474b-9871-2253f98326b9', '893abd24-12fb-494b-808c-16d991e6b6be', 'd8f3e2f9-3340-40b3-9203-ad6a07f6ee8d', 'd6ab8b94-cc21-4933-9671-f4d43d95be72', '9ee84e0d-e466-4094-b951-38199215f158');
-- St. Joseph Catholic Church: 2 of 11 rows
DELETE FROM "church_services" WHERE "isAutoImported" = true AND "id" IN ('5269a0fb-0e0d-4bae-acca-a9c469ce8845', 'b6a41ba5-0ff6-4939-af7d-918729ba9f4b');
-- St. Martin de Porres Catholic Church: 2 of 6 rows
DELETE FROM "church_services" WHERE "isAutoImported" = true AND "id" IN ('db2702a2-b726-48fd-a361-dbe044b9f4a7', '4a2cdbd1-8d37-4789-ad26-3cd29714e7f4');
-- St. Padre Pio Catholic Church: 17 of 26 rows
DELETE FROM "church_services" WHERE "isAutoImported" = true AND "id" IN ('d85b50df-da26-45a2-ab62-69305c29e323', '83200df1-debb-40a4-8e91-1962fa80204d', '2287f1d3-6ecc-4e74-a2dc-036b4513e516', '831498d3-5f2a-47f5-a316-7fc169bc0e38', '4ad0aa66-796a-4b5f-9723-63c6fac53d5e', '195372c4-69b8-4ff0-a655-4df53ea95a0c', '325c0d6d-23af-4484-aab4-2dd893360e6d', '389dc4d4-d944-48c2-a817-7fd6bc018a0b', '92c9d700-d2fa-4035-b0fc-67b24e8b1430', 'e7126d8b-45d7-40ba-9bf0-887bce601888', 'a03da667-8857-4525-ad39-a04ba2ecc680', 'd091acdc-fe2f-4bdf-9109-454fdbc58603', '80b20840-4b1e-4be8-a84a-fc493c63ee29', '5f0af233-4c89-4d3a-860d-62786528ad52', 'ac4ace42-693e-46b8-98dc-1ede9459a76e', '73d4399f-7332-46cb-9922-6b1076c94017', 'd95ba552-2169-4e11-8a00-9e23a2dff76b');
-- St. Paul Lutheran Church: 10 of 14 rows
DELETE FROM "church_services" WHERE "isAutoImported" = true AND "id" IN ('55d97e43-9f68-4832-94c1-ea52fb3a2074', '4401544f-dbbc-430d-a7ec-b29e98434e6b', '522f0611-cc8a-4d04-a00c-a660e2fc2884', '51696cf7-bfe2-419b-9ba4-45e1a76eb5b9', '46386c93-8810-42ab-9342-70e1d948882f', '03195a2f-fb69-435d-a805-83a347a36d8a', '8defc604-8a6b-408b-a5c9-7a3c4bffdf2e', '882319c1-c3ec-4cfe-8d37-eb20e088d635', '6808aff2-2268-40d1-a749-8539ea6500d2', '0b95e5eb-9fe4-4a09-a716-503a8d305a0b');
-- St. Paul's Episcopal Montessori School: 1 of 3 rows
DELETE FROM "church_services" WHERE "isAutoImported" = true AND "id" IN ('0cb5bd9e-5342-46af-b983-499b80b667b5');
-- St. Thomas More Catholic Church: 1 of 13 rows
DELETE FROM "church_services" WHERE "isAutoImported" = true AND "id" IN ('7345b35d-f49d-4a37-91a5-139844f4c3be');
-- Sunset Ridge Church: 2 of 16 rows
DELETE FROM "church_services" WHERE "isAutoImported" = true AND "id" IN ('0906ae0f-c993-4a15-9203-4333ab501065', 'de8f7721-84d5-4dbb-af2f-3f45c1946e09');
-- Trinity Baptist Church: 1 of 5 rows
DELETE FROM "church_services" WHERE "isAutoImported" = true AND "id" IN ('1a83b13b-cbea-4fbe-9109-d02a23a1eeaa');
-- University Oaks Church of Christ: 1 of 6 rows
DELETE FROM "church_services" WHERE "isAutoImported" = true AND "id" IN ('e1a393c3-aa46-4799-ad1d-35aec90aabb5');
-- Victory Assembly Of God: 6 of 9 rows
DELETE FROM "church_services" WHERE "isAutoImported" = true AND "id" IN ('cd8267f5-e9a7-4b01-bf71-4a1dbb9cd1f9', 'd362b5ab-8144-480f-9612-9b8c196490ed', '5dac6c15-f701-4a80-803d-85db2f1ae0d1', '00d53aa2-21ee-4afa-8c6c-bacb21aa5122', '6fec001a-eae3-4dda-802d-6bad69eec2f5', '0a4a924a-b66a-4cd4-9a2e-fea2925c37a4');
-- Vietnamese Martyrs Catholic Church: 4 of 11 rows
DELETE FROM "church_services" WHERE "isAutoImported" = true AND "id" IN ('8c56e260-9147-41b0-85a4-86b7b834650a', '4e6fe9ef-2824-4bab-b447-3cc2b60c2e6d', '818e964a-c665-4927-a1a2-2e48427c6d33', '40d73b33-017f-4100-b12f-93b97670f0a3');
-- Village Parkway Baptist Church: 11 of 14 rows
DELETE FROM "church_services" WHERE "isAutoImported" = true AND "id" IN ('ff7df1da-8016-4b7e-8806-a0dfd5874ddb', 'c23ee91b-be7c-433e-b079-615b2e477712', 'fb664910-ad6f-4c10-8227-3f5c77777bee', '12bfb80d-003b-40ef-b7f5-e1028ebbdca9', '07d8ab19-b2e9-4c92-a9a8-6856861ad238', 'eb00df97-df99-4cac-9427-49aeaa166e7b', '22860092-ef01-4571-8372-a7d1716308ee', '774ba04f-a611-4670-a194-829bd5f7386d', '7b36196d-910b-4134-8e1b-c8798b22cbb1', '2a3c7eea-8e4d-4512-94a7-2345957800eb', '21d5dee3-dcdb-4e1f-af79-ff17d847a550');
-- Watershed Church: 13 of 17 rows
DELETE FROM "church_services" WHERE "isAutoImported" = true AND "id" IN ('682d30ac-4f61-4c6a-9dd1-f75cbf826219', '01d6742b-9dc6-4129-89c7-50ad1e8e5923', 'd89224ff-890a-4506-a079-6ca57e7b01b8', '9c42382f-5729-47ff-abdf-55968b20a37c', '5fc36fd1-9a98-4ae6-bd16-4ee8c3cfe2c3', '3c314aa0-ee2e-42d6-9528-24f0d09df93d', '97aece0e-a96c-4d7a-8225-7cbcb18f3f60', '9d4f4aa8-6492-49cb-af61-14a01759de07', 'b1097c96-5dcb-410d-a83a-97b7cf4012b6', '57b0e7ac-8e01-490a-88f1-2e9a741bb543', '3e9d14e7-4066-4ca2-9baa-410ca06da6bf', '0731bbe5-139f-4426-86c2-6880300dff41', '312053aa-45e2-4ecf-954f-72dbcbddef64');
-- Wildfire Network: 1 of 3 rows
DELETE FROM "church_services" WHERE "isAutoImported" = true AND "id" IN ('038b64bd-9051-422a-8982-c2501c3b6887');
-- Woodland Church: 12 of 17 rows
DELETE FROM "church_services" WHERE "isAutoImported" = true AND "id" IN ('c67cffec-1a07-4325-931d-ea792a71dfc5', '10ef7199-7b32-4a14-9d81-38f553f356c5', 'a72851b5-aafe-499b-8deb-5d07a62d5ffb', '6b4a0d4b-6805-4e30-8c8c-6cd3178be0bf', 'cd7dae6d-5c0c-4b52-b895-90b1f6b1d427', '2bc0a966-22f5-4852-a1d1-acd9a2fb6b32', 'a07133c3-75bb-4192-a365-5784708a9456', '18618578-5623-4155-9497-12140c552c38', '253d8292-e13b-47aa-9e40-d132993ab736', 'fe3f8f84-905e-42e1-8fc6-849a10488484', '3752cb6b-d041-4379-bad6-bc29247295e6', '4e52eea2-953d-4a3c-ab13-e56231fe3dea');
-- Zion Lutheran Church: 1 of 8 rows
DELETE FROM "church_services" WHERE "isAutoImported" = true AND "id" IN ('e24ab186-1f2d-435c-a03a-dcd3af8601a7');
