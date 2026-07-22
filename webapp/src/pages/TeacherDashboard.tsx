import { useState, useEffect } from 'react'
import {
  ClipboardList,
  Check,
  X,
  AlertTriangle,
  Award,
  Plus,
  Image,
} from 'lucide-react'
import Screen from '@/components/ui/Screen'
import Header from '@/components/ui/Header'
import Button from '@/components/ui/Button'
import StatusBadge from '@/components/ui/StatusBadge'
import NavBar from '@/components/ui/NavBar'
import { useAuth } from '@/hooks/useAuth'
import { useTeacherArizas, useAllChildren, useBildirgis, uploadFile } from '@/hooks/useData'
import type { ArizaRequest, Child } from '@/hooks/types'

function ArizaModerationCard({
  ariza,
  childName,
  onApprove,
  onReject,
}: {
  ariza: ArizaRequest
  childName: string
  onApprove: (id: string) => void
  onReject: (id: string) => void
}) {
  return (
    <div className="rounded-zn-popover border border-zn-border bg-zn-surface p-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-zn-text">{childName}</p>
          <p className="text-xs text-zn-text-muted">{ariza.date_from} → {ariza.date_to}</p>
        </div>
        <StatusBadge status={ariza.status} />
      </div>
      <p className="mb-3 text-xs text-zn-text-faint">{ariza.reason}</p>

      {ariza.file_url && (
        <a
          href={ariza.file_url}
          target="_blank"
          rel="noopener noreferrer"
          className="mb-3 flex items-center gap-2 rounded-zn-input bg-zn-elevated px-3 py-2"
        >
          <Image size={16} className="text-zn-info-accent" />
          <span className="text-xs text-zn-info-accent">Faylni ko'rish</span>
        </a>
      )}

      {ariza.status === 'pending' && (
        <div className="flex gap-2">
          <button
            onClick={() => onApprove(ariza.id)}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-zn-btn bg-zn-success-bg py-2.5 text-sm font-semibold text-zn-success-text"
          >
            <Check size={16} />
            Tasdiqlash
          </button>
          <button
            onClick={() => onReject(ariza.id)}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-zn-btn bg-zn-error-bg py-2.5 text-sm font-semibold text-zn-error-text"
          >
            <X size={16} />
            Rad etish
          </button>
        </div>
      )}
    </div>
  )
}

