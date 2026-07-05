ALTER TABLE shablons ADD COLUMN IF NOT EXISTS teacher_visible boolean DEFAULT false;
UPDATE shablons SET teacher_visible = true WHERE type IN (
  'ariza', 'bsb_chb', 'ish_tabeli', 'ktp', 'oum', 'sillabus',
  'hisobot_choraklik', 'tushuntirish_xati', 'dars_jadvali',
  'ota_ona_majlis_bayoni', 'tavsifnoma', 'dars_ozini_toldirish'
);
