export type Role = 'parent' | 'sinf_rahbar'
export type ArizaStatus = 'pending' | 'approved' | 'rejected'
export type BildirgiType = 'violation' | 'praise'

export interface User {
  id: string
  telegram_id: number
  full_name: string
  phone: string | null
  role: Role
  avatar_url: string | null
  created_at: string
}

export interface Child {
  id: string
  parent_id: string
  full_name: string
  class_name: string
  created_at: string
}

export interface ArizaRequest {
  id: string
  child_id: string
  parent_id: string
  teacher_id: string | null
  date_from: string
  date_to: string
  reason_text: string
  doctor_paper_url: string | null
  status: ArizaStatus
  rejection_reason: string | null
  created_at: string
}

export interface BildirgiRecord {
  id: string
  student_id: string
  teacher_id: string
  type: BildirgiType
  title: string
  description: string | null
  image_url: string | null
  created_at: string
}

export interface ChatMessage {
  id: string
  sender_id: string
  receiver_id: string
  text: string | null
  attachment_url: string | null
  is_read: boolean
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
