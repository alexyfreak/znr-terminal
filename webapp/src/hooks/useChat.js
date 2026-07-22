import { useState, useCallback, useEffect, useRef } from 'react';
import { requireSupabase } from './useSupabase';
export function useChat(userId, _userRole) {
    const [contacts, setContacts] = useState([]);
    const [activeContact, setActiveContact] = useState(null);
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const channelRef = useRef(null);
    const fetchContacts = useCallback(async () => {
        if (!userId)
            return;
        const sb = requireSupabase();
        const { data: msgs } = await sb
            .from('chat_messages')
            .select('*, sender:users!sender_id(full_name, role), receiver:users!receiver_id(full_name, role)')
            .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
            .order('created_at', { ascending: false });
        if (!msgs)
            return;
        const seen = new Map();
        for (const m of msgs) {
            const otherId = m.sender_id === userId ? m.receiver_id : m.sender_id;
            if (seen.has(otherId))
                continue;
            const other = m.sender_id === userId ? m.receiver : m.sender;
            seen.set(otherId, {
                id: otherId,
                full_name: other?.full_name || 'Unknown',
                role: (other?.role || 'parent'),
                last_message: m.text || undefined,
                last_time: new Date(m.created_at).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }),
                unread: m.sender_id !== userId && !m.is_read ? 1 : 0,
            });
        }
        setContacts(Array.from(seen.values()));
    }, [userId]);
    const fetchMessages = useCallback(async (contactId) => {
        if (!userId || !contactId)
            return;
        setIsLoading(true);
        const sb = requireSupabase();
        const { data, error } = await sb
            .from('chat_messages')
            .select('*')
            .or(`and(sender_id.eq.${userId},receiver_id.eq.${contactId}),and(sender_id.eq.${contactId},receiver_id.eq.${userId})`)
            .order('created_at', { ascending: true });
        if (!error && data)
            setMessages(data);
        setIsLoading(false);
    }, [userId]);
    useEffect(() => {
        fetchContacts();
    }, [fetchContacts]);
    useEffect(() => {
        const sb = requireSupabase();
        if (channelRef.current) {
            sb.removeChannel(channelRef.current);
        }
        if (!userId)
            return;
        const channel = sb.channel(`chat:${userId}`);
        channel
            .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_messages', filter: `sender_id=eq.${userId}` }, () => { fetchContacts(); if (activeContact)
            fetchMessages(activeContact.id); })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_messages', filter: `receiver_id=eq.${userId}` }, () => { fetchContacts(); if (activeContact)
            fetchMessages(activeContact.id); })
            .subscribe();
        channelRef.current = channel;
        return () => {
            sb.removeChannel(channel);
        };
    }, [userId, activeContact, fetchContacts, fetchMessages]);
    useEffect(() => {
        if (activeContact) {
            fetchMessages(activeContact.id);
        }
    }, [activeContact, fetchMessages]);
    const sendMessage = useCallback(async (text) => {
        if (!activeContact || !text.trim() || !userId)
            return;
        const sb = requireSupabase();
        const { data, error } = await sb.from('chat_messages').insert({
            sender_id: userId,
            receiver_id: activeContact.id,
            text: text.trim(),
        }).select().single();
        if (!error && data) {
            setMessages((prev) => [...prev, data]);
        }
    }, [activeContact, userId]);
    const openChat = useCallback((contact) => {
        setActiveContact(contact);
    }, []);
    const goBack = useCallback(() => {
        setActiveContact(null);
        setMessages([]);
    }, []);
    return { contacts, activeContact, messages, isLoading, openChat, goBack, sendMessage };
}
