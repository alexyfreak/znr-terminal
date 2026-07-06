import { supabase, type Shablon } from './db'

export async function loadShablons(): Promise<Shablon[]> {
  if (!supabase) return []

  const { data: shablons, error } = await supabase
    .from('shablons')
    .select('*')
    .order('label')

  if (!error && shablons) {
    return shablons as unknown as Shablon[]
  }

  return []
}

export function filterShablonsByRole(shablons: Shablon[], role: 'teacher' | 'director'): Shablon[] {
  if (role === 'director') return shablons
  return shablons.filter(s => s.teacher_visible)
}
