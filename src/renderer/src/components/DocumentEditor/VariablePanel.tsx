import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { X, Search, Check, ChevronDown, AlertCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { useEditorStore } from '@renderer/store/useEditorStore'
import {
  isDateField,
  isNumericField,
  isPercentField,
  isSelectField,
  getSelectOptions,
  getAutoFillValue,
} from '@renderer/utils/fieldLabels'
import { useAccountStore } from '@renderer/store/useAccountStore'

interface VariablePanelProps {
  onExport: (values: Record<string, string>) => void
  requiredKeys?: string[]
  exporting?: boolean
}

function Combobox({
  options, value, onChange, placeholder,
  autoFill, required, onFocus,
}: {
  options: { value: string; label: string }[]
  value: string
  onChange: (v: string) => void
  placeholder?: string
  autoFill?: string | null
  required?: boolean
  onFocus?: () => void
}) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(-1)

  const filtered = useMemo(() => {
    if (!query) return options
    const q = query.toLowerCase()
    return options.filter(o => o.label.toLowerCase().includes(q) || o.value.toLowerCase().includes(q))
  }, [options, query])

  useEffect(() => {
    if (!open) setQuery('')
  }, [open])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node
      if (inputRef.current && !inputRef.current.contains(target) &&
          listRef.current && !listRef.current.contains(target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const valueLabel = useMemo(() => {
    if (!value) return ''
    const opt = options.find(o => o.value === value)
    return opt ? opt.label : value
  }, [options, value])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setOpen(true)
        e.preventDefault()
      }
      return
    }
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setActiveIndex(i => Math.min(i + 1, filtered.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setActiveIndex(i => Math.max(i - 1, 0))
        break
      case 'Enter':
        e.preventDefault()
        if (activeIndex >= 0 && activeIndex < filtered.length) {
          onChange(filtered[activeIndex].value)
          setOpen(false)
        }
        break
      case 'Escape':
        setOpen(false)
        break
    }
  }

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-zn-text-muted pointer-events-none" strokeWidth={1.5} />
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-autocomplete="list"
          value={open ? query : valueLabel}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); setActiveIndex(-1) }}
          onFocus={() => { setOpen(true); onFocus?.() }}
          onKeyDown={handleKeyDown}
          placeholder={autoFill || placeholder || t('variablePanel.searchOrType')}
          className="w-full pl-6 pr-7 py-1.5 text-xs bg-zn-elevated border border-zn-border rounded-zn-input outline-none transition-all text-zn-text placeholder:text-zn-text-faint/40 focus:border-zn-text/30"
        />
        {value || query ? (
          <button onClick={() => { onChange(''); setQuery(''); inputRef.current?.focus() }} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-zn-text-muted hover:text-zn-text">
            <X className="h-3 w-3" strokeWidth={1.5} />
          </button>
        ) : (
          <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 h-3 w-3 text-zn-text-faint/40 pointer-events-none" strokeWidth={1.5} />
        )}
      </div>
      {open && (
        <div ref={listRef} role="listbox" className="absolute top-full left-0 right-0 mt-1 max-h-40 overflow-y-auto rounded-zn-popover bg-zn-surface border border-zn-border shadow-lg z-30">
          {filtered.length === 0 ? (
            <p className="px-3 py-2 text-[11px] text-zn-text-muted">{t('variablePanel.noResults')}</p>
          ) : (
            filtered.map((opt, index) => (
              <button
                key={opt.value}
                role="option"
                aria-selected={value === opt.value}
                onClick={() => { onChange(opt.value); setOpen(false) }}
                className={`w-full flex items-center gap-2 px-3 py-1.5 text-[11px] text-left transition-colors hover:bg-zn-elevated ${
                  index === activeIndex ? 'bg-zn-elevated' : ''
                } ${value === opt.value ? 'text-zn-text font-medium' : 'text-zn-text'}`}
              >
                {value === opt.value && <Check className="h-2.5 w-2.5 shrink-0" strokeWidth={2} />}
                {value !== opt.value && <span className="w-2.5 shrink-0" />}
                {opt.label}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}

export const VariablePanel = ({ onExport, requiredKeys, exporting }: VariablePanelProps) => {
  const { t } = useTranslation()
  const {
    pendingVariableKeys, variables, setVariable, setFocusedVariable,
    fieldMeta, focusedVariable, removeVariableKey, prefillVariables,
  } = useEditorStore()

  const { userName, schoolName, classes, teachers, director } = useAccountStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [showCustom, setShowCustom] = useState(false)
  const [customName, setCustomName] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const inputRefs = useRef<Record<string, HTMLDivElement | null>>({})

  const userCtx = useMemo(() => ({
    schoolName: schoolName || undefined,
    classes: classes?.map((c) => c.name) || undefined,
    teachers: teachers?.map((t) => t.full_name) || undefined,
    directorName: director?.full_name || undefined,
  }), [schoolName, classes, teachers, director])

  const getFieldType = useCallback((key: string): string | undefined => {
    if (fieldMeta[key]?.type) return fieldMeta[key]!.type
    if (isDateField(key)) return 'date'
    if (isPercentField(key)) return 'percent'
    if (isNumericField(key)) return 'number'
    if (isSelectField(key)) return 'select'
    return 'text'
  }, [fieldMeta])

  const getOptions = useCallback((key: string): { value: string; label: string }[] => {
    if (fieldMeta[key]?.type === 'teacher_select') {
      return userCtx.teachers?.map((t) => ({ value: t, label: t })) || []
    }
    if (fieldMeta[key]?.type === 'class_select') {
      return userCtx.classes?.map((c) => ({ value: c, label: c })) || []
    }
    if (fieldMeta[key]?.type === 'director_select') {
      return userCtx.directorName ? [{ value: userCtx.directorName, label: userCtx.directorName }] : []
    }
    const selectOptions = getSelectOptions(key, userCtx)
    return selectOptions
  }, [fieldMeta, userCtx])

  const allFields = useMemo(() => {
    return pendingVariableKeys.map(({ key, label }) => {
      const autoVal = getAutoFillValue(key, userCtx, userName, schoolName)
      return {
        key,
        label,
        type: getFieldType(key),
        options: getOptions(key),
        required: requiredKeys?.includes(key) || fieldMeta[key]?.required === true,
        autoFill: autoVal,
        value: variables[key] || '',
      }
    })
  }, [pendingVariableKeys, variables, getFieldType, getOptions, requiredKeys, fieldMeta, userCtx, userName, schoolName])

  const filteredFields = useMemo(() => {
    if (!searchQuery) return allFields
    const q = searchQuery.toLowerCase()
    return allFields.filter(
      f => f.key.toLowerCase().includes(q) || f.label.toLowerCase().includes(q)
    )
  }, [allFields, searchQuery])

  const requiredFields = useMemo(() => filteredFields.filter(f => f.required), [filteredFields])
  const optionalFields = useMemo(() => filteredFields.filter(f => !f.required), [filteredFields])

  useEffect(() => {
    if (focusedVariable && inputRefs.current[focusedVariable]) {
      inputRefs.current[focusedVariable]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      const input = inputRefs.current[focusedVariable]?.querySelector('input, select, textarea')
      if (input) (input as HTMLElement).focus()
    }
  }, [focusedVariable])

  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {}
    if (requiredKeys) {
      for (const key of requiredKeys) {
        if (!variables[key] || variables[key].trim() === '') {
          newErrors[key] = t('variablePanel.requiredField')
        }
      }
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [requiredKeys, variables, t])

  const handleExport = useCallback(() => {
    if (!validate()) {
      const firstError = Object.keys(errors)[0]
      if (firstError && inputRefs.current[firstError]) {
        inputRefs.current[firstError]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
      return
    }
    onExport(variables)
  }, [validate, errors, onExport, variables])

  const addCustomField = useCallback(() => {
    const name = customName.trim()
    if (!name) return
    const key = name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
    if (!key || pendingVariableKeys.some((v) => v.key === key)) return
    useEditorStore.getState().addVariableKey(key, name)
    setCustomName('')
    setShowCustom(false)
  }, [customName, pendingVariableKeys])

  const remainingCustom = pendingVariableKeys.filter(
    pk => !requiredKeys?.includes(pk.key)
  )

  return (
    <div className="flex flex-col shrink-0 relative bg-zn-elevated border-l border-zn-border" style={{ width: 280 }}>
      <div className="shrink-0 px-3 pt-3 pb-2 space-y-2">
        <p className="label-uppercase">{t('variablePanel.variables')}</p>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-zn-text-muted pointer-events-none" strokeWidth={1.5} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('variablePanel.searchFields')}
            className="w-full pl-6 pr-2 py-1.5 text-[11px] bg-zn-surface border border-zn-border rounded-zn-input outline-none transition-all text-zn-text placeholder:text-zn-text-faint/40 focus:border-zn-text/30"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-24">
        {filteredFields.length === 0 ? (
          <p className="text-[11px] text-zn-text-faint/60 mt-4 text-center">
            {searchQuery ? t('variablePanel.noSearchResults') : t('variablePanel.noVariables')}
          </p>
        ) : (
          <>
            {requiredFields.length > 0 && (
              <div className="mb-1">
                <p className="text-[10px] font-medium text-zn-text-muted uppercase tracking-wider mb-1.5">
                  {t('variablePanel.required')}
                </p>
                {requiredFields.map(f => renderField(
                  f, inputRefs, setVariable, setFocusedVariable, setErrors, removeVariableKey, t
                ))}
              </div>
            )}

            {optionalFields.length > 0 && (
              <div>
                {requiredFields.length > 0 && (
                  <div className="border-t border-zn-border my-2" />
                )}
                <p className="text-[10px] font-medium text-zn-text-muted uppercase tracking-wider mb-1.5">
                  {t('variablePanel.optional')}
                </p>
                {optionalFields.map(f => renderField(
                  f, inputRefs, setVariable, setFocusedVariable, setErrors, removeVariableKey, t
                ))}
              </div>
            )}
          </>
        )}

        <div className="mt-3 pt-2 border-t border-zn-border">
          {!showCustom ? (
            <button
              onClick={() => setShowCustom(true)}
              className="w-full text-[11px] text-zn-text-muted hover:text-zn-text transition-colors text-left"
            >
              + {t('variablePanel.addField')}
            </button>
          ) : (
            <div>
              <label className="block text-[11px] font-medium text-zn-text mb-1">
                {t('variablePanel.newVariable')}
              </label>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') addCustomField() }}
                  placeholder={t('variablePanel.fieldName')}
                  autoFocus
                  className="flex-1 px-2 py-1.5 text-[11px] bg-zn-surface border border-zn-border rounded-zn-input outline-none text-zn-text placeholder:text-zn-text-faint/30 focus:border-zn-text/30"
                />
                <button
                  onClick={addCustomField}
                  className="px-2.5 py-1.5 text-[11px] font-medium rounded-zn-btn text-zn-page bg-zn-text hover:opacity-90 transition-all active:scale-90"
                >
                  {t('variablePanel.add')}
                </button>
              </div>
              <button
                onClick={() => { setShowCustom(false); setCustomName('') }}
                className="mt-1 text-[10px] text-zn-text-muted hover:text-zn-text transition-colors"
              >
                {t('variablePanel.cancel')}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-zn-elevated via-zn-elevated/95 to-transparent pt-6">
        <button
          onClick={handleExport}
          disabled={exporting}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-zn-btn transition-all active:scale-[0.98] disabled:opacity-40 bg-zn-text text-zn-page hover:opacity-90"
        >
          {exporting ? (
            <span className="inline-block h-3.5 w-3.5 rounded-full border-2 border-zn-page border-t-transparent animate-spin" />
          ) : <Check className="h-4 w-4" strokeWidth={1.5} />}
          {exporting ? t('variablePanel.generating') : t('variablePanel.generateDocument')}
        </button>
      </div>
    </div>
  )
}

function renderField(
  f: {
    key: string; label: string; type?: string; options: { value: string; label: string }[];
    required: boolean; autoFill: string | null; value: string;
  },
  inputRefs: React.MutableRefObject<Record<string, HTMLDivElement | null>>,
  setVariable: (key: string, value: string) => void,
  setFocusedVariable: (key: string | null) => void,
  setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>,
  removeVariableKey: (key: string) => void,
  t: (key: string) => string,
) {
  const { key, label, type, options, required, autoFill, value } = f
  const isDate = type === 'date'
  const isPercent = type === 'percent'
  const isNum = type === 'number' && !isPercent
  const isTextarea = type === 'textarea' || type === 'multi-select'
  const isSelect = options.length > 0

  return (
    <div
      key={key}
      ref={(el) => { inputRefs.current[key] = el }}
      data-field={key}
      className="mb-2"
    >
      <div className="flex items-center justify-between mb-1">
        <label className="text-[11px] font-medium text-zn-text cursor-pointer" onClick={() => setFocusedVariable(key)}>
          {label}
          {required && <span className="text-zn-error-text ml-0.5">*</span>}
        </label>
        <button
          onClick={() => removeVariableKey(key)}
          className="text-zn-text-faint/30 hover:text-zn-error-text transition-colors shrink-0"
          title={t('variablePanel.remove')}
        >
          <X className="h-3 w-3" strokeWidth={1.5} />
        </button>
      </div>

      {isDate ? (
        <input
          type="date"
          value={value}
          onChange={(e) => setVariable(key, e.target.value)}
          className="w-full px-2.5 py-1.5 text-xs bg-zn-elevated border border-zn-border rounded-zn-input outline-none transition-all text-zn-text [color-scheme:var(--date-picker-scheme)] focus:border-zn-text/30"
        />
      ) : isPercent ? (
        <div className="relative">
          <input
            type="number"
            min={1}
            max={100}
            value={value}
            onChange={(e) => setVariable(key, e.target.value)}
            placeholder={autoFill || '1-100'}
            className="w-full px-2.5 py-1.5 pr-6 text-xs bg-zn-elevated border border-zn-border rounded-zn-input outline-none transition-all text-zn-text placeholder:text-zn-text-faint/30 focus:border-zn-text/30"
          />
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-zn-text-muted pointer-events-none">%</span>
        </div>
      ) : isNum ? (
        <input
          type="number"
          min={0}
          value={value}
          onChange={(e) => setVariable(key, e.target.value)}
          placeholder={autoFill || '0'}
          className="w-full px-2.5 py-1.5 text-xs bg-zn-elevated border border-zn-border rounded-zn-input outline-none transition-all text-zn-text placeholder:text-zn-text-faint/30 focus:border-zn-text/30"
        />
      ) : isTextarea ? (
        <textarea
          value={value}
          onChange={(e) => setVariable(key, e.target.value)}
          rows={3}
          placeholder={autoFill || label}
          className="w-full px-2.5 py-1.5 text-xs bg-zn-elevated border border-zn-border rounded-zn-input outline-none transition-all text-zn-text placeholder:text-zn-text-faint/30 focus:border-zn-text/30 resize-none"
        />
      ) : isSelect ? (
        <Combobox
          options={options}
          value={value}
          onChange={(v) => setVariable(key, v)}
          placeholder={t('variablePanel.searchOrType')}
          autoFill={autoFill}
          required={required}
          onFocus={() => setFocusedVariable(key)}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => setVariable(key, e.target.value)}
          onFocus={() => setFocusedVariable(key)}
          placeholder={autoFill || label}
          className="w-full px-2.5 py-1.5 text-xs bg-zn-elevated border border-zn-border rounded-zn-input outline-none transition-all text-zn-text placeholder:text-zn-text-faint/30 focus:border-zn-text/30"
        />
      )}

      {autoFill && !value && (
        <p className="text-[9px] text-zn-text-faint/50 mt-0.5">{t('variablePanel.autoFill', { value: autoFill })}</p>
      )}
    </div>
  )
}
