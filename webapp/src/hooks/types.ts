export type Role = 'parent' | 'sinf_rahbar' | 'teacher' | 'director' | 'school' | 'pupil'
export type ArizaStatus = 'pending' | 'approved' | 'rejected'
export type BildirgiType = 'reprimand' | 'praise'

export interface User {
  user_id: string
  role: Role
  full_name: string
  phone: string | null
  children?: Child[]
}

export interface Child {
  pupil_id: string
  full_name: string
  class_name: string
}

export interface ArizaRequest {
  id: string
  parent_id: string
  child_pupil_id: string
  reason: string
  date_from: string
  date_to: string
  file_url: string | null
  status: ArizaStatus
  reviewed_by: string | null
  reviewed_at: string | null
  created_at: string
}

export interface BildirgiRecord {
  id: string
  author_id: string
  type: BildirgiType
  child_pupil_id: string
  reason: string
  image_url: string | null
  created_at: string
}

export interface ChatMessage {
  id: string
  sender_id: string
  recipient_id: string
  message: string | null
  created_at: string
}

export interface ChatContact {
  id: string
  full_name: string
  role: Role
  last_message?: string
  last_time?: string
  unread: number
}

export interface LoginResponse {
  success: boolean
  error?: string
  user?: {
    user_id: string
    role: Role
    full_name: string
    phone: string | null
  }
  children?: Child[]
}
