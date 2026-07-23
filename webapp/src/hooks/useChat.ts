import { useState, useCallback, useEffect, useRef } from 'react'
import { requireSupabase } from './useSupabase'
import type { ChatMessage, ChatContact } from './types'

export type { ChatContact, ChatMessage } from './types'

export function useChat(userId: string, _userRole: string) {
  const [contacts, setContacts] = useState<ChatContact[]>([])
  const [activeContact, setActiveContact] = useState<ChatContact | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [allUsers, setAllUsers] = useState<{ id: string; full_name: string; role: string }[]>([])
  const channelRef = useRef<ReturnType<ReturnType<typeof requireSupabase>['channel']> | null>(null)

  const fetchContacts = useCallback(async () => {
    if (!userId) return
    const sb = requireSupabase()
    const { data: msgs } = await sb
      .from('chat_messages')
      .select('*, sender:webapp_users!sender_id(full_name, role), receiver:webapp_users!recipient_id(full_name, role)')
      .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
      .order('created_at', { ascending: false })

    if (!msgs) return

    const seen = new Map<string, ChatContact>()
    for (const m of msgs) {
      const otherId = m.sender_id === userId ? m.recipient_id : m.sender_id
      if (seen.has(otherId)) continue
      const other = m.sender_id === userId ? m.receiver : m.sender
      seen.set(otherId, {
        id: otherId,
        full_name: other?.full_name || 'Unknown',
        role: (other?.role || 'teacher') as ChatContact['role'],
        last_message: m.message || undefined,
        last_time: new Date(m.created_at).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }),
        unread: 0,
      })
    }
    setContacts(Array.from(seen.values()))
  }, [userId])

  const fetchAllUsers = useCallback(async () => {
    if (!userId) return
    const sb = requireSupabase()
    const { data } = await sb
      .from('webapp_users')
      .select('user_id, full_name, role')
      .neq('user_id', userId)
    if (data) {
      setAllUsers(
        data.map((u: { user_id: string; full_name: string; role: string }) => ({
          id: u.user_id,
          full_name: u.full_name,
          role: u.role,
        })),
      )
    }
  }, [userId])

  useEffect(() => {
    fetchAllUsers()
  }, [fetchAllUsers])

  const markAsRead = useCallback(async (contactId: string) => {
    if (!userId) return
    const sb = requireSupabase()
    await sb
      .from('chat_messages')
      .update({ read: true })
      .eq('sender_id', contactId)
      .eq('recipient_id', userId)
      .is('read', false)
  }, [userId])

  const fetchMessages = useCallback(async (contactId: string) => {
    if (!userId || !contactId) return
    setIsLoading(true)
    const sb = requireSupabase()
    const { data, error } = await sb
      .from('chat_messages')
      .select('*')
      .or(`and(sender_id.eq.${userId},recipient_id.eq.${contactId}),and(sender_id.eq.${contactId},recipient_id.eq.${userId})`)
      .order('created_at', { ascending: true })

    if (!error && data) setMessages(data as ChatMessage[])
    setIsLoading(false)
    markAsRead(contactId)
  }, [userId, markAsRead])

  useEffect(() => {
    fetchContacts()
  }, [fetchContacts])

  useEffect(() => {
    const sb = requireSupabase()

    if (channelRef.current) {
      sb.removeChannel(channelRef.current)
    }

    if (!userId) return

    const channel = sb.channel(`chat:${userId}`)
    channel
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'chat_messages', filter: `sender_id=eq.${userId}` },
        () => { fetchContacts(); if (activeContact) fetchMessages(activeContact.id) },
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'chat_messages', filter: `recipient_id=eq.${userId}` },
        () => { fetchContacts(); if (activeContact) fetchMessages(activeContact.id) },
      )
      .subscribe()

    channelRef.current = channel

    return () => {
      sb.removeChannel(channel)
    }
  }, [userId, activeContact, fetchContacts, fetchMessages])

  useEffect(() => {
    if (activeContact) {
      fetchMessages(activeContact.id)
    }
  }, [activeContact, fetchMessages])

  const sendMessage = useCallback(async (text: string) => {
    if (!activeContact || !text.trim() || !userId) return
    const sb = requireSupabase()
    const { data, error } = await sb.from('chat_messages').insert({
      sender_id: userId,
      recipient_id: activeContact.id,
      message: text.trim(),
    }).select().single()

    if (!error && data) {
      setMessages((prev) => [...prev, data as ChatMessage])
    }
  }, [activeContact, userId])

  const startConversation = useCallback(async (targetUserId: string) => {
    const existing = contacts.find((c) => c.id === targetUserId)
    if (existing) {
      setActiveContact(existing)
      return
    }
    const user = allUsers.find((u) => u.id === targetUserId)
    if (!user) return
    const newContact: ChatContact = {
      id: user.id,
      full_name: user.full_name,
      role: user.role as ChatContact['role'],
      unread: 0,
    }
    setContacts((prev) => [newContact, ...prev])
    setActiveContact(newContact)
  }, [contacts, allUsers])

  const openChat = useCallback((contact: ChatContact) => {
    setActiveContact(contact)
  }, [])

  const goBack = useCallback(() => {
    setActiveContact(null)
    setMessages([])
  }, [])

  return { contacts, activeContact, messages, isLoading, allUsers, openChat, goBack, sendMessage, startConversation }
}
