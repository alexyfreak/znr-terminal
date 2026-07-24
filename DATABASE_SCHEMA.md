# Database Schema Reference

## Supabase Configuration
- **Project**: ixwujmimgafnckqlezud
- **Type**: PostgreSQL with Row Level Security (RLS)
- **MCP**: Enabled in opencode.json
- **URL**: https://mcp.supabase.com/mcp?project_ref=ixwujmimgafnckqlezud

## Core Tables

### `shablons` - Document Templates
```sql
CREATE TABLE shablons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  preview_image TEXT,
  category TEXT,
  fields JSONB NOT NULL,           -- Dynamic form fields
  docx_template TEXT,             -- DOCX file path
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_public BOOLEAN DEFAULT FALSE,
  price DECIMAL(10,2) DEFAULT 0.00
);

-- Fields JSONB structure:
{
  "steps": [{"id": "step1", "name": "Step 1", "description": ""}],
  "fields": [{
    "id": "student_name",
    "label": "Student Name",
    "type": "text|number|select|date",
    "required": true,
    "options": ["opt1", "opt2"],
    "validation": "pattern"
  }],
  "outputs": [{"type": "docx", "docx_template": "template.docx"}]
}
```

### `user_shablons` - User Template Ownership
```sql
CREATE TABLE user_shablons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,          -- TCH00001 format
  shablon_id UUID REFERENCES shablons(id),
  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_purchased BOOLEAN DEFAULT FALSE
);
```

