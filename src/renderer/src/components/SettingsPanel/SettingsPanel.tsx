import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Moon, Sun } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useThemeStore } from '@renderer/store/useThemeStore'
import { useLanguageStore, type Language } from '@renderer/store/useLanguageStore'
import i18n from '@renderer/i18n/config'
import { useFocusTrap } from '@renderer/hooks/useFocusTrap'

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
  const trapRef = useFocusTrap(isOpen)

  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    trapRef.current?.querySelector<HTMLElement>('button')?.focus()
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

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
            className="fixed inset-0 z-40 bg-zn-page/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            ref={trapRef}
            role="dialog"
            aria-modal="true"
            aria-label={t('settings.title')}
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-[420px] max-h-[80vh] overflow-y-auto p-8 rounded-zn-modal glass-strong shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-base font-medium text-zn-text">{t('settings.title')}</h2>
              <button onClick={onClose} className="grid h-7 w-7 place-items-center rounded-full text-zn-text-muted hover:text-zn-text hover:bg-zn-elevated transition-all active:scale-90">
                <X className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-2.5">
                  {theme === 'dark' ? <Moon className="h-4 w-4 text-zn-text-muted" strokeWidth={1.5} /> : <Sun className="h-4 w-4 text-zn-text-muted" strokeWidth={1.5} />}
                  <span className="text-sm text-zn-text">{t('settings.theme')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zn-text-muted">
                    {theme === 'dark' ? t('settings.dark') : t('settings.light')}
                  </span>
                  <button
                    onClick={toggle}
                    className={`relative w-9 h-5 rounded-full transition-colors duration-200 ${
                      theme === 'dark' ? 'bg-zn-text' : 'bg-zn-border'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-zn-page shadow-md transition-transform duration-200 ${
                        theme === 'dark' ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between py-3">
                <span className="text-sm text-zn-text">{t('settings.language')}</span>
                <div className="flex gap-1">
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => handleLanguageChange(l.code)}
                      className={`px-3 py-1.5 text-xs rounded-zn-btn transition-all active:scale-[0.98] ${
                        language === l.code
                          ? 'bg-zn-elevated text-zn-text'
                          : 'text-zn-text-muted hover:text-zn-text'
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
