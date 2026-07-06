import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, Undo2 } from 'lucide-react'
import { useHistoryStore, type HistoryItem } from '@renderer/store/useHistoryStore'
import { useAccountStore } from '@renderer/store/useAccountStore'

interface HistoryListProps {
  isExpanded: boolean
  onSelect: (item: HistoryItem) => void
  sortOrder: 'newest' | 'oldest'
}

function getRelativeDate(isoString: string): string {
  const now = Date.now()
  const date = new Date(isoString).getTime()
  const diffMs = now - date
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)

  if (diffSec < 10) return 'Hozir'
  if (diffMin < 1) return `${diffSec} soniya oldin`
  if (diffMin < 60) return `${diffMin} min oldin`
  if (diffHour < 24) return `${diffHour} soat oldin`
  if (diffDay === 1) return 'Kecha'
  if (diffDay < 7) return `${diffDay} kun oldin`

  const d = new Date(isoString)
  const months = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyun', 'Iyul', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek']
  return `${d.getDate()} ${months[d.getMonth()]}`
}

export const HistoryList = ({ isExpanded, onSelect, sortOrder }: HistoryListProps) => {
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
    <div className="flex-1 overflow-y-auto px-2.5 space-y-0.5">
      <AnimatePresence mode="popLayout">
        {sorted.length === 0 && (
          <p className="text-[11px] text-muted-foreground px-1.5 py-4 text-center">
            {isLoggedIn ? 'Hali tarix yo\'q' : 'Tarixni ko\'rish uchun tizimga kiring'}
          </p>
        )}
        {sorted.map((item) => (
          <motion.div
            key={item.id}
            layout
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            transition={{ duration: 0.15 }}
            className="group flex items-center justify-between rounded-md px-2.5 py-2 text-xs text-muted-foreground transition-colors hover:bg-[var(--surface-hover)] hover:text-foreground cursor-pointer"
          >
            <div
              className="flex flex-col min-w-0 flex-1"
              onClick={() => onSelect(item)}
            >
              <span className="truncate">{item.title}</span>
              <span className="text-[10px] opacity-60">{getRelativeDate(item.date)}</span>
            </div>
            {undoMap[item.id] ? (
              <button
                onClick={(e) => { e.stopPropagation(); handleUndo(item) }}
                className="shrink-0 ml-2 p-1 rounded text-warm hover:bg-warm/10 transition-colors"
                title="Bekor qilish"
              >
                <Undo2 className="h-3 w-3" strokeWidth={1.5} />
              </button>
            ) : (
              <button
                onClick={(e) => { e.stopPropagation(); handleDelete(item) }}
                className="shrink-0 ml-2 p-1 rounded opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                title="O'chirish"
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