### `schools` - Schools Directory
```sql
CREATE TABLE schools (
  school_id TEXT PRIMARY KEY,     -- SCH00001 format
  name TEXT NOT NULL,
  address TEXT,
  director_name TEXT,
  contact_info TEXT,
  region TEXT,
  district TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### `teachers` - Teacher Accounts (Desktop)
```sql
CREATE TABLE teachers (
  teacher_id TEXT PRIMARY KEY,    -- TCH00001 format
  password_hash TEXT NOT NULL,  -- scrypt hashed
  full_name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT,
  school_id TEXT REFERENCES schools(school_id),
  role TEXT DEFAULT 'teacher',    -- teacher, director
  credits INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE
);
```

### `doctors` - Director Accounts
```sql
CREATE TABLE doctors (
  doctor_id TEXT PRIMARY KEY,     -- DRK00001 format
  password_hash TEXT NOT NULL,    -- scrypt hashed
  full_name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT,
  school_id TEXT REFERENCES schools(school_id),
  role TEXT DEFAULT 'director',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE
);
```

### `classes` - Class Assignments
```sql
CREATE TABLE classes (
  class_id TEXT PRIMARY KEY,      -- CLS00001 format
  class_name TEXT NOT NULL,       -- "9-A"
  teacher_id TEXT REFERENCES teachers(teacher_id),
  school_id TEXT REFERENCES schools(school_id),
  room_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### `payments` - Transaction Records
```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,          -- TCH00001 or DRK00001
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'UZS',
  gateway TEXT NOT NULL,          -- 'payme' or 'click'
  transaction_id TEXT,           -- Gateway transaction ID
  status TEXT DEFAULT 'pending',  -- pending, completed, failed
  credits_added INTEGER,         -- Credits purchased
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## WebApp Tables

### `webapp_users` - Unified User Authentication
```sql
CREATE TABLE webapp_users (
  user_id TEXT PRIMARY KEY,      -- PRT00001, STCH00001, TCH00001, DRK00001, SCH00001
  password_hash TEXT NOT NULL,   -- raw MD5 for compatibility
  full_name TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL,            -- parent, sinf_rahbar, teacher, director, school, pupil
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Test credentials:
-- PRT00001 / parent123 (parent)
-- STCH00001 / sinf123 (sinf rahbar)
-- TCH00001 / tch123 (teacher)
-- DRK00001 / dir123 (director)
-- SCH00001 / school123 (school)
```

### `children` - Student Records
```sql
CREATE TABLE children (
  pupil_id TEXT PRIMARY KEY,     -- PPL000001 format
  full_name TEXT NOT NULL,
  class_name TEXT,               -- "9-A"
  parent_id TEXT REFERENCES webapp_users(user_id),
  sinf_rahbar_id TEXT REFERENCES webapp_users(user_id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### `ariza_requests` - Leave Requests
```sql
CREATE TABLE ariza_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pupil_id TEXT REFERENCES children(pupil_id),
  request_type TEXT NOT NULL,   -- 'leave', 'sick'
  reason TEXT,
  start_date DATE,
  end_date DATE,
  status TEXT DEFAULT 'pending', -- pending, approved, rejected
  approved_by TEXT REFERENCES webapp_users(user_id),
  attachments TEXT[],           -- File paths from Supabase Storage
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### `bildirgi_records` - Discipline Records
```sql
CREATE TABLE bildirgi_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pupil_id TEXT REFERENCES children(pupil_id),
  record_type TEXT NOT NULL,   -- 'praise', 'reprimand'
  description TEXT,
  evidence_photos TEXT[],       -- Supabase Storage paths
  recorded_by TEXT REFERENCES webapp_users(user_id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### `chat_messages` - Real-time Messages
```sql
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id TEXT NOT NULL,         -- e.g., "PRT00001-PPL000001"
  sender_id TEXT REFERENCES webapp_users(user_id),
  message TEXT NOT NULL,
  message_type TEXT DEFAULT 'text', -- text, image, file
  attachment_url TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Row Level Security (RLS)

### Enable RLS on all tables
```sql
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE shablons ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_shablons ENABLE ROW LEVEL SECURITY;
ALTER TABLE ariza_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE bildirgi_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
```

### Example RLS Policy
```sql
-- Teachers can only see their own records
CREATE POLICY "Teachers can view own records" ON teachers
  FOR SELECT USING (
    auth.uid() = teacher_id
  );

-- Users can only see their own purchased templates
CREATE POLICY "View purchased templates" ON user_shablons
  FOR SELECT USING (
    auth.uid() = user_id
  );
```

## Indexes

### Performance Optimization
```sql
-- Teacher lookup by email
CREATE INDEX idx_teachers_email ON teachers(email);

-- Template lookup
CREATE INDEX idx_shablons_category ON shablons(category);
CREATE INDEX idx_shablons_public ON shablons(is_public) WHERE is_public = true;

-- Payment lookups
CREATE INDEX idx_payments_user ON payments(user_id);
CREATE INDEX idx_payments_transaction ON payments(transaction_id);

-- WebApp lookups
CREATE INDEX idx_webapp_users_role ON webapp_users(role);
CREATE INDEX idx_ariza_pupil ON ariza_requests(pupil_id);
CREATE INDEX idx_ariza_status ON ariza_requests(status);
CREATE INDEX idx_bildirgi_pupil ON bildirgi_records(pupil_id);
CREATE INDEX idx_chat_room ON chat_messages(room_id);
```

## Supabase MCP

### Enabled in opencode.json
```json
{
  "mcp": {
    "supabase": {
      "type": "remote",
      "url": "https://mcp.supabase.com/mcp?project_ref=ixwujmimgafnckqlezud",
      "enabled": true
    }
  }
}
```

### Available Queries via MCP
- List all tables
- Query specific table
- Filter by role/user
- Real-time subscriptions
- Storage operations

## Data Relationships

```
### Desktop App
schools → teachers/doctors → user_shablons → shablons
       ↘
        → classes → [referenced in templates]

### WebApp
webapp_users (roles) → children ← ariza_requests, bildirgi_records
                       ↖
                        → chat_messages (via sender_id)
```

## ID Prefixes
- **PRT** = Parent
- **STCH** = Sinf Rahbar (Class Teacher)
- **TCH** = Teacher
- **DRK** = Director
- **SCH** = School
- **PPL** = Pupil/Student
- **CLS** = Class

## Sample Queries

### Get teacher's templates
```sql
SELECT s.* FROM shablons s
JOIN user_shablons us ON s.id = us.shablon_id
WHERE us.user_id = 'TCH00001' AND us.is_purchased = true;
```

### Get student's records
```sql
SELECT * FROM bildirgi_records
WHERE pupil_id = 'PPL000001'
ORDER BY created_at DESC;
```

### Get class statistics
```sql
SELECT class_name, COUNT(*) as student_count
FROM children
WHERE class_name = '9-A'
GROUP BY class_name;
```

## Migration Scripts
**Location:** `/home/alexy/zunosh/supabase/`