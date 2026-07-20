#!/usr/bin/env node

/**
 * Zunoora — One-command Supabase setup
 *
 *   npm run setup
 *
 * Prompts for your Supabase credentials, creates all required tables,
 * enables RLS, inserts sample data, and seeds 50+ document templates.
 * Optionally automates everything via a Supabase Personal Access Token.
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync, writeFileSync, existsSync, appendFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { createInterface } from 'readline'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const ENV_PATH = resolve(ROOT, '.env')
const ENV_EXAMPLE_PATH = resolve(ROOT, '.env.example')

// ── Helpers ──────────────────────────────────────────────────────────────

function ask(query) {
  const rl = createInterface({ input: process.stdin, output: process.stdout })
  return new Promise(resolve => rl.question(query, answer => { rl.close(); resolve(answer.trim()) }))
}

function print(msg) {
  console.log(`\n  ${msg}`)
}

function header(text) {
  console.log(`\n${'='.repeat(56)}\n  ${text}\n${'='.repeat(56)}`)
}

function success(text) {
  console.log(`  ✓ ${text}`)
}

function warn(text) {
  console.log(`  ⚠ ${text}`)
}

// ── SQL blocks from SETUP.md ─────────────────────────────────────────────

const SQL_CREATE_TABLES = `
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Schools
CREATE TABLE IF NOT EXISTS schools (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Teachers
CREATE TABLE IF NOT EXISTS teachers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  login_id TEXT UNIQUE NOT NULL,
  pin_hash TEXT,
  position TEXT,
  subject TEXT,
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  phone TEXT,
  email TEXT,
  age INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Directors
CREATE TABLE IF NOT EXISTS directors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  login_id TEXT UNIQUE NOT NULL,
  pin_hash TEXT,
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  position TEXT DEFAULT 'Direktor',
  phone TEXT,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Classes
CREATE TABLE IF NOT EXISTS classes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  form_teacher_id UUID REFERENCES teachers(id) ON DELETE SET NULL,
  academic_year TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Shablons (document templates)
CREATE TABLE IF NOT EXISTS shablons (
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

-- User-installed shablons
CREATE TABLE IF NOT EXISTS user_shablons (
  user_id UUID NOT NULL,
  shablon_id UUID REFERENCES shablons(id) ON DELETE CASCADE,
  installed_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, shablon_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_teachers_school ON teachers(school_id);
CREATE INDEX IF NOT EXISTS idx_teachers_login ON teachers(login_id);
CREATE INDEX IF NOT EXISTS idx_directors_school ON directors(school_id);
CREATE INDEX IF NOT EXISTS idx_directors_login ON directors(login_id);
CREATE INDEX IF NOT EXISTS idx_classes_school ON classes(school_id);
CREATE INDEX IF NOT EXISTS idx_shablons_type ON shablons(type);
CREATE INDEX IF NOT EXISTS idx_shablons_published ON shablons(published);
`

const SQL_RLS = `
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE directors ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE shablons ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_shablons ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Allow all on schools" ON schools FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Allow all on teachers" ON teachers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Allow all on directors" ON directors FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Allow all on classes" ON classes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Allow select shablons" ON shablons FOR SELECT USING (published = true OR true);
CREATE POLICY IF NOT EXISTS "Allow insert shablons" ON shablons FOR INSERT WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Allow update shablons" ON shablons FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Allow delete shablons" ON shablons FOR DELETE USING (true);
CREATE POLICY IF NOT EXISTS "Allow all on user_shablons" ON user_shablons FOR ALL USING (true) WITH CHECK (true);
`

const SQL_SAMPLE_DATA = `
INSERT INTO schools (name, address, phone) VALUES
('1-sonli maktab', 'Toshkent, Chilonzor tumani', '+998 71 123 4567')
ON CONFLICT DO NOTHING;

INSERT INTO directors (full_name, login_id, pin_hash, school_id, position) VALUES
('Aliyev Vali Valiyevich', 'DIR001', 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3',
  (SELECT id FROM schools WHERE name = '1-sonli maktab'), 'Direktor')
ON CONFLICT (login_id) DO NOTHING;

INSERT INTO teachers (full_name, login_id, pin_hash, school_id, position, subject) VALUES
('Karimova Olga Ivanovna', 'TCH001', 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3',
  (SELECT id FROM schools WHERE name = '1-sonli maktab'), 'O''qituvchi', 'Matematika')
ON CONFLICT (login_id) DO NOTHING;

INSERT INTO classes (name, school_id, form_teacher_id, academic_year) VALUES
('5-A', (SELECT id FROM schools WHERE name = '1-sonli maktab'),
  (SELECT id FROM teachers WHERE login_id = 'TCH001'), '2024-2025'),
('5-B', (SELECT id FROM schools WHERE name = '1-sonli maktab'), NULL, '2024-2025')
ON CONFLICT DO NOTHING;
`

// ── Management API ────────────────────────────────────────────────────────

async function runSqlViaMgmtApi(token, ref, sql) {
  const url = `https://api.supabase.com/v1/projects/${ref}/database/query`
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: sql }),
  })
  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Management API error (${response.status}): ${text}`)
  }
  return response.json()
}

function extractProjectRef(url) {
  const m = url.match(/https:\/\/([^.]+)\.supabase\.co/)
  return m ? m[1] : null
}

// ── Main ──────────────────────────────────────────────────────────────────

async function main() {
  console.log(`
  ╔══════════════════════════════════════════════════╗
  ║           ZUNOORA — Project Setup               ║
  ║    Uzbekistan teacher document assistant         ║
  ╚══════════════════════════════════════════════════╝
  `)

  // ── Phase 1: Credentials ────────────────────────────────────────────
  header('Step 1: Supabase Credentials')

  let supabaseUrl = process.env.SUPABASE_URL || ''
  let supabaseKey = process.env.SUPABASE_ANON_KEY || ''

  // Read existing .env
  if (existsSync(ENV_PATH)) {
    const existing = readFileSync(ENV_PATH, 'utf-8')
    const urlMatch = existing.match(/^SUPABASE_URL=(.+)$/m)
    const keyMatch = existing.match(/^SUPABASE_ANON_KEY=(.+)$/m)
    if (urlMatch) supabaseUrl = urlMatch[1].trim()
    if (keyMatch) supabaseKey = keyMatch[1].trim()
    if (supabaseUrl && supabaseKey) {
      print(`Found existing .env with SUPABASE_URL`)
      const useExisting = await ask(`  Use these credentials? (Y/n) `)
      if (useExisting.toLowerCase() === 'n') {
        supabaseUrl = ''
        supabaseKey = ''
      }
    }
  }

  if (!supabaseUrl) {
    supabaseUrl = await ask(`  Enter your Supabase Project URL:
    (e.g. https://abc123.supabase.co)
  > `)
  }

  if (!supabaseKey) {
    supabaseKey = await ask(`  Enter your Supabase anon/public key:
    (from Settings → API → Project API keys → anon/public)
  > `)
  }

  // Test connection
  print('Testing connection…')
  const testClient = createClient(supabaseUrl, supabaseKey)
  try {
    const { error } = await testClient.from('schools').select('count', { count: 'exact', head: true })
    if (error && error.code !== '42P01') throw error
    success('Connection OK')
  } catch (err) {
    warn(`Connection failed: ${err.message}`)
    print('Make sure the URL and key are correct, and the project is active.')
    const retry = await ask('  Retry? (Y/n) ')
    if (retry.toLowerCase() !== 'n') return main()
    process.exit(1)
  }

  // ── Phase 2: Database Setup ─────────────────────────────────────────
  header('Step 2: Database Setup')

  const usePat = await ask(`  Automatically create tables, RLS, and seed data?
  This requires a Supabase Personal Access Token (recommended).
  Get one at: https://supabase.com/dashboard/account/tokens
  (y = use PAT for automation, n = I will paste SQL manually)
  > `)

  let ddlDone = false

  if (usePat.toLowerCase() === 'y' || usePat.toLowerCase() === 'yes') {
    const pat = await ask(`  Paste your Supabase Personal Access Token:
  > `)
    const ref = extractProjectRef(supabaseUrl)
    if (!ref) {
      warn('Could not extract project ref from URL. Expected format: https://XXXXX.supabase.co')
      print('Falling back to manual SQL mode…')
    } else {
      try {
        print('Creating tables…')
        await runSqlViaMgmtApi(pat, ref, SQL_CREATE_TABLES)
        success('Tables created')

        print('Setting up Row Level Security…')
        await runSqlViaMgmtApi(pat, ref, SQL_RLS)
        success('RLS enabled + policies created')

        print('Inserting sample data…')
        await runSqlViaMgmtApi(pat, ref, SQL_SAMPLE_DATA)
        success('Sample data inserted (school, director, teacher, classes)')

        ddlDone = true
      } catch (err) {
        warn(`Automated setup failed: ${err.message}`)
        print('Falling back to manual SQL mode…')
      }
    }
  }

  if (!ddlDone) {
    print('')
    print('Open your Supabase SQL Editor and run ALL of the following SQL:')
    console.log(`\n${'─'.repeat(56)}`)
    console.log(SQL_CREATE_TABLES)
    console.log(SQL_RLS)
    console.log(SQL_SAMPLE_DATA)
    console.log(`${'─'.repeat(56)}`)
    await ask('  Press Enter after you have run the SQL above in Supabase SQL Editor…')
  }

  // ── Phase 3: Seed templates ──────────────────────────────────────────
  header('Step 3: Seed Document Templates')

  print('Seeding 50+ document templates into shablons table…')

  try {
    const { execSync } = await import('child_process')
    const seedScript = resolve(__dirname, 'seed-shablons.mjs')
    if (existsSync(seedScript)) {
      execSync(`node "${seedScript}"`, {
        cwd: ROOT,
        stdio: 'inherit',
        env: { ...process.env, SUPABASE_URL: supabaseUrl, SUPABASE_ANON_KEY: supabaseKey },
      })
      success('Templates seeded')
    } else {
      warn('seed-shablons.mjs not found — skipping template seed')
    }
  } catch (err) {
    warn(`Template seeding had errors (check output above): ${err.message}`)
  }

  // ── Phase 4: Write .env ──────────────────────────────────────────────
  header('Step 4: Save Configuration')

  // Build env content
  let envContent = ''
  if (existsSync(ENV_PATH)) {
    envContent = readFileSync(ENV_PATH, 'utf-8')
    // Update existing values
    envContent = envContent.replace(/^SUPABASE_URL=.*$/m, `SUPABASE_URL=${supabaseUrl}`)
    envContent = envContent.replace(/^SUPABASE_ANON_KEY=.*$/m, `SUPABASE_ANON_KEY=${supabaseKey}`)
    // Add if missing
    if (!envContent.includes('SUPABASE_URL=')) envContent += `\nSUPABASE_URL=${supabaseUrl}`
    if (!envContent.includes('SUPABASE_ANON_KEY=')) envContent += `\nSUPABASE_ANON_KEY=${supabaseKey}`
  } else {
    // Read .env.example as base
    if (existsSync(ENV_EXAMPLE_PATH)) {
      envContent = readFileSync(ENV_EXAMPLE_PATH, 'utf-8')
      envContent = envContent.replace(/^SUPABASE_URL=.*$/m, `SUPABASE_URL=${supabaseUrl}`)
      envContent = envContent.replace(/^SUPABASE_ANON_KEY=.*$/m, `SUPABASE_ANON_KEY=${supabaseKey}`)
    } else {
      envContent = `SUPABASE_URL=${supabaseUrl}\nSUPABASE_ANON_KEY=${supabaseKey}\n`
    }
  }

  writeFileSync(ENV_PATH, envContent, 'utf-8')
  success(`.env saved`)

  // ── Done ──────────────────────────────────────────────────────────────
  header('✓ Setup Complete!')

  console.log(`
  ┌──────────────────────────────────────────────────┐
  │  Sample login credentials:                       │
  │                                                  │
  │    Director:  DIR001   PIN: 123456               │
  │    Teacher:   TCH001   PIN: 123456               │
  │                                                  │
  │  Run the app:                                    │
  │                                                  │
  │    npm run dev                                   │
  │                                                  │
  │  First time? Press Ctrl+K to search templates.   │
  └──────────────────────────────────────────────────┘
  `)
}

main().catch(err => {
  console.error('Setup failed:', err)
  process.exit(1)
})
