-- School
INSERT INTO webapp_users (user_id, password, role, full_name, phone) VALUES
('SCH00001', 'school123', 'school', '28-umumiy o''rta ta''lim maktabi', '+998752211128')
ON CONFLICT (user_id) DO NOTHING;

-- Director
INSERT INTO webapp_users (user_id, password, role, full_name, phone) VALUES
('DRK00001', 'dir123', 'director', 'Ergashev Baxromjon Toshtemirovich', '+998902345671')
ON CONFLICT (user_id) DO NOTHING;

-- Teacher
INSERT INTO webapp_users (user_id, password, role, full_name, phone) VALUES
('TCH00001', 'tch123', 'teacher', 'Xalilova Gulnora Akramovna', '+998902345672')
ON CONFLICT (user_id) DO NOTHING;

-- Sinf Rahbars (5)
INSERT INTO webapp_users (user_id, password, role, full_name, phone) VALUES
('STCH00001', 'sinf123', 'sinf_rahbar', 'Aliyev Akmaljon Sobirovich', '+998901234561'),
('STCH00002', 'sinf123', 'sinf_rahbar', 'Karimova Nilufar Baxodirovna', '+998901234562'),
('STCH00003', 'sinf123', 'sinf_rahbar', 'Toshmatov Botirjon Qodirovich', '+998901234563'),
('STCH00004', 'sinf123', 'sinf_rahbar', 'Rahimova Dilorom Xasanovna', '+998901234564'),
('STCH00005', 'sinf123', 'sinf_rahbar', 'Nurmatov Jasur Alisherovich', '+998901234565')
ON CONFLICT (user_id) DO NOTHING;

-- Parents (5)
INSERT INTO webapp_users (user_id, password, role, full_name, phone) VALUES
('PRT00001', 'parent123', 'parent', 'Abdullayev Rustamjon Xalilovich', '+998911234561'),
('PRT00002', 'parent123', 'parent', 'Karimova Muhabbat Tolibovna', '+998911234562'),
('PRT00003', 'parent123', 'parent', 'Xasanov Shuxratjon Azimovich', '+998911234563'),
('PRT00004', 'parent123', 'parent', 'Ismoilova Zulfiya Baxtiyorovna', '+998911234564'),
('PRT00005', 'parent123', 'parent', 'Tursunov Olimjon Norqulovich', '+998911234565')
ON CONFLICT (user_id) DO NOTHING;

-- Pupils (20)
INSERT INTO webapp_users (user_id, password, role, full_name, phone) VALUES
('PPL000001', 'pupil123', 'pupil', 'Abdullayev Sherzod Rustam o''g''li', '+998931234501'),
('PPL000002', 'pupil123', 'pupil', 'Abdullayeva Madina Rustam qizi', '+998931234502'),
('PPL000003', 'pupil123', 'pupil', 'Abdullayev Jahongir Rustam o''g''li', '+998931234503'),
('PPL000004', 'pupil123', 'pupil', 'Abdullayeva Sevinch Rustam qizi', '+998931234504'),
('PPL000005', 'pupil123', 'pupil', 'Karimov Sardor Baxtiyor o''g''li', '+998931234505'),
('PPL000006', 'pupil123', 'pupil', 'Karimova Lola Baxtiyor qizi', '+998931234506'),
('PPL000007', 'pupil123', 'pupil', 'Karimov Javohir Baxtiyor o''g''li', '+998931234507'),
('PPL000008', 'pupil123', 'pupil', 'Karimova Gulruh Baxtiyor qizi', '+998931234508'),
('PPL000009', 'pupil123', 'pupil', 'Xasanov Islom Shuxrat o''g''li', '+998931234509'),
('PPL000010', 'pupil123', 'pupil', 'Xasanova Nilufar Shuxrat qizi', '+998931234510'),
('PPL000011', 'pupil123', 'pupil', 'Xasanov Diyorbek Shuxrat o''g''li', '+998931234511'),
('PPL000012', 'pupil123', 'pupil', 'Xasanova Zuhra Shuxrat qizi', '+998931234512'),
('PPL000013', 'pupil123', 'pupil', 'Ismoilov Muhammadali Baxtiyor o''g''li', '+998931234513'),
('PPL000014', 'pupil123', 'pupil', 'Ismoilova Sabina Baxtiyor qizi', '+998931234514'),
('PPL000015', 'pupil123', 'pupil', 'Ismoilov Abrorjon Baxtiyor o''g''li', '+998931234515'),
('PPL000016', 'pupil123', 'pupil', 'Ismoilova Malika Baxtiyor qizi', '+998931234516'),
('PPL000017', 'pupil123', 'pupil', 'Tursunov Behzod Olimjon o''g''li', '+998931234517'),
('PPL000018', 'pupil123', 'pupil', 'Tursunova Mohichehra Olimjon qizi', '+998931234518'),
('PPL000019', 'pupil123', 'pupil', 'Tursunov Dilshodbek Olimjon o''g''li', '+998931234519'),
('PPL000020', 'pupil123', 'pupil', 'Tursunova Zarnigor Olimjon qizi', '+998931234520')
ON CONFLICT (user_id) DO NOTHING;

