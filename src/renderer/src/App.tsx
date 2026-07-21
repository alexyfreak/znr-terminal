import { useState, useEffect, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Sidebar } from './components/Sidebar'
import { SpotlightSearchBar } from './components/Search'
import { DocumentEditor } from './components/DocumentEditor'
import { PricingPage } from './components/PricingPage'
import { BuyCreditsPage } from './components/BuyCreditsPage'
import { PaymentCheckout } from './components/PaymentCheckout'
import { SettingsPanel } from './components/SettingsPanel'
import { AdminPanel } from './components/AdminPanel/AdminPanel'
import { AccountMenu } from './components/AccountMenu'
import { AuthScreen } from './components/AuthScreen'
import { ShablonBuilderPanel } from './components/ShablonBuilder'
import { BugReportModal } from './components/BugReport/BugReportModal'
import { ErrorBoundary } from './components/BugReport/ErrorBoundary'
import { registerRendererErrorHandlers } from './utils/ipc'
import { useSearchStore } from './store/useSearchStore'
import { useThemeStore } from './store/useThemeStore'
import { useAccountStore } from './store/useAccountStore'
import { useHistoryStore } from './store/useHistoryStore'
import { useShablonBuilderStore } from './store/useShablonBuilderStore'
import type { HistoryItem } from './store/useHistoryStore'
import type { Template } from './types/template'
import type { Tier, BillingPeriod } from './store/useCreditsStore'

