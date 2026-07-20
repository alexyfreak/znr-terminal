# Setup Guide for Zunoora Desktop

This guide will help you set up Zunoora Desktop from scratch.

## Prerequisites

- Node.js 18 or higher
- A Supabase account
- Git (for cloning)

## Quick Start (Recommended)

```bash
git clone https://github.com/alexyfreak/zunoora.git
cd zunoora
npm install
npm run setup
npm run dev
```

The `setup` script handles everything: creates tables, seeds data, and configures `.env`.

---

## Manual Setup (Alternative to `npm run setup`)

### Step 1: Clone and Install

```bash
git clone https://github.com/alexyfreak/zunoora.git
cd zunoora
npm install
```

### Step 2: Set Up Supabase

### 2.1 Create a Supabase Project

1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Fill in project details
4. Wait for the project to be ready

### 2.2 Get Your API Credentials

1. In your Supabase project, go to **Settings** → **API**
2. Copy the following:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **Anon/Public Key** (long string starting with `eyJ...`)

### 2.3 Create Environment File

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and paste your credentials:
   ```env
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

⚠️ **Important**: Never commit the `.env` file to git!

## Step 3: Set Up Database Tables

Run these SQL commands in your Supabase SQL Editor:

### 3.1 Create Tables

```sql
-- Schools table
CREATE TABLE schools (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Teachers table
CREATE TABLE teachers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  login_id TEXT UNIQUE NOT NULL,
  pin_hash TEXT,
  position TEXT,
  subject TEXT,
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Directors table
CREATE TABLE directors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  login_id TEXT UNIQUE NOT NULL,
  pin_hash TEXT,
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  position TEXT DEFAULT 'Direktor',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Classes table
CREATE TABLE classes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  form_teacher_id UUID REFERENCES teachers(id) ON DELETE SET NULL,
  academic_year TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Shablons (Document Templates) table
CREATE TABLE shablons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL,
  label TEXT NOT NULL,
  description TEXT,
  keywords TEXT[] DEFAULT '{}',
  teacher_visible BOOLEAN DEFAULT true,
  schema JSONB NOT NULL DEFAULT '{"required":[],"optional":[]}'::jsonb,
  template TEXT NOT NULL,
  fields JSONB DEFAULT '[]'::jsonb,
  steps JSONB DEFAULT '[]'::jsonb,
  category TEXT,
  author_id UUID,
  published BOOLEAN DEFAULT false,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User-installed shablons table
CREATE TABLE user_shablons (
  user_id UUID NOT NULL,
  shablon_id UUID REFERENCES shablons(id) ON DELETE CASCADE,
  installed_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, shablon_id)
);

-- Create indexes for better performance
CREATE INDEX idx_teachers_school ON teachers(school_id);
CREATE INDEX idx_teachers_login ON teachers(login_id);
CREATE INDEX idx_directors_school ON directors(school_id);
CREATE INDEX idx_directors_login ON directors(login_id);
CREATE INDEX idx_classes_school ON classes(school_id);
CREATE INDEX idx_shablons_type ON shablons(type);
CREATE INDEX idx_shablons_published ON shablons(published);
```

### 3.2 Set Up Row Level Security (RLS)

```sql
-- Enable RLS on all tables
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE directors ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE shablons ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_shablons ENABLE ROW LEVEL SECURITY;

-- Schools: Allow all operations (adjust based on your needs)
CREATE POLICY "Allow all operations on schools"
  ON schools FOR ALL
  USING (true)
  WITH CHECK (true);

-- Teachers: Allow all operations
CREATE POLICY "Allow all operations on teachers"
  ON teachers FOR ALL
  USING (true)
  WITH CHECK (true);

-- Directors: Allow all operations
CREATE POLICY "Allow all operations on directors"
  ON directors FOR ALL
  USING (true)
  WITH CHECK (true);

-- Classes: Allow all operations
CREATE POLICY "Allow all operations on classes"
  ON classes FOR ALL
  USING (true)
  WITH CHECK (true);

-- Shablons: Allow reading published templates and all operations for creators
CREATE POLICY "Allow reading published shablons"
  ON shablons FOR SELECT
  USING (published = true OR true);

CREATE POLICY "Allow inserting shablons"
  ON shablons FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow updating own shablons"
  ON shablons FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow deleting own shablons"
  ON shablons FOR DELETE
  USING (true);

