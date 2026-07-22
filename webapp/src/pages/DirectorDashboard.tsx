import { useState, useEffect } from 'react'
import {
  Users, School, ClipboardList, Award, AlertTriangle, User as UserIcon,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useTeacherArizas, useAllChildren, useAllBildirgis } from '@/hooks/useData'
import Avatar from '@/components/ui/Avatar'
import StatusBadge from '@/components/ui/StatusBadge'
import EmptyState from '@/components/ui/EmptyState'
import NoteGenerator from '@/components/NoteGenerator'
import type { ArizaRequest } from '@/hooks/types'
import type { PageKey } from '@/components/ui/Sidebar'

function ArizaModerationCard({
  ariza, childName, onApprove, onReject,
}: {
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
      {ariza.status === 'pending' && (
        <div className="flex gap-2 ml-[42px]">
          <button onClick={() => onApprove(ariza.id)}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-green-500/15 py-2.5 text-sm font-semibold text-zn-success-text transition-colors hover:bg-green-500/25">
            Tasdiqlash
          </button>
          <button onClick={() => onReject(ariza.id)}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-red-500/15 py-2.5 text-sm font-semibold text-zn-error-text transition-colors hover:bg-red-500/25">
            Rad etish
          </button>
        </div>
      )}
    </div>
  )
}

export default function DirectorDashboard({ onNavigate: _onNavigate }: { onNavigate: (p: PageKey) => void }) {
  const { user } = useAuth()
  const { arizas, moderate } = useTeacherArizas()
  const { children } = useAllChildren()
  const { bildirgis } = useAllBildirgis()
  const [tab, setTab] = useState<'overview' | 'arizas' | 'documents'>('overview')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // director data fetch could go here
    }
  }, [])

  const pendingCount = arizas.filter((a) => a.status === 'pending').length
  const praises = bildirgis.filter((b) => b.type === 'praise').length
  const reprimands = bildirgis.filter((b) => b.type === 'reprimand').length
  const classList = [...new Set(children.map((c) => c.class_name))]

  const getChildName = (childPupilId: string) =>
    children.find((c) => c.pupil_id === childPupilId)?.full_name || childPupilId

  const handleApprove = async (id: string) => {
    if (!user) return
    await moderate(id, 'approved', user.user_id)
  }

  const handleReject = async (id: string) => {
    if (!user) return
    await moderate(id, 'rejected', user.user_id)
  }

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
        <span className="text-xs text-zn-text-muted">Direktor paneli</span>
      </div>

      <div className="flex gap-1.5 px-4 pb-3 overflow-x-auto no-scrollbar">
        {(['overview', 'arizas', 'documents'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`shrink-0 rounded-xl px-3.5 py-1.5 text-xs font-medium transition-all ${
              tab === t ? 'bg-white/10 text-zn-text' : 'bg-white/4 text-zn-text-muted hover:bg-white/7'
            }`}>
            {t === 'overview' ? 'Umumiy' : t === 'arizas' ? 'Arizalar' : 'Hujjatlar'}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <>
          <div className="grid grid-cols-2 gap-2 px-4 pb-4">
            <div className="animate-slideUp rounded-2xl bg-white/4 p-3">
              <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/10">
                <Users size={16} className="text-zn-info-accent" />
              </div>
              <p className="text-xl font-bold text-zn-text">{children.length}</p>
              <p className="text-[11px] text-zn-text-muted">O'quvchilar</p>
            </div>
            <div className="animate-slideUp animate-delay-100 rounded-2xl bg-white/4 p-3">
              <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-xl bg-orange-500/10">
                <School size={16} className="text-zn-warning-text" />
              </div>
              <p className="text-xl font-bold text-zn-text">{classList.length}</p>
              <p className="text-[11px] text-zn-text-muted">Sinf xonalari</p>
            </div>
            <div className="animate-slideUp animate-delay-200 rounded-2xl bg-white/4 p-3">
              <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-xl bg-green-500/10">
                <Award size={16} className="text-zn-success-text" />
              </div>
              <p className="text-xl font-bold text-zn-text">{praises}</p>
              <p className="text-[11px] text-zn-text-muted">Taqsinlar</p>
            </div>
            <div className="animate-slideUp animate-delay-300 rounded-2xl bg-white/4 p-3">
              <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-xl bg-red-500/10">
                <AlertTriangle size={16} className="text-zn-error-text" />
              </div>
              <p className="text-xl font-bold text-zn-text">{reprimands}</p>
              <p className="text-[11px] text-zn-text-muted">Tanbehlar</p>
            </div>
          </div>

          <div className="px-4 pb-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold text-zn-text-muted uppercase tracking-wider">Sinflar ro'yxati</h3>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {classList.slice(0, 6).map((cls) => {
                const count = children.filter((c) => c.class_name === cls).length
                return (
                  <div key={cls} className="rounded-2xl bg-white/4 p-3">
                    <p className="text-sm font-bold text-zn-text">{cls}</p>
                    <p className="text-xs text-zn-text-muted">{count} o'quvchi</p>
                  </div>
                )
              })}
            </div>
          </div>

          {pendingCount > 0 && (
            <div className="px-4">
              <button onClick={() => setTab('arizas')}
                className="flex w-full items-center justify-center gap-2 rounded-2xl gradient-accent py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/15 transition-all hover:brightness-110">
                <ClipboardList size={16} />
                Kutilayotgan arizalar ({pendingCount})
              </button>
            </div>
          )}
        </>
      )}

      {tab === 'arizas' && (
        <div className="space-y-2 px-4">
          {arizas.length === 0 && (
            <EmptyState
              icon={<ClipboardList size={28} />}
              title="Arizalar mavjud emas"
              description="Barcha arizalar tasdiqlangan yoki rad etilgan"
            />
          )}
          {arizas.map((a) => (
            <ArizaModerationCard
              key={a.id}
              ariza={a}
              childName={getChildName(a.child_pupil_id)}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          ))}
        </div>
      )}

      {tab === 'documents' && (
        <div className="px-4">
          <NoteGenerator />
        </div>
      )}
    </div>
  )
}
