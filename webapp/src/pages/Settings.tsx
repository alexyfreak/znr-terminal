import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import {
  User,
  Bell,
  Shield,
  Globe,
  LogOut,
  ChevronRight,
  ClipboardCheck,
  Moon,
  Info,
  Trash2,
} from 'lucide-react'
import Avatar from '@/components/ui/Avatar'

export default function Settings() {
  const { user, logout } = useAuth()
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  const roleLabels: Record<string, string> = {
    parent: 'Ota-ona',
    sinf_rahbar: 'Sinf Rahbar',
    teacher: "O'qituvchi",
    director: 'Direktor',
    school: 'Maktab',
    pupil: "O'quvchi",
  }

  const sections = [
    {
      title: 'Hisob',
      items: [
        { icon: User, label: 'Ism va familiya', value: user?.full_name },
        { icon: Shield, label: 'ID', value: user?.user_id },
        { icon: Globe, label: 'Rol', value: roleLabels[user?.role || ''] || user?.role },
      ],
    },
    {
      title: 'Sozlamalar',
      items: [
        { icon: Bell, label: 'Bildirishnomalar', value: 'Telegram orqali' },
        { icon: Moon, label: 'Mavzu', value: 'Qorong\'i' },
      ],
    },
    {
      title: 'Ilova',
      items: [
        { icon: Info, label: 'Versiya', value: '1.0.0' },
        { icon: ClipboardCheck, label: 'Platforma', value: 'Zunoora WebApp' },
      ],
    },
  ]

  return (
    <div className="animate-fadeIn pb-8">
      <div className="px-4 pt-6 pb-6">
        <h1 className="text-lg font-bold text-zn-text">Sozlamalar</h1>
      </div>

      <div className="mx-4 mb-6 flex items-center gap-4 rounded-2xl border border-white/8 bg-white/4 p-4">
        <Avatar name={user?.full_name || 'U'} role={user?.role} size="lg" />
        <div className="min-w-0 flex-1">
          <p className="text-base font-bold text-zn-text">{user?.full_name}</p>
          <p className="text-xs text-zn-text-muted">{roleLabels[user?.role || ''] || user?.role}</p>
          {user?.phone && <p className="mt-0.5 text-xs text-zn-text-faint">{user.phone}</p>}
        </div>
        <button className="rounded-xl border border-white/8 px-3 py-1.5 text-xs font-medium text-zn-text-muted hover:bg-white/4">
          Tahrirlash
        </button>
      </div>

      {sections.map((section) => (
        <div key={section.title} className="mb-5">
          <p className="px-4 pb-2 text-[11px] font-semibold text-zn-text-faint uppercase tracking-wider">
            {section.title}
          </p>
          <div className="mx-4 overflow-hidden rounded-2xl border border-white/6 bg-white/4">
            {section.items.map((item, idx) => {
              const Icon = item.icon
              return (
                <div
                  key={item.label}
                  className={`flex items-center gap-3 px-4 py-3 ${
                    idx < section.items.length - 1 ? 'border-b border-white/6' : ''
                  }`}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/4">
                    <Icon size={15} className="text-zn-text-muted" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-zn-text">{item.label}</p>
                    {item.value && (
                      <p className="text-xs text-zn-text-faint">{item.value}</p>
                    )}
                  </div>
                  <ChevronRight size={16} className="text-zn-text-faint" />
                </div>
              )
            })}
          </div>
        </div>
      ))}

      <div className="mx-4 mt-2">
        {!showLogoutConfirm ? (
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-500/20 bg-red-500/8 py-3 text-sm font-semibold text-zn-error-text transition-colors hover:bg-red-500/15"
          >
            <LogOut size={16} />
            Chiqish
          </button>
        ) : (
          <div className="animate-slideDown space-y-3 rounded-2xl border border-red-500/20 bg-red-500/8 p-4">
            <div className="flex items-center gap-2">
              <Trash2 size={16} className="text-zn-error-text" />
              <p className="text-sm font-medium text-zn-error-text">Haqiqatan ham chiqmoqchimisiz?</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 rounded-xl bg-white/8 py-2.5 text-sm font-medium text-zn-text transition-colors hover:bg-white/12"
              >
                Bekor qilish
              </button>
              <button
                onClick={logout}
                className="flex-1 rounded-xl bg-zn-error-text py-2.5 text-sm font-medium text-white transition-colors hover:brightness-110"
              >
                Chiqish
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