function BildirgiForm({
  allChildren,
  teacherId,
  onSubmit,
}: {
  allChildren: Child[]
  teacherId: string
  onSubmit: (data: {
    child_pupil_id: string
    author_id: string
    type: 'reprimand' | 'praise'
    reason: string
    image_url?: string
  }) => void
}) {
  const [childPupilId, setChildPupilId] = useState('')
  const [type, setType] = useState<'reprimand' | 'praise'>('praise')
  const [reason, setReason] = useState('')
  const [file, setFile] = useState<File | null>(null)

  useEffect(() => {
    if (allChildren.length > 0 && !childPupilId) {
      setChildPupilId(allChildren[0].pupil_id)
    }
  }, [allChildren, childPupilId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!childPupilId || !reason) return
    let image_url: string | undefined
    if (file) {
      try { image_url = (await uploadFile(file)) ?? undefined } catch { /* ignore */ }
    }
    onSubmit({ child_pupil_id: childPupilId, author_id: teacherId, type, reason, image_url })
    setReason('')
    setFile(null)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 px-4 py-4">
      <div>
        <label className="mb-1 block text-xs font-medium text-zn-text-muted">O'quvchi</label>
        <select
          value={childPupilId}
          onChange={(e) => setChildPupilId(e.target.value)}
          className="w-full rounded-zn-input bg-zn-elevated px-4 py-3 text-sm text-zn-text"
        >
          {allChildren.map((s) => (
            <option key={s.pupil_id} value={s.pupil_id}>{s.full_name} ({s.class_name})</option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-zn-text-muted">Tur</label>
        <div className="flex gap-3">
          {(['praise', 'reprimand'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-zn-btn border-2 py-2.5 text-sm font-semibold transition ${
                type === t
                  ? t === 'praise'
                    ? 'border-zn-success-text bg-zn-success-bg text-zn-success-text'
                    : 'border-zn-error-text bg-zn-error-bg text-zn-error-text'
                  : 'border-transparent bg-zn-elevated text-zn-text-muted'
              }`}
            >
              {t === 'praise' ? <Award size={16} /> : <AlertTriangle size={16} />}
              {t === 'praise' ? 'Taqsin' : 'Tanbeh'}
            </button>
          ))}
        </div>
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
        <label className="mb-1 block text-xs font-medium text-zn-text-muted">Rasm (ixtiyoriy)</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="w-full text-sm text-zn-text-muted file:mr-3 file:rounded-zn-btn file:border-0 file:bg-zn-surface file:px-4 file:py-2 file:text-sm file:text-zn-text"
        />
      </div>

      <Button type="submit" fullWidth>Bildirgi yuborish</Button>
    </form>
  )
}

function RoleLabel({ role }: { role: string }) {
  const labels: Record<string, string> = {
    sinf_rahbar: 'Sinf Rahbar',
    teacher: "O'qituvchi",
    director: 'Direktor',
    school: 'Maktab',
    pupil: "O'quvchi",
  }
  return <span className="text-xs text-zn-text-muted">{labels[role] || role}</span>
}

export default function TeacherDashboard({ onOpenChat }: { onOpenChat: () => void }) {
  const { user } = useAuth()
  const { arizas, moderate } = useTeacherArizas()
  const { children } = useAllChildren(user?.role === 'sinf_rahbar' ? user?.user_id : undefined)
  const { bildirgis, create: createBildirgi } = useBildirgis()
  const [tab, setTab] = useState<'home' | 'ariza' | 'chat' | 'profile'>('home')
  const [showBildirgiForm, setShowBildirgiForm] = useState(false)

  const pendingCount = arizas.filter((a) => a.status === 'pending').length

  const handleApprove = async (id: string) => {
    if (!user) return
    await moderate(id, 'approved', user.user_id)
  }

  const handleReject = async (id: string) => {
    if (!user) return
    await moderate(id, 'rejected', user.user_id)
  }

  const handleBildirgi = async (data: {
    child_pupil_id: string
    author_id: string
    type: 'reprimand' | 'praise'
    reason: string
    image_url?: string
  }) => {
    await createBildirgi(data)
    setShowBildirgiForm(false)
  }

  const childName = (childPupilId: string) => children.find((c) => c.pupil_id === childPupilId)?.full_name || childPupilId

  const content = () => {
    switch (tab) {
      case 'home':
        return (
          <>
            <div className="px-4 pt-4 pb-2">
              <p className="text-sm font-semibold text-zn-text">{user?.full_name}</p>
              <RoleLabel role={user?.role || ''} />
            </div>
            <div className="grid grid-cols-2 gap-3 px-4 pb-4 pt-2">
              <div className="rounded-zn-popover bg-zn-surface p-4">
                <ClipboardList size={20} className="mb-2 text-zn-warning-accent" />
                <p className="text-2xl font-bold text-zn-text">{pendingCount}</p>
                <p className="text-xs text-zn-text-muted">Kutilayotgan arizalar</p>
              </div>
              <div className="rounded-zn-popover bg-zn-surface p-4">
                <Award size={20} className="mb-2 text-zn-info-accent" />
                <p className="text-2xl font-bold text-zn-text">{children.length}</p>
                <p className="text-xs text-zn-text-muted">O'quvchilar</p>
              </div>
            </div>

            <div className="flex items-center justify-between px-4 py-2">
              <h3 className="font-sans text-sm font-semibold text-zn-text-muted uppercase tracking-wider">Sinf statistikasi</h3>
            </div>

            <div className="space-y-2 px-4 pb-6">
              <div className="flex items-center justify-between rounded-zn-input bg-zn-surface px-4 py-3">
                <span className="text-sm text-zn-text">Davomat (o'rtacha)</span>
                <span className="text-sm font-semibold text-zn-success-text">94%</span>
              </div>
              <div className="flex items-center justify-between rounded-zn-input bg-zn-surface px-4 py-3">
                <span className="text-sm text-zn-text">Shu oydagi bildirgilar</span>
                <span className="text-sm font-semibold text-zn-text">{bildirgis.length}</span>
              </div>
            </div>

            {bildirgis.length > 0 && (
              <>
                <div className="px-4 pb-2">
                  <h3 className="font-sans text-sm font-semibold text-zn-text-muted uppercase tracking-wider">Oxirgi yozuvlar</h3>
                </div>
                <div className="space-y-1 px-4 pb-6">
                  {bildirgis.slice(0, 20).map((b) => (
                    <div key={b.id} className="flex items-center gap-3 rounded-zn-input bg-zn-surface px-4 py-3">
                      {b.type === 'praise' ? (
                        <Award size={16} className="text-zn-success-text" />
                      ) : (
                        <AlertTriangle size={16} className="text-zn-error-text" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-zn-text">{b.reason}</p>
                        <p className="text-xs text-zn-text-muted">{childName(b.child_pupil_id)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )

      case 'ariza':
        return (
          <>
            <div className="flex items-center justify-between px-4 py-3">
              <h2 className="font-sans text-sm font-semibold text-zn-text-muted uppercase tracking-wider">Arizalarni boshqarish</h2>
              <button
                onClick={() => setShowBildirgiForm(!showBildirgiForm)}
                className="flex items-center gap-1 rounded-zn-btn bg-zn-surface px-3 py-1.5 text-xs font-medium text-zn-text"
              >
                <Plus size={14} />
                {showBildirgiForm ? 'Yopish' : 'Bildirgi'}
              </button>
            </div>

            {showBildirgiForm && user && (
              <BildirgiForm allChildren={children} teacherId={user.user_id} onSubmit={handleBildirgi} />
            )}

            <div className="space-y-3 px-4 pb-6">
              {arizas.length === 0 && (
                <p className="text-sm text-zn-text-faint text-center py-4">Arizalar mavjud emas</p>
              )}
              {arizas.map((a) => (
                <ArizaModerationCard
                  key={a.id}
                  ariza={a}
                  childName={childName(a.child_pupil_id)}
                  onApprove={handleApprove}
                  onReject={handleReject}
                />
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
      <Header title={user?.role === 'sinf_rahbar' ? 'Sinf Rahbar' : user?.role === 'director' ? 'Direktor' : "O'qituvchi"} onChat={onOpenChat} />
      <div className="flex-1 overflow-y-auto">{content()}</div>
      <NavBar active={tab} onNavigate={setTab} role="sinf_rahbar" />
    </Screen>
  )
}
