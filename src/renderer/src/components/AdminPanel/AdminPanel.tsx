import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Mail, Check, Loader2, AlertCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useFocusTrap } from '@renderer/hooks/useFocusTrap'

interface AdminPanelProps {
  isOpen: boolean
  onClose: () => void
}

export const AdminPanel = ({ isOpen, onClose }: AdminPanelProps) => {
  const { t } = useTranslation()
  const trapRef = useFocusTrap(isOpen)
  const [email, setEmail] = useState('')
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    trapRef.current?.querySelector<HTMLElement>('input')?.focus()
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  useEffect(() => {
    if (!isOpen) return
    setLoading(true)
    setError(null)
    try {
      window.electronAPI.getAdminConfig().then(res => {
        if (res.success && res.data) {
          setEmail(res.data.reportRecipientEmail)
        } else {
          setError(res.error || t('common.error'))
        }
        setLoading(false)
      }).catch((err) => {
        setError(err.message || t('common.error'))
        setLoading(false)
      })
    } catch {
      setError(t('common.error'))
      setLoading(false)
    }
  }, [isOpen])

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    try {
      const res = await window.electronAPI.setAdminConfig({ reportRecipientEmail: email })
      if (res.success) {
        setSaved(true)
        setTimeout(() => setSaved(false), 2500)
      } else {
        setError(res.error || t('common.error'))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error'))
    }
    setSaving(false)
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
            aria-label={t('admin.title')}
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-[420px] max-h-[80vh] overflow-y-auto p-8 rounded-zn-modal glass-strong shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-base font-medium text-zn-text">{t('admin.title')}</h2>
              <button onClick={onClose} className="grid h-7 w-7 place-items-center rounded-full text-zn-text-muted hover:text-zn-text hover:bg-zn-elevated transition-all active:scale-90">
                <X className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-5 w-5 animate-spin text-zn-text-muted" strokeWidth={1.5} />
              </div>
            ) : (
              <div className="space-y-5">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    role="alert"
                    className="flex items-center gap-2 px-3 py-2 rounded-zn-alert bg-zn-error-bg"
                  >
                    <AlertCircle className="h-3.5 w-3.5 shrink-0 text-zn-error-text" strokeWidth={1.5} />
                    <span className="text-[11px] text-zn-error-text">{error}</span>
                  </motion.div>
                )}

                <div>
                  <label className="flex items-center gap-2 text-sm text-zn-text mb-2">
                    <Mail className="h-4 w-4 text-zn-text-muted" strokeWidth={1.5} />
                    {t('admin.reportRecipient')}
                  </label>
                  <p className="text-xs text-zn-text-muted mb-3">{t('admin.reportRecipientHint')}</p>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="reports@your-school.uz"
                    className="w-full px-3 py-2 text-sm bg-zn-elevated rounded-zn-btn border border-zn-border text-zn-text placeholder:text-zn-text-faint outline-none focus:border-zn-text/30 transition-colors"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={handleSave}
                    disabled={saving || !email}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-zn-btn bg-zn-text text-zn-page hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none"
                  >
                    {saving ? (
                      <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
                    ) : saved ? (
                      <Check className="h-4 w-4" strokeWidth={1.5} />
                    ) : null}
                    {saved ? t('admin.saved') : t('common.save')}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
