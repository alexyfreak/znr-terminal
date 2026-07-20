import { useEffect, useMemo, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Check, Download, FileText, AlertTriangle, Sparkles, Zap } from 'lucide-react'
import { EditorToolbar } from './EditorToolbar'
import { DocumentCanvas } from './DocumentCanvas'
import { VariablePanel } from './VariablePanel'
import { AiHelperPanel } from '../AiHelperPanel'
import { getFieldLabel } from '@renderer/utils/fieldLabels'
import { useEditorStore } from '@renderer/store/useEditorStore'
import { useAccountStore } from '@renderer/store/useAccountStore'
import { useHistoryStore } from '@renderer/store/useHistoryStore'
import { useCreditsStore } from '@renderer/store/useCreditsStore'

interface VariableField {
  key: string
  label: string
  type?: string
  required?: boolean
  defaultValue?: string
  placeholder?: string
}

interface DocumentEditorProps {
  template: {
    type: string
    label: string
    template: string
    schema: { required: string[]; optional: string[] }
    fields?: VariableField[]
  }
  historyItem?: { id: string; title: string; type: string; shablonType?: string; templateLabel?: string; date: string; docCount?: number; fieldValues?: Record<string, string>; exportPath?: string; rendered?: string } | null
  onReset: () => void
}

interface DocumentEditorProps {
  template: {
    type: string
    label: string
    template: string
    schema: { required: string[]; optional: string[] }
    fields?: VariableField[]
  }
  historyItem?: { id: string; title: string; type: string; shablonType?: string; templateLabel?: string; date: string; docCount?: number; fieldValues?: Record<string, string>; exportPath?: string; rendered?: string } | null
  onReset: () => void
  onBuyCredits?: () => void
}

