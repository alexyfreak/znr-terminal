import { supabase, type Shablon, type UserContext } from './db.js';
import { writeFileSync, existsSync, mkdirSync, readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BLANKS_DIR = resolve(__dirname, '..', 'Blanks');
const CACHE_PATH = resolve(BLANKS_DIR, 'shablons.json');

export async function loadShablons(): Promise<Shablon[]> {
  let { data: shablons, error } = await supabase
    .from('shablons')
    .select('*')
    .order('label');

  if (!error && shablons) {
    try {
      if (!existsSync(BLANKS_DIR)) {
        mkdirSync(BLANKS_DIR, { recursive: true });
      }
      writeFileSync(CACHE_PATH, JSON.stringify(shablons, null, 2), 'utf-8');
    } catch {
      // cache write failure is non-fatal
    }
    return shablons as unknown as Shablon[];
  }

  if (existsSync(CACHE_PATH)) {
    try {
      const cached = JSON.parse(readFileSync(CACHE_PATH, 'utf-8'));
      return cached as Shablon[];
    } catch {
      // corrupted cache
    }
  }

  console.error('Shablonlarni yuklab bo\'lmadi. Internet aloqangizni tekshiring.');
  process.exit(1);
}

export function filterShablonsByRole(shablons: Shablon[], role: 'teacher' | 'director'): Shablon[] {
  if (role === 'director') return shablons;
  return shablons.filter(s => s.teacher_visible);
}
