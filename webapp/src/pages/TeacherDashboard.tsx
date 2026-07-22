import { useState, useEffect } from 'react'
import {
  ClipboardList, Check, X, AlertTriangle, Award, Plus, Image,
  User as UserIcon, Clock, Send, BookOpen,
} from 'lucide-react'
import Button from '@/components/ui/Button'
import StatusBadge from '@/components/ui/StatusBadge'
import EmptyState from '@/components/ui/EmptyState'
import Avatar from '@/components/ui/Avatar'
import NoteGenerator from '@/components/NoteGenerator'
import { useAuth } from '@/hooks/useAuth'
import { useTeacherArizas, useAllChildren, useBildirgis, uploadFile } from '@/hooks/useData'
import type { ArizaRequest, Child } from '@/hooks/types'
import type { PageKey } from '@/components/ui/Sidebar'

function BildirgiForm({
  allChildren, teacherId, onSubmit, onCancel,
}: {
  allChildren: Child[]; teacherId: string
  onSubmit: (data: { child_pupil_id: string; author_id: string; type: 'reprimand' | 'praise'; reason: string; image_url?: string }) => void
  onCancel: () => void
}) {
  const [childPupilId, setChildPupilId] = useState('')
  const [type, setType] = useState<'reprimand' | 'praise'>('praise')
  const [reason, setReason] = useState('')
  const [file, setFile] = useState<File | null>(null)

  useEffect(() => {
    if (allChildren.length > 0 && !childPupilId) setChildPupilId(allChildren[0].pupil_id)
  }, [allChildren, childPupilId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!childPupilId || !reason) return
    let image_url: string | undefined
    if (file) { try { image_url = (await uploadFile(file)) ?? undefined } catch { /* ignore */ } }
    onSubmit({ child_pupil_id: childPupilId, author_id: teacherId, type, reason, image_url })
    setReason(''); setFile(null)
  }

  return (
    <form onSubmit={handleSubmit} className="animate-slideDown space-y-4 rounded-2xl border border-white/8 bg-white/4 p-4 mx-4 mb-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-zn-text">Yangi bildirgi</p>
        <button type="button" onClick={onCancel} className="rounded-full p-1 text-zn-text-faint hover:text-zn-text-muted">
          <X size={18} />
        </button>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-zn-text-muted">O'quvchi</label>
        <select value={childPupilId} onChange={(e) => setChildPupilId(e.target.value)}
          className="w-full rounded-xl border border-white/8 bg-white/4 px-3 py-2.5 text-sm text-zn-text">
          {allChildren.map((s) => (
            <option key={s.pupil_id} value={s.pupil_id}>{s.full_name} ({s.class_name})</option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-zn-text-muted">Tur</label>
        <div className="flex gap-3">
          {(['praise', 'reprimand'] as const).map((t) => (
            <button key={t} type="button" onClick={() => setType(t)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl border-2 py-2.5 text-sm font-semibold transition ${
                type === t
                  ? t === 'praise'
                    ? 'border-zn-success-text bg-green-500/10 text-zn-success-text'
                    : 'border-zn-error-text bg-red-500/10 text-zn-error-text'
                  : 'border-transparent bg-white/4 text-zn-text-muted'
              }`}>
              {t === 'praise' ? <Award size={16} /> : <AlertTriangle size={16} />}
              {t === 'praise' ? 'Taqsin' : 'Tanbeh'}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-zn-text-muted">Sabab</label>
        <textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Sababni yozing..." rows={3}
          className="w-full resize-none rounded-xl border border-white/8 bg-white/4 px-3 py-2.5 text-sm text-zn-text placeholder-zn-text-faint outline-none" required />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-zn-text-muted">Rasm (ixtiyoriy)</label>
        <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="w-full text-sm text-zn-text-muted file:mr-3 file:rounded-xl file:border-0 file:bg-white/8 file:px-4 file:py-2 file:text-sm file:text-zn-text file:cursor-pointer" />
      </div>
      <Button type="submit" fullWidth>Bildirgi yuborish</Button>
    </form>
  )
}

function ArizaModerationCard({ ariza, childName, onApprove, onReject }: {
  ariza: ArizaRequest; childName: string
  onApprove: (id: string) => void; onReject: (id: string) => void
}) {
  return (
    <div className="animate-slideUp rounded-2xl border border-white/6 bg-white/4 p-4">
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Avatar name={childName} size="sm" />
            <div>
              <p className="text-sm font-semibold text-zn-text">{childName}</p>
              <p className="text-xs text-zn-text-muted">{ariza.date_from} → {ariza.date_to}</p>
            </div>
          </div>
        </div>
        <StatusBadge status={ariza.status} />
      </div>
      <p className="mb-3 text-xs text-zn-text-faint ml-[42px]">{ariza.reason}</p>
      {ariza.file_url && (
        <a href={ariza.file_url} target="_blank" rel="noopener noreferrer"
          className="mb-3 flex items-center gap-2 rounded-xl bg-white/4 px-3 py-2 ml-[42px]">
          <Image size={14} className="text-zn-info-accent" />
          <span className="text-xs text-zn-info-accent">Faylni ko'rish</span>
        </a>
      )}
      {ariza.status === 'pending' && (
        <div className="flex gap-2 ml-[42px]">
          <button onClick={() => onApprove(ariza.id)}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-green-500/15 py-2.5 text-sm font-semibold text-zn-success-text transition-colors hover:bg-green-500/25">
            <Check size={16} /> Tasdiqlash
          </button>
          <button onClick={() => onReject(ariza.id)}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-red-500/15 py-2.5 text-sm font-semibold text-zn-error-text transition-colors hover:bg-red-500/25">
            <X size={16} /> Rad etish
          </button>
        </div>
      )}
    </div>
  )
}

export function TeacherHome({ onNavigate }: { onNavigate: (p: PageKey) => void }) {
  const { user } = useAuth()
  const { arizas } = useTeacherArizas()
  const { children: classChildren } = useAllChildren(user?.user_id)
  const { children: allChildren } = useAllChildren()
  const { bildirgis } = useBildirgis()

  const pendingCount = arizas.filter((a) => a.status === 'pending').length
  const thisMonthBildirgi = bildirgis.length
  const hasClass = classChildren.length > 0
  const uniqueClasses = hasClass ? [...new Set(classChildren.map((c) => c.class_name))] : []

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
          <div className="flex h-7 w-7 items-center justify-center rounded-full gradient-warning">
            <UserIcon size={14} className="text-black" />
          </div>
          <p className="text-xs font-medium text-zn-text-muted">{new Date().toLocaleDateString('uz-UZ', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        </div>
        <h1 className="text-xl font-bold text-zn-text">
          {greeting()}, {user?.full_name?.split(' ')[0]}
        </h1>
        <span className="text-xs text-zn-text-muted">O'qituvchi paneli</span>
      </div>

      <div className="grid grid-cols-3 gap-2 px-4 pb-4">
        <div className="animate-slideUp rounded-2xl bg-white/4 p-3">
          <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-xl bg-orange-500/10">
            <ClipboardList size={16} className="text-zn-warning-text" />
          </div>
          <p className={`text-xl font-bold ${pendingCount > 0 ? 'text-zn-warning-text' : 'text-zn-text'}`}>{pendingCount}</p>
          <p className="text-[11px] text-zn-text-muted">Kutilayotgan</p>
        </div>
        <div className="animate-slideUp animate-delay-100 rounded-2xl bg-white/4 p-3">
          <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/10">
            <Award size={16} className="text-zn-info-accent" />
          </div>
          <p className="text-xl font-bold text-zn-text">{hasClass ? classChildren.length : allChildren.length}</p>
          <p className="text-[11px] text-zn-text-muted">O'quvchilar</p>
        </div>
        <div className="animate-slideUp animate-delay-200 rounded-2xl bg-white/4 p-3">
          <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-xl bg-green-500/10">
            <Award size={16} className="text-zn-success-text" />
          </div>
          <p className="text-xl font-bold text-zn-text">{thisMonthBildirgi}</p>
          <p className="text-[11px] text-zn-text-muted">Bildirgilar</p>
        </div>
      </div>

      {hasClass && (
        <div className="px-4 pb-4">
          <h3 className="text-xs font-semibold text-zn-text-muted uppercase tracking-wider mb-2">Sinfim statistikasi</h3>
          <div className="grid grid-cols-2 gap-2">
            {uniqueClasses.map((cls) => {
              const count = classChildren.filter((c) => c.class_name === cls).length
              return (
                <div key={cls} className="rounded-2xl bg-white/4 p-3">
                  <BookOpen size={16} className="text-zn-info-accent mb-1" />
                  <p className="text-sm font-bold text-zn-text">{cls}</p>
                  <p className="text-xs text-zn-text-muted">{count} o'quvchi</p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2 px-4 pb-4">
        <button onClick={() => onNavigate('arizas')}
          className="flex items-center justify-center gap-2 rounded-2xl gradient-accent py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/15 transition-all hover:brightness-110">
          <Check size={16} />
          Arizalarni ko'rib chiqish
        </button>
        <button onClick={() => onNavigate('chat')}
          className="flex items-center justify-center gap-2 rounded-2xl bg-white/8 py-3 text-sm font-semibold text-zn-text transition-colors hover:bg-white/10">
          <Send size={16} className="text-zn-info-accent" />
          Xabar yozish
        </button>
      </div>

      <div className="px-4 pb-4">
        <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
          <NoteGenerator />
        </div>
      </div>

      <div className="px-4 pb-1">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-zn-text-muted uppercase tracking-wider">
            {pendingCount > 0 ? 'Kutilayotgan arizalar' : 'Oxirgi bildirgilar'}
          </h3>
          <span className="text-[11px] text-zn-text-faint">Bugun</span>
        </div>
      </div>

      <div className="space-y-1 px-4">
        {pendingCount > 0 ? (
          arizas.filter((a) => a.status === 'pending').slice(0, 3).map((a) => (
            <div key={a.id} className="animate-slideUp flex items-start gap-3 rounded-2xl bg-white/4 px-4 py-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-500/10">
                <ClipboardList size={14} className="text-zn-warning-text" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-zn-text">{a.reason}</p>
                <div className="mt-0.5 flex items-center gap-2">
                  <Clock size={10} className="text-zn-text-faint" />
                  <p className="text-[11px] text-zn-text-faint">{new Date(a.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              <StatusBadge status="pending" />
            </div>
          ))
        ) : (
          bildirgis.slice(0, 3).map((b) => (
            <div key={b.id} className="animate-slideUp flex items-start gap-3 rounded-2xl bg-white/4 px-4 py-3">
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                b.type === 'praise' ? 'bg-green-500/10' : 'bg-red-500/10'
              }`}>
                {b.type === 'praise' ? <Award size={14} className="text-zn-success-text" /> : <AlertTriangle size={14} className="text-zn-error-text" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-zn-text">{b.reason}</p>
                <p className="text-[11px] text-zn-text-faint mt-0.5">{new Date(b.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export function TeacherArizas() {
  const { user } = useAuth()
  const { arizas, moderate } = useTeacherArizas()
  const { children } = useAllChildren()
  const { bildirgis, create: createBildirgi } = useBildirgis()
  const [showBildirgiForm, setShowBildirgiForm] = useState(false)
  const [subtab, setSubtab] = useState<'arizas' | 'bildirgis' | 'documents'>('arizas')

  const handleApprove = async (id: string) => {
    if (!user) return
    await moderate(id, 'approved', user.user_id)
  }

  const handleReject = async (id: string) => {
    if (!user) return
    await moderate(id, 'rejected', user.user_id)
  }

  const handleBildirgi = async (data: {
    child_pupil_id: string; author_id: string; type: 'reprimand' | 'praise'; reason: string; image_url?: string
  }) => {
    await createBildirgi(data)
    setShowBildirgiForm(false)
  }

  const childName = (childPupilId: string) => children.find((c) => c.pupil_id === childPupilId)?.full_name || childPupilId

  const pendingCount = arizas.filter((a) => a.status === 'pending').length
  const approvedCount = arizas.filter((a) => a.status === 'approved').length
  const rejectedCount = arizas.filter((a) => a.status === 'rejected').length

  return (
    <div className="animate-fadeIn pb-6">
      <div className="px-4 pt-6 pb-3">
        <h1 className="text-lg font-bold text-zn-text">Arizalar va bildirgilar</h1>
      </div>

      <div className="flex gap-1.5 px-4 pb-3 overflow-x-auto no-scrollbar">
        <button onClick={() => setSubtab('arizas')}
          className={`shrink-0 rounded-xl px-3.5 py-1.5 text-xs font-medium transition-all ${
            subtab === 'arizas' ? 'bg-white/10 text-zn-text' : 'bg-white/4 text-zn-text-muted hover:bg-white/7'
          }`}>
          Arizalar
          {pendingCount > 0 && <span className="ml-1.5 rounded-full bg-zn-warning-bg px-1.5 py-0.5 text-[10px] text-zn-warning-text">{pendingCount}</span>}
        </button>
        <button onClick={() => setSubtab('bildirgis')}
          className={`shrink-0 rounded-xl px-3.5 py-1.5 text-xs font-medium transition-all ${
            subtab === 'bildirgis' ? 'bg-white/10 text-zn-text' : 'bg-white/4 text-zn-text-muted hover:bg-white/7'
          }`}>
          Bildirgilar
        </button>
        <button onClick={() => setSubtab('documents')}
          className={`shrink-0 rounded-xl px-3.5 py-1.5 text-xs font-medium transition-all ${
            subtab === 'documents' ? 'bg-white/10 text-zn-text' : 'bg-white/4 text-zn-text-muted hover:bg-white/7'
          }`}>
          Hujjatlar
        </button>
      </div>

      {subtab === 'arizas' && (
        <>
          <div className="grid grid-cols-3 gap-2 px-4 pb-4">
            <div className="rounded-2xl bg-white/4 p-2.5 text-center">
              <p className="text-lg font-bold text-zn-warning-text">{pendingCount}</p>
              <p className="text-[10px] text-zn-text-muted">Kutilmoqda</p>
            </div>
            <div className="rounded-2xl bg-white/4 p-2.5 text-center">
              <p className="text-lg font-bold text-zn-success-text">{approvedCount}</p>
              <p className="text-[10px] text-zn-text-muted">Tasdiqlangan</p>
            </div>
            <div className="rounded-2xl bg-white/4 p-2.5 text-center">
              <p className="text-lg font-bold text-zn-error-text">{rejectedCount}</p>
              <p className="text-[10px] text-zn-text-muted">Rad etilgan</p>
            </div>
          </div>
          <div className="space-y-2 px-4">
            {arizas.length === 0 && (
              <EmptyState
                icon={<ClipboardList size={28} />}
                title="Arizalar mavjud emas"
                description="Ota-onalar tomonidan yuborilgan arizalar bu yerda ko'rsatiladi"
              />
            )}
            {arizas.map((a) => (
              <ArizaModerationCard
                key={a.id} ariza={a}
                childName={childName(a.child_pupil_id)}
                onApprove={handleApprove} onReject={handleReject}
              />
            ))}
          </div>
        </>
      )}

      {subtab === 'bildirgis' && (
        <>
          <div className="px-4 pb-3">
            {!showBildirgiForm ? (
              <button onClick={() => setShowBildirgiForm(true)}
                className="flex w-full items-center justify-center gap-2 rounded-2xl gradient-accent py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/15 transition-all hover:brightness-110">
                <Plus size={16} />
                Yangi bildirgi yozish
              </button>
            ) : null}
          </div>
          {showBildirgiForm && user && (
            <BildirgiForm
              allChildren={children} teacherId={user.user_id}
              onSubmit={handleBildirgi} onCancel={() => setShowBildirgiForm(false)}
            />
          )}
          <div className="space-y-1 px-4">
            {bildirgis.length === 0 && (
              <EmptyState
                icon={<Award size={28} />}
                title="Bildirgilar mavjud emas"
                description="Yozilgan bildirgilar bu yerda ko'rsatiladi"
                action={{ label: 'Bildirgi yozish', onClick: () => setShowBildirgiForm(true) }}
              />
            )}
            {bildirgis.map((b) => (
              <div key={b.id} className="animate-slideUp flex items-start gap-3 rounded-2xl bg-white/4 px-4 py-3">
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                  b.type === 'praise' ? 'bg-green-500/10' : 'bg-red-500/10'
                }`}>
                  {b.type === 'praise' ? <Award size={14} className="text-zn-success-text" /> : <AlertTriangle size={14} className="text-zn-error-text" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-zn-text">{b.reason}</p>
                  <p className="text-xs text-zn-text-muted">{childName(b.child_pupil_id)}</p>
                  <p className="text-[11px] text-zn-text-faint">{new Date(b.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {subtab === 'documents' && (
        <div className="px-4">
          <NoteGenerator />
        </div>
      )}
    </div>
  )
}
