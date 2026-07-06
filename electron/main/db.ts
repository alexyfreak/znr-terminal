import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_ANON_KEY

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

export interface ShablonField {
  key: string
  label: string
  type: 'text' | 'textarea' | 'date' | 'number' | 'percent' | 'select'
    | 'multi-select' | 'teacher_select' | 'class_select' | 'subject_select'
    | 'director_select' | 'signature'
  required: boolean
  defaultValue?: string
  options?: { value: string; label: string }[]
  placeholder?: string
  validation?: {
    min?: number
    max?: number
    pattern?: string
    message?: string
  }
  autoFill?: string
}

export interface ShablonStep {
  header: string
  fields: string[]
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
  fields?: ShablonField[]
  steps?: ShablonStep[]
  category?: string | null
  author_id?: string | null
  published?: boolean
  version?: number
  created_at?: string
  updated_at?: string
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