-- User shablons: Allow all operations
CREATE POLICY "Allow all operations on user_shablons"
  ON user_shablons FOR ALL
  USING (true)
  WITH CHECK (true);
```

### 3.3 Insert Sample Data (Optional)

```sql
-- Insert a sample school
INSERT INTO schools (name, address, phone) VALUES
('1-sonli maktab', 'Toshkent, Chilonzor tumani', '+998 71 123 4567');

-- Insert a sample director
INSERT INTO directors (full_name, login_id, pin_hash, school_id, position) VALUES
('Aliyev Vali Valiyevich', 'DIR001', 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3', (SELECT id FROM schools WHERE name = '1-sonli maktab'), 'Direktor');

-- Insert a sample teacher
INSERT INTO teachers (full_name, login_id, pin_hash, school_id, position, subject) VALUES
('Karimova Olga Ivanovna', 'TCH001', 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3', (SELECT id FROM schools WHERE name = '1-sonli maktab'), 'O''qituvchi', 'Matematika');

-- Insert sample classes
INSERT INTO classes (name, school_id, form_teacher_id, academic_year) VALUES
('5-A', (SELECT id FROM schools WHERE name = '1-sonli maktab'), (SELECT id FROM teachers WHERE login_id = 'TCH001'), '2024-2025'),
('5-B', (SELECT id FROM schools WHERE name = '1-sonli maktab'), NULL, '2024-2025');

-- Note: Default PIN for sample users is '123456' (hashed)
```

### 3.4 Insert Sample Template

```sql
INSERT INTO shablons (type, label, description, schema, template, fields, published) VALUES
('ariza', 
'Ariza (formal murojaat)', 
'Rasmiy ariza yozish uchun shablon', 
'{
  "required": ["recipient_name", "sender_name", "reason", "date"],
  "optional": ["reference_number"]
}'::jsonb,
'{{recipient_name}} ga

{{sender_name}}dan

ARIZA

{{reason}}

Sana: {{date}}
Imzo: _____________
{{sender_name}}',
'[
  {"key": "recipient_name", "label": "Qabul qiluvchi F.I.O", "type": "text", "required": true},
  {"key": "sender_name", "label": "Yuboruvchi F.I.O", "type": "text", "required": true},
  {"key": "reason", "label": "Sabab / ariza matni", "type": "textarea", "required": true},
  {"key": "date", "label": "Sana", "type": "date", "required": true},
  {"key": "reference_number", "label": "Hujjat raqami", "type": "text", "required": false}
]'::jsonb,
true);
```

## Step 4: Run the Application

### Development Mode

```bash
npm run dev
```

This will start the application in development mode with hot reload.

### Production Build

```bash
npm run build
npm run preview
```

### Create Installer

```bash
# For Windows
npm run package:win
```

The installer will be created in the `release/` directory.

## Step 5: Login

Use the sample credentials:
- **Director Login**: `DIR001`, PIN: `123456`
- **Teacher Login**: `TCH001`, PIN: `123456`

Or create your own users in the Supabase database.

## Troubleshooting

### Issue: "Cannot connect to Supabase"

**Solution**: 
- Check your `.env` file has correct credentials
- Verify your Supabase project is active
- Check your internet connection

### Issue: "No templates showing"

**Solution**:
- Verify you've inserted sample templates (Step 3.4)
- Check RLS policies are set up correctly
- Try logging in as a different user

### Issue: "Authentication failed"

**Solution**:
- Verify the user exists in the database
- Check the PIN is correct (default: `123456`)
- PINs are hashed with SHA-256

## Security Notes

1. **Never commit `.env` to version control** - It's already in `.gitignore`
2. **Change default PINs** - The sample PIN `123456` is for testing only
3. **Review RLS policies** - The sample policies allow all operations. Adjust based on your security requirements.
4. **Use HTTPS** - Supabase provides HTTPS by default
5. **Rotate API keys** - If compromised, rotate them in Supabase dashboard

## Getting Help

- **Documentation**: See [README.md](./README.md)
- **Issues**: https://github.com/alexyfreak/znr-terminal/issues
- **Email**: info@zunoora.uz

---

**Made with ❤️ for teachers in Uzbekistan**
