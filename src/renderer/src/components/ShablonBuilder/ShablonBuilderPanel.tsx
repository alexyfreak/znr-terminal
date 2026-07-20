import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Library, Store, Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useShablonBuilderStore } from '@renderer/store/useShablonBuilderStore'
import { ShablonLibrary } from './ShablonLibrary'
import { ShablonMarketplace } from './ShablonMarketplace'
import { ShablonBuilder } from './ShablonBuilder'
import { useFocusTrap } from '@renderer/hooks/useFocusTrap'

interface ShablonBuilderPanelProps {
  isOpen: boolean
  onClose: () => void
}

export const ShablonBuilderPanel = ({ isOpen, onClose }: ShablonBuilderPanelProps) => {
  const { t } = useTranslation()
  const { activeTab, setTab, fetchInstalled, fetchMarketplace, wizardStep } = useShablonBuilderStore()
  const trapRef = useFocusTrap(isOpen)

  useEffect(() => {
    if (isOpen) {
      fetchInstalled()
      fetchMarketplace()
    }
  }, [isOpen, fetchInstalled, fetchMarketplace])

  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  const tabs: { key: typeof activeTab; label: string; icon: typeof Library }[] = [
    { key: 'library', label: t('shablonBuilder.library'), icon: Library },
    { key: 'marketplace', label: t('shablonBuilder.marketplace'), icon: Store },
    { key: 'builder', label: t('shablonBuilder.builder'), icon: Plus },
  ]

  const isTemplateStep = activeTab === 'builder' && wizardStep === 2
  const isBuilderTab = activeTab === 'builder'

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-40 flex items-center justify-center bg-zn-page/60 backdrop-blur-sm"
          style={{ padding: isTemplateStep ? 0 : undefined }}
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            ref={trapRef}
            role="dialog"
            aria-modal="true"
            aria-label={t('shablonBuilder.title')}
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
              width: isTemplateStep ? '100%' : undefined,
              height: isTemplateStep ? '100%' : undefined,
              maxWidth: isTemplateStep ? '100%' : '64rem',
              maxHeight: isTemplateStep ? '100%' : '85vh',
              borderRadius: isTemplateStep ? 0 : 'var(--zn-radius-modal)',
              margin: isTemplateStep ? 0 : '0 1rem',
            }}
            transition={{ type: 'spring', stiffness: 200, damping: 28 }}
            className="w-full mx-4 rounded-zn-modal border border-zn-border glass-strong flex flex-col overflow-hidden outline-none"
          >
            <div className="flex items-center justify-between px-5 py-3 border-b border-zn-border shrink-0">
              <div className="flex gap-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  const isActive = activeTab === tab.key
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setTab(tab.key)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-zn-btn transition-all active:scale-[0.98] ${
                        isActive
                          ? 'bg-zn-elevated text-zn-text'
                          : 'text-zn-text-muted hover:text-zn-text hover:bg-zn-elevated/50'
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />
                      {tab.label}
                    </button>
                  )
                })}
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full text-zn-text-muted hover:text-zn-text hover:bg-zn-elevated transition-all active:scale-90"
              >
                <X className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </div>

            <div
              className="flex-1 overflow-y-auto transition-[padding] duration-200 ease-out"
              style={{ padding: isTemplateStep ? 0 : '1.25rem' }}
            >
              {activeTab === 'library' && <div className="p-5"><ShablonLibrary /></div>}
              {activeTab === 'marketplace' && <div className="p-5"><ShablonMarketplace /></div>}
              {activeTab === 'builder' && <ShablonBuilder />}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
