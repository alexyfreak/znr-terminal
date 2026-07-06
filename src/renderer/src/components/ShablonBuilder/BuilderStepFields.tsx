import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useShablonBuilderStore, type ShablonField } from '@renderer/store/useShablonBuilderStore'

const FIELD_TYPES: { value: ShablonField['type']; label: string }[] = [
  { value: 'text', label: 'Text' },
  { value: 'textarea', label: 'Textarea' },
  { value: 'date', label: 'Date' },
  { value: 'number', label: 'Number' },
  { value: 'percent', label: 'Percent' },
  { value: 'select', label: 'Select' },
  { value: 'multi-select', label: 'Multi-Select' },
  { value: 'teacher_select', label: 'Teacher Select' },
  { value: 'class_select', label: 'Class Select' },
  { value: 'subject_select', label: 'Subject Select' },
  { value: 'director_select', label: 'Director Select' },
  { value: 'signature', label: 'Signature' },
]

const AUTO_FILL_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'None' },
  { value: 'userName', label: 'User Name' },
  { value: 'schoolName', label: 'School Name' },
  { value: 'directorName', label: 'Director Name' },
]

export const BuilderStepFields = () => {
  const { t } = useTranslation()
  const { draft, updateDraft } = useShablonBuilderStore()
  const fields = draft.fields || []

  const addField = () => {
    const newField: ShablonField = {
      key: `field_${fields.length + 1}`,
      label: '',
      type: 'text',
      required: false,
    }
    updateDraft({ fields: [...fields, newField] })
  }

  const updateField = (index: number, patch: Partial<ShablonField>) => {
    const updated = fields.map((f, i) => (i === index ? { ...f, ...patch } : f))
    updateDraft({ fields: updated })
  }

  const removeField = (index: number) => {
    const updated = fields.filter((_, i) => i !== index)
    updateDraft({ fields: updated })
  }

  const moveField = (from: number, to: number) => {
    const updated = [...fields]
    const [moved] = updated.splice(from, 1)
    updated.splice(to, 0, moved)
    updateDraft({ fields: updated })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-muted-foreground">
          {fields.length} field{fields.length !== 1 ? 's' : ''} defined
        </p>
        <button
          onClick={addField}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-foreground bg-[var(--warm)]/10 hover:bg-[var(--warm)]/20 border border-[var(--hairline)] rounded-lg transition-colors"
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={1.5} />
          {t('shablonBuilder.addField')}
        </button>
      </div>

      <AnimatePresence mode="popLayout">
        {fields.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-[var(--hairline)] rounded-xl"
          >
            <p className="text-sm text-muted-foreground">{t('shablonBuilder.noFields')}</p>
            <button
              onClick={addField}
              className="mt-2 text-xs text-warm hover:text-warm/80 transition-colors"
            >
              {t('shablonBuilder.addFirstField')}
            </button>
          </motion.div>
        ) : (
          <div className="space-y-2">
            {fields.map((field, index) => (
              <FieldEditor
                key={`${field.key}-${index}`}
                field={field}
                index={index}
                total={fields.length}
                onUpdate={(patch) => updateField(index, patch)}
                onRemove={() => removeField(index)}
                onMoveUp={() => index > 0 && moveField(index, index - 1)}
                onMoveDown={() => index < fields.length - 1 && moveField(index, index + 1)}
              />
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

function FieldEditor({
  field,
  index,
  total,
  onUpdate,
  onRemove,
  onMoveUp,
  onMoveDown,
}: {
  field: ShablonField
  index: number
  total: number
  onUpdate: (patch: Partial<ShablonField>) => void
  onRemove: () => void
  onMoveUp: () => void
  onMoveDown: () => void
}) {
  const { t } = useTranslation()
  const [expanded, setExpanded] = useState(false)

  const autoLabel = (key: string) => {
    const labels: Record<string, string> = {
      teacher_name: "O'qituvchi F.I.O",
      school: 'Maktab nomi',
      director_name: 'Direktor F.I.O',
      class_name: 'Sinf',
      subject: 'Fan nomi',
      date: 'Sana',
      reason: 'Sabab / ariza matni',
    }
    return labels[key] || ''
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      className="rounded-xl border border-[var(--hairline)] bg-[var(--surface)] overflow-hidden"
    >
      <div className="flex items-center gap-2 px-3 py-2.5">
        <div className="flex flex-col gap-0.5 text-muted-foreground/40">
          <button onClick={onMoveUp} disabled={index === 0} className="disabled:opacity-20 hover:text-foreground transition-colors">
            <ChevronUp className="h-3 w-3" strokeWidth={2} />
          </button>
          <button onClick={onMoveDown} disabled={index === total - 1} className="disabled:opacity-20 hover:text-foreground transition-colors">
            <ChevronDown className="h-3 w-3" strokeWidth={2} />
          </button>
        </div>

        <span className="text-[10px] text-muted-foreground/50 w-5">{index + 1}</span>

        <div className="flex-1 min-w-0">
          <input
            type="text"
            value={field.label}
            onChange={(e) => {
              const label = e.target.value
              const updates: Partial<ShablonField> = { label }
              if (!field.key || autoLabel(field.key) !== field.label) {
                const generatedKey = label
                  .toLowerCase()
                  .replace(/[ʻ'ʼ`‘’]/g, '')
                  .replace(/[^a-z0-9]+/g, '_')
                  .replace(/^_|_$/g, '')
                updates.key = generatedKey
              }
              onUpdate(updates)
            }}
            placeholder={t('shablonBuilder.fieldLabelPlaceholder')}
            className="w-full bg-transparent text-xs text-foreground outline-none placeholder:text-muted-foreground/40"
          />
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[10px] font-mono text-muted-foreground/50">{field.key}</span>
            <span className="text-[10px] px-1 rounded bg-[var(--warm)]/5 text-muted-foreground">{field.type}</span>
            {field.required && <span className="text-[10px] text-destructive">Required</span>}
          </div>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="p-1 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronDown className={`h-3.5 w-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`} strokeWidth={1.5} />
        </button>
        <button
          onClick={onRemove}
          className="p-1 text-muted-foreground hover:text-destructive transition-colors"
        >
          <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
        </button>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-[var(--hairline)] px-3 py-3 space-y-3"
          >
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] text-muted-foreground mb-1">{t('shablonBuilder.fieldKey')}</label>
                <input
                  type="text"
                  value={field.key}
                  onChange={(e) => onUpdate({ key: e.target.value })}
                  className="w-full px-2 py-1.5 text-xs font-mono bg-transparent border border-[var(--hairline)] rounded-md outline-none text-foreground"
                />
              </div>
              <div>
                <label className="block text-[10px] text-muted-foreground mb-1">{t('shablonBuilder.fieldType')}</label>
                <select
                  value={field.type}
                  onChange={(e) => onUpdate({ type: e.target.value as ShablonField['type'] })}
                  className="w-full px-2 py-1.5 text-xs bg-transparent border border-[var(--hairline)] rounded-md outline-none text-foreground appearance-none cursor-pointer"
                >
                  {FIELD_TYPES.map((ft) => (
                    <option key={ft.value} value={ft.value}>{ft.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] text-muted-foreground mb-1">{t('shablonBuilder.autoFill')}</label>
                <select
                  value={field.autoFill || ''}
                  onChange={(e) => onUpdate({ autoFill: e.target.value || undefined })}
                  className="w-full px-2 py-1.5 text-xs bg-transparent border border-[var(--hairline)] rounded-md outline-none text-foreground appearance-none cursor-pointer"
                >
                  {AUTO_FILL_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] text-muted-foreground mb-1">{t('shablonBuilder.placeholder')}</label>
                <input
                  type="text"
                  value={field.placeholder || ''}
                  onChange={(e) => onUpdate({ placeholder: e.target.value })}
                  className="w-full px-2 py-1.5 text-xs bg-transparent border border-[var(--hairline)] rounded-md outline-none text-foreground"
                />
              </div>
            </div>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={field.required}
                onChange={(e) => onUpdate({ required: e.target.checked })}
                className="rounded border-[var(--hairline)] text-warm focus:ring-warm/30"
              />
              <span className="text-xs text-foreground">{t('shablonBuilder.required')}</span>
            </label>

            {(field.type === 'select' || field.type === 'multi-select') && (
              <div>
                <label className="block text-[10px] text-muted-foreground mb-1">{t('shablonBuilder.options')}</label>
                <OptionsEditor
                  options={field.options || []}
                  onChange={(options) => onUpdate({ options })}
                />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function OptionsEditor({
  options,
  onChange,
}: {
  options: { value: string; label: string }[]
  onChange: (options: { value: string; label: string }[]) => void
}) {
  const addOption = () => {
    onChange([...options, { value: '', label: '' }])
  }

  const updateOption = (index: number, patch: Partial<{ value: string; label: string }>) => {
    const updated = options.map((opt, i) => (i === index ? { ...opt, ...patch } : opt))
    onChange(updated)
  }

  const removeOption = (index: number) => {
    onChange(options.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-1">
      {options.map((opt, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <input
            type="text"
            value={opt.label}
            onChange={(e) => updateOption(i, { label: e.target.value, value: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
            placeholder="Label"
            className="flex-1 px-2 py-1 text-[11px] bg-transparent border border-[var(--hairline)] rounded-md outline-none text-foreground"
          />
          <button
            onClick={() => removeOption(i)}
            className="p-1 text-muted-foreground hover:text-destructive transition-colors"
          >
            <Trash2 className="h-3 w-3" strokeWidth={1.5} />
          </button>
        </div>
      ))}
      <button
        onClick={addOption}
        className="text-[10px] text-warm hover:text-warm/80 transition-colors"
      >
        + Add option
      </button>
    </div>
  )
}
