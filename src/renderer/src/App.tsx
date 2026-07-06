import { useState, useEffect, useCallback, useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Sidebar } from './components/Sidebar'
import { SpotlightSearchBar } from './components/Search'
import { DocumentFulfillmentCard } from './components/DocumentFulfillmentCard'
import { SettingsPanel } from './components/SettingsPanel'
import { AccountMenu } from './components/AccountMenu'
import { ShablonBuilderPanel } from './components/ShablonBuilder'
import { useSearchStore } from './store/useSearchStore'
import { useThemeStore } from './store/useThemeStore'
import { useAccountStore } from './store/useAccountStore'
import { useHistoryStore } from './store/useHistoryStore'
import { useShablonBuilderStore } from './store/useShablonBuilderStore'
import type { HistoryItem } from './store/useHistoryStore'

interface Template {
  type: string
  label: string
  description: string | null
  teacher_visible: boolean
  schema: { required: string[]; optional: string[] }
  template: string
  keywords: string[]
}

const SUBJECTS = [
  'Matematika', 'O\'zbek tili', 'Adabiyot', 'Ingliz tili',
  'Fizika', 'Kimyo', 'Biologiya', 'Tarix',
  'Geografiya', 'Informatika', 'Jismoniy tarbiya', 'San\'at',
]

const App = () => {
  const [showSettings, setShowSettings] = useState(false)
  const [showAccount, setShowAccount] = useState(false)
  const [templates, setTemplates] = useState<Template[]>([])
  const [templatesLoading, setTemplatesLoading] = useState(false)
  const [pendingType, setPendingType] = useState<string | null>(null)
  const { isDocked, isFocused, setDocked } = useSearchStore()
  const { theme } = useThemeStore()
  const { isLoggedIn, schoolName, classes, director, teachers, setContext, setTeachers } = useAccountStore()
  const { activeId, setActiveId, items } = useHistoryStore()
  const { isOpen: isBuilderOpen, close: closeBuilder, open: openBuilder } = useShablonBuilderStore()

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        if (isBuilderOpen) { closeBuilder(); return }
        setDocked(false)
        setActiveId(null)
        document.querySelector<HTMLInputElement>('input[type="text"]')?.focus()
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault()
        if (isBuilderOpen) { closeBuilder(); return }
        openBuilder()
      }
      if (e.key === 'Escape') {
        if (isBuilderOpen) closeBuilder()
        if (showSettings) setShowSettings(false)
        if (showAccount) setShowAccount(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showSettings, showAccount, setDocked, setActiveId, isBuilderOpen, closeBuilder, openBuilder])

  useEffect(() => {
    if (!isLoggedIn) return
    setTemplatesLoading(true)
    if (window.electronAPI?.loadTemplates) {
      window.electronAPI.loadTemplates().then(res => {
        console.log('[App] loadTemplates response:', res)
        if (res.success && res.data) {
          console.log('[App] Templates loaded:', {
            count: res.data.length,
            templates: res.data.map((t: Template) => ({
              type: t.type,
              label: t.label,
              hasFields: !!t.fields,
              fieldsCount: t.fields?.length || 0,
              hasSteps: !!t.steps,
              stepsCount: t.steps?.length || 0,
            }))
          })
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
  }, [isLoggedIn, setContext, setTeachers])

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

  const userContext = useMemo(() => ({
    schoolName: schoolName || undefined,
    classes: classes.map(c => c.name),
    subjects: SUBJECTS,
    teachers: teachers.map(t => t.full_name),
    directorName: director?.full_name || undefined,
  }), [schoolName, classes, teachers, director])

  return (
    <div className="flex h-screen w-full overflow-hidden bg-carbon text-foreground">
      <Sidebar
        onSettingsOpen={() => setShowSettings(true)}
        onAccountOpen={() => setShowAccount(true)}
        onHistorySelect={handleHistorySelect}
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
                <span className="serif-italic text-[13px] tracking-[0.3em] text-muted-foreground">
                  Zunoora
                </span>
                <h1 className="text-2xl font-medium tracking-tight text-foreground">
                  What shall we draft today?
                </h1>
                <p className="text-sm text-muted-foreground">
                  A lesson plan, a quiz...
                </p>
              </motion.div>
            )}
            <SpotlightSearchBar onSelect={handleSelect} templates={templates} templatesLoading={templatesLoading} />
          </div>
        )}

        <AnimatePresence mode="wait">
          {isDocked && activeId && (
            <motion.div
              key={activeId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, delay: 0.15 }}
              className="flex-1 flex items-start justify-center pt-20 pb-8 px-4 overflow-y-auto"
            >
              <DocumentFulfillmentCard
                key={activeId}
                isVisible={true}
                onReset={handleReset}
                template={activeTemplate || undefined}
                userContext={userContext}
                historyItem={activeItem}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <ShablonBuilderPanel isOpen={isBuilderOpen} onClose={() => closeBuilder()} />
      <SettingsPanel isOpen={showSettings} onClose={() => setShowSettings(false)} />
      <AccountMenu isOpen={showAccount} onClose={() => setShowAccount(false)} />
    </div>
  )
}

export default App
