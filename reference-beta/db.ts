import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, '..', '.env');

if (existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (process.env.SUPABASE_SERVICE_KEY && !process.env.SUPABASE_ANON_KEY) {
  console.error(
    'Faqat SUPABASE_SERVICE_KEY topildi. Ushbu vosita individual o\'qituvchilar/direktorlar ' +
    'uchun tarqatiladi va hech qachon service-role kaliti bilan ishlamasligi kerak, chunki u ' +
    'Row Level Security-ni chetlab o\'tadi va har bir foydalanuvchiga to\'liq ma\'lumotlar ' +
    'bazasiga kirish imkonini beradi. .env faylida SUPABASE_ANON_KEY ni sozlang.'
  );
  process.exit(1);
}

if (!supabaseUrl || !supabaseKey) {
  console.error('SUPABASE_URL va SUPABASE_ANON_KEY .env faylida bo\'lishi shart');
  process.exit(1);
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export interface School {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  director_id: string | null;
}

export interface Teacher {
  id: string;
  full_name: string;
  login_id: string;
  pin_hash: string | null;
  position: string | null;
  subject: string | null;
  school_id: string | null;
  phone: string | null;
  email: string | null;
  school_data?: School;
}

export interface Director {
  id: string;
  full_name: string;
  login_id: string;
  pin_hash: string | null;
  school_id: string | null;
  phone: string | null;
  email: string | null;
  position: string | null;
  school_data?: School;
}

export interface Shablon {
  id: string;
  type: string;
  label: string;
  description: string | null;
  keywords: string[];
  teacher_visible: boolean;
  schema: {
    required: string[];
    optional: string[];
  };
  template: string;
}

export interface Class {
  id: string;
  name: string;
  school_id: string | null;
  form_teacher_id: string | null;
  academic_year: string | null;
}

export interface UserContext {
  user: Teacher | Director;
  school: School;
  director: Director | null;
  teachers?: Teacher[];
  classes: Class[];
  role: 'teacher' | 'director';
}
