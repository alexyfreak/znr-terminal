import { useState, useEffect, useCallback } from 'react'
import { requireSupabase } from './useSupabase'
import type { Child, ArizaRequest, BildirgiRecord } from './types'

const BOT_API = import.meta.env.VITE_BOT_API_URL || 'http://localhost:3001'

async function triggerBotNotification(endpoint: string, payload: Record<string, unknown>) {
  try {
    await fetch(`${BOT_API}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  } catch {
    // Bot server unreachable
  }
}

export function useChildren(parentId: string | undefined) {
  const [children, setChildren] = useState<Child[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!parentId) return
    const sb = requireSupabase()

    sb.from('children').select('pupil_id, full_name, class_name').eq('parent_id', parentId).then(({ data, error }) => {
      if (!error && data) setChildren(data as Child[])
      setLoading(false)
    })
  }, [parentId])

  return { children, loading }
}

export function useAllChildren(teacherId?: string) {
  const [children, setChildren] = useState<Child[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const sb = requireSupabase()
    let q = sb.from('children').select('pupil_id, full_name, class_name')
    if (teacherId) q = q.eq('sinf_rahbar_id', teacherId)
    q.then(({ data, error }) => {
      if (!error && data) setChildren(data as Child[])
      setLoading(false)
    })
  }, [teacherId])

  return { children, loading }
}

export function useArizas(parentId: string | undefined) {
  const [arizas, setArizas] = useState<ArizaRequest[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    if (!parentId) return
    const sb = requireSupabase()
    const { data, error } = await sb.from('ariza_requests').select('*').eq('parent_id', parentId).order('created_at', { ascending: false })
    if (!error && data) setArizas(data as ArizaRequest[])
    setLoading(false)
  }, [parentId])

  useEffect(() => { fetch() }, [fetch])

  const create = useCallback(async (input: {
    child_pupil_id: string
    date_from: string
    date_to: string
    reason: string
    file_url?: string
  }) => {
    if (!parentId) return
    const sb = requireSupabase()
    const { data, error } = await sb.from('ariza_requests').insert({
      parent_id: parentId,
      child_pupil_id: input.child_pupil_id,
      date_from: input.date_from,
      date_to: input.date_to,
      reason: input.reason,
      file_url: input.file_url || null,
    }).select().single()
    if (!error && data) {
      setArizas((prev) => [data as ArizaRequest, ...prev])
    }
    return { data, error }
  }, [parentId])

  return { arizas, loading, create }
}

export function useTeacherArizas() {
  const [arizas, setArizas] = useState<ArizaRequest[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    const sb = requireSupabase()
    const { data, error } = await sb.from('ariza_requests').select('*').order('created_at', { ascending: false })
    if (!error && data) setArizas(data as ArizaRequest[])
    setLoading(false)
  }, [])

  useEffect(() => { fetch() }, [fetch])

  const moderate = useCallback(async (id: string, status: 'approved' | 'rejected', reviewerId: string) => {
    const sb = requireSupabase()
    const { data, error } = await sb.from('ariza_requests').update({
      status,
      reviewed_by: reviewerId,
      reviewed_at: new Date().toISOString(),
    }).eq('id', id).select().single()
    if (!error && data) {
      setArizas((prev) => prev.map((a) => (a.id === id ? data as ArizaRequest : a)))
      triggerBotNotification('/notify-ariza', { arizaId: id, status })
    }
    return { data, error }
  }, [])

  return { arizas, loading, moderate }
}

export function useBildirgis(childPupilId?: string) {
  const [bildirgis, setBildirgis] = useState<BildirgiRecord[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    const sb = requireSupabase()
    let q = sb.from('bildirgi_records').select('*').order('created_at', { ascending: false })
    if (childPupilId) q = q.eq('child_pupil_id', childPupilId)
    const { data, error } = await q
    if (!error && data) setBildirgis(data as BildirgiRecord[])
    setLoading(false)
  }, [childPupilId])

  useEffect(() => { fetch() }, [fetch])

  const create = useCallback(async (input: {
    child_pupil_id: string
    author_id: string
    type: 'reprimand' | 'praise'
    reason: string
    image_url?: string
  }) => {
    const sb = requireSupabase()
    const { data, error } = await sb.from('bildirgi_records').insert(input).select().single()
    if (!error && data) {
      setBildirgis((prev) => [data as BildirgiRecord, ...prev])
      triggerBotNotification('/notify-bildirgi', { bildirgiId: data.id })
    }
    return { data, error }
  }, [childPupilId])

  return { bildirgis, loading, create }
}

export function useAllBildirgis() {
  const [bildirgis, setBildirgis] = useState<BildirgiRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const sb = requireSupabase()
    sb.from('bildirgi_records').select('*').order('created_at', { ascending: false }).then(({ data, error }) => {
      if (!error && data) setBildirgis(data as BildirgiRecord[])
      setLoading(false)
    })
  }, [])

  return { bildirgis, loading }
}

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const ALLOWED_DOC_TYPES = ['application/pdf']
const MAX_FILE_SIZE = 10 * 1024 * 1024

export async function uploadFile(file: File, bucket = 'uploads'): Promise<string | null> {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type) && !ALLOWED_DOC_TYPES.includes(file.type)) {
    throw new Error('Only JPEG, PNG, WebP, GIF images and PDF files are allowed')
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File exceeds 10MB limit')
  }

  const sb = requireSupabase()
  const ext = file.name.split('.').pop()
  const path = `${crypto.randomUUID()}.${ext}`
  const { error } = await sb.storage.from(bucket).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  })
  if (error) throw error
  const { data } = sb.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}
