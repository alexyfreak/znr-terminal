import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Library, Store, Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useShablonBuilderStore } from '@renderer/store/useShablonBuilderStore'
import { ShablonLibrary } from './ShablonLibrary'
import { ShablonMarketplace } from './ShablonMarketplace'
import { ShablonBuilder } from './ShablonBuilder'

interface ShablonBuilderPanelProps {
  isOpen: boolean
  onClose: () => void
}

export const ShablonBuilderPanel = ({ isOpen, onClose }: ShablonBuilderPanelProps) => {
  const { t } = useTranslation()
  const { activeTab, setTab, fetchInstalled, fetchMarketplace, wizardStep } = useShablonBuilderStore()

  useEffect(() => {
    if (isOpen) {
      fetchInstalled()
      fetchMarketplace()
    }
  }, [isOpen, fetchInstalled, fetchMarketplace])

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
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          style={{ padding: isTemplateStep ? 0 : undefined }}
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
              width: isTemplateStep ? '100%' : undefined,
              height: isTemplateStep ? '100%' : undefined,
              maxWidth: isTemplateStep ? '100%' : '64rem',
              maxHeight: isTemplateStep ? '100%' : '85vh',
              borderRadius: isTemplateStep ? 0 : '1rem',
              margin: isTemplateStep ? 0 : '0 1rem',
            }}
            transition={{ type: 'spring', stiffness: 200, damping: 28 }}
            className="w-full mx-4 rounded-2xl border border-[var(--hairline)] bg-[var(--surface)] shadow-2xl flex flex-col overflow-hidden"
          >
            <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--hairline)] shrink-0">
              <div className="flex gap-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  const isActive = activeTab === tab.key
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setTab(tab.key)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                        isActive
                          ? 'bg-[var(--warm)]/10 text-warm'
                          : 'text-muted-foreground hover:text-foreground hover:bg-[var(--surface-hover)]'
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
                className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-[var(--surface-hover)] transition-colors"
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
