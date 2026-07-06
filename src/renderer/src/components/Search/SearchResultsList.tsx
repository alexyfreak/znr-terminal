import { useTranslation } from 'react-i18next'
import { AnimatePresence, motion } from 'framer-motion'
import { NewShablonAction } from './NewShablonAction'
import { useSearchStore } from '@renderer/store/useSearchStore'

interface Template {
  type: string
  label: string
  description: string | null
  teacher_visible: boolean
  schema: { required: string[]; optional: string[] }
  template: string
  keywords: string[]
}

interface SearchResultsListProps {
  onSelect: (result: string) => void
  templates: Template[]
}

export const SearchResultsList = ({ onSelect, templates }: SearchResultsListProps) => {
  const { t } = useTranslation()
  const { query, results } = useSearchStore()

  return (
    <div className="rounded-b-2xl border border-t-0 border-[var(--hairline)] bg-[var(--surface)]">
      <NewShablonAction />

      <AnimatePresence mode="popLayout">
        {results.length === 0 && query.length > 0 && (
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

        {results.map((type, i) => {
          const tmpl = templates.find(t => t.type === type)
          return (
            <motion.button
              key={type}
              layout
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15, delay: i * 0.02 }}
              onClick={() => onSelect(type)}
              className="flex w-full flex-col px-3 py-2.5 text-left transition-colors hover:bg-[var(--surface-hover)]"
            >
              <span className="text-xs text-foreground font-medium">
                {tmpl?.label || type}
              </span>
              {tmpl?.description && (
                <span className="text-[11px] text-muted-foreground mt-0.5">
                  {tmpl.description}
                </span>
              )}
            </motion.button>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
