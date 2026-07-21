import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import {
  LayoutDashboard, Database, FileText, Settings, LogOut, Bug, AlertCircle,
} from 'lucide-react'
import { useAccountStore } from '@renderer/store/useAccountStore'

type AdminView = 'dashboard' | 'database' | 'reports' | 'settings'

interface AdminSidebarProps {
  currentView: AdminView
  onNavigate: (view: AdminView) => void
}

const items: { view: AdminView; icon: typeof LayoutDashboard; labelKey: string }[] = [
  { view: 'dashboard', icon: LayoutDashboard, labelKey: 'admin.dashboard' },
  { view: 'database', icon: Database, labelKey: 'admin.database' },
  { view: 'reports', icon: FileText, labelKey: 'admin.reports' },
  { view: 'settings', icon: Settings, labelKey: 'admin.settings' },
]

export const AdminSidebar = ({ currentView, onNavigate }: AdminSidebarProps) => {
  const { t } = useTranslation()
  const logout = useAccountStore((s) => s.logout)
  const [confirmLogout, setConfirmLogout] = useState(false)

  const handleLogout = () => {
    logout()
    setConfirmLogout(false)
  }

  return (
    <aside className="flex flex-col w-56 h-full bg-zn-surface border-r border-zn-border shrink-0 select-none">
      <div className="flex items-center px-5 h-14 border-b border-zn-border shrink-0">
        <span className="label-uppercase tracking-[0.25em] text-sm">Zunoora</span>
        <span className="ml-2 text-[9px] px-1.5 py-0.5 rounded-full bg-zn-elevated text-zn-text-faint font-medium uppercase">
          Admin
        </span>
      </div>

      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {items.map(({ view, icon: Icon, labelKey }) => (
          <button
            key={view}
            onClick={() => onNavigate(view)}
            className={`flex w-full items-center gap-3 px-3 py-2.5 text-xs rounded-zn-btn transition-all active:scale-[0.98] ${
              currentView === view
                ? 'bg-zn-elevated text-zn-text font-medium'
                : 'text-zn-text-muted hover:text-zn-text hover:bg-zn-elevated/50'
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" strokeWidth={1.5} />
            <span>{t(labelKey)}</span>
          </button>
        ))}
      </nav>

      <div className="border-t border-zn-border px-2 py-2 space-y-0.5">
        {confirmLogout ? (
          <div className="px-3 py-2 space-y-2">
            <p className="text-[10px] text-zn-text-muted flex items-center gap-1.5">
              <AlertCircle className="h-3 w-3 shrink-0" strokeWidth={1.5} />
              {t('account.confirmLogout')}
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleLogout}
                className="flex-1 px-2 py-1.5 text-[10px] font-medium rounded-zn-btn bg-zn-text text-zn-page hover:opacity-90 transition-all"
              >
                {t('account.logout')}
              </button>
              <button
                onClick={() => setConfirmLogout(false)}
                className="flex-1 px-2 py-1.5 text-[10px] rounded-zn-btn text-zn-text-muted hover:text-zn-text hover:bg-zn-elevated/50 transition-all"
              >
                {t('common.cancel')}
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setConfirmLogout(true)}
            className="flex w-full items-center gap-3 px-3 py-2.5 text-xs rounded-zn-btn text-zn-text-muted hover:text-zn-text hover:bg-zn-elevated/50 transition-all active:scale-[0.98]"
          >
            <LogOut className="h-4 w-4 shrink-0" strokeWidth={1.5} />
            <span>{t('account.logout')}</span>
          </button>
        )}
      </div>
    </aside>
  )
}
