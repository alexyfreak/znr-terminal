import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Trash2, Globe, FileText, ExternalLink, Store } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useShablonBuilderStore, type Shablon } from '@renderer/store/useShablonBuilderStore'

export const ShablonLibrary = () => {
  const { t } = useTranslation()
  const { installed, loading, publishShablon, deleteShablon, setTab } = useShablonBuilderStore()
  const [search, setSearch] = useState('')

  const filtered = installed.filter((s) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      s.label.toLowerCase().includes(q) ||
      (s.description && s.description.toLowerCase().includes(q)) ||
      s.type.toLowerCase().includes(q)
    )
  })

  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('shablonBuilder.searchLibrary')}
            className="w-full pl-9 pr-3 py-2 text-sm bg-transparent border border-[var(--hairline)] rounded-lg outline-none text-foreground placeholder:text-muted-foreground/40 focus:border-[var(--warm)]/30 transition-colors"
          />
        </div>
        <button
          onClick={() => setTab('builder')}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-foreground bg-[var(--warm)]/10 hover:bg-[var(--warm)]/20 border border-[var(--hairline)] rounded-lg transition-colors"
        >
          <FileText className="h-3.5 w-3.5" strokeWidth={1.5} />
          {t('shablonBuilder.newShablon')}
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <FileText className="h-8 w-8 text-muted-foreground/30" strokeWidth={1} />
          <p className="text-sm text-muted-foreground">
            {installed.length === 0
              ? t('shablonBuilder.noInstalled')
              : t('search.noResults')}
          </p>
          {installed.length === 0 && (
            <button
              onClick={() => setTab('marketplace')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-warm hover:text-warm/80 transition-colors"
            >
              <Store className="h-3.5 w-3.5" strokeWidth={1.5} />
              {t('shablonBuilder.browseMarketplace')}
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((shablon, i) => (
              <ShablonLibraryCard
                key={shablon.id}
                shablon={shablon}
                index={i}
                onPublish={(id, pub) => publishShablon(id, pub)}
                onDelete={(id) => deleteShablon(id)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}

function ShablonLibraryCard({
  shablon,
  index,
  onPublish,
  onDelete,
}: {
  shablon: Shablon
  index: number
  onPublish: (id: string, pub: boolean) => Promise<boolean>
  onDelete: (id: string) => Promise<boolean>
}) {
  const { setTab, updateDraft, close } = useShablonBuilderStore()

  const handleEdit = () => {
    updateDraft(shablon)
    setTab('builder')
  }

  const handleUse = () => {
    close()
    setTimeout(() => {
      const event = new CustomEvent('shablon:select', { detail: shablon.type })
      window.dispatchEvent(event)
    }, 200)
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.15, delay: index * 0.03 }}
      className="group rounded-xl border border-[var(--hairline)] bg-[var(--surface)] p-4 hover:border-[var(--warm)]/20 transition-colors"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-foreground truncate">{shablon.label}</h3>
          {shablon.description && (
            <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{shablon.description}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--warm)]/5 text-muted-foreground font-mono">
          {shablon.type}
        </span>
        {shablon.published && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-500/10 text-green-500 flex items-center gap-1">
            <Globe className="h-2.5 w-2.5" strokeWidth={2} />
            Published
          </span>
        )}
        {shablon.category && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--surface-hover)] text-muted-foreground">
            {shablon.category}
          </span>
        )}
      </div>

      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={handleUse}
          className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium text-foreground bg-[var(--warm)]/10 hover:bg-[var(--warm)]/20 rounded-md transition-colors"
        >
          <ExternalLink className="h-3 w-3" strokeWidth={1.5} />
          Use
        </button>
        <button
          onClick={handleEdit}
          className="flex items-center gap-1 px-2 py-1 text-[10px] text-muted-foreground hover:text-foreground rounded-md transition-colors"
        >
          <FileText className="h-3 w-3" strokeWidth={1.5} />
          Edit
        </button>
        <button
          onClick={() => onPublish(shablon.id, !shablon.published)}
          className="flex items-center gap-1 px-2 py-1 text-[10px] text-muted-foreground hover:text-foreground rounded-md transition-colors"
        >
          <Globe className="h-3 w-3" strokeWidth={1.5} />
          {shablon.published ? 'Unpublish' : 'Publish'}
        </button>
        <button
          onClick={() => onDelete(shablon.id)}
          className="flex items-center gap-1 px-2 py-1 text-[10px] text-destructive/70 hover:text-destructive rounded-md transition-colors ml-auto"
        >
          <Trash2 className="h-3 w-3" strokeWidth={1.5} />
        </button>
      </div>
    </motion.div>
  )
}
