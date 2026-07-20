import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Sparkles, X, ArrowUp, AlertCircle } from 'lucide-react'

interface AiHelperPanelProps {
  onClose: () => void
}

export const AiHelperPanel = ({ onClose }: AiHelperPanelProps) => {
  const { t } = useTranslation()
  const [prompt, setPrompt] = useState('')
  const [result, setResult] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = () => {
    if (!prompt.trim()) return
    setLoading(true)
    setTimeout(() => {
      setResult(t('aiHelper.placeholderResult'))
      setLoading(false)
    }, 1200)
  }

  return (
    <div className="flex flex-col w-72 shrink-0 bg-zn-elevated border-l border-zn-border">
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-zn-border shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-yellow-400" strokeWidth={1.5} />
          <span className="text-xs font-medium text-zn-text">{t('aiHelper.title')}</span>
        </div>
        <button
          onClick={onClose}
          className="grid h-6 w-6 place-items-center rounded-md text-zn-text-muted hover:text-zn-text hover:bg-zn-elevated/60 transition-all"
        >
          <X className="h-3.5 w-3.5" strokeWidth={1.5} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
        <div className="flex items-start gap-2 px-2.5 py-2 rounded-zn-input bg-zn-surface border border-zn-border/50">
          <AlertCircle className="h-3 w-3 shrink-0 mt-0.5 text-zn-text-faint" strokeWidth={1.5} />
          <p className="text-[10px] text-zn-text-muted leading-relaxed">
            {t('aiHelper.disclaimer')}
          </p>
        </div>

        {result && (
          <div className="px-2.5 py-2 rounded-zn-input bg-gradient-to-br from-yellow-400/5 to-transparent border border-yellow-400/10">
            <p className="text-[11px] text-zn-text leading-relaxed whitespace-pre-wrap">{result}</p>
          </div>
        )}

        {loading && (
          <div className="flex items-center gap-2 px-2.5 py-2">
            <span className="inline-block h-3 w-3 rounded-full border-2 border-yellow-400 border-t-transparent animate-spin" />
            <span className="text-[11px] text-zn-text-muted">{t('aiHelper.generating')}</span>
          </div>
        )}
      </div>

      <div className="shrink-0 px-3 py-2 border-t border-zn-border">
        <div className="relative">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={t('aiHelper.placeholder')}
            rows={2}
            className="w-full px-2.5 py-1.5 pr-8 text-xs bg-zn-surface border border-zn-border rounded-zn-input outline-none resize-none text-zn-text placeholder:text-zn-text-faint/30 focus:border-zn-text/30"
          />
          <button
            onClick={handleSubmit}
            disabled={!prompt.trim() || loading}
            className="absolute right-1.5 bottom-1.5 grid h-6 w-6 place-items-center rounded-md bg-zn-text text-zn-page transition-all active:scale-90 disabled:opacity-30"
          >
            <ArrowUp className="h-3 w-3" strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  )
}