export const DocumentEditor = ({ template, historyItem, onReset, onBuyCredits }: DocumentEditorProps) => {
  const { t } = useTranslation()
  const { setTemplateContent, reset: resetStore, variables, prefillVariables } = useEditorStore()
  const { userName, schoolName } = useAccountStore()
  const { addItem, setActiveId, activeId } = useHistoryStore()
  const { spendCredits, balance, tier } = useCreditsStore()
  const [exporting, setExporting] = useState(false)
  const [exportPath, setExportPath] = useState<string | null>(null)
  const [exportError, setExportError] = useState<string | null>(null)
  const [isDone, setIsDone] = useState(false)
  const [showAi, setShowAi] = useState(false)

  const derivedKeys = useMemo(() => {
    if (template.fields && template.fields.length > 0) {
      return template.fields.map((f) => ({
        key: f.key,
        label: f.label,
      }))
    }
    const all = [...template.schema.required, ...template.schema.optional]
    return all.map((k) => ({ key: k, label: getFieldLabel(k) }))
  }, [template])

  const derivedMeta = useMemo(() => {
    if (template.fields && template.fields.length > 0) {
      const meta: Record<string, { type?: string; required?: boolean; defaultValue?: string; placeholder?: string }> = {}
      template.fields.forEach((f) => {
        meta[f.key] = {
          type: f.type,
          required: f.required,
          defaultValue: f.defaultValue,
          placeholder: f.placeholder,
        }
      })
      return meta
    }
    return {}
  }, [template])

  const requiredKeys = useMemo(() => {
    if (template.fields && template.fields.length > 0) {
      return template.fields.filter(f => f.required).map(f => f.key)
    }
    return template.schema.required
  }, [template])

  useEffect(() => {
    setTemplateContent(template.template, derivedKeys, derivedMeta)

    if (historyItem?.fieldValues) {
      prefillVariables(historyItem.fieldValues)
    }

    return () => { resetStore() }
  }, [template, derivedKeys, derivedMeta])

  const doExport = useCallback(async (vals: Record<string, string>) => {
    setExporting(true)
    setExportError(null)

    const { templateContent: liveTemplate } = useEditorStore.getState()
    const rendered = liveTemplate.replace(/{{(\w+)}}/g, (_, key: string) => vals[key] || '')

    try {
      if (window.electronAPI?.renderAndGenerate) {
        const result = await window.electronAPI.renderAndGenerate({
          template: liveTemplate,
          values: vals,
          shablonType: template.type,
          userName: userName || 'user',
          school: schoolName ? { name: schoolName } : undefined,
        })

        if (result.success && result.data) {
          setExportPath(result.data)
          setIsDone(true)
          addItem({
            id: activeId || `doc-${Date.now()}`,
            title: template.label,
            type: template.type,
            shablonType: template.type,
            templateLabel: template.label,
            date: new Date().toISOString(),
            docCount: 1,
            fieldValues: vals,
            exportPath: result.data,
            rendered,
          })
          return true
        } else {
          if (result.error !== 'Saqlash bekor qilindi') {
            setExportError(result.error || 'Hujjat yaratishda xatolik')
          }
          return false
        }
      } else {
        const path = `~/Documents/Zunoora/${template.type}_${Date.now()}.docx`
        setExportPath(path)
        setIsDone(true)
        addItem({
          id: activeId || `doc-${Date.now()}`,
          title: template.label,
          type: template.type,
          shablonType: template.type,
          templateLabel: template.label,
          date: new Date().toISOString(),
          docCount: 1,
          fieldValues: vals,
          exportPath: path,
          rendered,
        })
        return true
      }
    } catch (err) {
      setExportError((err as Error).message || 'Hujjat yaratishda xatolik')
      return false
    } finally {
      setExporting(false)
    }
  }, [template, userName, schoolName, activeId, addItem])

  const handleExport = useCallback(async (vals: Record<string, string>) => {
    if (!spendCredits(1)) {
      setExportError(t('documentEditor.noCredits'))
      setTimeout(() => onBuyCredits?.(), 1500)
      return
    }
    const ok = await doExport(vals)
    if (!ok) {
      useCreditsStore.getState().topUp(1)
    }
  }, [doExport, spendCredits, t, onBuyCredits])

  const handleReExport = useCallback(async () => {
    const vals = useEditorStore.getState().variables
    setExporting(true)
    setExportError(null)

    const { templateContent: liveTemplate } = useEditorStore.getState()
    const rendered = liveTemplate.replace(/{{(\w+)}}/g, (_, key: string) => vals[key] || '')

    try {
      if (window.electronAPI?.renderAndGenerate) {
        const result = await window.electronAPI.renderAndGenerate({
          template: liveTemplate,
          values: vals,
          shablonType: template.type,
          userName: userName || 'user',
          school: schoolName ? { name: schoolName } : undefined,
        })
        if (result.success && result.data) {
          setExportPath(result.data)
        } else if (result.error !== 'Saqlash bekor qilindi') {
          setExportError(result.error || 'Hujjat yaratishda xatolik')
        }
      }
    } catch (err) {
      setExportError((err as Error).message || 'Hujjat yaratishda xatolik')
    } finally {
      setExporting(false)
    }
  }, [template, userName, schoolName])

  const handleNewDocument = useCallback(() => {
    setIsDone(false)
    setExportPath(null)
    setExportError(null)
    resetStore()
    onReset()
  }, [onReset, resetStore])

  const handleToolbarExport = useCallback(() => {
    const vals = useEditorStore.getState().variables
    handleExport(vals)
  }, [handleExport])

  return (
    <div className="relative flex flex-col h-full w-full bg-zn-page">
      <EditorToolbar
        onExport={handleToolbarExport}
        onAiToggle={tier !== 'free' ? () => setShowAi(!showAi) : undefined}
        aiActive={showAi}
      />

      <div className="flex flex-1 min-h-0">
        <DocumentCanvas />
        {showAi && <AiHelperPanel onClose={() => setShowAi(false)} />}
        <VariablePanel onExport={handleExport} requiredKeys={requiredKeys} exporting={exporting} />
      </div>

      {exportError && !isDone && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-zn-alert z-50 border bg-zn-surface border-zn-error-text/30 text-zn-error-text text-xs flex items-center gap-2"
        >
          <AlertTriangle className="h-3 w-3 shrink-0" strokeWidth={1.5} />
          {exportError}
        </div>
      )}

      {exporting && !isDone && (
        <div className="absolute inset-0 flex items-center justify-center z-50 bg-zn-page/70">
          <div className="flex items-center gap-2 px-4 py-2 rounded-zn-btn bg-zn-surface border border-zn-border text-zn-text text-sm">
            <FileText className="h-4 w-4 animate-pulse" strokeWidth={1.5} />
            {t('documentEditor.saving')}
          </div>
        </div>
      )}

      <AnimatePresence>
        {isDone && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center z-50 bg-black/70"
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 26 }}
              className="w-full max-w-sm mx-4 p-8 rounded-zn-modal glass-strong text-center"
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-4 bg-zn-elevated">
                <Check className="h-5 w-5 text-zn-text" strokeWidth={2} />
              </div>
              <h3 className="text-lg font-medium mb-2 text-zn-text">
                {t('documentEditor.ready')}
              </h3>
              <p className="text-sm mb-6 text-zn-text-muted">
                {t('documentEditor.readyDesc')}
              </p>

              {exportPath && (
                <div className="mb-4 px-4 py-2.5 rounded-zn-input text-xs bg-zn-elevated border border-zn-border text-zn-text-muted truncate">
                  {t('documentEditor.savedAt')} {exportPath}
                </div>
              )}

              <div className="mb-4 flex items-center justify-center gap-1.5 text-[11px] text-zn-text-muted">
                <Zap className="h-3 w-3 text-yellow-400" strokeWidth={2} />
                {t('documentEditor.creditsRemaining', { balance })}
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleReExport}
                  disabled={exporting}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-zn-btn transition-all active:scale-[0.98] disabled:opacity-30 bg-zn-text text-zn-page hover:opacity-90"
                >
                  <Download className="h-4 w-4" strokeWidth={1.5} />
                  {exporting ? t('documentEditor.saving') : t('documentEditor.downloadDocx')}
                </button>
                <button
                  onClick={handleNewDocument}
                  className="w-full px-4 py-2 text-xs text-zn-text-muted hover:text-zn-text transition-colors"
                >
                  {t('documentEditor.newDocument')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
