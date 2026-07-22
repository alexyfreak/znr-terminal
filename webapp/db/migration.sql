-- Zunoora WebApp — PostgreSQL Schema (Supabase)
-- Run this in Supabase SQL Editor

-- 1. ENUMS
CREATE TYPE user_role AS ENUM ('parent', 'sinf_rahbar', 'admin');
CREATE TYPE ariza_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE bildirgi_type AS ENUM ('violation', 'praise');

-- 2. USERS
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  telegram_id BIGINT UNIQUE,
  full_name TEXT NOT NULL,
  phone TEXT,
  role user_role NOT NULL DEFAULT 'parent',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_users_telegram_id ON users(telegram_id);
CREATE INDEX idx_users_role ON users(role);

-- 3. CHILDREN
CREATE TABLE children (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  class_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_children_parent ON children(parent_id);

-- 4. ARIZA REQUESTS
CREATE TABLE ariza_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  parent_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES users(id),
  date_from DATE NOT NULL,
  date_to DATE NOT NULL,
  reason_text TEXT NOT NULL,
  doctor_paper_url TEXT,
  status ariza_status NOT NULL DEFAULT 'pending',
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_ariza_parent ON ariza_requests(parent_id);
CREATE INDEX idx_ariza_child ON ariza_requests(child_id);
CREATE INDEX idx_ariza_teacher ON ariza_requests(teacher_id);
CREATE INDEX idx_ariza_status ON ariza_requests(status);

-- 5. BILDIRGI RECORDS
CREATE TABLE bildirgi_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type bildirgi_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_bildirgi_student ON bildirgi_records(student_id);
CREATE INDEX idx_bildirgi_teacher ON bildirgi_records(teacher_id);

-- 6. CHAT MESSAGES
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  text TEXT,
  attachment_url TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_chat_sender ON chat_messages(sender_id);
CREATE INDEX idx_chat_receiver ON chat_messages(receiver_id);
CREATE INDEX idx_chat_unread ON chat_messages(receiver_id, is_read) WHERE NOT is_read;

-- 7. ROW LEVEL SECURITY
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE children ENABLE ROW LEVEL SECURITY;
ALTER TABLE ariza_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE bildirgi_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Users: read own, admins read all
CREATE POLICY users_self ON users
  FOR ALL USING (id = auth.uid()::uuid);

-- Children: parent reads own; teachers read all
CREATE POLICY children_parent ON children
  FOR SELECT USING (parent_id = auth.uid()::uuid);
CREATE POLICY children_teacher ON children
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid()::uuid AND role IN ('sinf_rahbar', 'admin'))
  );

-- Ariza: parent CRUD own; teacher reads/moderates all pending
CREATE POLICY ariza_parent ON ariza_requests
  FOR ALL USING (parent_id = auth.uid()::uuid);
CREATE POLICY ariza_teacher_read ON ariza_requests
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid()::uuid AND role IN ('sinf_rahbar', 'admin'))
  );
CREATE POLICY ariza_teacher_update ON ariza_requests
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid()::uuid AND role IN ('sinf_rahbar', 'admin'))
  );

-- Bildirgi: teachers insert; parents read own children
CREATE POLICY bildirgi_teacher_insert ON bildirgi_records
  FOR INSERT WITH CHECK (teacher_id = auth.uid()::uuid);
CREATE POLICY bildirgi_parent_read ON bildirgi_records
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = student_id AND children.parent_id = auth.uid()::uuid
    )
  );

-- Chat: participants only
CREATE POLICY chat_participants ON chat_messages
  FOR ALL USING (
    sender_id = auth.uid()::uuid OR receiver_id = auth.uid()::uuid
  );

-- 8. SEED DATA (demo)
INSERT INTO users (telegram_id, full_name, phone, role) VALUES
  (1000001, 'Aliya Karimova', '+998901234567', 'parent'),
  (1000002, 'Botir Rahimov', '+998901234568', 'parent'),
  (2000001, 'Dilorom Salimova', '+998901234569', 'sinf_rahbar');

INSERT INTO children (parent_id, full_name, class_name)
SELECT id, 'Kamron Karimov', '5-А'
FROM users WHERE full_name = 'Aliya Karimova';

INSERT INTO children (parent_id, full_name, class_name)
SELECT id, 'Lola Karimova', '3-Б'
FROM users WHERE full_name = 'Aliya Karimova';
