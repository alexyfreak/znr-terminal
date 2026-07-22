-- Director (also has class = teacher profile available)
INSERT INTO webapp_users (user_id, password, role, full_name, phone) VALUES
('DRK00001', 'dir123', 'director', 'Ergashev Baxromjon Toshtemirovich', '+998902345671')
ON CONFLICT (user_id) DO NOTHING;

-- Teachers
INSERT INTO webapp_users (user_id, password, role, full_name, phone) VALUES
('TCH00001', 'tch123', 'teacher', 'Xalilova Gulnora Akramovna', '+998902345672')
ON CONFLICT (user_id) DO NOTHING;

-- Sinf Rahbars (teachers with class, some also have children)
INSERT INTO webapp_users (user_id, password, role, full_name, phone) VALUES
('STCH00001', 'sinf123', 'teacher', 'Aliyev Akmaljon Sobirovich', '+998901234561'),
('STCH00002', 'sinf123', 'teacher', 'Karimova Nilufar Baxodirovna', '+998901234562'),
('STCH00003', 'sinf123', 'teacher', 'Toshmatov Botirjon Qodirovich', '+998901234563'),
('STCH00004', 'sinf123', 'teacher', 'Rahimova Dilorom Xasanovna', '+998901234564'),
('STCH00005', 'sinf123', 'teacher', 'Nurmatov Jasur Alisherovich', '+998901234565')
ON CONFLICT (user_id) DO NOTHING;

-- Teachers who are also parents (have children)
INSERT INTO webapp_users (user_id, password, role, full_name, phone) VALUES
('PRT00001', 'parent123', 'teacher', 'Abdullayev Rustamjon Xalilovich', '+998911234561'),
('PRT00002', 'parent123', 'teacher', 'Karimova Muhabbat Tolibovna', '+998911234562'),
('PRT00003', 'parent123', 'teacher', 'Xasanov Shuxratjon Azimovich', '+998911234563'),
('PRT00004', 'parent123', 'teacher', 'Ismoilova Zulfiya Baxtiyorovna', '+998911234564'),
('PRT00005', 'parent123', 'teacher', 'Tursunov Olimjon Norqulovich', '+998911234565')
ON CONFLICT (user_id) DO NOTHING;

-- Admin
INSERT INTO webapp_users (user_id, password, role, full_name, phone) VALUES
('ADM00001', 'admin123', 'admin', 'Toshmatov Adminjon Adminovich', '+998998887766')
ON CONFLICT (user_id) DO NOTHING;

-- Children: linking pupils to parents and sinf rahbars
INSERT INTO children (pupil_id, full_name, class_name, school_id, parent_id, sinf_rahbar_id) VALUES
-- STCH00001 -> 9-A -> PRT00001 children (4)
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
