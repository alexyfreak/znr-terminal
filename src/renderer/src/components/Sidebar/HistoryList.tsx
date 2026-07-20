import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, Undo2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useHistoryStore, type HistoryItem } from '@renderer/store/useHistoryStore'
import { useAccountStore } from '@renderer/store/useAccountStore'

interface HistoryListProps {
  isExpanded: boolean
  onSelect: (item: HistoryItem) => void
  sortOrder: 'newest' | 'oldest'
}

function getRelativeDate(isoString: string, t: (key: string, opts?: object) => string): string {
  const now = Date.now()
  const date = new Date(isoString).getTime()
  const diffMs = now - date
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)

  if (diffSec < 10) return t('sidebar.now')
  if (diffMin < 1) return t('sidebar.secondsAgo', { count: diffSec })
  if (diffMin < 60) return t('sidebar.minutesAgo', { count: diffMin })
  if (diffHour < 24) return t('sidebar.hoursAgo', { count: diffHour })
  if (diffDay === 1) return t('sidebar.yesterday')
  if (diffDay < 7) return t('sidebar.daysAgo', { count: diffDay })

  const d = new Date(isoString)
  const months = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyun', 'Iyul', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek']
  return `${d.getDate()} ${months[d.getMonth()]}`
}

export const HistoryList = ({ isExpanded, onSelect, sortOrder }: HistoryListProps) => {
  const { t } = useTranslation()
  const { items, removeItem, addItem } = useHistoryStore()
  const { isLoggedIn } = useAccountStore()
  const [undoMap, setUndoMap] = useState<Record<string, HistoryItem>>({})

  const sorted = useMemo(() => {
    const copy = [...items]
    copy.sort((a, b) => {
      const diff = new Date(b.date).getTime() - new Date(a.date).getTime()
      return sortOrder === 'newest' ? diff : -diff
    })
    return copy
  }, [items, sortOrder])

  const handleDelete = (item: HistoryItem) => {
    removeItem(item.id)
    setUndoMap(prev => ({ ...prev, [item.id]: item }))
    setTimeout(() => {
      setUndoMap(prev => {
        const next = { ...prev }
        delete next[item.id]
        return next
      })
    }, 4000)
  }

  const handleUndo = (item: HistoryItem) => {
    addItem(item)
    setUndoMap(prev => {
      const next = { ...prev }
      delete next[item.id]
      return next
    })
  }

  if (!isExpanded) return null

  return (
    <div className="flex-1 overflow-y-auto px-2 space-y-0.5">
      <AnimatePresence mode="popLayout">
        {sorted.length === 0 && (
          <p className="text-[11px] text-zn-text-muted px-1.5 py-4 text-center">
            {isLoggedIn ? t('sidebar.noHistory') : t('sidebar.noHistoryLogin')}
          </p>
        )}
        {sorted.map((item) => (
          <motion.div
            key={item.id}
            layout
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="group flex items-center justify-between rounded-zn-input px-3 py-2 text-xs text-zn-text-muted transition-all hover:bg-zn-elevated hover:text-zn-text cursor-pointer active:scale-[0.99]"
          >
            <div
              className="flex flex-col min-w-0 flex-1"
              onClick={() => onSelect(item)}
            >
              <span className="truncate font-medium">{item.title}</span>
              <span className="text-[10px] text-zn-text-faint">{getRelativeDate(item.date, t)}</span>
            </div>
            {undoMap[item.id] ? (
              <button
                onClick={(e) => { e.stopPropagation(); handleUndo(item) }}
                className="shrink-0 ml-2 p-1 rounded-full text-zn-text-muted hover:bg-zn-elevated transition-colors"
                title={t('sidebar.undo')}
              >
                <Undo2 className="h-3 w-3" strokeWidth={1.5} />
              </button>
            ) : (
              <button
                onClick={(e) => { e.stopPropagation(); handleDelete(item) }}
                className="shrink-0 ml-2 p-1 rounded-full opacity-0 group-hover:opacity-100 text-zn-text-faint hover:text-zn-error-text hover:bg-zn-error-bg/30 transition-all"
                title={t('sidebar.delete')}
              >
                <Trash2 className="h-3 w-3" strokeWidth={1.5} />
              </button>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
