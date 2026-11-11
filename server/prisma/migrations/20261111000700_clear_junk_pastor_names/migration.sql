-- Pastor names that are scraped sentence fragments, not names. The old
-- website parser matched "pastor <words>" case-insensitively, so profiles
-- read "Led by and of the Son", "Led by Office Hours", "Led by in heaven".
-- Cleared here; real names are re-read from each church's site by the
-- reworked website stage. Guarded by the audited value.

UPDATE "churches" SET "pastorName" = NULL WHERE "id" = 'b84c997f-94c0-42dd-98ae-4b6b6beb5d4e' AND "pastorName" = 'provides verbal directions as'; -- Abiding Presence Lutheran Church and Day School
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = 'ada343ec-ea2c-434d-9b18-7bb447523aa8' AND "pastorName" = 'and love on God'; -- Agape Christian Church
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = '53f40746-25e3-4cbb-bfc5-a95051c22dd4' AND "pastorName" = 'Office Hours'; -- Alamo United Methodist Church
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = '3ab43eae-26ab-4868-b024-47be4af969e4' AND "pastorName" = 'Shabbat Messianic service is'; -- Baruch Hashem Congregation
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = 'a7a45e2a-0485-4bac-b475-1d3afea67fd8' AND "pastorName" = 'Frank'; -- Belong Church
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = 'e0aba20a-54d2-4276-8197-2a5feb7b0538' AND "pastorName" = 'Pastor Troy'; -- Calvary Chapel Solid Rock
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = '9ffa1aea-482e-4c5c-98c8-f7f65568d5c8' AND "pastorName" = 'will deliver'; -- Calvary Church
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = '7e921d3e-6809-447c-9ee3-1a164e42be93' AND "pastorName" = 'in heaven'; -- Castle Hills Christian Church
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = '49041299-51c9-481e-8392-6e87ea55eb50' AND "pastorName" = 'Charles and Co'; -- Chosen4Service Ministries
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = '65a34b9c-316b-479a-a67d-795773aaa977' AND "pastorName" = 'Leslie Christ Lutheran Church'; -- Christ Lutheran Church
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = 'ee91f580-0c67-4d00-b241-39b7586a920c' AND "pastorName" = 'Martin and Staff'; -- Christ the King Catholic Church
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = 'f4a0638a-4a61-4241-9e44-ac66166ddca2' AND "pastorName" = 'John Sweeney for more'; -- Christ the Servant Charismatic Episcopal Church
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = '93e9b857-9d9a-457a-80fa-4dfb14abba3b' AND "pastorName" = 'Rob Johnson sees the'; -- Christian Family Baptist Church
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = 'b0145d14-939e-408a-a59f-b3668f065cb6' AND "pastorName" = 'and of the Son'; -- Church of the Blessed Sacrament
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = '7f0db9a6-862f-4f04-992a-f3eff3040fdb' AND "pastorName" = 'was among the group'; -- Coker Methodist Church
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = '2df64b8e-c872-4dee-a541-eabe97edef44' AND "pastorName" = 'to the spiritual and'; -- Communities Under the Bridge with Church Under the Bridge
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = '6b8a5b81-3a77-41bd-9b68-de44d78293a1' AND "pastorName" = 'for Community Bible Church'; -- Community Bible Church - Southside
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = 'e4a4216f-41b1-4b0f-ab1b-5f5354985015' AND "pastorName" = 'who shepherds the church'; -- Community Bible Church - West
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = '86b71000-e39b-4688-83d2-6182061f2df0' AND "pastorName" = 'and to seek His'; -- Compass Church San Antonio
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = 'bfc291e8-f321-4ea2-a2de-fc06bdd7f4dd' AND "pastorName" = 'at jenny'; -- Covenant Baptist Church
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = '2d1e9236-7e94-4991-adfa-b7adafe22919' AND "pastorName" = 'Brian'; -- Cross Roads Church
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = '414498b7-71c3-428d-a296-b1c3f04c5ec9' AND "pastorName" = 'Alex and fellow new'; -- Elevate Ministries
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = '9b2fa3ca-3da3-4c7f-a921-cd6c10ab3ca9' AND "pastorName" = 'of Emanuel United Methodist'; -- Emanuel United Methodist Church
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = '460e910e-5b2e-439f-8e68-08763255eb4c' AND "pastorName" = 'Reagan Gonzalez was called'; -- Episcopal Church of Reconciliation
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = '714e1939-0de2-4799-8ed2-bc00761f81c7' AND "pastorName" = 'All who so acknowledge'; -- Evers Road Christian Church San Antonio
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = '50d87e97-c9fd-44fa-8d8e-f22dcba208db' AND "pastorName" = 'directly at pastorruiz'; -- Faith Lutheran Church
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = 'd9b0f47b-a42c-4a59-a015-78d42c9d5d44' AND "pastorName" = 'or Young Adult Pastor'; -- First Chinese Baptist Church
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = 'eb652a1f-0a41-4d5a-a84a-fafc059b9c38' AND "pastorName" = 'was the late Dr'; -- First Mexican Fundamental Baptist
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = '1697494b-9b14-48fb-8bc5-24eee1562a71' AND "pastorName" = 'as His Word'; -- First Presbyterian Church
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = 'ab58f65b-7f40-4976-8cc9-abbbb3f8ca09' AND "pastorName" = 'and Wife Biography'; -- Fountain Of Praise Church of God in Christ
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = 'b2c8f56c-7477-41fe-98f7-6abfc1d46d02' AND "pastorName" = 'Anthony Lamb was born'; -- Freedom, A Church For All People
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = 'ca877a71-10f3-4614-9cd2-617a8db0c18d' AND "pastorName" = 'Warren is speaking about'; -- Friendship Church
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = '259eec0e-869b-41ec-8dc7-07a55bdc0bf6' AND "pastorName" = 'who is in heaven'; -- Ft. Sam Houston Church of Christ
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = '4bc11e9d-ecf7-454d-abcf-09319f270ab8' AND "pastorName" = 'for us'; -- Garden City Church
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = 'b491cebd-44cb-4206-b648-3c1f8db9eda8' AND "pastorName" = 'Pastor Veronica Soto; Pastors Joshua & Johanna Soto'; -- Generations Family Church (Mission Cristiana Maranatha)
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = '5203e41c-410a-4146-a1a5-aa447e085810' AND "pastorName" = 'and of the Son'; -- Glendora Avenue Church of Christ
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = '528db041-2a18-4551-a9b5-c26a0f739c90' AND "pastorName" = 'Donte and our teaching'; -- GodChasers Community Church
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = '639da2af-93cf-47ce-8368-4710714e31c3' AND "pastorName" = 'to you as well'; -- Grace Baptist Church
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = 'da71af2f-2038-4fa5-a115-f245c4f15eb3' AND "pastorName" = 'Pastor Joe'; -- Grace Calvary Chapel
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = '8d5f06f9-a414-41b4-bf17-6b5b06eb4a27' AND "pastorName" = 'concerning what God requires'; -- Grace Community Church
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = 'fb1977b7-af8e-4318-bda9-8bcfd48feb58' AND "pastorName" = 'in heaven'; -- Grace Orthodox Presbyterian Church
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = '6c261773-48f5-48dd-8a66-010fcd1f3d28' AND "pastorName" = 'Joseph Ward at Grady'; -- Greater Joy Temple Church of God In Christ
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = 'e814f276-a26f-4366-849d-af330e353e7c' AND "pastorName" = 'and Deacon'; -- Harvest Hill Baptist Church
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = '533c75b3-1d61-496d-9d19-1dff75db98c6' AND "pastorName" = 'holding his toddler daughter'; -- Helotes Building
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = '877a909d-c801-473a-8aa1-a11dcf6f3206' AND "pastorName" = 'will rice'; -- Helotes Hills United Methodist Church
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = '56e51c92-6740-4170-9754-ba4c9b44b9d1' AND "pastorName" = 'of Helotes Independent Baptist'; -- Helotes Independent Baptist Church
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = '0e3e65af-432b-479b-b4ab-39a69d2f830c' AND "pastorName" = 'Fr. Rodolfo'; -- Holy Trinity Catholic Church
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = '31120b4f-6978-4f65-8789-8290e6b70deb' AND "pastorName" = 'Nathan Scoggins has ignited'; -- Hope Center Church
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = '13422e66-d73b-47b3-9a50-252e18f95370' AND "pastorName" = 'Tom invitar'; -- Hope Church San Antonio
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = '199ee642-5637-45e3-9ddf-412eda8c53db' AND "pastorName" = 'in leading worship for'; -- Hosanna Assembly of God
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = 'a5d70106-4e3c-477e-bf0f-88cd1f68f3d3' AND "pastorName" = 'has been given'; -- Iglesia Bethel
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = 'a209d467-cc04-47a7-ba5f-3972e45a6153' AND "pastorName" = 'Richard Zurita hace una'; -- Iglesia Cristiana El Sembrador
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = '18f025c3-d149-47d1-9c65-7155e5205c63' AND "pastorName" = 'Gilberto trinidad'; -- Iglesia Cristiana Roca De Salvacion
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = 'e3a711ac-c239-484b-a46f-e4cdca94b1f4' AND "pastorName" = 'who loves you and'; -- Iglesia Cristiana Triunfante
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = '1567abe4-85dc-407f-a629-d1ce61b536ff' AND "pastorName" = 'Rafael Gutierrez redactar los'; -- Iglesia Puerta de Restauracion
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = '63a76b08-999b-4607-b4f0-69c7dde582ce' AND "pastorName" = 'and the Son'; -- Journey Fellowship
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = '20f8fd57-55d4-4ba3-a5bb-449d885e6174' AND "pastorName" = 'Neldo Schmidt served as'; -- King of Kings Lutheran Church LCMS
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = '97532dae-f30f-4e44-98de-cea7b6e09b8b' AND "pastorName" = 'Sam on YouTube Live'; -- KRBC Ministries
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = 'ca989c9f-be31-4caa-b0e7-8714e38b66de' AND "pastorName" = 'Steve Burkholder preaches and'; -- Leon Valley Baptist Church
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = '7f56b0ee-d4e3-4132-a86c-aef35765561b' AND "pastorName" = 'to the physical and'; -- Liberty Baptist Church
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = 'ed3febbb-8774-47b9-b375-7c687e6b750d' AND "pastorName" = 'Danny and Rachel'; -- Life Point Church
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = '981dc630-4172-466d-88ac-5a8d972c27b6' AND "pastorName" = 'and of the Son'; -- Lifehouse Church
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = '9f5e412f-919c-4aa8-b1f4-7aea94ebae15' AND "pastorName" = 'you during important seasons'; -- LifeShare Church
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = '6bf91cef-d203-47ee-9e90-0d2d70d19a15' AND "pastorName" = 'spoke with such passion'; -- Lilly of the Valley Missionary
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = '9a9e1e8e-08d9-417a-9735-a1d0d882fe65' AND "pastorName" = 'and the Holy Spirit'; -- Limitless Church SA
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = 'f00ec0e0-8639-45f6-b049-5b3ba3a31212' AND "pastorName" = 'of Living Faith Church'; -- Living Faith Church
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = '4f9c5e18-1f1a-4bb9-b335-be647dfef3ed' AND "pastorName" = 'and wanting our ministry'; -- Luminous Church
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = '15858964-4cc2-45e2-8972-9433d01c882f' AND "pastorName" = 'Pastor Draper'; -- Maranatha Bible Church
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = '6db1f00c-314e-4986-bb6b-f1b0abab9d43' AND "pastorName" = 'teaching Scripture verse by'; -- Messiah Bible Church
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = '1cb44d8e-7859-434b-9993-f6914efe53c6' AND "pastorName" = 'and the Son and'; -- Mighty Fortress Church
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = 'fef8d6d7-2e9e-4886-ae63-6920776b14d2' AND "pastorName" = 'unto us'; -- Mount Calvary Lutheran Church
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = 'ed481522-bcda-48f4-ad8c-ae7904da54c1' AND "pastorName" = 'Eliseo "Al" Garza'; -- My Redeemer Lives Baptist Church
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = 'db4e3321-d9bf-4e80-b9ac-c1dc01f8fee2' AND "pastorName" = 'of New Covenant'; -- New Covenant Baptist Church
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = '60a0e5bf-4806-4b60-bbaa-adc375756f4e' AND "pastorName" = 'is the almighty Creator'; -- New Hope United Church of God (Seventh Day)
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = '184b1d2c-9b52-4bba-bca2-1e304f10fee2' AND "pastorName" = 'Pastor Green'; -- New Life Baptist Church
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = '48c67f75-909d-4431-af0a-18a374e8793d' AND "pastorName" = 'will also send you'; -- New Life Christian Center
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = 'f1643681-4b87-4130-bd00-20b1679ff983' AND "pastorName" = 'Pastors Denise & Jeff Stiewig'; -- New Vision Church of God
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = 'f9b42878-621d-4203-8039-f5df3eb8d0ad' AND "pastorName" = 'as our High Priest'; -- Northeast Bible Church
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = '6128d54e-c766-4d7a-8030-2de70459fb69' AND "pastorName" = 'Speaking to'; -- NorthRock Church
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = 'ad0f1a68-e6ad-4030-bd55-f2bc27159486' AND "pastorName" = 'of the Word'; -- Northside Church of Christ
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = 'fc431140-af81-4b4d-9118-74f4bbf2aebf' AND "pastorName" = 'and to seek His'; -- Northwest Hills Global Methodist Church
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = '9c3bbeb1-2712-4022-979f-637e5f101e14' AND "pastorName" = 'Keith Graham designed to'; -- Now Word Covenant Church
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = '35f1681c-5a04-405b-a80c-f9cec3595f15' AND "pastorName" = 'through Him'; -- O'Connor Road Church of Christ
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = 'fa541c2c-8ac6-44b5-a274-48b8c14d9cfa' AND "pastorName" = 'has sent me'; -- Oak Meadow United Methodist
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = 'e57ae095-6cf0-4e66-8de5-b8ceb4eb4d74' AND "pastorName" = 'John Collins as the'; -- Our Lady of Grace Church
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = '8041d3f8-ce03-4fd3-8781-7b6f6d96ab2f' AND "pastorName" = 'Friar Andy Martinez OFM Conv'; -- Our Lady of Guadalupe Shrine
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = 'cb4401af-f356-450d-9dd2-d56ca994ad1b' AND "pastorName" = 'Fr. Luke Jordan, O.F.M. Cap.'; -- Our Lady of the Angels Church
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = '36d57a8c-94c6-4526-a02a-f5a0f8f07565' AND "pastorName" = 'and his family'; -- Our Lady of the Atonement Catholic Church
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = '22574bad-0cac-436c-b346-bfa0391433e2' AND "pastorName" = 'Jesus Camacho'; -- Our Lady Queen of Heaven Church
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = 'f354c70e-97cf-4745-b051-ea5f431b38d3' AND "pastorName" = 'Search Updates'; -- Parkhills Baptist Church
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = '26db5f77-b0fc-45d9-861e-3d7fa90465dd' AND "pastorName" = 'Statt came as Pastor'; -- Pearsall Road Church - Pastor Statt
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = 'd98daba3-92b0-4697-9994-7ed44c7f662a' AND "pastorName" = 'will also be happy'; -- Randolph Church of Christ
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = '00823fac-afef-41b4-9fd6-878a8aa30d50' AND "pastorName" = 'Phil Dvorak at Recovery'; -- Recovery Church San Antonio
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = 'cb7a7080-00e0-44d6-964f-56dbb8f12cc3' AND "pastorName" = 'Bailey is in the'; -- Redeemer Lutheran Church
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = 'e4a21bfa-bc67-4eba-8c48-87cd33b38db8' AND "pastorName" = 'Youth is designed to'; -- Revelation Church San Antonio
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = '2466bf1e-cd4e-4f25-8f9f-1436a7d19e2b' AND "pastorName" = 'and different guests share'; -- Revolution Church
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = '09236812-32fb-46e6-ba92-84c706f31216' AND "pastorName" = 'is the Creator of'; -- River of Life Church
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = '640eef54-3941-465c-99a7-85d33015baa7' AND "pastorName" = 'of Monasticism'; -- Saint Anthony the Great Orthodox Church
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = 'aabf5f95-4761-4e6a-9e6c-a92b872a2966' AND "pastorName" = 'of St'; -- Saint Philip of Jesus Catholic Church
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = 'b997b88c-19a1-4a66-87b3-3fcb57777133' AND "pastorName" = 'delivers sermons that are'; -- San Antonio For Christ
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = '083e44d3-dea5-49eb-8a86-7476b3128b33' AND "pastorName" = 'Very Rev. Carlos B. Velázquez'; -- San Fernando Cathedral
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = '5a0886c5-9506-4060-8ccb-234259ce94ac' AND "pastorName" = 'in
Heaven'; -- San Pedro Church of Christ
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = '3c0b505d-7d00-42c2-a1ad-42959f75af88' AND "pastorName" = 'Joe has been honored'; -- Saved By Grace Church
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = '2eefd611-9377-4fae-8603-b38899b743d5' AND "pastorName" = 'and to'; -- Schoenstatt Movement of San Antonio
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = '937a8081-b61a-4886-829d-db809f374130' AND "pastorName" = 'Fr. Martin'; -- Senyor Santo Niño de Cebu Catholic Church
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = '7d026556-13c0-4c6b-a1b7-f8fe85cfc89f' AND "pastorName" = 'Chris for'; -- Shepherd of the Hills Lutheran Church, School, & Child Care
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = '775d14f4-a058-4506-8b45-9820410ed387' AND "pastorName" = 'through the power of'; -- Shepherd's Own Church
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = '97f9b93f-a2e8-45a1-a1a0-4da0ccfeb422' AND "pastorName" = 'Nick every Friday afternoon'; -- Somerset Baptist Church
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = 'c4d62a46-4411-41d8-b15c-0aa91908bca3' AND "pastorName" = 'so that the Father'; -- Southeast Church of Christ
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = 'bf29edff-a36f-48fd-97ac-bb2247cabac7' AND "pastorName" = 'and of the Son'; -- SOWERS Church of Christ
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = 'f272ecf4-535b-484d-8783-d6747868d624' AND "pastorName" = 'Friar Andy Martinez OFM Conv'; -- St Alphonsus Catholic Church
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = '446ac858-f0e2-48f4-a859-d3194241ce99' AND "pastorName" = 'or any priest does'; -- St Gerard's Catholic Church
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = 'a044fbc2-d591-4ca3-9ccf-bbd0930d7a38' AND "pastorName" = 'Kris may also require'; -- St Jerome Catholic Church
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = '6348ded7-bb79-4e72-b9d3-6fa0de307844' AND "pastorName" = 'Fr. Thumma'; -- St Monica Catholic Church
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = 'c51f208a-3b80-4170-bdb8-1a1935085b1a' AND "pastorName" = 'of St'; -- St. Anthony Catholic Church & Hall
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = '8531d532-d23e-4328-b39c-92092d84a36f' AND "pastorName" = 'Kevin Shanahan Welcomes You'; -- St. Anthony de Padua Catholic Church
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = '0463f326-d0c7-4b57-9898-b51028884f84' AND "pastorName" = 'with effect from December'; -- St. Anthony's Knanaya Catholic Church
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = '458ec288-4289-4e6c-9872-84c197fd9bfd' AND "pastorName" = 'and of the Son'; -- St. Benedict Catholic Church
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = 'dde21194-63a7-4311-922d-e6b1771de1c4' AND "pastorName" = 'Father Gilberto'; -- St. Brigid Catholic Church
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = '17945698-a77d-4245-be17-7ddd313fd2bf' AND "pastorName" = 'to those who are'; -- St. George Indian Orthodox Church
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = '62d87a9b-2ce8-4eab-bdf1-c90e95edb620' AND "pastorName" = 'and of the Son'; -- St. Henry Catholic Church
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = '5d9c6c08-624f-4ba5-91b6-52a4968f924c' AND "pastorName" = 'Lenin announces all parish'; -- St. José Luis Sánchez del Río Catholic Church
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = '1910b6c8-c9d3-472c-aeb9-e91546e1cd72' AND "pastorName" = 'Beth Knowlton on April'; -- St. Mark's Episcopal Church
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = 'd2bad95d-92b8-4d74-b84f-2cac3b7cc74e' AND "pastorName" = 'Rev. Joaquin Rojas, MSM'; -- St. Martin de Porres Catholic Church
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = '794a56f8-54e2-49ae-9086-ee70b4cdc425' AND "pastorName" = 'JOHNS LETTER'; -- St. Mary's Catholic Church
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = '8cda5b7b-8257-48a0-9538-1dd9be45dc90' AND "pastorName" = 'of Religious Education'; -- St. Padre Pio Catholic Church
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = '8592a8fb-8d8e-4b9b-a9d0-fb61df91e8d0' AND "pastorName" = 'Pastor Dave'; -- St. Paul Lutheran Church
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = 'e7771b5b-0e18-428b-bc20-727c26e797ef' AND "pastorName" = 'Pastor Mark'; -- Stone Oak Cumberland Presbyterian Church
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = 'f6893091-893b-4e8c-aadf-55a8b49ac5e2' AND "pastorName" = 'who faithfully guides our'; -- Stonebridge Baptist Church
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = 'b55f3df6-e631-4684-acb5-c58e26b15d5f' AND "pastorName" = 'or to pray'; -- Talley Road Baptist Church
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = 'f8efed97-fabf-43c8-9a2f-df7f74a2c844' AND "pastorName" = 'of Texas Baptist Church'; -- Texas Baptist Church
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = '7fc29a44-a3df-4c9f-8f03-61f23aa4df4c' AND "pastorName" = 'Carl Huffaker and Worship'; -- The Bridge Community Church
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = '159abd63-fd56-4127-b75c-9e46706fb255' AND "pastorName" = 'to contact you'; -- The Door Christian Fellowship Church Southside San Antonio
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = '107bf2bf-6a76-4239-9fa0-673cc6accaf2' AND "pastorName" = 'or member of our'; -- The Garden Church
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = 'f74be1c0-9369-4429-ae6d-b7d0371d8151' AND "pastorName" = 'reigns with providential care'; -- The Hills Church
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = 'd411ca84-4f8e-4931-9388-784b85486ad4' AND "pastorName" = 'Jimmy'; -- The Kings Mission Fellowship
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = '8caf1a20-2956-4ccf-b5b9-e86eb0ede23e' AND "pastorName" = 'Juan is the first'; -- The Promised Land Church
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = 'a80eb623-f0c7-4f1f-b4eb-57dc0c724166' AND "pastorName" = 'Jesus lived'; -- The Rim Church
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = '7f11cffc-3a59-4a5d-8d3c-4aedb65009da' AND "pastorName" = 'and Creator of all'; -- The Rock San Antonio
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = '927b5854-5ce0-4d67-b75a-d2a329063e66' AND "pastorName" = 'of Greater Joy Temple'; -- Tried Stone Baptist Church
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = '2287554c-a8d2-45af-804e-f664569080e9' AND "pastorName" = 'in reaching the mission'; -- Trinity Baptist Church
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = 'ca06e7b1-8512-4f26-8594-1823b038d22c' AND "pastorName" = 'Profile that reflects who'; -- Trinity Grace Church San Antonio - A PCA Church
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = '877b4072-5284-4f99-a5b4-45b2f4bdb8f6' AND "pastorName" = 'before all worlds'; -- Trinity San Antonio Lutheran Church
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = '8076ce42-26eb-4e30-9003-44567e3dbe11' AND "pastorName" = 'of True Life Church'; -- True Life Church
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = 'ab2e9157-dad1-453e-97bc-e2556e013bff' AND "pastorName" = 'of True Vine Baptist'; -- True Vine Baptist Church
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = 'f97d632a-37b6-43ad-ac7d-94b6e6fe3ae8' AND "pastorName" = 'at UFC Fellowship in'; -- United For Christ Fellowship
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = '30da03a9-2c86-49f5-a9ef-0734270a954d' AND "pastorName" = 'Nina carries such'; -- Unity of San Antonio
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = '854280e1-8572-40b1-ad4c-00a0bad8ffb4' AND "pastorName" = 'uses the Christian Standard'; -- University Baptist Church
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = 'f6990e7a-25ed-4acb-8a1b-1372b154a6fd' AND "pastorName" = 'to the brokenness in'; -- University Presbyterian Church
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = 'a4ae2ae4-6f57-4533-a0e8-53ec05094162' AND "pastorName" = 'to pray with you'; -- Victory Gospel Chapel
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = 'e797584f-6378-409d-8a58-7e43e1624825' AND "pastorName" = 'AND THE SON AND'; -- Victory Outreach San Antonio West
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = '402adf66-731a-43a1-a10f-aa3f341f8ac8' AND "pastorName" = 'Waddle invites you to'; -- Windcrest United Methodist Church
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = 'f796ff48-e7f2-4abc-8b66-18cdd42aed22' AND "pastorName" = 'has given me the'; -- Woodlawn Christian Church
UPDATE "churches" SET "pastorName" = NULL WHERE "id" = 'e5c2fe90-404d-49b1-be53-4399dac5b5e6' AND "pastorName" = 'Al'; -- Zion Lutheran Church
