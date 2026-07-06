import { useEffect, useRef, useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AnimatePresence, motion } from 'framer-motion'
import { Search, Loader2 } from 'lucide-react'
import { useSearchStore } from '@renderer/store/useSearchStore'
import { useSidebarStore } from '@renderer/store/useSidebarStore'
import { SearchResultsList } from './SearchResultsList'

interface Template {
  type: string
  label: string
  description: string | null
  teacher_visible: boolean
  schema: { required: string[]; optional: string[] }
  template: string
  keywords: string[]
}

interface SpotlightSearchBarProps {
  onSelect: (result: string) => void
  templates: Template[]
  templatesLoading?: boolean
}

const DEBOUNCE_MS = 180

export const SpotlightSearchBar = ({ onSelect, templates, templatesLoading = false }: SpotlightSearchBarProps) => {
  const { t } = useTranslation()
  const { query, setQuery, isFocused, setFocused, setResults, isDocked } = useSearchStore()
  const { isExpanded } = useSidebarStore()
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>()

  const handleChange = useCallback((value: string) => {
    setQuery(value)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      if (value.length === 0) {
        setResults(templates.map(t => t.type))
      } else {
        const q = value.toLowerCase()
        const filtered = templates.filter(t =>
          t.label.toLowerCase().includes(q) ||
          (t.description && t.description.toLowerCase().includes(q)) ||
          (t.keywords && t.keywords.some(k => k.toLowerCase().includes(q)))
        ).map(t => t.type)
        setResults(filtered)
      }
    }, DEBOUNCE_MS)
  }, [setQuery, setResults, templates])

  useEffect(() => {
    if (isFocused && query.length === 0) {
      setResults(templates.map(t => t.type))
    }
  }, [isFocused, query, templates, setResults])

  useEffect(() => {
    return () => clearTimeout(debounceRef.current)
  }, [])

  return (
    <>
      {isDocked ? (
        <motion.div
          key="docked-search"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 180, damping: 26 }}
          className="fixed top-3 z-30"
          style={{ left: isExpanded ? 276 : 76, width: 320 }}
        >
          <div className="flex items-center gap-2 px-3 h-9 rounded-lg border border-[var(--hairline)] bg-[var(--surface)] backdrop-blur-sm">
            {templatesLoading ? (
              <Loader2 className="h-4 w-4 text-muted-foreground shrink-0 animate-spin" strokeWidth={1.5} />
            ) : (
              <Search className="h-4 w-4 text-muted-foreground shrink-0" strokeWidth={1.5} />
            )}
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => handleChange(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setTimeout(() => setFocused(false), 200)}
              placeholder={t('search.placeholder')}
              className="flex-1 bg-transparent outline-none text-xs text-foreground placeholder:text-muted-foreground"
            />
          </div>
          {isFocused && (
            <div className="mt-1">
              <SearchResultsList onSelect={onSelect} templates={templates} />
            </div>
          )}
        </motion.div>
      ) : (
        <motion.div
          key="centered-search"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 180, damping: 26 }}
          className="w-full max-w-xl"
        >
          <div
            className={`flex items-center gap-3 px-4 h-12 border bg-[var(--surface)] backdrop-blur-sm transition-all duration-300 ease-out ${
              isFocused || query.length > 0
                ? 'border-[var(--hairline)] bg-[var(--surface)] rounded-t-2xl rounded-b-none shadow-panel'
                : 'border-[var(--input-border)] rounded-2xl'
            }`}
          >
            {templatesLoading ? (
              <Loader2 className="h-4 w-4 text-muted-foreground shrink-0 animate-spin" strokeWidth={1.5} />
            ) : (
              <Search className="h-4 w-4 text-muted-foreground shrink-0" strokeWidth={1.5} />
            )}
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => handleChange(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setTimeout(() => setFocused(false), 200)}
              placeholder={t('search.placeholder')}
              className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground"
            />
          </div>

          {isFocused && (
            <SearchResultsList onSelect={onSelect} templates={templates} />
          )}
        </motion.div>
      )}
    </>
  )
}
