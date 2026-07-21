import { useSidebarStore } from '@renderer/store/useSidebarStore'
import { useHistoryStore } from '@renderer/store/useHistoryStore'
import { useSearchStore } from '@renderer/store/useSearchStore'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Settings, User, Plus, Clock, ArrowUpDown, PanelLeftClose, PanelLeft, Bug, Diamond, Zap, Shield } from 'lucide-react'
import { HistoryList } from './HistoryList'
import { useBugReportStore } from '@renderer/store/useBugReportStore'
import { useCreditsStore } from '@renderer/store/useCreditsStore'
import type { HistoryItem } from '@renderer/store/useHistoryStore'

const spring = { type: 'spring' as const, stiffness: 200, damping: 28 }

interface SidebarProps {
  onSettingsOpen: () => void
  onAdminOpen: () => void
  onAccountOpen: () => void
  onHistorySelect: (item: HistoryItem) => void
  onPricingOpen?: () => void
  onBuyCreditsOpen?: () => void
}

export const Sidebar = ({ onSettingsOpen, onAdminOpen, onAccountOpen, onHistorySelect, onPricingOpen, onBuyCreditsOpen }: SidebarProps) => {
  const { t } = useTranslation()
  const { isExpanded, toggle } = useSidebarStore()
  const { items, sortOrder, setSortOrder } = useHistoryStore()
  const { clear, setDocked } = useSearchStore()
  const { balance, tier } = useCreditsStore()

  const handleNewChat = () => {
    clear()
    setDocked(false)
  }

  return (
    <motion.aside
      layout
      animate={{ width: isExpanded ? 260 : 60 }}
      transition={spring}
      className="flex flex-col h-screen bg-zn-page border-r border-zn-border overflow-hidden shrink-0 select-none"
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 h-14 border-b border-zn-border shrink-0">
        <button
          onClick={toggle}
          className="grid h-7 w-7 place-items-center rounded-full text-zn-text-muted hover:text-zn-text hover:bg-zn-elevated transition-all active:scale-90"
          title={isExpanded ? t('sidebar.collapse') : t('sidebar.expand')}
        >
          {isExpanded ? <PanelLeftClose className="h-4 w-4" strokeWidth={1.5} /> : <PanelLeft className="h-4 w-4" strokeWidth={1.5} />}
        </button>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 flex-1 min-w-0"
          >
            <span className="label-uppercase tracking-[0.25em]">Zunoora</span>
            <div className="flex-1" />
            <button
              onClick={onBuyCreditsOpen}
              className="flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-medium text-zn-text-muted hover:text-zn-text hover:bg-zn-elevated transition-all"
            >
              <Zap className="h-3 w-3 text-yellow-400" strokeWidth={2} />
              {balance}
            </button>
            <button
              onClick={onPricingOpen}
              className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium transition-all hover:opacity-80 ${
                tier !== 'free'
                  ? 'bg-yellow-400/10 text-yellow-400'
                  : 'bg-zn-elevated text-zn-text-faint hover:text-zn-text hover:bg-zn-elevated/70'
              }`}
            >
              {tier === 'free' ? 'Free' : tier === 'pro' ? 'Pro' : 'Enterprise'}
            </button>
          </motion.div>
        )}
      </div>

      {/* History section */}
      <div className="flex flex-col flex-1 min-h-0">
        <div className="px-3 pt-4 pb-1 shrink-0">
          {isExpanded && (
            <div className="flex items-center justify-between mb-2 px-1.5">
              <p className="label-uppercase">{t('sidebar.history')}</p>
              <button
                onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
                className="flex items-center gap-1 text-[10px] text-zn-text-muted hover:text-zn-text transition-colors"
              >
                <ArrowUpDown className="h-3 w-3" strokeWidth={1.5} />
                {sortOrder === 'newest' ? t('sidebar.newest') : t('sidebar.oldest')}
              </button>
            </div>
          )}
          {!isExpanded && (
            <div className="flex justify-center py-2">
              <Clock className="h-3.5 w-3.5 text-zn-text-muted" strokeWidth={1.5} />
            </div>
          )}
        </div>

        <HistoryList isExpanded={isExpanded} onSelect={onHistorySelect} sortOrder={sortOrder} />
      </div>

      {/* Bottom actions */}
      <div className="border-t border-zn-border py-2 px-2 flex flex-col gap-0.5 shrink-0">
        <button
          onClick={handleNewChat}
          title={`${t('sidebar.newChat')} (Ctrl+N)`}
          className="flex w-full items-center gap-2.5 rounded-zn-btn px-3 py-2 text-xs text-zn-text-muted transition-all hover:bg-zn-elevated hover:text-zn-text active:scale-[0.98]"
        >
          <Plus className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
          {isExpanded && (
            <span className="flex-1 whitespace-nowrap flex items-center justify-between">
              <span>{t('sidebar.newChat')}</span>
              <span className="text-[9px] text-zn-text-faint font-mono">Ctrl+N</span>
            </span>
          )}
        </button>
        <button
          onClick={onSettingsOpen}
          title={t('sidebar.settings')}
          className="flex w-full items-center gap-2.5 rounded-zn-btn px-3 py-2 text-xs text-zn-text-muted transition-all hover:bg-zn-elevated hover:text-zn-text active:scale-[0.98]"
        >
          <Settings className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
          {isExpanded && <span className="whitespace-nowrap">{t('sidebar.settings')}</span>}
        </button>
        <button
          onClick={onAccountOpen}
          title={t('sidebar.account')}
          className="flex w-full items-center gap-2.5 rounded-zn-btn px-3 py-2 text-xs text-zn-text-muted transition-all hover:bg-zn-elevated hover:text-zn-text active:scale-[0.98]"
        >
          <User className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
          {isExpanded && <span className="whitespace-nowrap">{t('sidebar.account')}</span>}
        </button>
        <button
          onClick={onAdminOpen}
          title={t('admin.title')}
          className="flex w-full items-center gap-2.5 rounded-zn-btn px-3 py-2 text-xs text-zn-text-faint transition-all hover:bg-zn-elevated hover:text-zn-text active:scale-[0.98]"
        >
          <Shield className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
          {isExpanded && <span className="whitespace-nowrap">{t('admin.title')}</span>}
        </button>
        <div className="border-t border-zn-border my-1 mx-2" />
        <button
          onClick={() => useBugReportStore.getState().open('manual')}
          title={t('bugReport.reportBug')}
          className="flex w-full items-center gap-2.5 rounded-zn-btn px-3 py-2 text-xs text-zn-text-faint transition-all hover:bg-zn-elevated hover:text-zn-text-muted active:scale-[0.98]"
        >
          <Bug className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
          {isExpanded && <span className="whitespace-nowrap">{t('bugReport.reportBug')}</span>}
        </button>
      </div>
    </motion.aside>
  )
}
