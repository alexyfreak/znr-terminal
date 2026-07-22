import { Home, ClipboardList, MessageCircle, Settings, LogOut, ClipboardCheck } from 'lucide-react'
import Avatar from './Avatar'
import { useAuth } from '@/hooks/useAuth'

export type PageKey = 'home' | 'arizas' | 'chat' | 'settings'

const navItems: { key: PageKey; label: string; icon: typeof Home }[] = [
  { key: 'home', label: 'Bosh sahifa', icon: Home },
  { key: 'arizas', label: 'Arizalar', icon: ClipboardList },
  { key: 'chat', label: 'Xabarlar', icon: MessageCircle },
  { key: 'settings', label: 'Sozlamalar', icon: Settings },
]

export default function Sidebar({ active, onNavigate }: { active: PageKey; onNavigate: (k: PageKey) => void }) {
  const { user, logout } = useAuth()

  const roleLabels: Record<string, string> = {
    parent: 'Ota-ona',
    sinf_rahbar: 'Sinf Rahbar',
    teacher: "O'qituvchi",
    director: 'Direktor',
    school: 'Maktab',
    pupil: "O'quvchi",
  }

  return (
    <aside className="flex flex-col border-r border-zn-border bg-[#0C0C0C]">
      <div className="flex items-center gap-3 border-b border-zn-border px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-accent">
          <ClipboardCheck size={18} className="text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-zn-text">Zunoora</p>
          <p className="text-[10px] text-zn-text-faint">Maktab tizimi</p>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 px-3 py-4">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = active === item.key
          return (
            <button
              key={item.key}
              onClick={() => onNavigate(item.key)}
              className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-white/8 text-zn-text'
                  : 'text-zn-text-muted hover:bg-white/4 hover:text-zn-text'
              }`}
            >
              <Icon size={18} className={isActive ? 'text-zn-info-accent' : 'text-zn-text-faint group-hover:text-zn-text-muted'} />
              <span>{item.label}</span>
              {isActive && <div className="ml-auto h-1.5 w-1.5 rounded-full bg-zn-info-accent" />}
            </button>
          )
        })}
      </nav>

      <div className="border-t border-zn-border p-4">
        <div className="mb-3 flex items-center gap-3">
          <Avatar name={user?.full_name || 'U'} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-zn-text">{user?.full_name}</p>
            <p className="text-[11px] text-zn-text-faint">{roleLabels[user?.role || ''] || user?.role}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-white/4 px-3 py-2 text-xs font-medium text-zn-text-muted transition-colors hover:bg-white/8 hover:text-zn-error-text"
        >
          <LogOut size={14} />
          Chiqish
        </button>
      </div>
    </aside>
  )
}
