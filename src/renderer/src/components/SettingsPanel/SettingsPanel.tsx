import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useThemeStore } from '@renderer/store/useThemeStore'
import { useLanguageStore, type Language } from '@renderer/store/useLanguageStore'
import i18n from '@renderer/i18n/config'

interface SettingsPanelProps {
  isOpen: boolean
  onClose: () => void
}

const languages: { code: Language; label: string }[] = [
  { code: 'uz', label: "O'zbek" },
  { code: 'ru', label: 'Русский' },
  { code: 'en', label: 'English' },
]

export const SettingsPanel = ({ isOpen, onClose }: SettingsPanelProps) => {
  const { t } = useTranslation()
  const { theme, toggle } = useThemeStore()
  const { language, setLanguage } = useLanguageStore()

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang)
    i18n.changeLanguage(lang)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-[420px] p-6 rounded-xl bg-[var(--surface)] border border-[var(--hairline)] shadow-2xl"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="serif-italic text-lg text-warm">{t('settings.title')}</h2>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-foreground">{t('settings.theme')}</span>
                <button
                  onClick={toggle}
                  className={`relative w-9 h-5 rounded-full transition-colors duration-200 ${
                    theme === 'dark' ? 'bg-warm' : 'bg-[var(--hairline)]'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-carbon shadow-md transition-transform duration-200 ${
                      theme === 'dark' ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-foreground">{t('settings.language')}</span>
                <div className="flex gap-1">
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => handleLanguageChange(l.code)}
                      className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                        language === l.code
                          ? 'bg-warm/20 text-warm'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
