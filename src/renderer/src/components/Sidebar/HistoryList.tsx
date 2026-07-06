import { motion, AnimatePresence } from 'framer-motion'
import { useHistoryStore } from '@renderer/store/useHistoryStore'

interface HistoryListProps {
  isExpanded: boolean
}

export const HistoryList = ({ isExpanded }: HistoryListProps) => {
  const { items } = useHistoryStore()

  if (!isExpanded) return null

  return (
    <div className="flex-1 overflow-y-auto px-2.5 space-y-0.5">
      <AnimatePresence mode="popLayout">
        {items.length === 0 && (
          <p className="text-[11px] text-muted-foreground px-1.5 py-4 text-center">
            No history yet
          </p>
        )}
        {items.map((item) => (
          <motion.div
            key={item.id}
            layout
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.15 }}
            className="group flex items-center justify-between rounded-md px-2.5 py-2 text-xs text-muted-foreground transition-colors hover:bg-[var(--surface-hover)] hover:text-foreground cursor-pointer"
          >
            <div className="flex flex-col min-w-0">
              <span className="truncate">{item.title}</span>
              <span className="text-[10px] opacity-60">{item.date}</span>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
