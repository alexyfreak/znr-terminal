import { Home, ClipboardList, MessageCircle, User } from 'lucide-react'

interface NavBarProps {
  active: 'home' | 'ariza' | 'chat' | 'profile'
  onNavigate: (tab: 'home' | 'ariza' | 'chat' | 'profile') => void
  role: 'parent' | 'sinf_rahbar'
}

const items = [
  { key: 'home', label: 'Home', icon: Home },
  { key: 'ariza', label: 'Ariza', icon: ClipboardList },
  { key: 'chat', label: 'Chat', icon: MessageCircle },
  { key: 'profile', label: 'Profile', icon: User },
] as const

export default function NavBar({ active, onNavigate }: NavBarProps) {
  return (
    <nav className="safe-bottom flex items-center justify-around border-t border-zn-border bg-zn-page px-2 pt-2">
      {items.map((item) => {
        const Icon = item.icon
        const isActive = active === item.key
        return (
          <button
            key={item.key}
            onClick={() => onNavigate(item.key)}
            className="flex flex-col items-center gap-0.5 px-3 py-1"
          >
            <Icon size={22} className={isActive ? 'text-zn-text' : 'text-zn-text-faint'} />
            <span
              className={`text-[10px] font-medium ${isActive ? 'text-zn-text' : 'text-zn-text-faint'}`}
            >
              {item.label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
