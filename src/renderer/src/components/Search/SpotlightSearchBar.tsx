import { useEffect, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Search } from 'lucide-react'
import { useSearchStore } from '@renderer/store/useSearchStore'
import { SearchResultsList } from './SearchResultsList'

interface SpotlightSearchBarProps {
  onSelect: (result: string) => void
}

const DEBOUNCE_MS = 180

const mockResults: Record<string, string[]> = {
  y: ['Yillik Taqvim-Mavzu Reja', 'Yakuniy Hisobot'],
  d: ['Dars Ishlanmasi', 'Daftar Tekshirish Jadvali'],
  o: ['Ochiq Dars Konspekti', 'O\'quvchilar Ro\'yxati'],
  s: ['Sinflar Kesimida Hisobot', 'Sinf jurnali'],
  t: ['Ta\'lim Standarti', 'Tarqatma Material'],
  m: ['Mavsumiy Hisobot', 'Maktab Passporti'],
}

export const SpotlightSearchBar = ({ onSelect }: SpotlightSearchBarProps) => {
  const { t } = useTranslation()
  const { query, setQuery, isFocused, setFocused, setResults, isDocked } = useSearchStore()
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>()

  const handleChange = useCallback((value: string) => {
    setQuery(value)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      const firstChar = value.charAt(0).toLowerCase()
      const results = value.length > 0
        ? mockResults[firstChar] ?? [`${value}... shablon`]
        : []
      setResults(results)
    }, DEBOUNCE_MS)
  }, [setQuery, setResults])

  useEffect(() => {
    return () => clearTimeout(debounceRef.current)
  }, [])

  return (
    <motion.div
      layout
      layoutId="search-bar"
      transition={{ type: 'spring', stiffness: 180, damping: 26 }}
      className={isDocked
        ? 'fixed top-3 left-[72px] z-30'
        : 'w-full max-w-xl'
      }
      style={isDocked ? { width: 320 } : undefined}
    >
      <div
        className={`flex items-center border bg-[var(--surface)] backdrop-blur-sm transition-all duration-200 ease-out
          ${isDocked
            ? 'gap-2 px-3 h-9 rounded-lg border-[var(--hairline)]'
            : `gap-3 px-4 h-12
               ${isFocused || query.length > 0
                  ? 'border-[var(--hairline)] bg-[var(--surface)]'
                  : 'border-[var(--input-border)]'
               }
               ${isFocused || query.length > 0 ? 'rounded-t-2xl rounded-b-none' : 'rounded-2xl'}
             `
          }
        `}
        style={!isDocked && isFocused ? { boxShadow: '0 8px 30px -12px rgba(0,0,0,0.6)' } : undefined}
      >
        <Search className="h-4 w-4 text-muted-foreground shrink-0" strokeWidth={1.5} />
        {isDocked ? (
          <span className="text-xs text-muted-foreground truncate">
            {query || t('search.placeholder')}
          </span>
        ) : (
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
        )}
      </div>

      {!isDocked && (isFocused || query.length > 0) && (
        <SearchResultsList onSelect={onSelect} />
      )}
    </motion.div>
  )
}
