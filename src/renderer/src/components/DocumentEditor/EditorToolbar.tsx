import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Bold, Italic, Underline, Strikethrough, Plus, Sparkles } from 'lucide-react'
import { useEditorStore } from '@renderer/store/useEditorStore'

const FONTS = [
  'Times New Roman',
  'Arial',
  'Courier New',
  'Tahoma',
  'Georgia',
  'Calibri',
]

const SIZES = [10, 12, 14, 16, 18, 20, 24, 28, 32, 36]

const styleIcons = [
  { key: 'bold' as const, icon: Bold },
  { key: 'italic' as const, icon: Italic },
  { key: 'underline' as const, icon: Underline },
  { key: 'strikethrough' as const, icon: Strikethrough },
]

interface EditorToolbarProps {
  onExport?: () => void
  onAiToggle?: () => void
  aiActive?: boolean
}

export const EditorToolbar = ({ onExport, onAiToggle, aiActive }: EditorToolbarProps) => {
  const { t } = useTranslation()
  const {
    fontFamily, setFontFamily,
    fontSize, setFontSize,
    textStyles, toggleStyle,
    pendingVariableKeys,
    appendToTemplate,
  } = useEditorStore()

  const [showVarPicker, setShowVarPicker] = useState(false)

  const insertVariable = useCallback((key: string) => {
    appendToTemplate(`{{${key}}}`)
    setShowVarPicker(false)
  }, [appendToTemplate])

  return (
    <div className="flex items-center gap-1 h-11 px-3 shrink-0 border-b border-zn-border select-none bg-zn-surface">
      <select
        value={fontFamily}
        onChange={(e) => setFontFamily(e.target.value)}
        className="bg-zn-elevated border border-zn-border text-xs rounded-zn-input px-2 py-1 text-zn-text outline-none cursor-pointer"
        style={{ minWidth: 120 }}
      >
        {FONTS.map((f) => (
          <option key={f} value={f} className="bg-zn-surface">{f}</option>
        ))}
      </select>

      <select
        value={fontSize}
        onChange={(e) => setFontSize(Number(e.target.value))}
        className="bg-zn-elevated border border-zn-border text-xs rounded-zn-input px-2 py-1 text-zn-text outline-none cursor-pointer"
        style={{ width: 56 }}
      >
        {SIZES.map((s) => (
          <option key={s} value={s} className="bg-zn-surface">{s}</option>
        ))}
      </select>

      <div className="w-px h-5 mx-1 bg-zn-border" />

      <div className="flex items-center gap-0.5">
        {styleIcons.map(({ key, icon: Icon }) => {
          const active = textStyles[key]
          return (
            <button
              key={key}
              onClick={() => toggleStyle(key)}
              className={`grid h-7 w-7 place-items-center rounded-md transition-all active:scale-90 ${
                active ? 'bg-zn-elevated text-zn-text' : 'text-zn-text-muted hover:text-zn-text hover:bg-zn-elevated/50'
              }`}
            >
              <Icon className="h-3.5 w-3.5" strokeWidth={1.8} />
            </button>
          )
        })}
      </div>

      <div className="flex-1" />

      <div className="relative">
        <button
          onClick={() => setShowVarPicker(!showVarPicker)}
          className="flex items-center gap-1 h-7 px-2 rounded-md text-xs text-zn-text-muted hover:text-zn-text hover:bg-zn-elevated/50 transition-all active:scale-90"
          title={t('editorToolbar.addVariable')}
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={1.8} />
          <span>{t('editorToolbar.variable')}</span>
        </button>

        {showVarPicker && (
          <div className="absolute top-full right-0 mt-1 w-48 max-h-56 overflow-y-auto rounded-zn-popover bg-zn-surface border border-zn-border shadow-lg z-50">
            <p className="px-3 py-2 text-[10px] font-medium text-zn-text-muted uppercase tracking-wider">
              {t('editorToolbar.variables')}
            </p>
            {pendingVariableKeys.length === 0 ? (
              <p className="px-3 py-3 text-[11px] text-zn-text-faint/60 text-center">
                {t('editorToolbar.noVariables')}
              </p>
            ) : (
              pendingVariableKeys.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => insertVariable(key)}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-[11px] text-left text-zn-text hover:bg-zn-elevated transition-colors"
                >
                  <Plus className="h-2.5 w-2.5 shrink-0 text-zn-text-muted" strokeWidth={2} />
                  {label}
                </button>
              ))
            )}
          </div>
        )}
      </div>

      <div className="w-px h-5 mx-1 bg-zn-border" />

      {onAiToggle && (
        <button
          onClick={onAiToggle}
          className={`flex items-center gap-1.5 h-7 px-2.5 rounded-md text-xs transition-all active:scale-90 ${
            aiActive
              ? 'bg-yellow-400/10 text-yellow-400 border border-yellow-400/20'
              : 'text-zn-text-muted hover:text-zn-text hover:bg-zn-elevated/50'
          }`}
          title={t('editorToolbar.aiHelper')}
        >
          <Sparkles className={`h-3.5 w-3.5 ${aiActive ? 'text-yellow-400' : ''}`} strokeWidth={1.8} />
          <span>AI</span>
        </button>
      )}

      {onExport && (
        <button
          onClick={onExport}
          className="flex items-center gap-1.5 h-7 px-3 rounded-md text-xs font-medium bg-zn-text text-zn-page hover:opacity-90 transition-all active:scale-[0.98]"
        >
          {t('editorToolbar.generate')}
        </button>
      )}
    </div>
  )
}
