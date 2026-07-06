import { createHash } from 'crypto'
import { supabase, type UserContext, type Teacher, type Director, type School, type Class } from './db'

function hashPin(pin: string): string {
  return createHash('sha256').update(pin).digest('hex')
}

export async function verifyCredentials(loginId: string, pinHash: string): Promise<UserContext | null> {
  if (!supabase) return null

  const { data: teacher } = await supabase
    .from('teachers')
    .select('*, school_data:schools(*)')
    .eq('login_id', loginId)
    .eq('pin_hash', pinHash)
    .maybeSingle()

  if (teacher) {
    if (!teacher.school_data) return null

    const { data: director } = await supabase
      .from('directors')
      .select('*')
      .eq('school_id', teacher.school_id)
      .maybeSingle()

    const { data: classes } = await supabase
      .from('classes')
      .select('*')
      .eq('form_teacher_id', teacher.id)

    return {
      user: teacher as unknown as Teacher,
      school: teacher.school_data as unknown as School,
      director: (director as unknown as Director) || null,
      classes: (classes as unknown as Class[]) || [],
      role: 'teacher',
    }
  }

  const { data: director } = await supabase
    .from('directors')
    .select('*, school_data:schools(*)')
    .eq('login_id', loginId)
    .eq('pin_hash', pinHash)
    .maybeSingle()

  if (director) {
    if (!director.school_data) return null

    const { data: classes } = await supabase
      .from('classes')
      .select('*')
      .eq('school_id', director.school_id)

    return {
      user: director as unknown as Director,
      school: director.school_data as unknown as School,
      director: null,
      classes: (classes as unknown as Class[]) || [],
      role: 'director',
    }
  }

  return null
}
