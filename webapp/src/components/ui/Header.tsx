import { ArrowLeft, MessageCircle } from 'lucide-react'

interface HeaderProps {
  title: string
  onBack?: () => void
  onChat?: () => void
}

export default function Header({ title, onBack, onChat }: HeaderProps) {
  return (
    <header className="safe-top flex items-center justify-between border-b border-zn-border px-4 pb-3 pt-2">
      <div className="flex items-center gap-3">
        {onBack && (
          <button onClick={onBack} className="rounded-zn-btn p-1 text-zn-text-muted hover:text-zn-text">
            <ArrowLeft size={22} />
          </button>
        )}
        <h1 className="font-sans text-lg font-semibold text-zn-text">{title}</h1>
      </div>
      {onChat && (
        <button onClick={onChat} className="rounded-zn-btn p-2 text-zn-text-muted hover:text-zn-text">
          <MessageCircle size={22} />
        </button>
      )}
    </header>
  )
}
