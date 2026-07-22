import { Home, ClipboardList, MessageCircle, Settings } from 'lucide-react'
import type { PageKey } from './Sidebar'

interface NavBarProps {
  active: PageKey
  onNavigate: (tab: PageKey) => void
}

const items: { key: PageKey; label: string; icon: typeof Home }[] = [
  { key: 'home', label: 'Bosh sahifa', icon: Home },
  { key: 'arizas', label: 'Arizalar', icon: ClipboardList },
  { key: 'chat', label: 'Xabarlar', icon: MessageCircle },
  { key: 'settings', label: 'Sozlamalar', icon: Settings },
]

export default function NavBar({ active, onNavigate }: NavBarProps) {
  return (
    <nav className="safe-bottom z-30 flex items-center justify-around border-t border-zn-border bg-[#0C0C0C] px-2 pt-2 lg:hidden">
      {items.map((item) => {
        const Icon = item.icon
        const isActive = active === item.key
        return (
          <button
            key={item.key}
            onClick={() => onNavigate(item.key)}
            className="group relative flex flex-col items-center gap-0.5 px-3 py-1 transition-colors"
          >
            {isActive && (
              <div className="absolute -top-2 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-zn-info-accent" />
            )}
            <Icon size={22} className={isActive ? 'text-zn-info-accent' : 'text-zn-text-faint group-hover:text-zn-text-muted'} />
            <span className={`text-[10px] font-medium ${isActive ? 'text-zn-text' : 'text-zn-text-faint'}`}>
              {item.label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
