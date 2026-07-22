import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useChildren, useArizas, useBildirgis, uploadFile } from '@/hooks/useData'
import {
  Calendar,
  Award,
  AlertTriangle,
  Plus,
  ChevronDown,
  Send,
  X,
  Clock,
  User as UserIcon,
} from 'lucide-react'
import Avatar from '@/components/ui/Avatar'
import Button from '@/components/ui/Button'
import StatusBadge from '@/components/ui/StatusBadge'
import EmptyState from '@/components/ui/EmptyState'
import type { PageKey } from '@/components/ui/Sidebar'

function ChildSelector({
  children,
  selected,
  onChange,
}: {
  children: { pupil_id: string; full_name: string; class_name: string }[]
  selected: { pupil_id: string; full_name: string; class_name: string }
  onChange: (c: { pupil_id: string; full_name: string; class_name: string }) => void
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative px-4 pt-1 pb-2">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between rounded-2xl bg-white/4 px-4 py-3 transition-colors hover:bg-white/6"
      >
        <div className="flex items-center gap-3">
          <Avatar name={selected.full_name} size="sm" />
          <div className="text-left">
            <p className="text-sm font-semibold text-zn-text">{selected.full_name}</p>
            <p className="text-xs text-zn-text-muted">{selected.class_name}</p>
          </div>
        </div>
        <ChevronDown size={18} className="text-zn-text-muted" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-4 right-4 top-full z-20 mt-1 overflow-hidden rounded-2xl border border-white/8 bg-[#0C0C0C] shadow-2xl">
            {children.map((c) => (
              <button
                key={c.pupil_id}
                onClick={() => { onChange(c); setOpen(false) }}
                className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-white/4 ${
                  c.pupil_id === selected.pupil_id ? 'bg-white/6' : ''
                }`}
              >
                <Avatar name={c.full_name} size="sm" />
                <div>
                  <p className="text-sm font-semibold text-zn-text">{c.full_name}</p>
                  <p className="text-xs text-zn-text-muted">{c.class_name}</p>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function ArizaForm({
  selectedChildPupilId,
  onSubmit,
  onCancel,
}: {
  selectedChildPupilId: string
  onSubmit: (data: { child_pupil_id: string; date_from: string; date_to: string; reason: string; file_url?: string }) => void
  onCancel: () => void
}) {
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [reason, setReason] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!dateFrom || !dateTo || !reason) return
    setUploading(true)
    let file_url: string | undefined
    if (file) {
      try { file_url = (await uploadFile(file)) ?? undefined } catch { /* ignore */ }
    }
    onSubmit({ child_pupil_id: selectedChildPupilId, date_from: dateFrom, date_to: dateTo, reason, file_url })
    setDateFrom(''); setDateTo(''); setReason(''); setFile(null)
    setUploading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="animate-slideDown space-y-4 rounded-2xl border border-white/8 bg-white/4 p-4 mx-4 mb-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-zn-text">Yangi ariza</p>
        <button type="button" onClick={onCancel} className="rounded-full p-1 text-zn-text-faint hover:text-zn-text-muted">
          <X size={18} />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-zn-text-muted">Sanadan</label>
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
            className="w-full rounded-xl border border-white/8 bg-white/4 px-3 py-2.5 text-sm text-zn-text" required />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-zn-text-muted">Sanagacha</label>
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
            className="w-full rounded-xl border border-white/8 bg-white/4 px-3 py-2.5 text-sm text-zn-text" required />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-zn-text-muted">Sabab</label>
        <textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Sababni yozing..." rows={3}
          className="w-full resize-none rounded-xl border border-white/8 bg-white/4 px-3 py-2.5 text-sm text-zn-text placeholder-zn-text-faint outline-none" required />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-zn-text-muted">Shifokor ma'lumotnomasi (ixtiyoriy)</label>
        <input type="file" accept="image/*,.pdf" onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="w-full text-sm text-zn-text-muted file:mr-3 file:rounded-xl file:border-0 file:bg-white/8 file:px-4 file:py-2 file:text-sm file:text-zn-text file:cursor-pointer" />
      </div>
      <Button type="submit" fullWidth disabled={uploading}>
        {uploading ? 'Yuklanmoqda...' : 'Ariza yuborish'}
      </Button>
    </form>
  )
}

export function ParentHome({ onNavigate }: { onNavigate: (p: PageKey) => void }) {
  const { user } = useAuth()
  const { children } = useChildren(user?.user_id)
  const { bildirgis } = useBildirgis()

  const [selectedChild, setSelectedChild] = useState<{ pupil_id: string; full_name: string; class_name: string } | null>(null)

  useEffect(() => {
    if (children.length > 0 && !selectedChild) setSelectedChild(children[0])
  }, [children, selectedChild])

  const childBildirgis = bildirgis.filter((b) => b.child_pupil_id === selectedChild?.pupil_id)
  const praises = childBildirgis.filter((b) => b.type === 'praise')
  const violations = childBildirgis.filter((b) => b.type === 'reprimand')

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
      </div>

      {selectedChild && (
        <ChildSelector children={children} selected={selectedChild} onChange={setSelectedChild} />
      )}

      <div className="grid grid-cols-3 gap-2 px-4 pb-4">
        <div className="animate-slideUp rounded-2xl bg-white/4 p-3">
          <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/10">
            <Calendar size={16} className="text-zn-info-accent" />
          </div>
          <p className="text-xl font-bold text-zn-text">96%</p>
          <p className="text-[11px] text-zn-text-muted">Davomat</p>
        </div>
        <div className="animate-slideUp animate-delay-100 rounded-2xl bg-white/4 p-3">
          <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-xl bg-green-500/10">
            <Award size={16} className="text-zn-success-text" />
          </div>
          <p className="text-xl font-bold text-zn-text">{praises.length}</p>
          <p className="text-[11px] text-zn-text-muted">Taqsinlar</p>
        </div>
        <div className="animate-slideUp animate-delay-200 rounded-2xl bg-white/4 p-3">
          <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-xl bg-red-500/10">
            <AlertTriangle size={16} className="text-zn-error-text" />
          </div>
          <p className="text-xl font-bold text-zn-text">{violations.length}</p>
          <p className="text-[11px] text-zn-text-muted">Tanbehlar</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 px-4 pb-4">
        <button
          onClick={() => onNavigate('arizas')}
          className="flex items-center justify-center gap-2 rounded-2xl gradient-accent py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/15 transition-all hover:brightness-110"
        >
          <Plus size={16} />
          Ariza yuborish
        </button>
        <button
          onClick={() => onNavigate('chat')}
          className="flex items-center justify-center gap-2 rounded-2xl bg-white/8 py-3 text-sm font-semibold text-zn-text transition-colors hover:bg-white/10"
        >
          <Send size={16} className="text-zn-info-accent" />
          Xabar yozish
        </button>
      </div>

      <div className="px-4 pb-1">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-zn-text-muted uppercase tracking-wider">Oxirgi bildirgilar</h3>
          <span className="text-[11px] text-zn-text-faint">So'nggi 30 kun</span>
        </div>
      </div>

      <div className="space-y-1 px-4">
        {childBildirgis.length === 0 && (
          <div className="flex flex-col items-center py-10 text-center animate-fadeIn animate-delay-300">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/4">
              <Award size={22} className="text-zn-text-faint" />
            </div>
            <p className="text-sm text-zn-text-muted">Hozircha bildirgilar mavjud emas</p>
            <p className="mt-1 text-xs text-zn-text-faint">O'qituvchi tomonidan yozilgan bildirgilar bu yerda ko'rsatiladi</p>
          </div>
        )}
        {childBildirgis.slice(0, 5).map((b) => (
          <div key={b.id} className="animate-slideUp flex items-start gap-3 rounded-2xl bg-white/4 px-4 py-3">
            <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
              b.type === 'praise' ? 'bg-green-500/10' : 'bg-red-500/10'
            }`}>
              {b.type === 'praise' ? (
                <Award size={14} className="text-zn-success-text" />
              ) : (
                <AlertTriangle size={14} className="text-zn-error-text" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-zn-text">{b.reason}</p>
              <div className="mt-0.5 flex items-center gap-2">
                <Clock size={10} className="text-zn-text-faint" />
                <p className="text-[11px] text-zn-text-faint">
                  {new Date(b.created_at).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short' })}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function ParentArizas() {
  const { user } = useAuth()
  const { children } = useChildren(user?.user_id)
  const { arizas, create: createAriza } = useArizas(user?.user_id)
  const [selectedChild, setSelectedChild] = useState<{ pupil_id: string; full_name: string; class_name: string } | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')

  useEffect(() => {
    if (children.length > 0 && !selectedChild) setSelectedChild(children[0])
  }, [children, selectedChild])

  const handleNewAriza = useCallback(async (data: {
    child_pupil_id: string; date_from: string; date_to: string; reason: string; file_url?: string
  }) => {
    await createAriza(data)
    setShowForm(false)
  }, [createAriza])

  const childArizas = arizas.filter((a) => a.child_pupil_id === selectedChild?.pupil_id)
  const filtered = filter === 'all' ? childArizas : childArizas.filter((a) => a.status === filter)

  const filters = [
    { key: 'all' as const, label: 'Barchasi' },
    { key: 'pending' as const, label: 'Kutilmoqda' },
    { key: 'approved' as const, label: 'Tasdiqlangan' },
    { key: 'rejected' as const, label: 'Rad etilgan' },
  ]

  return (
    <div className="animate-fadeIn pb-6">
      <div className="px-4 pt-6 pb-1">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold text-zn-text">Arizalar</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1.5 rounded-xl gradient-accent px-4 py-2 text-xs font-bold text-white shadow-lg shadow-blue-500/15 transition-all hover:brightness-110"
          >
            {showForm ? <X size={14} /> : <Plus size={14} />}
            {showForm ? 'Yopish' : 'Yangi'}
          </button>
        </div>
      </div>

      {selectedChild && (
        <ChildSelector children={children} selected={selectedChild} onChange={setSelectedChild} />
      )}

      {showForm && selectedChild && (
        <ArizaForm
          selectedChildPupilId={selectedChild.pupil_id}
          onSubmit={handleNewAriza}
          onCancel={() => setShowForm(false)}
        />
      )}

      <div className="flex gap-1.5 px-4 pb-3 pt-1 overflow-x-auto no-scrollbar">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`shrink-0 rounded-xl px-3.5 py-1.5 text-xs font-medium transition-all ${
              filter === f.key
                ? 'bg-white/10 text-zn-text'
                : 'bg-white/4 text-zn-text-muted hover:bg-white/7'
            }`}
          >
            {f.label}
            {f.key !== 'all' && (
              <span className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] ${
                f.key === 'pending' ? 'bg-zn-warning-bg text-zn-warning-text' :
                f.key === 'approved' ? 'bg-zn-success-bg text-zn-success-text' :
                'bg-zn-error-bg text-zn-error-text'
              }`}>
                {childArizas.filter((a) => a.status === f.key).length}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="space-y-2 px-4">
        {filtered.length === 0 && (
          <EmptyState
            title={childArizas.length === 0 ? 'Hali arizalar yo\'q' : 'Bu turdagi arizalar yo\'q'}
            description={childArizas.length === 0 ? 'Farzandingiz uchun birinchi arizani yuboring' : 'Boshqa filtrni tanlang'}
            action={!showForm ? { label: 'Ariza yuborish', onClick: () => setShowForm(true) } : undefined}
          />
        )}
        {filtered.map((a) => (
          <div key={a.id} className="animate-slideUp rounded-2xl border border-white/6 bg-white/4 p-4">
            <div className="mb-2 flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-zn-text">{a.reason}</p>
                <p className="mt-0.5 text-xs text-zn-text-muted">
                  {a.date_from} → {a.date_to}
                </p>
              </div>
              <StatusBadge status={a.status} />
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Clock size={10} className="text-zn-text-faint" />
              <span className="text-[11px] text-zn-text-faint">
                {new Date(a.created_at).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
