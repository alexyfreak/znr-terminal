import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { existsSync } from 'fs'
import { resolve } from 'path'

const envPath = resolve(__dirname, '..', '..', '.env')
if (existsSync(envPath)) {
  dotenv.config({ path: envPath })
}

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('SUPABASE_URL and SUPABASE_ANON_KEY must be set in .env')
}

export const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null

export interface School {
  id: string
  name: string
  address: string | null
  phone: string | null
}

export interface Teacher {
  id: string
  full_name: string
  login_id: string
  pin_hash: string | null
  position: string | null
  subject: string | null
  school_id: string | null
  phone: string | null
  school_data?: School
}

export interface Director {
  id: string
  full_name: string
  login_id: string
  pin_hash: string | null
  school_id: string | null
  position: string | null
  school_data?: School
}

export interface Shablon {
  id: string
  type: string
  label: string
  description: string | null
  keywords: string[]
  teacher_visible: boolean
  schema: { required: string[]; optional: string[] }
  template: string
}

export interface Class {
  id: string
  name: string
  school_id: string | null
  form_teacher_id: string | null
  academic_year: string | null
}

export interface UserContext {
  user: Teacher | Director
  school: School
  director: Director | null
  teachers?: Teacher[]
  classes: Class[]
  role: 'teacher' | 'director'
}
