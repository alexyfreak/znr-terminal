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
import type { ArizaRequest, BildirgiType } from '@/hooks/types'

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
      <p className="mb-3 text-xs text-zn-text-faint">{ariza.reason_text}</p>

      {ariza.doctor_paper_url && (
        <a
          href={ariza.doctor_paper_url}
          target="_blank"
          rel="noopener noreferrer"
          className="mb-3 flex items-center gap-2 rounded-zn-input bg-zn-elevated px-3 py-2"
        >
          <Image size={16} className="text-zn-info-accent" />
          <span className="text-xs text-zn-info-accent">View doctor paper</span>
        </a>
      )}

      {ariza.status === 'pending' && (
        <div className="flex gap-2">
          <button
            onClick={() => onApprove(ariza.id)}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-zn-btn bg-zn-success-bg py-2.5 text-sm font-semibold text-zn-success-text"
          >
            <Check size={16} />
            Approve
          </button>
          <button
            onClick={() => onReject(ariza.id)}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-zn-btn bg-zn-error-bg py-2.5 text-sm font-semibold text-zn-error-text"
          >
            <X size={16} />
            Reject
          </button>
        </div>
      )}
    </div>
  )
}

function BildirgiForm({
  onSubmit,
}: {
  onSubmit: (data: {
    student_id: string
    teacher_id: string
    type: BildirgiType
    title: string
    description?: string
    image_url?: string
  }) => void
}) {
  const { children: allStudents } = useAllChildren()
  const [studentId, setStudentId] = useState('')
  const [type, setType] = useState<BildirgiType>('praise')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [file, setFile] = useState<File | null>(null)

  useEffect(() => {
    if (allStudents.length > 0 && !studentId) {
      setStudentId(allStudents[0].id)
    }
  }, [allStudents, studentId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!studentId || !title) return
    let image_url: string | undefined
    if (file) {
      try { image_url = (await uploadFile(file)) ?? undefined } catch { /* ignore */ }
    }
    onSubmit({ student_id: studentId, teacher_id: '', type, title, description, image_url })
    setTitle('')
    setDescription('')
    setFile(null)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 px-4 py-4">
      <div>
        <label className="mb-1 block text-xs font-medium text-zn-text-muted">Student</label>
        <select
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
          className="w-full rounded-zn-input bg-zn-elevated px-4 py-3 text-sm text-zn-text"
        >
          {allStudents.map((s) => (
            <option key={s.id} value={s.id}>{s.full_name} ({s.class_name})</option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-zn-text-muted">Type</label>
        <div className="flex gap-3">
          {(['praise', 'violation'] as const).map((t) => (
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
              {t === 'praise' ? 'Praise' : 'Violation'}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-zn-text-muted">Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Excellent participation"
          className="w-full rounded-zn-input bg-zn-elevated px-4 py-3 text-sm text-zn-text placeholder-zn-text-faint"
          required
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-zn-text-muted">Description (optional)</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Details..."
          rows={2}
          className="w-full resize-none rounded-zn-input bg-zn-elevated px-4 py-3 text-sm text-zn-text placeholder-zn-text-faint"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-zn-text-muted">Photo (optional)</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="w-full text-sm text-zn-text-muted file:mr-3 file:rounded-zn-btn file:border-0 file:bg-zn-surface file:px-4 file:py-2 file:text-sm file:text-zn-text"
        />
      </div>

      <Button type="submit" fullWidth>Submit Bildirgi</Button>
    </form>
  )
}

export default function TeacherDashboard({ onOpenChat }: { onOpenChat: () => void }) {
  const { user } = useAuth()
  const { arizas, moderate } = useTeacherArizas()
  const { children } = useAllChildren()
  const { bildirgis, create: createBildirgi } = useBildirgis()
  const [tab, setTab] = useState<'home' | 'ariza' | 'chat' | 'profile'>('home')
  const [showBildirgiForm, setShowBildirgiForm] = useState(false)
  const [localBildirgis, setLocalBildirgis] = useState<{ id: string; studentName: string; type: string; title: string }[]>([])

  const pendingCount = arizas.filter((a) => a.status === 'pending').length

  const handleApprove = async (id: string) => {
    if (!user) return
    await moderate(id, 'approved', user.id)
  }

  const handleReject = async (id: string) => {
    if (!user) return
    await moderate(id, 'rejected', user.id)
  }

  const handleBildirgi = async (data: {
    student_id: string
    teacher_id: string
    type: BildirgiType
    title: string
    description?: string
    image_url?: string
  }) => {
    if (!user) return
    const result = await createBildirgi({ ...data, teacher_id: user.id })
    if (result.data) {
      const student = children.find((s) => s.id === data.student_id)
      setLocalBildirgis((prev) => [{
        id: result.data!.id,
        studentName: student?.full_name || 'Unknown',
        type: data.type,
        title: data.title,
      }, ...prev])
    }
    setShowBildirgiForm(false)
  }

  const childName = (childId: string) => children.find((c) => c.id === childId)?.full_name || 'Unknown'

  const content = () => {
    switch (tab) {
      case 'home':
        return (
          <>
            <div className="grid grid-cols-2 gap-3 px-4 pb-4 pt-4">
              <div className="rounded-zn-popover bg-zn-surface p-4">
                <ClipboardList size={20} className="mb-2 text-zn-warning-accent" />
                <p className="text-2xl font-bold text-zn-text">{pendingCount}</p>
                <p className="text-xs text-zn-text-muted">Pending Arizas</p>
              </div>
              <div className="rounded-zn-popover bg-zn-surface p-4">
                <Award size={20} className="mb-2 text-zn-info-accent" />
                <p className="text-2xl font-bold text-zn-text">{children.length}</p>
                <p className="text-xs text-zn-text-muted">Students</p>
              </div>
            </div>

            <div className="flex items-center justify-between px-4 py-2">
              <h3 className="font-sans text-sm font-semibold text-zn-text-muted uppercase tracking-wider">Class Stats</h3>
            </div>

            <div className="space-y-2 px-4 pb-6">
              <div className="flex items-center justify-between rounded-zn-input bg-zn-surface px-4 py-3">
                <span className="text-sm text-zn-text">Attendance (avg)</span>
                <span className="text-sm font-semibold text-zn-success-text">94%</span>
              </div>
              <div className="flex items-center justify-between rounded-zn-input bg-zn-surface px-4 py-3">
                <span className="text-sm text-zn-text">Bildirgi this month</span>
                <span className="text-sm font-semibold text-zn-text">{bildirgis.length + localBildirgis.length}</span>
              </div>
            </div>

            {(localBildirgis.length > 0 || bildirgis.length > 0) && (
              <>
                <div className="px-4 pb-2">
                  <h3 className="font-sans text-sm font-semibold text-zn-text-muted uppercase tracking-wider">Recent Entries</h3>
                </div>
                <div className="space-y-1 px-4 pb-6">
                  {[...localBildirgis, ...bildirgis.slice(0, 10).map((b) => ({
                    id: b.id,
                    studentName: childName(b.student_id),
                    type: b.type,
                    title: b.title,
                  }))].slice(0, 20).map((b) => (
                    <div key={b.id} className="flex items-center gap-3 rounded-zn-input bg-zn-surface px-4 py-3">
                      {b.type === 'praise' ? (
                        <Award size={16} className="text-zn-success-text" />
                      ) : (
                        <AlertTriangle size={16} className="text-zn-error-text" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-zn-text">{b.title}</p>
                        <p className="text-xs text-zn-text-muted">{b.studentName}</p>
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
              <h2 className="font-sans text-sm font-semibold text-zn-text-muted uppercase tracking-wider">Ariza Moderation</h2>
              <button
                onClick={() => setShowBildirgiForm(!showBildirgiForm)}
                className="flex items-center gap-1 rounded-zn-btn bg-zn-surface px-3 py-1.5 text-xs font-medium text-zn-text"
              >
                <Plus size={14} />
                {showBildirgiForm ? 'Close' : 'Bildirgi'}
              </button>
            </div>

            {showBildirgiForm && <BildirgiForm onSubmit={handleBildirgi} />}

            <div className="space-y-3 px-4 pb-6">
              {arizas.length === 0 && (
                <p className="text-sm text-zn-text-faint text-center py-4">No ariza requests</p>
              )}
              {arizas.map((a) => (
                <ArizaModerationCard
                  key={a.id}
                  ariza={a}
                  childName={childName(a.child_id)}
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
            <p className="text-sm text-zn-text-muted">Profile settings</p>
          </div>
        )
    }
  }

  return (
    <Screen>
      <Header title="Sinf Rahbar" onChat={onOpenChat} />
      <div className="flex-1 overflow-y-auto">{content()}</div>
      <NavBar active={tab} onNavigate={setTab} role="sinf_rahbar" />
    </Screen>
  )
}
