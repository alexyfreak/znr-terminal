import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface FieldDef {
  key: string
  label: string
  required: boolean
}

interface StepData {
  header: string
  fields: FieldDef[]
}

interface FieldCollectorProps {
  onComplete: (values: Record<string, string>) => void
  onBack: () => void
}

const steps: StepData[] = [
  {
    header: '1-qadam: Asosiy ma\'lumotlar',
    fields: [
      { key: 'school', label: 'Maktab nomi', required: true },
      { key: 'director_name', label: 'Direktor F.I.O', required: true },
      { key: 'teacher_name', label: 'O\'qituvchi F.I.O', required: true },
      { key: 'subject', label: 'Fan nomi', required: true },
      { key: 'class_name', label: 'Sinf', required: true },
      { key: 'academic_year', label: 'O\'quv yili', required: true },
    ],
  },
  {
    header: '2-qadam: Hujjat tafsilotlari',
    fields: [
      { key: 'document_title', label: 'Hujjat nomi', required: true },
      { key: 'date', label: 'Sana (KK.OO.YYYY)', required: true },
      { key: 'reference_number', label: 'Hujjat raqami', required: false },
      { key: 'notes', label: 'Izohlar', required: false },
    ],
  },
  {
    header: '3-qadam: Qo\'shimcha ma\'lumotlar',
    fields: [
      { key: 'recipient_name', label: 'Qabul qiluvchi F.I.O', required: false },
      { key: 'basis', label: 'Asos', required: false },
      { key: 'appendix', label: 'Ilova', required: false },
    ],
  },
]

const isDateField = (key: string) =>
  ['date', 'start_date', 'effective_date'].includes(key)

export const FieldCollector = ({ onComplete, onBack }: FieldCollectorProps) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [values, setValues] = useState<Record<string, string>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})

  const stepDef = steps[currentStep]
  const fields: FieldDef[] = stepDef.fields

  const validateField = useCallback((fdef: FieldDef, value: string) => {
    if (fdef.required && !value.trim()) return `${fdef.label} bo'sh bo'lishi mumkin emas`
    if (value.trim() && isDateField(fdef.key) && !/^\d{2}\.\d{2}\.\d{4}$/.test(value.trim())) {
      return 'Sana KK.OO.YYYY formatida bo\'lishi kerak'
    }
    return null
  }, [])

  const handleChange = (key: string, value: string) => {
    setValues(prev => ({ ...prev, [key]: value }))
    const field = fields.find(f => f.key === key)
    if (field) {
      const err = validateField(field, value)
      setErrors(prev => {
        const next = { ...prev }
        if (err) next[key] = err
        else delete next[key]
        return next
      })
    }
  }

  const isStepValid = () =>
    fields.every(f => !f.required || values[f.key]?.trim())

  const handleNext = () => {
    if (!isStepValid()) {
      const newErrors: Record<string, string> = {}
      fields.forEach(f => {
        if (f.required && !values[f.key]?.trim()) {
          newErrors[f.key] = `${f.label} bo'sh bo'lishi mumkin emas`
        }
      })
      setErrors(newErrors)
      return
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(s => s + 1)
    } else {
      onComplete(values)
    }
  }

  return (
    <div className="p-7">
      <div className="flex gap-1.5 mb-6">
        {steps.map((s, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
              i <= currentStep ? 'bg-[var(--warm)]' : 'bg-[var(--hairline)]'
            }`}
          />
        ))}
      </div>

      <p className="text-sm font-medium text-[var(--paper-text)] mb-5 tracking-wide">{stepDef.header}</p>

      {fields.map((field) => {
        const hasError = !!errors[field.key]
        return (
          <div key={field.key} className="mb-4">
            <label className="block text-xs font-medium text-[var(--paper-text)] mb-1.5">
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </label>
            <input
              type="text"
              value={values[field.key] || ''}
              onChange={(e) => handleChange(field.key, e.target.value)}
              placeholder={field.required ? '' : 'Ixtiyoriy'}
              className={`w-full px-3 py-2 text-sm bg-transparent border rounded-md outline-none transition-colors
                ${hasError
                  ? 'border-destructive'
                  : 'border-[var(--input-border)] focus:border-[var(--hairline)]'
                }
                text-[var(--paper-text)] placeholder:text-[var(--paper-text)]/40
              `}
            />
            {hasError && (
              <p className="text-[11px] text-destructive mt-1">{errors[field.key]}</p>
            )}
          </div>
        )
      })}

      <div className="flex gap-3 mt-6 pt-4 border-t border-[var(--hairline)]">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-2 text-xs text-[var(--paper-text)]/60 hover:text-[var(--paper-text)] transition-colors"
        >
          <ChevronLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
          Ortga
        </button>
        <button
          onClick={handleNext}
          className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-medium text-[var(--paper-text)] bg-[var(--warm)]/10 hover:bg-[var(--warm)]/20 border border-[var(--hairline)] rounded-md transition-colors"
        >
          {currentStep < steps.length - 1 ? 'Keyingi' : 'Tayyor'}
          <ChevronRight className="h-3.5 w-3.5" strokeWidth={1.5} />
        </button>
      </div>
    </div>
  )
}
