import { supabase, type Shablon, type ShablonField, type ShablonStep } from './db'
import type { UserContext } from './db'

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

export async function listMarketplaceShablons(): Promise<Shablon[]> {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('shablons')
    .select('*')
    .eq('published', true)
    .order('label')
  if (!error && data) return data as unknown as Shablon[]
  return []
}

export async function searchMarketplaceShablons(query: string): Promise<Shablon[]> {
  if (!supabase) return []
  const q = `%${query.toLowerCase()}%`
  const { data, error } = await supabase
    .from('shablons')
    .select('*')
    .eq('published', true)
    .or(`label.ilike.${q},description.ilike.${q},type.ilike.${q}`)
    .order('label')
  if (!error && data) return data as unknown as Shablon[]
  return []
}

export async function createShablon(shablon: Omit<Shablon, 'id' | 'created_at' | 'updated_at'>, userId?: string): Promise<Shablon | null> {
  if (!supabase) return null

  const insertData = {
    type: shablon.type,
    label: shablon.label,
    description: shablon.description || null,
    keywords: shablon.keywords || [],
    teacher_visible: shablon.teacher_visible ?? true,
    schema: shablon.schema || { required: [], optional: [] },
    template: shablon.template || '',
    fields: shablon.fields || [],
    steps: shablon.steps || [],
    category: shablon.category || null,
    author_id: userId || null,
    published: shablon.published ?? false,
    version: 1,
  }

  const { data, error } = await supabase
    .from('shablons')
    .insert(insertData)
    .select()
    .single()

  if (error) return null
  if (!data) return null

  return data as unknown as Shablon
}

export async function updateShablon(id: string, updates: Partial<Shablon>): Promise<Shablon | null> {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('shablons')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
      version: (updates.version || 0) + 1,
    })
    .eq('id', id)
    .select()
    .single()
  if (!error && data) return data as unknown as Shablon
  return null
}

export async function deleteShablon(id: string): Promise<boolean> {
  if (!supabase) return false
  const { error } = await supabase
    .from('shablons')
    .delete()
    .eq('id', id)
  return !error
}

export async function installShablon(userId: string, shablonId: string): Promise<boolean> {
  if (!supabase) return false
  const { error } = await supabase
    .from('user_shablons')
    .insert({ user_id: userId, shablon_id: shablonId })
  return !error
}

export async function listInstalledShablons(userId: string): Promise<Shablon[]> {
  if (!supabase) return []
  const { data: installed, error } = await supabase
    .from('user_shablons')
    .select('shablon_id')
    .eq('user_id', userId)
  if (error || !installed) return []

  const ids = installed.map(i => i.shablon_id)
  if (ids.length === 0) return []

  const { data: shablons, error: shablonError } = await supabase
    .from('shablons')
    .select('*')
    .in('id', ids)
    .order('label')
  if (!shablonError && shablons) return shablons as unknown as Shablon[]
  return []
}

export async function uninstallShablon(userId: string, shablonId: string): Promise<boolean> {
  if (!supabase) return false
  const { error } = await supabase
    .from('user_shablons')
    .delete()
    .eq('user_id', userId)
    .eq('shablon_id', shablonId)
  return !error
}

export async function togglePublish(id: string, publish: boolean): Promise<boolean> {
  if (!supabase) return false
  const { error } = await supabase
    .from('shablons')
    .update({ published: publish })
    .eq('id', id)
  return !error
}

export async function getShablonById(id: string): Promise<Shablon | null> {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('shablons')
    .select('*')
    .eq('id', id)
    .single()
  if (!error && data) return data as unknown as Shablon
  return null
}
