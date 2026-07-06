import { useState, useMemo, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Check, Download, FileText, Eye } from 'lucide-react'
import { VersionPicker } from '../VersionPicker'
import { FieldCollector } from '../FieldCollector'
import { useAccountStore } from '@renderer/store/useAccountStore'
import { useHistoryStore } from '@renderer/store/useHistoryStore'
import type { HistoryItem } from '@renderer/store/useHistoryStore'

interface Template {
  type: string
  label: string
  description: string | null
  teacher_visible: boolean
  schema: { required: string[]; optional: string[] }
  template: string
  keywords: string[]
  fields?: { key: string; label: string; type: string; required: boolean; defaultValue?: string; options?: { value: string; label: string }[]; placeholder?: string; autoFill?: string }[]
  steps?: { header: string; fields: string[] }[]
}

interface UserContext {
  schoolName?: string
  classes?: string[]
  subjects?: string[]
  teachers?: string[]
  directorName?: string
}

interface DocumentFulfillmentCardProps {
  isVisible: boolean
  onReset: () => void
  template?: Template
  userContext?: UserContext
  historyItem?: HistoryItem | null
}

type View = 'fields' | 'preview' | 'done'

export const DocumentFulfillmentCard = ({ isVisible, onReset, template, userContext, historyItem }: DocumentFulfillmentCardProps) => {
  const [view, setView] = useState<View>('fields')
  const [fieldValues, setFieldValues] = useState<Record<string, string> | null>(null)
  const [exportPath, setExportPath] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)
  const [exportAttempted, setExportAttempted] = useState(false)

  // Debug logging to understand template structure
  useEffect(() => {
    if (template) {
      console.log('[DocumentFulfillmentCard] Template loaded:', {
        type: template.type,
        label: template.label,
        hasSchema: !!template.schema,
        schemaRequired: template.schema?.required || [],
        schemaOptional: template.schema?.optional || [],
        hasFields: !!template.fields,
        fieldsCount: template.fields?.length || 0,
        fields: template.fields,
        hasSteps: !!template.steps,
        stepsCount: template.steps?.length || 0,
        steps: template.steps,
      })
    }
  }, [template])

  useEffect(() => {
    setView(historyItem?.exportPath ? 'done' : 'fields')
    setFieldValues(historyItem?.fieldValues || null)
    setExportPath(historyItem?.exportPath || null)
    setExportError(null)
    setExportAttempted(false)
  }, [historyItem?.id])
  const { isLoggedIn, userName, schoolName, role } = useAccountStore()
  const { addItem, setActiveId, activeId } = useHistoryStore()

  const rendered = useMemo(() => {
    if (!template || !fieldValues) return ''
    let result = template.template.replace(/{{(\w+)}}/g, (_, key) => {
      return fieldValues[key] !== undefined && fieldValues[key] !== null ? fieldValues[key] : ''
    })
    return result
      .split('\n')
      .map(line => line.trim() === '' ? '' : line)
      .join('\n')
      .replace(/\n{3,}/g, '\n\n')
      .replace(/^\n+/, '')
      .replace(/\n+$/, '')
  }, [template, fieldValues])

  if (!isVisible) return null

  const handleFormComplete = (values: Record<string, string>) => {
    setFieldValues(values)
    setView('preview')
  }

  const handleBackFields = () => {
    if (view === 'preview') {
      setView('fields')
    } else if (view === 'done') {
      setView('preview')
      setExportPath(null)
      setExportError(null)
    } else {
      onReset()
    }
  }

  const handleExport = async () => {
    if (!template || !fieldValues) return
    setExporting(true)
    setExportError(null)
    setExportPath(null)
    setExportAttempted(true)

    try {
      if (window.electronAPI?.renderAndGenerate) {
        const result = await window.electronAPI.renderAndGenerate({
          template: template.template,
          values: fieldValues,
          shablonType: template.type,
          userName: userName || 'user',
          school: schoolName ? { name: schoolName } : undefined,
        })

        if (result.success && result.data) {
          setExportPath(result.data)
          addItem({
            id: activeId || `doc-${Date.now()}`,
            title: template.label,
            type: template.type,
            shablonType: template.type,
            templateLabel: template.label,
            date: new Date().toISOString(),
            docCount: 1,
            fieldValues: fieldValues || undefined,
            exportPath: result.data,
            rendered,
          })
        } else {
          if (result.error !== 'Saqlash bekor qilindi') {
            setExportError(result.error || 'Hujjat yaratishda xatolik')
          }
        }
      } else {
        const path = `~/Documents/Zunoora/${template.type}_${Date.now()}.docx`
        setExportPath(path)
        addItem({
          id: activeId || `doc-${Date.now()}`,
          title: template.label,
          type: template.type,
          shablonType: template.type,
          templateLabel: template.label,
          date: new Date().toISOString(),
          docCount: 1,
          fieldValues: fieldValues || undefined,
          exportPath: path,
          rendered,
        })
      }
    } catch (err) {
      setExportError((err as Error).message || 'Hujjat yaratishda xatolik')
    } finally {
      setExporting(false)
    }
  }

  const handleGenerateAndExport = async () => {
    setView('done')
    await handleExport()
  }

  const templateName = template?.label || 'Shablon to\'ldirish'

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
      className="mx-auto w-full max-w-2xl"
    >
      <div className="flex items-center justify-between px-1 py-2 mb-2">
        <p className="text-xs text-muted-foreground">{templateName}</p>
        <VersionPicker />
      </div>

      {view === 'fields' && (
        <div className="rounded-sm bg-[var(--surface)] text-foreground"
          style={{ boxShadow: 'var(--shadow-card)' }}
        >
          <FieldCollector
            schema={template?.schema || { required: [], optional: [] }}
            onComplete={handleFormComplete}
            onBack={onReset}
            userContext={userContext}
            shablonType={template?.type}
            fields={template?.fields}
            steps={template?.steps}
          />
        </div>
      )}

      {view === 'preview' && (
        <div className="rounded-sm bg-[var(--surface)] text-foreground"
          style={{ boxShadow: 'var(--shadow-card)' }}
        >
          <div className="p-7">
            <div className="flex items-center gap-2 mb-4">
              <Eye className="h-4 w-4" strokeWidth={1.5} />
              <h3 className="text-sm font-medium">Tayyor matn</h3>
            </div>
            <div
              className="paper-noise bg-[var(--paper-bg)] text-[var(--paper-text)] border border-[var(--hairline)] rounded-sm p-4 text-sm leading-relaxed whitespace-pre-wrap font-serif max-h-96 overflow-y-auto"
              style={{ fontFamily: '"Times New Roman", Times, serif', fontSize: '13px', lineHeight: 1.5 }}
            >
              {rendered || 'Matn bo\'sh'}
            </div>
            <div className="flex gap-3 mt-6 pt-4 border-t border-[var(--hairline)]">
              <button
                onClick={handleBackFields}
                className="px-3 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Ortga
              </button>
              <button
                onClick={handleGenerateAndExport}
                disabled={exporting}
                className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-medium text-foreground bg-[var(--warm)]/10 hover:bg-[var(--warm)]/20 disabled:opacity-40 border border-[var(--hairline)] rounded-md transition-colors"
              >
                <FileText className="h-3.5 w-3.5" strokeWidth={1.5} />
                {exporting ? 'Yaratilmoqda...' : 'Hujjat yaratish'}
              </button>
            </div>
          </div>
        </div>
      )}

      {view === 'done' && (
        <div className="rounded-sm bg-[var(--surface)] text-foreground"
          style={{ boxShadow: 'var(--shadow-card)' }}
        >
          <div className="p-7 text-center">
            <div className="w-10 h-10 rounded-full bg-[var(--warm)]/10 flex items-center justify-center mx-auto mb-4">
              <Check className="h-5 w-5 text-warm" strokeWidth={2} />
            </div>
            <h3 className="text-lg font-serif font-semibold mb-2">Hujjat tayyor</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Barcha ma'lumotlar to'ldirildi. Hujjatni yuklab olishingiz mumkin.
            </p>

            {exportPath && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 px-4 py-2.5 rounded-md bg-[var(--surface)] border border-[var(--hairline)] text-xs text-foreground"
              >
                Hujjat saqlandi: {exportPath}
              </motion.div>
            )}

            {exportError && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 px-4 py-2.5 rounded-md bg-[var(--surface)] border border-[var(--hairline)] text-xs text-destructive"
              >
                {exportError}
              </motion.div>
            )}

            <div className="space-y-3">
              <button
                onClick={handleExport}
                disabled={exporting}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-foreground bg-[var(--warm)]/10 hover:bg-[var(--warm)]/20 disabled:opacity-40 border border-[var(--hairline)] rounded-md transition-colors"
              >
                <Download className="h-4 w-4" strokeWidth={1.5} />
                {exporting ? 'Yaratilmoqda...' : exportPath ? 'Saqlangan' : 'Yuklab olish (.docx)'}
              </button>
              <button
                onClick={onReset}
                className="w-full px-4 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Yangi hujjat yaratish
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )
}
