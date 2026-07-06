import { useState } from 'react'
import { X, Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useShablonBuilderStore } from '@renderer/store/useShablonBuilderStore'

const CATEGORIES = [
  'Farmoish / Buyruq',
  'Pedagogik kengash',
  'O\'quv hujjatlari',
  'Shaxsiy hujjatlar',
  'Hisobot',
  'Tarif-malaka',
  'Xat va arizalar',
  'Dalolatnoma',
  'Tavsifnoma',
]

export const BuilderStepMetadata = () => {
  const { t } = useTranslation()
  const { draft, updateDraft } = useShablonBuilderStore()
  const [keywordInput, setKeywordInput] = useState('')

  const generateType = (label: string) => {
    return label
      .toLowerCase()
      .replace(/[ʻ'ʼ`‘’]/g, '')
      .replace(/['']/g, '')
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_|_$/g, '')
  }

  const handleLabelChange = (value: string) => {
    const updates: Record<string, unknown> = { label: value }
    if (!draft.type || draft.type === generateType(draft.label || '')) {
      updates.type = generateType(value)
    }
    updateDraft(updates)
  }

  const addKeyword = () => {
    const kw = keywordInput.trim().toLowerCase()
    if (kw && !(draft.keywords || []).includes(kw)) {
      updateDraft({ keywords: [...(draft.keywords || []), kw] })
      setKeywordInput('')
    }
  }

  const removeKeyword = (kw: string) => {
    updateDraft({ keywords: (draft.keywords || []).filter((k) => k !== kw) })
  }

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-xs font-medium text-foreground mb-1.5">
          {t('shablonBuilder.shablonName')} <span className="text-destructive">*</span>
        </label>
        <input
          type="text"
          value={draft.label || ''}
          onChange={(e) => handleLabelChange(e.target.value)}
          placeholder={t('shablonBuilder.shablonNamePlaceholder')}
          className="w-full px-3 py-2 text-sm bg-transparent border border-[var(--hairline)] rounded-lg outline-none text-foreground placeholder:text-muted-foreground/40 focus:border-[var(--warm)]/30 transition-colors"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-foreground mb-1.5">
          {t('shablonBuilder.shablonType')} <span className="text-destructive">*</span>
        </label>
        <input
          type="text"
          value={draft.type || ''}
          onChange={(e) => updateDraft({ type: e.target.value })}
          placeholder="my_shablon_type"
          className="w-full px-3 py-2 text-xs font-mono bg-transparent border border-[var(--hairline)] rounded-lg outline-none text-foreground placeholder:text-muted-foreground/40 focus:border-[var(--warm)]/30 transition-colors"
        />
        <p className="text-[10px] text-muted-foreground/50 mt-1">{t('shablonBuilder.typeHint')}</p>
      </div>

      <div>
        <label className="block text-xs font-medium text-foreground mb-1.5">
          {t('shablonBuilder.description')}
        </label>
        <textarea
          value={draft.description || ''}
          onChange={(e) => updateDraft({ description: e.target.value })}
          placeholder={t('shablonBuilder.descriptionPlaceholder')}
          rows={3}
          className="w-full px-3 py-2 text-sm bg-transparent border border-[var(--hairline)] rounded-lg outline-none text-foreground placeholder:text-muted-foreground/40 focus:border-[var(--warm)]/30 transition-colors resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-foreground mb-1.5">
            {t('shablonBuilder.category')}
          </label>
          <select
            value={draft.category || ''}
            onChange={(e) => updateDraft({ category: e.target.value || null })}
            className="w-full px-3 py-2 text-sm bg-transparent border border-[var(--hairline)] rounded-lg outline-none text-foreground appearance-none cursor-pointer focus:border-[var(--warm)]/30 transition-colors"
          >
            <option value="">{t('shablonBuilder.noCategory')}</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-foreground mb-1.5">
            {t('shablonBuilder.visibility')}
          </label>
          <label className="flex items-center gap-2 px-3 py-2 border border-[var(--hairline)] rounded-lg cursor-pointer hover:bg-[var(--surface-hover)] transition-colors">
            <input
              type="checkbox"
              checked={draft.teacher_visible ?? true}
              onChange={(e) => updateDraft({ teacher_visible: e.target.checked })}
              className="rounded border-[var(--hairline)] text-warm focus:ring-warm/30"
            />
            <span className="text-xs text-foreground">{t('shablonBuilder.teacherVisible')}</span>
          </label>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-foreground mb-1.5">
          {t('shablonBuilder.keywords')}
        </label>
        <div className="flex items-center gap-2 mb-2">
          <input
            type="text"
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addKeyword() } }}
            placeholder={t('shablonBuilder.addKeyword')}
            className="flex-1 px-3 py-2 text-sm bg-transparent border border-[var(--hairline)] rounded-lg outline-none text-foreground placeholder:text-muted-foreground/40 focus:border-[var(--warm)]/30 transition-colors"
          />
          <button
            onClick={addKeyword}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Plus className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>
        {(draft.keywords || []).length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {(draft.keywords || []).map((kw) => (
              <span
                key={kw}
                className="flex items-center gap-1 px-2 py-0.5 text-[10px] rounded-full bg-[var(--warm)]/10 text-warm"
              >
                {kw}
                <button onClick={() => removeKeyword(kw)} className="hover:text-destructive transition-colors">
                  <X className="h-2.5 w-2.5" strokeWidth={2} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
