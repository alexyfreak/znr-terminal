import { useAuth } from '@/hooks/useAuth'
import { useChat } from '@/hooks/useChat'
import type { ChatContact } from '@/hooks/types'
import { MessageCircle, ChevronLeft, Send, CheckCheck, FileText } from 'lucide-react'
import Screen from '@/components/ui/Screen'

function ChatList({
  contacts,
  onSelect,
}: {
  contacts: ChatContact[]
  onSelect: (c: ChatContact) => void
}) {
  return (
    <div className="flex-1 overflow-y-auto">
      {contacts.length === 0 && (
        <div className="flex flex-1 items-center justify-center pt-20">
          <div className="text-center">
            <MessageCircle size={40} className="mx-auto mb-3 text-zn-text-faint" />
            <p className="text-sm text-zn-text-muted">No conversations yet</p>
          </div>
        </div>
      )}
      {contacts.map((c) => (
        <button
          key={c.id}
          onClick={() => onSelect(c)}
          className="flex w-full items-center gap-3 border-b border-zn-border px-4 py-3 text-left active:bg-zn-surface"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-zn-elevated">
            <FileText size={20} className="text-zn-text-muted" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-zn-text">{c.full_name}</p>
              {c.last_time && (
                <span className="text-[11px] text-zn-text-faint">{c.last_time}</span>
              )}
            </div>
            <div className="flex items-center justify-between">
              <p className="truncate text-xs text-zn-text-muted">{c.last_message}</p>
              {c.unread > 0 && (
                <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-zn-info-accent text-[10px] font-bold text-black">
                  {c.unread}
                </span>
              )}
            </div>
          </div>
        </button>
      ))}
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
  messages: { id: string; sender_id: string; text: string | null; created_at: string }[]
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
    <div className="flex flex-1 flex-col">
      <div className="flex items-center gap-3 border-b border-zn-border px-4 py-3">
        <button onClick={onBack} className="rounded-zn-btn p-1 text-zn-text-muted">
          <ChevronLeft size={22} />
        </button>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zn-elevated">
          <FileText size={16} className="text-zn-text-muted" />
        </div>
        <p className="text-sm font-semibold text-zn-text">{contact.full_name}</p>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto px-4 py-4">
        {messages.map((m) => {
          const isMine = m.sender_id === user?.id
          return (
            <div key={m.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[80%] rounded-zn-input px-4 py-2.5 ${
                  isMine ? 'bg-zn-info-accent text-black' : 'bg-zn-surface text-zn-text'
                }`}
              >
                <p className="text-sm">{m.text}</p>
                <div className={`mt-0.5 flex items-center justify-end gap-1 ${isMine ? 'text-black/60' : 'text-zn-text-faint'}`}>
                  <span className="text-[10px]">{new Date(m.created_at).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}</span>
                  {isMine && <CheckCheck size={12} />}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <form onSubmit={handleSubmit} className="safe-bottom flex items-center gap-2 border-t border-zn-border px-4 py-3">
        <input
          name="message"
          placeholder="Write a message..."
          autoFocus
          className="min-w-0 flex-1 rounded-zn-input bg-zn-elevated px-4 py-2.5 text-sm text-zn-text placeholder-zn-text-faint outline-none"
        />
        <button type="submit" className="flex h-10 w-10 items-center justify-center rounded-full bg-zn-info-accent">
          <Send size={16} className="text-black" />
        </button>
      </form>
    </div>
  )
}

export default function Chat({ onClose }: { onClose: () => void }) {
  const { user } = useAuth()
  const { contacts, activeContact, messages, openChat, goBack, sendMessage } = useChat(
    user?.id || '',
    user?.role || 'parent',
  )

  return (
    <Screen>
      {activeContact ? (
        <ChatThread
          contact={activeContact}
          messages={messages}
          onSend={sendMessage}
          onBack={goBack}
        />
      ) : (
        <>
          <div className="flex items-center gap-3 border-b border-zn-border px-4 py-3">
            <button onClick={onClose} className="rounded-zn-btn p-1 text-zn-text-muted">
              <ChevronLeft size={22} />
            </button>
            <h1 className="font-sans text-lg font-semibold text-zn-text">Messages</h1>
          </div>
          <ChatList contacts={contacts} onSelect={openChat} />
        </>
      )}
    </Screen>
  )
}
