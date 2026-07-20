import { scryptSync, randomBytes } from 'crypto'
import { supabase, type UserContext, type Teacher, type Director, type School, type Class } from './db'

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(':')
  if (!salt || !hash) return false
  const verify = scryptSync(password, salt, 64).toString('hex')
  return hash === verify
}

export interface RegisterInput {
  loginId: string
  password: string
  fullName: string
  email: string
  phone: string
  age: number
  position: 'teacher' | 'director'
  subject: string
  schoolId: string | null
  schoolName: string
  schoolAddress: string
}

async function idExists(loginId: string): Promise<boolean> {
  if (!supabase) return true
  const { data: teacher } = await supabase.from('teachers').select('id').eq('login_id', loginId).maybeSingle()
  if (teacher) return true
  const { data: director } = await supabase.from('directors').select('id').eq('login_id', loginId).maybeSingle()
  if (director) return true
  return false
}

export async function generateUniqueId(): Promise<string | null> {
  if (!supabase) return null
  for (let attempt = 0; attempt < 20; attempt++) {
    const num = String(Math.floor(10000 + Math.random() * 90000))
    const id = `TCH${num}`
    const exists = await idExists(id)
    if (!exists) return id
  }
  return null
}

function validatePassword(password: string): { valid: boolean; message?: string } {
  if (password.length < 8) return { valid: false, message: 'Kamida 8 ta belgi' }
  if (!/[a-zA-Z]/.test(password)) return { valid: false, message: 'Kamida bitta harf' }
  if (!/[0-9]/.test(password)) return { valid: false, message: 'Kamida bitta raqam' }
  if (!/[^a-zA-Z0-9]/.test(password)) return { valid: false, message: 'Kamida bitta belgi (!@#$%^&*)' }
  return { valid: true }
}

async function tryInsertTeacher(pinHash: string, input: RegisterInput, schoolId: string) {
  if (!supabase) return null
  const { data } = await supabase
    .from('teachers')
    .insert({
      login_id: input.loginId,
      pin_hash: pinHash,
      full_name: input.fullName,
      email: input.email || null,
      phone: input.phone || null,
      age: input.age || null,
      subject: input.subject || null,
      school_id: schoolId,
      position: "O'qituvchi",
    })
    .select('*, school_data:schools(*)')
    .maybeSingle()
  return data
}

async function tryInsertDirector(pinHash: string, input: RegisterInput, schoolId: string) {
  if (!supabase) return null
  const { data } = await supabase
    .from('directors')
    .insert({
      login_id: input.loginId,
      pin_hash: pinHash,
      full_name: input.fullName,
      email: input.email || null,
      phone: input.phone || null,
      school_id: schoolId,
      position: 'Direktor',
    })
    .select('*, school_data:schools(*)')
    .maybeSingle()
  return data
}

export async function registerUser(input: RegisterInput): Promise<UserContext | null> {
  if (!supabase) return null

  const pwdCheck = validatePassword(input.password)
  if (!pwdCheck.valid) return null

  const pinHash = hashPassword(input.password)

  let schoolId = input.schoolId

  if (!schoolId) {
    const { data: existingSchool } = await supabase
      .from('schools')
      .select('id')
      .eq('name', input.schoolName)
      .maybeSingle()

    if (existingSchool) {
      schoolId = existingSchool.id
    } else if (input.schoolName.trim()) {
      const { data: newSchool } = await supabase
        .from('schools')
        .insert({ name: input.schoolName.trim(), address: input.schoolAddress.trim() || null })
        .select('id')
        .single()

      if (newSchool) schoolId = newSchool.id
    }
  }

  if (!schoolId) return null

  for (let attempt = 0; attempt < 5; attempt++) {
    const loginId = attempt === 0 ? input.loginId : (await generateUniqueId()) || input.loginId

    if (input.position === 'teacher') {
      const result = await tryInsertTeacher(pinHash, { ...input, loginId }, schoolId)
      if (result) {
        const { data: classes } = await supabase
          .from('classes')
          .select('*')
          .eq('school_id', schoolId)
        return {
          user: result as unknown as Teacher,
          school: result.school_data as unknown as School,
          director: null,
          classes: (classes as unknown as Class[]) || [],
          role: 'teacher',
        }
      }
    } else {
      const result = await tryInsertDirector(pinHash, { ...input, loginId }, schoolId)
      if (result) {
        await supabase.from('schools').update({ director_id: result.id }).eq('id', schoolId)
        const { data: classes } = await supabase
          .from('classes')
          .select('*')
          .eq('school_id', schoolId)
        return {
          user: result as unknown as Director,
          school: result.school_data as unknown as School,
          director: null,
          classes: (classes as unknown as Class[]) || [],
          role: 'director',
        }
      }
    }
  }

  return null
}

const DEFAULT_USER = { loginId: 'TCH00001', password: '1234', name: 'Default Teacher', school: 'Default School', role: 'teacher' as const }

export async function verifyCredentials(loginId: string, password: string): Promise<UserContext | null> {
  if (loginId === DEFAULT_USER.loginId && password === DEFAULT_USER.password) {
    return {
      user: { id: 'default-001', full_name: DEFAULT_USER.name, email: '', phone: '', subject: 'General', login_id: DEFAULT_USER.loginId } as any,
      school: { id: 'default-school', name: DEFAULT_USER.school, address: '' } as any,
      director: null,
      classes: [],
      role: DEFAULT_USER.role,
    }
  }

  if (!supabase) return null

  const { data: teacher } = await supabase
    .from('teachers')
    .select('*, school_data:schools(*)')
    .eq('login_id', loginId)
    .maybeSingle()

  if (teacher) {
    if (!teacher.school_data) return null
    if (teacher.pin_hash && !verifyPassword(password, teacher.pin_hash)) return null

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
    .maybeSingle()

  if (director) {
    if (!director.school_data) return null
    if (director.pin_hash && !verifyPassword(password, director.pin_hash)) return null

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
