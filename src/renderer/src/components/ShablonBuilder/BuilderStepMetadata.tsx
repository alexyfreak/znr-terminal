import { useState } from 'react'
import { X, Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useShablonBuilderStore } from '@renderer/store/useShablonBuilderStore'

const CATEGORIES = [
  "Farmoish / Buyruq",
  "Pedagogik kengash",
  "O'quv hujjatlari",
  "Shaxsiy hujjatlar",
  "Hisobot",
  "Tarif-malaka",
  "Xat va arizalar",
  "Dalolatnoma",
  "Tavsifnoma",
]

export const BuilderStepMetadata = () => {
  const { t } = useTranslation()
  const { draft, updateDraft } = useShablonBuilderStore()
  const [keywordInput, setKeywordInput] = useState('')

  const generateType = (label: string) => {
    return label
      .toLowerCase()
      .replace(/[\u02BB'`\u2018\u2019]/g, '')
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
        <label className="block text-xs font-medium text-zn-text mb-1.5">
          {t('shablonBuilder.shablonName')} <span className="text-zn-error-text">*</span>
        </label>
        <input
          type="text"
          value={draft.label || ''}
          onChange={(e) => handleLabelChange(e.target.value)}
          placeholder={t('shablonBuilder.shablonNamePlaceholder')}
          className="w-full px-3 py-2 text-sm bg-zn-elevated border border-zn-border rounded-zn-input outline-none text-zn-text placeholder:text-zn-text-faint/40 focus:border-zn-text/30 transition-all"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-zn-text mb-1.5">
          {t('shablonBuilder.shablonType')} <span className="text-zn-error-text">*</span>
        </label>
        <input
          type="text"
          value={draft.type || ''}
          onChange={(e) => updateDraft({ type: e.target.value })}
          placeholder="my_shablon_type"
          className="w-full px-3 py-2 text-xs font-mono bg-zn-elevated border border-zn-border rounded-zn-input outline-none text-zn-text placeholder:text-zn-text-faint/40 focus:border-zn-text/30 transition-all"
        />
        <p className="text-[10px] text-zn-text-faint/60 mt-1">{t('shablonBuilder.typeHint')}</p>
      </div>

      <div>
        <label className="block text-xs font-medium text-zn-text mb-1.5">
          {t('shablonBuilder.description')}
        </label>
        <textarea
          value={draft.description || ''}
          onChange={(e) => updateDraft({ description: e.target.value })}
          placeholder={t('shablonBuilder.descriptionPlaceholder')}
          rows={3}
          className="w-full px-3 py-2 text-sm bg-zn-elevated border border-zn-border rounded-zn-input outline-none text-zn-text placeholder:text-zn-text-faint/40 focus:border-zn-text/30 transition-all resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-zn-text mb-1.5">
            {t('shablonBuilder.category')}
          </label>
          <select
            value={draft.category || ''}
            onChange={(e) => updateDraft({ category: e.target.value || null })}
            className="w-full px-3 py-2 text-sm bg-zn-elevated border border-zn-border rounded-zn-input outline-none text-zn-text appearance-none cursor-pointer focus:border-zn-text/30 transition-all"
          >
            <option value="">{t('shablonBuilder.noCategory')}</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-zn-text mb-1.5">
            {t('shablonBuilder.visibility')}
          </label>
          <label className="flex items-center gap-2 px-3 py-2 border border-zn-border rounded-zn-input cursor-pointer hover:bg-zn-elevated transition-all">
            <input
              type="checkbox"
              checked={draft.teacher_visible ?? true}
              onChange={(e) => updateDraft({ teacher_visible: e.target.checked })}
              className="rounded border-zn-border text-zn-text focus:ring-zn-text/30"
            />
            <span className="text-xs text-zn-text">{t('shablonBuilder.teacherVisible')}</span>
          </label>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-zn-text mb-1.5">
          {t('shablonBuilder.keywords')}
        </label>
        <div className="flex items-center gap-2 mb-2">
          <input
            type="text"
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addKeyword() } }}
            placeholder={t('shablonBuilder.addKeyword')}
            className="flex-1 px-3 py-2 text-sm bg-zn-elevated border border-zn-border rounded-zn-input outline-none text-zn-text placeholder:text-zn-text-faint/40 focus:border-zn-text/30 transition-all"
          />
          <button
            onClick={addKeyword}
            className="p-2 text-zn-text-muted hover:text-zn-text transition-colors"
          >
            <Plus className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>
        {(draft.keywords || []).length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {(draft.keywords || []).map((kw) => (
              <span
                key={kw}
                className="flex items-center gap-1 px-2 py-0.5 text-[10px] rounded-zn-btn bg-zn-elevated text-zn-text-muted"
              >
                {kw}
                <button onClick={() => removeKeyword(kw)} className="hover:text-zn-error-text transition-colors">
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
