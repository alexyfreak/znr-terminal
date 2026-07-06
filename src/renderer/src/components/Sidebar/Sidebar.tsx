import { useSidebarStore } from '@renderer/store/useSidebarStore'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Settings, User, Plus, Clock } from 'lucide-react'

const spring = { type: 'spring' as const, stiffness: 180, damping: 26 }

export const Sidebar = () => {
  const { t } = useTranslation()
  const { isExpanded, toggle } = useSidebarStore()

  return (
    <motion.aside
      layout
      animate={{ width: isExpanded ? 260 : 60 }}
      transition={spring}
      className="flex flex-col h-screen bg-[var(--sidebar)] border-r border-[var(--hairline)] overflow-hidden shrink-0"
    >
      <div className="flex items-center gap-2 px-5 h-14 border-b border-[var(--hairline)]">
        <button
          onClick={toggle}
          className="flex items-center justify-center w-[18px] h-[18px] text-warm shrink-0"
        >
          <span
            className="block w-[10px] h-[10px] border border-warm rotate-45"
            style={{ borderWidth: 1.5 }}
          />
        </button>
        {isExpanded && (
          <span className="text-xs font-medium tracking-[0.2em] text-warm uppercase whitespace-nowrap">
            Zunoora
          </span>
        )}
      </div>

      <div className="flex flex-col flex-1 min-h-0">
        <div className="px-2.5 pt-4 pb-2">
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
      </div>

      <div className="border-t border-[var(--hairline)] py-2 px-2.5 flex flex-col gap-0.5">
        <button className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-xs text-muted-foreground transition-colors hover:bg-[var(--surface-hover)] hover:text-foreground">
          <Plus className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
          {isExpanded && <span className="whitespace-nowrap">{t('sidebar.newChat')}</span>}
        </button>
        <button className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-xs text-muted-foreground transition-colors hover:bg-[var(--surface-hover)] hover:text-foreground">
          <Settings className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
          {isExpanded && <span className="whitespace-nowrap">{t('sidebar.settings')}</span>}
        </button>
        <button className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-xs text-muted-foreground transition-colors hover:bg-[var(--surface-hover)] hover:text-foreground">
          <User className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
          {isExpanded && <span className="whitespace-nowrap">{t('sidebar.account')}</span>}
        </button>
      </div>
    </motion.aside>
  )
}
