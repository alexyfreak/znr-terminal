-- Migration 002: Add pupils table and extended school fields
-- Run this in your Supabase SQL editor (https://supabase.com/dashboard/project/YOUR_PROJECT/sql/new)

-- 1. Add extended fields to schools table
ALTER TABLE schools
  ADD COLUMN IF NOT EXISTS code TEXT,
  ADD COLUMN IF NOT EXISTS viloyat TEXT,
  ADD COLUMN IF NOT EXISTS tuman TEXT,
  ADD COLUMN IF NOT EXISTS shahar TEXT;

-- 2. Create pupils table
CREATE TABLE IF NOT EXISTS pupils (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pupil_id TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  parent_phone TEXT,
  telegram_username TEXT,
  class_id UUID REFERENCES classes(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable RLS on pupils
ALTER TABLE pupils ENABLE ROW LEVEL SECURITY;

-- 4. Create a default RLS policy (admin access)
CREATE POLICY "Admin full access to pupils"
  ON pupils
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- 5. Update the RLS for schools to allow admin read/write
DROP POLICY IF EXISTS "Admin full access to schools" ON schools;
CREATE POLICY "Admin full access to schools"
  ON schools
  FOR ALL
  USING (true)
  WITH CHECK (true);
