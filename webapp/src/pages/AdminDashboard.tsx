import { useAuth } from '@/hooks/useAuth'
import { Shield, Users, ClipboardCheck, User as UserIcon } from 'lucide-react'

export default function AdminDashboard() {
  const { user } = useAuth()

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Xayrli tong'
    if (h < 18) return 'Xayrli kun'
    return 'Xayrli kech'
  }

  return (
    <div className="animate-fadeIn pb-6">
      <div className="px-4 pt-6 pb-4">
        <div className="mb-1 flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full gradient-accent">
            <UserIcon size={14} className="text-white" />
          </div>
          <p className="text-xs font-medium text-zn-text-muted">{new Date().toLocaleDateString('uz-UZ', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        </div>
        <h1 className="text-xl font-bold text-zn-text">
          {greeting()}, {user?.full_name?.split(' ')[0]}
        </h1>
        <span className="text-xs text-zn-text-muted">Admin paneli</span>
      </div>

      <div className="grid grid-cols-2 gap-2 px-4 pb-4">
        <div className="rounded-2xl bg-white/4 p-4">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">
            <Users size={20} className="text-zn-info-accent" />
          </div>
          <p className="text-2xl font-bold text-zn-text">26</p>
          <p className="text-xs text-zn-text-muted">Foydalanuvchilar</p>
        </div>
        <div className="rounded-2xl bg-white/4 p-4">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/10">
            <Shield size={20} className="text-zn-success-text" />
          </div>
          <p className="text-2xl font-bold text-zn-text">3</p>
          <p className="text-xs text-zn-text-muted">Rollar</p>
        </div>
      </div>

      <div className="mx-4 rounded-2xl border border-white/8 bg-white/4 overflow-hidden">
        <div className="flex items-center gap-3 border-b border-white/6 px-4 py-3">
          <ClipboardCheck size={16} className="text-zn-info-accent" />
          <span className="text-sm font-semibold text-zn-text">Tizim ma'lumotlari</span>
        </div>
        <div className="space-y-0 divide-y divide-white/6">
          {[
            { label: 'Maktab nomi', value: 'Zunoora' },
            { label: 'Platforma', value: 'WebApp v1.0' },
            { label: 'Ma\'lumotlar bazasi', value: 'Supabase' },
            { label: 'Holat', value: 'Aktiv' },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between px-4 py-3">
              <span className="text-xs text-zn-text-muted">{item.label}</span>
              <span className="text-sm font-medium text-zn-text">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