const App = () => {
  const { t } = useTranslation()
  const [showSettings, setShowSettings] = useState(false)
  const [showAdmin, setShowAdmin] = useState(false)
  const [showAccount, setShowAccount] = useState(false)
  const [templates, setTemplates] = useState<Template[]>([])
  const [templatesLoading, setTemplatesLoading] = useState(false)
  const [pendingType, setPendingType] = useState<string | null>(null)
  const [showPricing, setShowPricing] = useState(false)
  const [showBuyCredits, setShowBuyCredits] = useState(false)
  const [checkout, setCheckout] = useState<{
    type: 'credit_pack' | 'subscription'
    credits?: number
    priceUzs: number
    tier?: Tier
    billing?: BillingPeriod
  } | null>(null)
  const { isDocked, isFocused, setDocked } = useSearchStore()
  const { theme } = useThemeStore()
  const { isLoggedIn, setContext, setTeachers, setSubjects } = useAccountStore()
  const { activeId, setActiveId, items } = useHistoryStore()
  const { isOpen: isBuilderOpen, close: closeBuilder, open: openBuilder } = useShablonBuilderStore()

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  useEffect(() => {
    registerRendererErrorHandlers()
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        if (isBuilderOpen) { closeBuilder(); return }
        setDocked(false)
        setActiveId(null)
        document.querySelector<HTMLInputElement>('[data-command-palette]')?.focus()
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault()
        if (isBuilderOpen) { closeBuilder(); return }
        openBuilder()
      }
      if (e.key === 'Escape') {
        if (checkout) { setCheckout(null); return }
        if (showPricing) { setShowPricing(false); return }
        if (showBuyCredits) { setShowBuyCredits(false); return }
        if (isBuilderOpen) { closeBuilder(); return }
        if (showSettings) { setShowSettings(false); return }
        if (showAdmin) { setShowAdmin(false); return }
        if (showAccount) { setShowAccount(false); return }
        if (isDocked) {
          setActiveId(null)
          setPendingType(null)
          setDocked(false)
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showSettings, showAdmin, showAccount, showPricing, showBuyCredits, checkout, setDocked, setActiveId, isBuilderOpen, closeBuilder, openBuilder])

  useEffect(() => {
    if (!isLoggedIn) return
    setTemplatesLoading(true)
    if (window.electronAPI?.loadTemplates) {
      window.electronAPI.loadTemplates().then(res => {
        if (res.success && res.data) {
          setTemplates(res.data as Template[])
        }
        setTemplatesLoading(false)
      })
    } else {
      setTemplatesLoading(false)
    }
  }, [isLoggedIn])

  useEffect(() => {
    if (!isLoggedIn) return
    if (window.electronAPI?.getContext) {
      window.electronAPI.getContext().then(res => {
        if (res.success && res.data) {
          const ctx = res.data as { classes: { id: string; name: string; school_id: string | null; form_teacher_id: string | null; academic_year: string | null }[]; director: { id: string; full_name: string; position: string | null } | null }
          setContext({ classes: ctx.classes || [], director: ctx.director })
        }
      })
    }
    if (window.electronAPI?.getTeachers) {
      window.electronAPI.getTeachers().then(res => {
        if (res.success && res.data) {
          setTeachers(res.data as { id: string; full_name: string }[])
        }
      })
    }
    if (window.electronAPI?.getSubjects) {
      window.electronAPI.getSubjects().then(res => {
        if (res.success && res.data) {
          setSubjects(res.data as string[])
        }
      })
    }
  }, [isLoggedIn, setContext, setTeachers, setSubjects])

  const activeItem = activeId ? items.find(i => i.id === activeId) : null

  const resolvedType = activeItem
    ? activeItem.shablonType || activeItem.type
    : pendingType

  const activeTemplate = resolvedType
    ? templates.find(t => t.type === resolvedType)
    : null

  const handleSelect = useCallback((result: string) => {
    const id = `doc-${Date.now()}`
    setPendingType(result)
    setActiveId(id)
    setDocked(true)
  }, [setDocked, setActiveId])

  const handleReset = useCallback(() => {
    setActiveId(null)
    setPendingType(null)
    setDocked(false)
  }, [setDocked, setActiveId])

  const handleHistorySelect = useCallback((item: HistoryItem) => {
    setActiveId(item.id)
    setPendingType(null)
    setDocked(true)
  }, [setDocked, setActiveId])

  useEffect(() => {
    const handler = (e: CustomEvent) => {
      const type = e.detail
      const tmpl = templates.find(t => t.type === type)
      if (tmpl) {
        handleSelect(type)
      }
    }
    window.addEventListener('shablon:select', handler as EventListener)
    return () => window.removeEventListener('shablon:select', handler as EventListener)
  }, [templates, handleSelect])

  if (!isLoggedIn) {
    return <AuthScreen />
  }

  return (
    <ErrorBoundary>
    <div className="relative flex h-screen w-full overflow-hidden bg-zn-page text-zn-text">
      <Sidebar
        onSettingsOpen={() => setShowSettings(true)}
        onAdminOpen={() => setShowAdmin(true)}
        onAccountOpen={() => setShowAccount(true)}
        onHistorySelect={handleHistorySelect}
        onPricingOpen={() => setShowPricing(true)}
        onBuyCreditsOpen={() => setShowBuyCredits(true)}
      />
      <div className="relative flex flex-1 flex-col min-h-0">
        {!isDocked && (
          <div className="flex-1 flex flex-col items-center justify-center gap-6 px-6">
            {!isFocused && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="flex flex-col items-center gap-2 select-none"
              >
                <span className="label-uppercase text-[13px] tracking-[0.3em] text-zn-text-muted">
                  Zunoora
                </span>
                <h1 className="text-2xl font-medium tracking-tight text-zn-text">
                  {t('app.welcomeTitle')}
                </h1>
                <p className="text-sm text-zn-text-muted">
                  {t('app.welcomeSubtitle')}
                </p>
              </motion.div>
            )}
            <SpotlightSearchBar onSelect={handleSelect} templates={templates} templatesLoading={templatesLoading} />
          </div>
        )}

        <AnimatePresence mode="wait">
          {isDocked && activeId && activeTemplate && (
            <motion.div
              key={activeId}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex-1 flex flex-col min-h-0"
            >
              <DocumentEditor
                key={activeId}
                template={activeTemplate}
                historyItem={activeItem}
                onReset={handleReset}
                onBuyCredits={() => setShowBuyCredits(true)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <ShablonBuilderPanel isOpen={isBuilderOpen} onClose={() => closeBuilder()} />
      <SettingsPanel isOpen={showSettings} onClose={() => setShowSettings(false)} />
      <AdminPanel isOpen={showAdmin} onClose={() => setShowAdmin(false)} />
      <AccountMenu isOpen={showAccount} onClose={() => setShowAccount(false)} />
      <BugReportModal />

      {/* Full-screen overlay for Pricing / Buy Credits — covers sidebar too */}
      <AnimatePresence>
        {(showPricing || showBuyCredits || checkout) && (
          <motion.div
            key={checkout ? 'checkout' : showPricing ? 'pricing' : 'buyCredits'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 z-[60] bg-zn-page flex"
          >
            {checkout ? (
              <PaymentCheckout
                type={checkout.type}
                credits={checkout.credits}
                priceUzs={checkout.priceUzs}
                tier={checkout.tier}
                billing={checkout.billing as BillingPeriod}
                onClose={() => setCheckout(null)}
                onSuccess={() => setCheckout(null)}
              />
            ) : showPricing ? (
              <PricingPage
                onClose={() => setShowPricing(false)}
                onCheckout={(tier, billing, priceUzs) => {
                  setShowPricing(false)
                  setCheckout({ type: 'subscription', tier, billing: billing as BillingPeriod, priceUzs })
                }}
              />
            ) : (
              <BuyCreditsPage
                onClose={() => setShowBuyCredits(false)}
                onBuy={(credits, priceUzs) => {
                  setShowBuyCredits(false)
                  setCheckout({ type: 'credit_pack', credits, priceUzs })
                }}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </ErrorBoundary>
  )
}

export default App
