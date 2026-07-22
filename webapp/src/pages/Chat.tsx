import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useChat } from '@/hooks/useChat'
import type { ChatContact } from '@/hooks/types'
import { MessageCircle, ChevronLeft, Send, CheckCheck, Search } from 'lucide-react'
import Avatar from '@/components/ui/Avatar'
import EmptyState from '@/components/ui/EmptyState'

function ChatList({
  contacts,
  onSelect,
}: {
  contacts: ChatContact[]
  onSelect: (c: ChatContact) => void
}) {
  const [search, setSearch] = useState('')

  const filtered = search
    ? contacts.filter((c) => c.full_name.toLowerCase().includes(search.toLowerCase()))
    : contacts

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="px-4 pt-6 pb-3">
        <h1 className="text-lg font-bold text-zn-text">Xabarlar</h1>
        {contacts.length > 0 && (
          <div className="relative mt-3">
            <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zn-text-faint" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Qidirish..."
              className="w-full rounded-2xl border border-white/8 bg-white/4 py-2.5 pl-10 pr-4 text-sm text-zn-text placeholder-zn-text-faint outline-none transition-all focus:border-white/20"
            />
          </div>
        )}
      </div>

      <div className="flex-1 space-y-0.5 overflow-y-auto px-4 pb-4">
        {contacts.length === 0 && (
          <div className="pt-10">
            <EmptyState
              icon={<MessageCircle size={28} />}
              title="Xabarlar mavjud emas"
              description="Suhbatni boshlash uchun dashboarddan xabar yozishingiz mumkin"
            />
          </div>
        )}
        {filtered.length === 0 && search && (
          <EmptyState
            icon={<Search size={28} />}
            title="Hech narsa topilmadi"
            description="Boshqa so'z bilan qidirib ko'ring"
          />
        )}
        {filtered.map((c) => (
          <button
            key={c.id}
            onClick={() => onSelect(c)}
            className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition-colors hover:bg-white/4 active:bg-white/6"
          >
            <Avatar name={c.full_name} role={c.role} size="md" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-zn-text">{c.full_name}</p>
                {c.last_time && <span className="text-[11px] text-zn-text-faint">{c.last_time}</span>}
              </div>
              <div className="flex items-center justify-between">
                <p className="truncate text-xs text-zn-text-muted">{c.last_message || 'Xabar yo\'q'}</p>
                {c.unread > 0 && (
                  <span className="ml-2 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-zn-info-accent px-1.5 text-[10px] font-bold text-black">
                    {c.unread}
                  </span>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

function ChatThread({
  contact,
  messages,
  onSend,
  onBack,
}: {
  contact: ChatContact
  messages: { id: string; sender_id: string; message: string | null; created_at: string }[]
  onSend: (text: string) => void
  onBack: () => void
}) {
  const { user } = useAuth()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const input = form.querySelector<HTMLInputElement>('[name="message"]')
    if (input?.value) {
      onSend(input.value)
      input.value = ''
    }
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex items-center gap-3 border-b border-white/8 px-4 py-3">
        <button onClick={onBack} className="rounded-xl p-1 text-zn-text-muted hover:text-zn-text">
          <ChevronLeft size={22} />
        </button>
        <Avatar name={contact.full_name} role={contact.role} size="sm" />
        <div>
          <p className="text-sm font-semibold text-zn-text">{contact.full_name}</p>
          <RoleLabel role={contact.role} />
        </div>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto px-4 py-4">
        {messages.map((m) => {
          const isMine = m.sender_id === user?.user_id
          return (
            <div key={m.id} className={`animate-slideUp flex ${isMine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                isMine
                  ? 'bg-zn-info-accent/90 text-white rounded-br-md'
                  : 'bg-white/6 text-zn-text rounded-bl-md'
              }`}>
                <p className="text-sm">{m.message}</p>
                <div className={`mt-0.5 flex items-center justify-end gap-1 ${
                  isMine ? 'text-white/60' : 'text-zn-text-faint'
                }`}>
                  <span className="text-[10px]">{new Date(m.created_at).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}</span>
                  {isMine && <CheckCheck size={12} />}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <form onSubmit={handleSubmit} className="safe-bottom flex items-center gap-2 border-t border-white/8 px-4 py-3">
        <input
          name="message"
          placeholder="Xabar yozing..."
          autoFocus
          className="min-w-0 flex-1 rounded-2xl border border-white/8 bg-white/4 px-4 py-2.5 text-sm text-zn-text placeholder-zn-text-faint outline-none transition-all focus:border-white/20"
        />
        <button type="submit" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full gradient-accent shadow-lg shadow-blue-500/15 transition-all hover:brightness-110">
          <Send size={16} className="text-white" />
        </button>
      </form>
    </div>
  )
}

function RoleLabel({ role }: { role: string }) {
  const labels: Record<string, string> = {
    parent: 'Ota-ona',
    sinf_rahbar: 'Sinf Rahbar',
    teacher: "O'qituvchi",
    director: 'Direktor',
    pupil: "O'quvchi",
  }
  return <span className="text-[11px] text-zn-text-faint">{labels[role] || role}</span>
}

export default function Chat() {
  const { user } = useAuth()
  const { contacts, activeContact, messages, openChat, goBack, sendMessage } = useChat(
    user?.user_id || '',
    user?.role || 'parent',
  )

  return (
    <div className="flex h-full flex-col animate-fadeIn">
      {activeContact ? (
        <ChatThread
          contact={activeContact}
          messages={messages}
          onSend={sendMessage}
          onBack={goBack}
        />
      ) : (
        <ChatList contacts={contacts} onSelect={openChat} />
      )}
    </div>
  )
}
