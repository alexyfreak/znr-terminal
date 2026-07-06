import { Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'

interface NewShablonActionProps {
  onSelect: () => void
}

export const NewShablonAction = ({ onSelect }: NewShablonActionProps) => {
  const { t } = useTranslation()

  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.15 }}
    >
      <button
        onClick={onSelect}
        className="flex w-full items-center gap-3 px-3 py-2.5 text-xs text-foreground transition-colors hover:bg-[var(--surface-hover)] border-b border-[var(--hairline)]"
      >
        <Plus className="h-4 w-4 shrink-0 text-warm" strokeWidth={1.5} />
        <span className="font-medium">{t('search.newShablon')}</span>
      </button>
    </motion.div>
  )
}
