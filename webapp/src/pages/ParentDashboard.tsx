import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useChildren, useArizas, useBildirgis, uploadFile } from '@/hooks/useData'
import { ChevronDown, Plus, AlertTriangle, Award, Calendar, FileText } from 'lucide-react'
import Screen from '@/components/ui/Screen'
import Header from '@/components/ui/Header'
import Button from '@/components/ui/Button'
import StatusBadge from '@/components/ui/StatusBadge'
import NavBar from '@/components/ui/NavBar'

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
    <div className="relative px-4 py-3">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between rounded-zn-input bg-zn-surface px-4 py-3"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zn-elevated">
            <FileText size={18} className="text-zn-text-muted" />
          </div>
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
          <div className="absolute left-4 right-4 top-full z-20 mt-1 overflow-hidden rounded-zn-popover bg-zn-surface shadow-2xl">
            {children.map((c) => (
              <button
                key={c.pupil_id}
                onClick={() => {
                  onChange(c)
                  setOpen(false)
                }}
                className={`flex w-full items-center gap-3 px-4 py-3 text-left ${
                  c.pupil_id === selected.pupil_id ? 'bg-zn-elevated' : ''
                }`}
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zn-elevated">
                  <FileText size={18} className="text-zn-text-muted" />
                </div>
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
}: {
  selectedChildPupilId: string
  onSubmit: (data: { child_pupil_id: string; date_from: string; date_to: string; reason: string; file_url?: string }) => void
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
      try {
        file_url = (await uploadFile(file)) ?? undefined
      } catch {
        // Upload failed
      }
    }
    onSubmit({ child_pupil_id: selectedChildPupilId, date_from: dateFrom, date_to: dateTo, reason, file_url })
    setDateFrom('')
    setDateTo('')
    setReason('')
    setFile(null)
    setUploading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 px-4 py-4">
      <div>
        <label className="mb-1 block text-xs font-medium text-zn-text-muted">Sanadan</label>
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className="w-full rounded-zn-input bg-zn-elevated px-4 py-3 text-sm text-zn-text placeholder-zn-text-faint"
          required
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-zn-text-muted">Sanagacha</label>
        <input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className="w-full rounded-zn-input bg-zn-elevated px-4 py-3 text-sm text-zn-text placeholder-zn-text-faint"
          required
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-zn-text-muted">Sabab</label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Sababni yozing..."
          rows={3}
          className="w-full resize-none rounded-zn-input bg-zn-elevated px-4 py-3 text-sm text-zn-text placeholder-zn-text-faint"
          required
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-zn-text-muted">Shifokor ma'lumotnomasi (ixtiyoriy)</label>
        <input
          type="file"
          accept="image/*,.pdf"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="w-full text-sm text-zn-text-muted file:mr-3 file:rounded-zn-btn file:border-0 file:bg-zn-surface file:px-4 file:py-2 file:text-sm file:text-zn-text"
        />
      </div>
      <Button type="submit" fullWidth disabled={uploading}>
        {uploading ? 'Yuklanmoqda...' : 'Ariza yuborish'}
      </Button>
    </form>
  )
}

