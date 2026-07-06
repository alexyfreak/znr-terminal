import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Check, Download, FileText, Eye } from 'lucide-react'
import { VersionPicker } from '../VersionPicker'
import { FieldCollector } from '../FieldCollector'
import { useAccountStore } from '@renderer/store/useAccountStore'

interface Template {
  type: string
  label: string
  description: string | null
  teacher_visible: boolean
  schema: { required: string[]; optional: string[] }
  template: string
  keywords: string[]
}

interface DocumentFulfillmentCardProps {
  isVisible: boolean
  onReset: () => void
  template?: Template
}

type View = 'fields' | 'preview' | 'done'

export const DocumentFulfillmentCard = ({ isVisible, onReset, template }: DocumentFulfillmentCardProps) => {
  const [view, setView] = useState<View>('fields')
  const [fieldValues, setFieldValues] = useState<Record<string, string> | null>(null)
  const [exportPath, setExportPath] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)
  const { isLoggedIn, userName, schoolName, role } = useAccountStore()

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
        } else {
          if (result.error !== 'Saqlash bekor qilindi') {
            setExportError(result.error || 'Hujjat yaratishda xatolik')
          }
        }
      } else {
        setExportPath(`~/Documents/Zunoora/${template.type}_${Date.now()}.docx`)
      }
    } catch (err) {
      setExportError((err as Error).message || 'Hujjat yaratishda xatolik')
    } finally {
      setExporting(false)
    }
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
      className="mx-auto w-full max-w-[640px]"
    >
      <div className="flex items-center justify-between px-1 py-2 mb-2">
        <p className="text-xs text-muted-foreground">{templateName}</p>
        <VersionPicker />
      </div>

      {view === 'fields' && (
        <div className="rounded-sm bg-[var(--paper-bg)] text-[var(--paper-text)] paper-noise shadow-xl"
          style={{
            boxShadow: '0 40px 80px -20px rgba(0,0,0,0.7), 0 8px 20px rgba(0,0,0,0.4)',
          }}
        >
          <FieldCollector
            schema={template?.schema || { required: [], optional: [] }}
            onComplete={handleFormComplete}
            onBack={onReset}
          />
        </div>
      )}

      {view === 'preview' && (
        <div className="rounded-sm bg-[var(--paper-bg)] text-[var(--paper-text)] paper-noise shadow-xl"
          style={{
            boxShadow: '0 40px 80px -20px rgba(0,0,0,0.7), 0 8px 20px rgba(0,0,0,0.4)',
          }}
        >
          <div className="p-7">
            <div className="flex items-center gap-2 mb-4">
              <Eye className="h-4 w-4" strokeWidth={1.5} />
              <h3 className="text-sm font-medium">Tayyor matn</h3>
            </div>
            <div
              className="bg-white border border-gray-200 rounded-md p-4 text-sm leading-relaxed whitespace-pre-wrap font-serif max-h-96 overflow-y-auto"
              style={{ fontFamily: '"Times New Roman", Times, serif', fontSize: '13px', lineHeight: 1.5 }}
            >
              {rendered || 'Matn bo\'sh'}
            </div>
            <div className="flex gap-3 mt-6 pt-4 border-t border-[var(--hairline)]">
              <button
                onClick={handleBackFields}
                className="px-3 py-2 text-xs text-[var(--paper-text)]/60 hover:text-[var(--paper-text)] transition-colors"
              >
                Ortga
              </button>
              <button
                onClick={() => setView('done')}
                className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
              >
                <FileText className="h-3.5 w-3.5" strokeWidth={1.5} />
                Hujjat yaratish
              </button>
            </div>
          </div>
        </div>
      )}

      {view === 'done' && (
        <div className="rounded-sm bg-[var(--paper-bg)] text-[var(--paper-text)] paper-noise shadow-xl"
          style={{
            boxShadow: '0 40px 80px -20px rgba(0,0,0,0.7), 0 8px 20px rgba(0,0,0,0.4)',
          }}
        >
          <div className="p-7 text-center">
            <div className="w-10 h-10 rounded-full bg-[var(--warm)]/20 flex items-center justify-center mx-auto mb-4">
              <Check className="h-5 w-5 text-warm" strokeWidth={2} />
            </div>
            <h3 className="text-lg font-serif font-semibold mb-2">Hujjat tayyor</h3>
            <p className="text-sm text-[var(--paper-text)]/60 mb-6">
              Barcha ma'lumotlar to'ldirildi. Hujjatni yuklab olishingiz mumkin.
            </p>

            {exportPath && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 px-4 py-2.5 rounded-md bg-green-50 border border-green-200 text-xs text-green-700"
              >
                Hujjat saqlandi: {exportPath}
              </motion.div>
            )}

            {exportError && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 px-4 py-2.5 rounded-md bg-red-50 border border-red-200 text-xs text-red-600"
              >
                {exportError}
              </motion.div>
            )}

            <div className="space-y-3">
              <button
                onClick={handleExport}
                disabled={exporting || !!exportPath}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-md transition-colors"
              >
                <Download className="h-4 w-4" strokeWidth={1.5} />
                {exporting ? 'Yaratilmoqda...' : exportPath ? 'Saqlangan' : 'Yuklab olish (.docx)'}
              </button>
              <button
                onClick={onReset}
                className="w-full px-4 py-2 text-xs text-[var(--paper-text)]/40 hover:text-[var(--paper-text)]/60 transition-colors"
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
