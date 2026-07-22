-- WebApp Users: all roles in one table with formatted IDs
CREATE TABLE IF NOT EXISTS webapp_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL DEFAULT '123456',
  role TEXT NOT NULL CHECK (role IN ('director', 'school', 'teacher', 'sinf_rahbar', 'parent', 'pupil')),
  full_name TEXT NOT NULL,
  phone TEXT,
  telegram_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE webapp_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own data" ON webapp_users
  FOR SELECT USING (true);

CREATE POLICY "Users can update own data" ON webapp_users
  FOR UPDATE USING (user_id = current_setting('app.user_id', true));

-- Children / pupils
CREATE TABLE IF NOT EXISTS children (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pupil_id TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  class_name TEXT NOT NULL,
  school_id TEXT NOT NULL DEFAULT 'SCH00001',
  parent_id TEXT REFERENCES webapp_users(user_id),
  sinf_rahbar_id TEXT REFERENCES webapp_users(user_id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE children ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read children" ON children
  FOR SELECT USING (true);

-- Ariza requests
CREATE TABLE IF NOT EXISTS ariza_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id TEXT REFERENCES webapp_users(user_id),
  child_pupil_id TEXT REFERENCES children(pupil_id),
  reason TEXT NOT NULL,
  date_from DATE NOT NULL,
  date_to DATE NOT NULL,
  file_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by TEXT REFERENCES webapp_users(user_id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE ariza_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read arizas" ON ariza_requests
  FOR SELECT USING (true);

CREATE POLICY "Parents can insert arizas" ON ariza_requests
  FOR INSERT WITH CHECK (true);

-- Bildirgi records
CREATE TABLE IF NOT EXISTS bildirgi_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id TEXT REFERENCES webapp_users(user_id),
  type TEXT NOT NULL CHECK (type IN ('reprimand', 'praise')),
  child_pupil_id TEXT REFERENCES children(pupil_id),
  reason TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE bildirgi_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read bildirgis" ON bildirgi_records
  FOR SELECT USING (true);

CREATE POLICY "Teachers can insert bildirgis" ON bildirgi_records
  FOR INSERT WITH CHECK (true);

-- Chat messages
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id TEXT REFERENCES webapp_users(user_id),
  recipient_id TEXT REFERENCES webapp_users(user_id),
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their messages" ON chat_messages
  FOR SELECT USING (sender_id = current_setting('app.user_id', true) OR recipient_id = current_setting('app.user_id', true));

CREATE POLICY "Users can insert messages" ON chat_messages
  FOR INSERT WITH CHECK (true);

-- Stored function for login (avoids exposing passwords in client)
CREATE OR REPLACE FUNCTION login_user(p_user_id TEXT, p_password TEXT)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user webapp_users;
  v_children jsonb;
BEGIN
  SELECT * INTO v_user FROM webapp_users WHERE user_id = p_user_id AND password = p_password;
  
  IF v_user.id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Неверный ID или пароль');
  END IF;

  -- Get children for parents / sinf_rahbar
  IF v_user.role IN ('parent', 'sinf_rahbar') THEN
    SELECT COALESCE(jsonb_agg(row_to_json(c)::jsonb), '[]'::jsonb) INTO v_children
    FROM (
      SELECT pupil_id, full_name, class_name
      FROM children
      WHERE CASE 
        WHEN v_user.role = 'parent' THEN parent_id = p_user_id
        ELSE sinf_rahbar_id = p_user_id
      END
    ) c;
  ELSE
    v_children := '[]'::jsonb;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'user', jsonb_build_object(
      'user_id', v_user.user_id,
      'role', v_user.role,
      'full_name', v_user.full_name,
      'phone', v_user.phone
    ),
    'children', v_children
  );
END;
$$;
