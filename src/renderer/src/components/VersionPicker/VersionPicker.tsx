import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, History } from 'lucide-react'

const versions = [
  { id: 'v3', label: '2025-2026 o\'quv yili' },
  { id: 'v2', label: '2024-2025 o\'quv yili' },
  { id: 'v1', label: '2023-2024 o\'quv yili' },
]

export const VersionPicker = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [activeVersion, setActiveVersion] = useState(versions[0].id)

  const activeLabel = versions.find(v => v.id === activeVersion)?.label || versions[0].label

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
      >
        <History className="h-3 w-3" strokeWidth={1.5} />
        <span className="hidden sm:inline truncate max-w-[160px]">{activeLabel}</span>
        <span className="sm:hidden">Versiyalar</span>
        <ChevronDown className="h-3 w-3" strokeWidth={1.5} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.12 }}
            className="absolute top-full right-0 mt-1 w-48 py-1 rounded-lg bg-[var(--popover)] border border-[var(--hairline)] shadow-lg z-20"
          >
            {versions.map((v) => (
              <button
                key={v.id}
                onClick={() => {
                  setActiveVersion(v.id)
                  setIsOpen(false)
                }}
                className={`w-full text-left px-3 py-1.5 text-xs transition-colors ${
                  v.id === activeVersion
                    ? 'text-warm bg-warm/10'
                    : 'text-muted-foreground hover:text-foreground hover:bg-[var(--surface-hover)]'
                }`}
              >
                {v.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