-- Children table: linking pupils to parents and sinf rahbars
INSERT INTO children (pupil_id, full_name, class_name, school_id, parent_id, sinf_rahbar_id) VALUES
-- STCH00001 -> 9-A -> PRT00001 children
('PPL000001', 'Abdullayev Sherzod Rustam o''g''li', '9-A', 'SCH00001', 'PRT00001', 'STCH00001'),
('PPL000002', 'Abdullayeva Madina Rustam qizi', '9-A', 'SCH00001', 'PRT00001', 'STCH00001'),
('PPL000003', 'Abdullayev Jahongir Rustam o''g''li', '9-A', 'SCH00001', 'PRT00001', 'STCH00001'),
('PPL000004', 'Abdullayeva Sevinch Rustam qizi', '9-A', 'SCH00001', 'PRT00001', 'STCH00001'),
-- STCH00002 -> 9-B -> PRT00002 children
('PPL000005', 'Karimov Sardor Baxtiyor o''g''li', '9-B', 'SCH00001', 'PRT00002', 'STCH00002'),
('PPL000006', 'Karimova Lola Baxtiyor qizi', '9-B', 'SCH00001', 'PRT00002', 'STCH00002'),
('PPL000007', 'Karimov Javohir Baxtiyor o''g''li', '9-B', 'SCH00001', 'PRT00002', 'STCH00002'),
('PPL000008', 'Karimova Gulruh Baxtiyor qizi', '9-B', 'SCH00001', 'PRT00002', 'STCH00002'),
-- STCH00003 -> 10-A -> PRT00003 children
('PPL000009', 'Xasanov Islom Shuxrat o''g''li', '10-A', 'SCH00001', 'PRT00003', 'STCH00003'),
('PPL000010', 'Xasanova Nilufar Shuxrat qizi', '10-A', 'SCH00001', 'PRT00003', 'STCH00003'),
('PPL000011', 'Xasanov Diyorbek Shuxrat o''g''li', '10-A', 'SCH00001', 'PRT00003', 'STCH00003'),
('PPL000012', 'Xasanova Zuhra Shuxrat qizi', '10-A', 'SCH00001', 'PRT00003', 'STCH00003'),
-- STCH00004 -> 8-A -> PRT00004 children
('PPL000013', 'Ismoilov Muhammadali Baxtiyor o''g''li', '8-A', 'SCH00001', 'PRT00004', 'STCH00004'),
('PPL000014', 'Ismoilova Sabina Baxtiyor qizi', '8-A', 'SCH00001', 'PRT00004', 'STCH00004'),
('PPL000015', 'Ismoilov Abrorjon Baxtiyor o''g''li', '8-A', 'SCH00001', 'PRT00004', 'STCH00004'),
('PPL000016', 'Ismoilova Malika Baxtiyor qizi', '8-A', 'SCH00001', 'PRT00004', 'STCH00004'),
-- STCH00005 -> 11-A -> PRT00005 children
('PPL000017', 'Tursunov Behzod Olimjon o''g''li', '11-A', 'SCH00001', 'PRT00005', 'STCH00005'),
('PPL000018', 'Tursunova Mohichehra Olimjon qizi', '11-A', 'SCH00001', 'PRT00005', 'STCH00005'),
('PPL000019', 'Tursunov Dilshodbek Olimjon o''g''li', '11-A', 'SCH00001', 'PRT00005', 'STCH00005'),
('PPL000020', 'Tursunova Zarnigor Olimjon qizi', '11-A', 'SCH00001', 'PRT00005', 'STCH00005')
ON CONFLICT (pupil_id) DO NOTHING;
