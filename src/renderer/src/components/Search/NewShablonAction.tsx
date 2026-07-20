import { Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { useSearchStore } from '@renderer/store/useSearchStore'
import { useShablonBuilderStore } from '@renderer/store/useShablonBuilderStore'

export const NewShablonAction = () => {
  const { t } = useTranslation()
  const { setQuery, setFocused } = useSearchStore()
  const { open } = useShablonBuilderStore()

  const handleClick = () => {
    setQuery('')
    setFocused(false)
    open()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.15 }}
    >
      <button
        onClick={handleClick}
        className="flex w-full items-center gap-3 px-3 py-2.5 text-xs text-zn-text transition-colors hover:bg-zn-elevated border-b border-zn-border"
      >
        <Plus className="h-4 w-4 shrink-0 text-zn-text" strokeWidth={1.5} />
        <span className="font-medium">{t('search.newShablon')}</span>
      </button>
    </motion.div>
  )
}