export default function ParentDashboard({ onOpenChat }: { onOpenChat: () => void }) {
  const { user } = useAuth()
  const { children } = useChildren(user?.user_id)
  const { arizas, create: createAriza } = useArizas(user?.user_id)
  const { bildirgis } = useBildirgis()

  const [selectedChild, setSelectedChild] = useState<{ pupil_id: string; full_name: string; class_name: string } | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [tab, setTab] = useState<'home' | 'ariza' | 'chat' | 'profile'>('home')

  useEffect(() => {
    if (children.length > 0 && !selectedChild) {
      setSelectedChild(children[0])
    }
  }, [children, selectedChild])

  const handleNewAriza = useCallback(async (data: {
    child_pupil_id: string
    date_from: string
    date_to: string
    reason: string
    file_url?: string
  }) => {
    await createAriza(data)
    setShowForm(false)
  }, [createAriza])

  const childBildirgis = bildirgis.filter((b) => b.child_pupil_id === selectedChild?.pupil_id)
  const childArizas = arizas.filter((a) => a.child_pupil_id === selectedChild?.pupil_id)
  const praises = childBildirgis.filter((b) => b.type === 'praise')
  const violations = childBildirgis.filter((b) => b.type === 'reprimand')

  const content = () => {
    switch (tab) {
      case 'home':
        return (
          <>
            <div className="px-4 pb-1 pt-4">
              <h2 className="font-sans text-sm font-semibold text-zn-text-muted uppercase tracking-wider">Umumiy</h2>
            </div>
            <div className="flex gap-3 px-4 pb-4">
              <div className="flex-1 rounded-zn-popover bg-zn-surface p-4">
                <Calendar size={20} className="mb-2 text-zn-info-accent" />
                <p className="text-2xl font-bold text-zn-text">96%</p>
                <p className="text-xs text-zn-text-muted">Davomat</p>
              </div>
              <div className="flex-1 rounded-zn-popover bg-zn-surface p-4">
                <Award size={20} className="mb-2 text-zn-success-text" />
                <p className="text-2xl font-bold text-zn-text">{praises.length}</p>
                <p className="text-xs text-zn-text-muted">Taqsinlar</p>
              </div>
              <div className="flex-1 rounded-zn-popover bg-zn-surface p-4">
                <AlertTriangle size={20} className="mb-2 text-zn-warning-text" />
                <p className="text-2xl font-bold text-zn-text">{violations.length}</p>
                <p className="text-xs text-zn-text-muted">Tanbehlar</p>
              </div>
            </div>

            <div className="px-4 pb-2">
              <h3 className="font-sans text-sm font-semibold text-zn-text-muted uppercase tracking-wider">Oxirgi bildirgilar</h3>
            </div>
            <div className="space-y-1 px-4 pb-6">
              {childBildirgis.length === 0 && (
                <p className="text-sm text-zn-text-faint text-center py-4">Hozircha yozuv mavjud emas</p>
              )}
              {childBildirgis.map((b) => (
                <div key={b.id} className="flex items-start gap-3 rounded-zn-input bg-zn-surface px-4 py-3">
                  <div
                    className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                      b.type === 'praise' ? 'bg-zn-success-bg' : 'bg-zn-error-bg'
                    }`}
                  >
                    {b.type === 'praise' ? (
                      <Award size={14} className="text-zn-success-text" />
                    ) : (
                      <AlertTriangle size={14} className="text-zn-error-text" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-zn-text">{b.reason}</p>
                    <p className="mt-0.5 text-[11px] text-zn-text-faint">{new Date(b.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )

      case 'ariza':
        return (
          <>
            <div className="flex items-center justify-between px-4 py-3">
              <h2 className="font-sans text-sm font-semibold text-zn-text-muted uppercase tracking-wider">Mening arizalarim</h2>
              <button
                onClick={() => setShowForm(!showForm)}
                className="flex items-center gap-1 rounded-zn-btn bg-zn-surface px-3 py-1.5 text-xs font-medium text-zn-text"
              >
                <Plus size={14} />
                {showForm ? 'Yopish' : 'Yangi'}
              </button>
            </div>

            {showForm && selectedChild && (
              <ArizaForm selectedChildPupilId={selectedChild.pupil_id} onSubmit={handleNewAriza} />
            )}

            <div className="space-y-2 px-4 pb-6">
              {childArizas.length === 0 && (
                <p className="text-sm text-zn-text-faint text-center py-4">Arizalar mavjud emas</p>
              )}
              {childArizas.map((a) => (
                <div key={a.id} className="rounded-zn-popover bg-zn-surface p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-sm font-semibold text-zn-text">{a.reason}</p>
                    <StatusBadge status={a.status} />
                  </div>
                  <p className="text-xs text-zn-text-muted">{a.date_from} → {a.date_to}</p>
                </div>
              ))}
            </div>
          </>
        )

      case 'chat':
        onOpenChat()
        return null

      default:
        return (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-sm text-zn-text-muted">Sozlamalar</p>
          </div>
        )
    }
  }

  return (
    <Screen>
      <Header title="Zunoora" onChat={onOpenChat} />
      {selectedChild && (
        <ChildSelector
          children={children}
          selected={selectedChild}
          onChange={setSelectedChild}
        />
      )}
      <div className="flex-1 overflow-y-auto">{content()}</div>
      <NavBar active={tab} onNavigate={setTab} role="parent" />
    </Screen>
  )
}
