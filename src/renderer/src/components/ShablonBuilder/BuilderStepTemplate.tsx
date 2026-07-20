import { useMemo, useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, FileText, ChevronDown, ChevronRight, Beaker, BookOpen, Lightbulb, Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useShablonBuilderStore, type ShablonField } from '@renderer/store/useShablonBuilderStore'

export const BuilderStepTemplate = () => {
  const { t } = useTranslation()
  const { draft, updateDraft } = useShablonBuilderStore()
  const [showPreview, setShowPreview] = useState(false)
  const [showVariables, setShowVariables] = useState(true)
  const [testValues, setTestValues] = useState<Record<string, string>>({})

  const fieldMap = useMemo(() => {
    const map = new Map<string, ShablonField>()
    if (draft.fields) {
      draft.fields.forEach((f) => {
        if (f.key) map.set(f.key, f)
      })
    }
    return map
  }, [draft.fields])

  const fieldKeys = useMemo(() => {
    const keys = new Set<string>()
    if (draft.fields) {
      draft.fields.forEach((f) => {
        if (f.key) keys.add(f.key)
      })
    }
    const templateVars = draft.template?.match(/{{(\w+)}}/g) || []
    templateVars.forEach((v) => keys.add(v.replace(/{{|}}/g, '')))
    return Array.from(keys).sort()
  }, [draft.fields, draft.template])

  const testRendered = useMemo(() => {
    if (!draft.template) return ''
    let result = draft.template.replace(/{{(\w+)}}/g, (_, key) => {
      const field = fieldMap.get(key)
      const label = field?.label || key
      return testValues[key] || `[${label}]`
    })
    return result
  }, [draft.template, testValues, fieldMap])

  return (
    <div className="flex flex-1 h-full">
      {/* Left: Editor */}
      <div className="flex-1 flex flex-col min-w-0 border-r border-zn-border">
        {/* Guidance bar */}
        <div className="flex items-center gap-3 px-4 py-2 bg-zn-elevated/30 border-b border-zn-border">
          <Lightbulb className="h-3.5 w-3.5 text-zn-text-muted shrink-0" strokeWidth={1.5} />
          <p className="text-[11px] text-zn-text-muted">{t('shablonBuilder.templateGuide')}</p>
          <div className="flex-1" />
          <button
            onClick={() => setShowVariables(!showVariables)}
            className={`flex items-center gap-1 px-2 py-1 text-[10px] font-medium rounded-zn-btn transition-all ${
              showVariables ? 'bg-zn-elevated text-zn-text' : 'text-zn-text-muted hover:text-zn-text'
            }`}
          >
            <BookOpen className="h-3 w-3" strokeWidth={1.5} />
            {showVariables ? t('shablonBuilder.hideVars') : t('shablonBuilder.showVars')}
          </button>
          <button
            onClick={() => setShowPreview(!showPreview)}
            className={`flex items-center gap-1 px-2 py-1 text-[10px] font-medium rounded-zn-btn transition-all ${
              showPreview ? 'bg-zn-elevated text-zn-text' : 'text-zn-text-muted hover:text-zn-text'
            }`}
          >
            <Eye className="h-3 w-3" strokeWidth={1.5} />
            {showPreview ? 'Edit' : t('shablonBuilder.preview')}
          </button>
        </div>

        <div className="flex-1 flex" style={{ minHeight: showPreview ? 'auto' : 300 }}>
          {showPreview ? (
            <div className="flex-1 overflow-y-auto p-5">
              <div
                className="text-sm leading-relaxed whitespace-pre-wrap font-serif rounded-zn-card border border-zn-border bg-[var(--paper-bg)] p-5 min-h-full"
                style={{ fontFamily: '"Times New Roman", Times, serif', fontSize: '13px', lineHeight: 1.5, color: 'var(--paper-text)' }}
              >
                {(draft.template || '').split('\n').map((line, i) => (
                  <p key={i} className={line.trim() ? 'mb-1' : 'mb-3'}>
                    {line.split(/({{.+?}})/g).map((part, j) => {
                      if (part.startsWith('{{') && part.endsWith('}}')) {
                        const key = part.slice(2, -2)
                        const val = testValues[key]
                        return (
                          <span
                            key={j}
                            className={`px-0.5 rounded ${val ? 'bg-zn-elevated text-zn-text' : 'text-zn-text-muted bg-zn-elevated/50'}`}
                          >
                            {val || part}
                          </span>
                        )
                      }
                      return <span key={j}>{part}</span>
                    })}
                  </p>
                ))}
                {!draft.template && (
                  <p className="text-zn-text-faint/40 italic">{t('shablonBuilder.previewEmpty')}</p>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col p-4">
              <SyntaxHighlightEditor
                value={draft.template || ''}
                onChange={(val) => updateDraft({ template: val })}
                fieldKeys={fieldKeys}
                fieldMap={fieldMap}
                insertVariable={(key) => {
                  const textarea = document.querySelector('#template-editor') as HTMLTextAreaElement
                  if (textarea) {
                    const start = textarea.selectionStart
                    const end = textarea.selectionEnd
                    const text = draft.template || ''
                    const newText = text.substring(0, start) + `{{${key}}}` + text.substring(end)
                    updateDraft({ template: newText })
                    setTimeout(() => {
                      textarea.focus()
                      textarea.selectionStart = textarea.selectionEnd = start + key.length + 4
                    }, 0)
                  }
                }}
              />
              <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-zn-border flex-wrap">
                <span className="text-[10px] text-zn-text-muted mr-1 shrink-0">{t('shablonBuilder.insertVariable')}:</span>
                {fieldKeys.slice(0, 12).map((key) => {
                  const field = fieldMap.get(key)
                  return (
                    <button
                      key={key}
                      onClick={() => {
                        const editor = document.querySelector('#template-editor') as HTMLTextAreaElement
                        if (editor) {
                          const start = editor.selectionStart
                          const end = editor.selectionEnd
                          const text = draft.template || ''
                          const newText = text.substring(0, start) + `{{${key}}}` + text.substring(end)
                          updateDraft({ template: newText })
                          setTimeout(() => {
                            editor.focus()
                            editor.selectionStart = editor.selectionEnd = start + key.length + 4
                          }, 0)
                        }
                      }}
                      title={field?.label || key}
                      className="px-1.5 py-0.5 text-[10px] font-mono bg-zn-elevated hover:bg-zn-elevated text-zn-text-muted border border-zn-border rounded-zn-btn transition-all"
                    >
                      {'{{' + key + '}}'}
                    </button>
                  )
                })}
                {fieldKeys.length > 12 && (
                  <span className="text-[10px] text-zn-text-muted">+{fieldKeys.length - 12} more</span>
                )}
                {fieldKeys.length === 0 && (
                  <p className="text-[10px] text-zn-text-faint/50 italic">{t('shablonBuilder.noVariables')}</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right: Variables reference panel */}
      <AnimatePresence>
        {showVariables && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 340, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden shrink-0"
          >
            <div className="w-[340px] h-full flex flex-col border-l border-zn-border bg-zn-surface">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-zn-border">
                <span className="text-xs font-medium text-zn-text">{t('shablonBuilder.variables')}</span>
                <span className="text-[10px] text-zn-text-muted">{fieldKeys.length} fields</span>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {fieldKeys.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Beaker className="h-6 w-6 text-zn-text-faint/30 mb-2" strokeWidth={1} />
                    <p className="text-[11px] text-zn-text-muted">{t('shablonBuilder.noFieldsYet')}</p>
                    <p className="text-[10px] text-zn-text-faint/60 mt-1">{t('shablonBuilder.addFieldsGuide')}</p>
                  </div>
                )}

                {fieldKeys.map((key) => {
                  const field = fieldMap.get(key)
                  return (
                    <VariableCard
                      key={key}
                      fieldKey={key}
                      field={field}
                      testValue={testValues[key] || ''}
                      onTestChange={(val) => setTestValues((prev) => ({ ...prev, [key]: val }))}
                      onInsert={() => {
                        const editor = document.querySelector('#template-editor') as HTMLTextAreaElement
                        if (editor) {
                          const start = editor.selectionStart
                          const end = editor.selectionEnd
                          const text = draft.template || ''
                          const newText = text.substring(0, start) + `{{${key}}}` + text.substring(end)
                          updateDraft({ template: newText })
                          setTimeout(() => {
                            editor.focus()
                            editor.selectionStart = editor.selectionEnd = start + key.length + 4
                          }, 0)
                        }
                      }}
                    />
                  )
                })}
              </div>

              {fieldKeys.length > 0 && (
                <div className="border-t border-zn-border p-3">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Beaker className="h-3 w-3 text-zn-text-muted" strokeWidth={1.5} />
                    <span className="text-[10px] font-medium text-zn-text-muted">{t('shablonBuilder.testPreview')}</span>
                  </div>
                  <div
                    className="text-[11px] leading-relaxed whitespace-pre-wrap font-serif rounded-zn-card border border-zn-border bg-[var(--paper-bg)] p-3 max-h-32 overflow-y-auto"
                    style={{ fontFamily: '"Times New Roman", Times, serif', color: 'var(--paper-text)' }}
                  >
                    {testRendered ? (
                      testRendered.split('\n').map((line, i) => (
                        <p key={i} className={line.trim() ? '' : 'h-2'}>{line || '\u00A0'}</p>
                      ))
                    ) : (
                      <p className="text-zn-text-faint/40 italic">{t('shablonBuilder.previewEmpty')}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Syntax Highlighted Editor ───────────────────────────────────────────

function SyntaxHighlightEditor({
  value,
  onChange,
  fieldKeys,
  fieldMap,
}: {
  value: string
  onChange: (val: string) => void
  fieldKeys: string[]
  fieldMap: Map<string, ShablonField>
  insertVariable: (key: string) => void
}) {
  const { t } = useTranslation()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const backdropRef = useRef<HTMLPreElement>(null)
  const [suggestions, setSuggestions] = useState<{ key: string; label: string; type: string; index: number }[]>([])
  const [suggestionIndex, setSuggestionIndex] = useState(0)
  const [suggestionPos, setSuggestionPos] = useState({ top: 0, left: 0 })
  const [currentToken, setCurrentToken] = useState('')

  const syncScroll = useCallback(() => {
    if (textareaRef.current && backdropRef.current) {
      backdropRef.current.scrollTop = textareaRef.current.scrollTop
      backdropRef.current.scrollLeft = textareaRef.current.scrollLeft
    }
  }, [])

  const highlighted = useMemo(() => {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/(\{\{(\w+)\}\})/g, (_, full, key) => {
        const field = fieldMap.get(key)
        const color = field
          ? field.type === 'date' ? 'var(--syn-date)'
            : field.type === 'number' || field.type === 'percent' ? 'var(--syn-number)'
            : field.type === 'textarea' ? 'var(--syn-textarea)'
            : field.type?.includes('select') ? 'var(--syn-select)'
            : 'var(--syn-default)'
          : 'var(--syn-default)'
        return `<span style="color:${color};background:color-mix(in srgb, ${color} 10%, transparent);border-radius:3px;padding:0 3px;font-weight:500">${full}</span>`
      })
      .replace(/(\n)/g, '$1')
  }, [value, fieldMap])

  const getCaretCoordinates = (): { top: number; left: number } => {
    const textarea = textareaRef.current
    if (!textarea) return { top: 0, left: 0 }
    const rect = textarea.getBoundingClientRect()
    const pos = textarea.selectionStart
    const text = value.substring(0, pos)
    const lines = text.split('\n')
    const lineNumber = lines.length - 1
    const colNumber = lines[lines.length - 1].length

    const lineHeight = 20
    const charWidth = 8.4
    const paddingLeft = 12
    const paddingTop = 12

    return {
      top: rect.top + paddingTop + lineNumber * lineHeight + lineHeight,
      left: rect.left + paddingLeft + colNumber * charWidth,
    }
  }

  const checkAutocomplete = useCallback(() => {
    const textarea = textareaRef.current
    if (!textarea) return
    const pos = textarea.selectionStart
    const text = value.substring(0, pos)

    const lastOpen = text.lastIndexOf('{{')
    if (lastOpen === -1) {
      setSuggestions([])
      return
    }

    const between = text.substring(lastOpen + 2)
    const closeBrace = between.indexOf('}}')
    if (closeBrace !== -1 && closeBrace < pos - lastOpen - 2) {
      setSuggestions([])
      return
    }

    const token = between.toLowerCase()

    const matches = fieldKeys
      .filter((k) => k.toLowerCase().includes(token))
      .map((k, i) => {
        const field = fieldMap.get(k)
        return {
          key: k,
          label: field?.label || k,
          type: field?.type || 'text',
          index: i,
        }
      })

    if (matches.length > 0) {
      const coords = getCaretCoordinates()
      setSuggestions(matches)
      setSuggestionIndex(0)
      setCurrentToken(token)
      setSuggestionPos(coords)
    } else {
      setSuggestions([])
    }
  }, [value, fieldKeys, fieldMap])

  useEffect(() => {
    checkAutocomplete()
  }, [value, checkAutocomplete])

  const applySuggestion = (key: string) => {
    const textarea = textareaRef.current
    if (!textarea) return
    const pos = textarea.selectionStart
    const text = value
    const lastOpen = text.substring(0, pos).lastIndexOf('{{')
    if (lastOpen === -1) return

    const before = text.substring(0, lastOpen)
    const after = text.substring(pos)
    const newText = before + `{{${key}}}` + after
    onChange(newText)
    setSuggestions([])
    setTimeout(() => {
      textarea.focus()
      const newPos = lastOpen + key.length + 4
      textarea.selectionStart = textarea.selectionEnd = newPos
    }, 0)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSuggestionIndex((i) => Math.min(i + 1, suggestions.length - 1))
        return
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSuggestionIndex((i) => Math.max(i - 1, 0))
        return
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault()
        applySuggestion(suggestions[suggestionIndex].key)
        return
      }
      if (e.key === 'Escape') {
        setSuggestions([])
        return
      }
    }
  }

  return (
    <div className="relative flex-1 rounded-zn-card border border-zn-border overflow-hidden bg-zn-surface">
      <pre
        ref={backdropRef}
        className="absolute inset-0 m-0 p-3 font-mono text-sm leading-5 whitespace-pre-wrap break-all overflow-auto pointer-events-none select-none"
        style={{
          color: 'var(--zn-text)',
          background: 'transparent',
          lineHeight: '20px',
          fontSize: '13px',
          fontFamily: "'Cascadia Code', 'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
          tabSize: 2,
        }}
        dangerouslySetInnerHTML={{ __html: highlighted + '\n' }}
        aria-hidden="true"
      />

      <textarea
        id="template-editor"
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onScroll={syncScroll}
        onKeyDown={handleKeyDown}
        onClick={checkAutocomplete}
        placeholder={t('shablonBuilder.templatePlaceholder')}
        spellCheck={false}
        className="relative w-full h-full min-h-[300px] p-3 font-mono text-sm leading-5 bg-transparent text-transparent caret-zn-text border-none outline-none resize-none selection:bg-zn-text/20"
        style={{
          lineHeight: '20px',
          fontSize: '13px',
          fontFamily: "'Cascadia Code', 'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
          tabSize: 2,
          WebkitTextFillColor: 'transparent',
        }}
      />

      <AnimatePresence>
        {suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="fixed z-50 w-64 rounded-zn-popover border border-zn-border glass-strong shadow-xl overflow-hidden"
            style={{
              top: suggestionPos.top + 100,
              left: suggestionPos.left + 40,
            }}
          >
            <div className="px-3 py-1.5 text-[10px] text-zn-text-muted border-b border-zn-border">
              {t('shablonBuilder.suggestions')}
            </div>
            {suggestions.map((s, i) => (
              <button
                key={s.key}
                onClick={() => applySuggestion(s.key)}
                onMouseEnter={() => setSuggestionIndex(i)}
                className={`w-full flex items-center gap-2 px-3 py-2 text-left transition-colors ${
                  i === suggestionIndex ? 'bg-zn-elevated' : 'hover:bg-zn-elevated/50'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                  s.type === 'date' ? 'bg-blue-400'
                    : s.type === 'number' || s.type === 'percent' ? 'bg-amber-400'
                    : s.type === 'textarea' ? 'bg-purple-400'
                    : s.type?.includes('select') ? 'bg-emerald-400'
                    : 'bg-pink-400'
                }`} />
                <span className="text-xs font-mono text-zn-text font-medium">{s.key}</span>
                <span className="text-[10px] text-zn-text-muted flex-1 truncate">{s.label}</span>
                <span className="text-[9px] px-1 rounded bg-zn-elevated text-zn-text-muted">{s.type}</span>
              </button>
            ))}
            <div className="px-3 py-1.5 text-[9px] text-zn-text-faint/50 border-t border-zn-border flex gap-3">
              <span>Tab / Enter → insert</span>
              <span>↑↓ → navigate</span>
              <span>Esc → close</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Variable Card ───────────────────────────────────────────────────────

function VariableCard({
  fieldKey,
  field,
  testValue,
  onTestChange,
  onInsert,
}: {
  fieldKey: string
  field?: ShablonField
  testValue: string
  onTestChange: (val: string) => void
  onInsert: () => void
}) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="rounded-zn-card border border-zn-border bg-zn-surface overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-zn-elevated transition-colors"
      >
        {expanded ? (
          <ChevronDown className="h-3 w-3 text-zn-text-muted shrink-0" strokeWidth={2} />
        ) : (
          <ChevronRight className="h-3 w-3 text-zn-text-muted shrink-0" strokeWidth={2} />
        )}
        <span className="text-xs font-mono text-zn-text font-medium">{fieldKey}</span>
        <span className="text-[10px] text-zn-text-muted flex-1 truncate">{field?.label || ''}</span>
        <span className="text-[9px] px-1 rounded-zn-btn bg-zn-elevated text-zn-text-muted">
          {field?.type || 'text'}
        </span>
        <span className="text-[10px] text-zn-text-faint/60">{field?.required ? 'Required' : 'Opt'}</span>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-zn-border"
          >
            <div className="p-3 space-y-2">
              <div className="flex items-center gap-2 text-[10px] text-zn-text-muted">
                <span className="font-mono bg-zn-elevated px-1.5 py-0.5 rounded-zn-input">
                  {'{{' + fieldKey + '}}'}
                </span>
                {field?.autoFill && (
                  <span className="bg-zn-elevated text-zn-text-muted px-1.5 py-0.5 rounded-zn-input">
                    auto: {field.autoFill}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type={field?.type === 'date' ? 'date' : 'text'}
                  value={testValue}
                  onChange={(e) => onTestChange(e.target.value)}
                  placeholder={'Test value for ' + fieldKey}
                  className="flex-1 px-2 py-1.5 text-[11px] bg-zn-elevated border border-zn-border rounded-zn-input outline-none text-zn-text placeholder:text-zn-text-faint/40 focus:border-zn-text/30 transition-all"
                />
                <button
                  onClick={onInsert}
                  className="p-1.5 text-zn-text-muted hover:text-zn-text transition-colors"
                  title="Insert into template"
                >
                  <Check className="h-3 w-3" strokeWidth={2} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
