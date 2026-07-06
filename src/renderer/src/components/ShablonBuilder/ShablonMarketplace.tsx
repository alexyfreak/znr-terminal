import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Download, Check, Store, User, Clock } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useShablonBuilderStore, type Shablon } from '@renderer/store/useShablonBuilderStore'

export const ShablonMarketplace = () => {
  const { t } = useTranslation()
  const {
    marketplace,
    loading, installShablon, installed, searchMarketplace,
  } = useShablonBuilderStore()
  const [query, setQuery] = useState('')
  const [debounceTimer, setDebounceTimer] = useState<ReturnType<typeof setTimeout> | null>(null)

  const installedIds = new Set(installed.map((s) => s.id))

  useEffect(() => {
    return () => {
      if (debounceTimer) clearTimeout(debounceTimer)
    }
  }, [debounceTimer])

  const handleSearch = (value: string) => {
    setQuery(value)
    if (debounceTimer) clearTimeout(debounceTimer)
    const timer = setTimeout(() => {
      searchMarketplace(value)
    }, 250)
    setDebounceTimer(timer)
  }

  return (
    <div>
      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder={t('shablonBuilder.searchMarketplace')}
          className="w-full pl-9 pr-3 py-2 text-sm bg-transparent border border-[var(--hairline)] rounded-lg outline-none text-foreground placeholder:text-muted-foreground/40 focus:border-[var(--warm)]/30 transition-colors"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
        </div>
      ) : marketplace.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Store className="h-8 w-8 text-muted-foreground/30" strokeWidth={1} />
          <p className="text-sm text-muted-foreground">
            {query ? t('search.noResults') : t('shablonBuilder.noMarketplace')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <AnimatePresence mode="popLayout">
            {marketplace.map((shablon, i) => (
              <MarketplaceCard
                key={shablon.id}
                shablon={shablon}
                index={i}
                isInstalled={installedIds.has(shablon.id)}
                onInstall={(id) => installShablon(id)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}

function MarketplaceCard({
  shablon,
  index,
  isInstalled,
  onInstall,
}: {
  shablon: Shablon
  index: number
  isInstalled: boolean
  onInstall: (id: string) => Promise<boolean>
}) {
  const [installing, setInstalling] = useState(false)

  const handleInstall = async () => {
    setInstalling(true)
    await onInstall(shablon.id)
    setInstalling(false)
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.15, delay: index * 0.03 }}
      className="rounded-xl border border-[var(--hairline)] bg-[var(--surface)] p-4 hover:border-[var(--warm)]/20 transition-colors"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-foreground truncate">{shablon.label}</h3>
          {shablon.description && (
            <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{shablon.description}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--warm)]/5 text-muted-foreground font-mono">
          {shablon.type}
        </span>
        {shablon.category && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--surface-hover)] text-muted-foreground">
            {shablon.category}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
          <User className="h-3 w-3" strokeWidth={1.5} />
          <span>{shablon.author_id ? 'Author' : 'Zunoora'}</span>
          <Clock className="h-3 w-3 ml-1" strokeWidth={1.5} />
          <span>v{shablon.version || 1}</span>
        </div>

        <button
          onClick={handleInstall}
          disabled={isInstalled || installing}
          className={`flex items-center gap-1 px-3 py-1.5 text-[11px] font-medium rounded-lg transition-colors ${
            isInstalled
              ? 'bg-green-500/10 text-green-500 border border-green-500/20'
              : 'bg-[var(--warm)]/10 text-warm hover:bg-[var(--warm)]/20 border border-[var(--warm)]/10'
          }`}
        >
          {isInstalled ? (
            <><Check className="h-3 w-3" strokeWidth={2} /> Installed</>
          ) : installing ? (
            <>{t('common.loading')}</>
          ) : (
            <><Download className="h-3 w-3" strokeWidth={1.5} /> Install</>
          )}
        </button>
      </div>
    </motion.div>
  )
}
