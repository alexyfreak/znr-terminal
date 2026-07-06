import { useTranslation } from 'react-i18next'
import { AnimatePresence, motion } from 'framer-motion'
import { NewShablonAction } from './NewShablonAction'
import { useSearchStore } from '@renderer/store/useSearchStore'

interface SearchResultsListProps {
  onSelect: (result: string) => void
}

export const SearchResultsList = ({ onSelect }: SearchResultsListProps) => {
  const { t } = useTranslation()
  const { query, results, recentSuggestions } = useSearchStore()

  const items = query.length > 0 ? results : recentSuggestions

  if (query.length === 0) return null

  return (
    <div className="rounded-b-2xl border border-t-0 border-[var(--hairline)] bg-[var(--surface)]">
      <NewShablonAction onSelect={() => onSelect('new-shablon')} />

      <AnimatePresence mode="popLayout">
        {results.length === 0 && (
          <motion.div
            key="no-results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="px-3 py-4 text-xs text-muted-foreground text-center"
          >
            {t('search.noResults')}
          </motion.div>
        )}

        {items.map((item, i) => (
          <motion.button
            key={`${item}-${i}`}
            layout
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15, delay: i * 0.02 }}
            onClick={() => onSelect(item)}
            className="flex w-full items-center px-3 py-2.5 text-xs text-muted-foreground transition-colors hover:bg-[var(--surface-hover)] hover:text-foreground text-left"
          >
            {item}
          </motion.button>
        ))}
      </AnimatePresence>
    </div>
  )
}
