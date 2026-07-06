import { useState } from 'react'
import { motion } from 'framer-motion'
import { VersionPicker } from '../VersionPicker'
import { FieldCollector } from '../FieldCollector'

interface DocumentFulfillmentCardProps {
  isVisible: boolean
}

type View = 'fields' | 'done'

export const DocumentFulfillmentCard = ({ isVisible }: DocumentFulfillmentCardProps) => {
  const [view, setView] = useState<View>('fields')
  const [fieldValues, setFieldValues] = useState<Record<string, string> | null>(null)

  if (!isVisible) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.97 }}
      transition={{
        type: 'spring',
        stiffness: 160,
        damping: 24,
        delay: 0.15,
      }}
      className="mx-auto w-full max-w-[640px]"
    >
      <div className="flex items-center justify-between px-1 py-2 mb-2">
        <p className="text-xs text-muted-foreground">Shablon to'ldirish</p>
        <VersionPicker />
      </div>

      <div
        className="rounded-sm bg-[var(--paper-bg)] text-[var(--paper-text)] paper-noise shadow-xl"
        style={{
          boxShadow: '0 40px 80px -20px rgba(0,0,0,0.7), 0 8px 20px rgba(0,0,0,0.4)',
        }}
      >
        {view === 'fields' && (
          <FieldCollector
            onComplete={(values) => {
              setFieldValues(values)
              setView('done')
            }}
            onBack={() => {}}
          />
        )}

        {view === 'done' && fieldValues && (
          <div className="p-7 text-center">
            <div className="w-10 h-10 rounded-full bg-[var(--warm)]/20 flex items-center justify-center mx-auto mb-4">
              <span className="text-warm text-lg">✓</span>
            </div>
            <h3 className="text-lg font-serif font-semibold mb-2">Hujjat tayyor</h3>
            <p className="text-sm text-[var(--paper-text)]/60 mb-6">
              Barcha ma'lumotlar to'ldirildi. Hujjatni yuklab olishingiz mumkin.
            </p>
            <div className="space-y-3">
              <button className="w-full px-4 py-2.5 text-sm font-medium bg-[var(--warm)]/10 hover:bg-[var(--warm)]/20 border border-[var(--hairline)] rounded-md transition-colors">
                Yuklab olish (.docx)
              </button>
              <button className="w-full px-4 py-2 text-xs text-[var(--paper-text)]/40 hover:text-[var(--paper-text)]/60 transition-colors">
                Ortga qaytish
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}
