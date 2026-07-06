import { useEffect, useRef } from 'react'
import { useSidebarStore } from '@renderer/store/useSidebarStore'
import { useHistoryStore } from '@renderer/store/useHistoryStore'
import { useSearchStore } from '@renderer/store/useSearchStore'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Settings, User, Plus, Clock } from 'lucide-react'
import { HistoryList } from './HistoryList'

const spring = { type: 'spring' as const, stiffness: 180, damping: 26 }

const seedData = [
  { id: '1', title: 'Yillik Taqvim-Mavzu Reja', type: 'reja', date: '2m ago', docCount: 1 },
  { id: '2', title: 'Dars Ishlanmasi — 5-sinf', type: 'dars', date: '5h ago', docCount: 1 },
  { id: '3', title: 'Ochiq Dars Konspekti', type: 'konspekt', date: '1d ago', docCount: 2 },
]

interface SidebarProps {
  onSettingsOpen: () => void
  onAccountOpen: () => void
}

export const Sidebar = ({ onSettingsOpen, onAccountOpen }: SidebarProps) => {
  const { t } = useTranslation()
  const { isExpanded, toggle } = useSidebarStore()
  const { setItems, items } = useHistoryStore()
  const { clear, setDocked } = useSearchStore()
  const seeded = useRef(false)

  useEffect(() => {
    if (!seeded.current && items.length === 0) {
      setItems(seedData)
      seeded.current = true
    }
  }, [items, setItems])

  const handleNewChat = () => {
    clear()
    setDocked(false)
  }

  const handleHistorySelect = (title: string) => {
    clear()
    setDocked(true)
  }

  return (
    <motion.aside
      layout
      animate={{ width: isExpanded ? 260 : 60 }}
      transition={spring}
      className="flex flex-col h-screen bg-[var(--sidebar)] border-r border-[var(--hairline)] overflow-hidden shrink-0"
    >
      <div className="flex items-center gap-2.5 px-5 h-14 border-b border-[var(--hairline)] shrink-0">
        <button
          onClick={toggle}
          className="flex items-center justify-center w-4 h-4 text-warm shrink-0"
        >
          <motion.span
            animate={{ rotate: isExpanded ? 45 : 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="block w-[10px] h-[10px] border border-current"
            style={{ borderWidth: 1.5 }}
          />
        </button>
        {isExpanded && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-xs font-medium tracking-[0.2em] text-warm uppercase whitespace-nowrap"
          >
            Zunoora
          </motion.span>
        )}
      </div>

      <div className="flex flex-col flex-1 min-h-0">
        <div className="px-2.5 pt-4 pb-1 shrink-0">
          {isExpanded && (
            <p className="serif-italic text-[10px] tracking-[0.3em] text-muted-foreground mb-2 px-1.5">
              {t('sidebar.history')}
            </p>
          )}
          {!isExpanded && (
            <div className="flex justify-center py-2">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.5} />
            </div>
          )}
        </div>

        <HistoryList isExpanded={isExpanded} onSelect={handleHistorySelect} />
      </div>

      <div className="border-t border-[var(--hairline)] py-2 px-2.5 flex flex-col gap-0.5 shrink-0">
        <button
          onClick={handleNewChat}
          className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-xs text-muted-foreground transition-colors hover:bg-[var(--surface-hover)] hover:text-foreground"
        >
          <Plus className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
          {isExpanded && <span className="whitespace-nowrap">{t('sidebar.newChat')}</span>}
        </button>
        <button
          onClick={onSettingsOpen}
          className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-xs text-muted-foreground transition-colors hover:bg-[var(--surface-hover)] hover:text-foreground"
        >
          <Settings className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
          {isExpanded && <span className="whitespace-nowrap">{t('sidebar.settings')}</span>}
        </button>
        <button
          onClick={onAccountOpen}
          className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-xs text-muted-foreground transition-colors hover:bg-[var(--surface-hover)] hover:text-foreground"
        >
          <User className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
          {isExpanded && <span className="whitespace-nowrap">{t('sidebar.account')}</span>}
        </button>
      </div>
    </motion.aside>
  )
}
