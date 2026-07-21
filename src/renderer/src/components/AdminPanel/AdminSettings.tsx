import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Mail, Check, Loader2, AlertCircle } from 'lucide-react'

export const AdminSettings = () => {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    window.electronAPI.getAdminConfig().then(res => {
      if (res.success && res.data) setEmail(res.data.reportRecipientEmail)
      else setError(res.error || t('common.error'))
      setLoading(false)
    }).catch((err) => {
      setError(err.message || t('common.error'))
      setLoading(false)
    })
  }, [])

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
    <div className="p-6 max-w-xl mx-auto space-y-6">
      <h1 className="text-lg font-medium text-zn-text">{t('admin.title')}</h1>

      {loading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="h-5 w-5 animate-spin text-zn-text-muted" strokeWidth={1.5} />
        </div>
      ) : (
        <div className="p-5 rounded-zn-modal glass-strong space-y-4">
          {error && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-zn-alert bg-zn-error-bg">
              <AlertCircle className="h-3.5 w-3.5 shrink-0 text-zn-error-text" strokeWidth={1.5} />
              <span className="text-[11px] text-zn-error-text">{error}</span>
            </div>
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

          <button
            onClick={handleSave}
            disabled={saving || !email}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-zn-btn bg-zn-text text-zn-page hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
              : saved ? <Check className="h-4 w-4" strokeWidth={1.5} /> : null}
            {saved ? t('admin.saved') : t('common.save')}
          </button>
        </div>
      )}
    </div>
  )
}
