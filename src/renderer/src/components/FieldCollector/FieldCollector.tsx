import { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Search, X, Check } from 'lucide-react'
import { useAccountStore } from '@renderer/store/useAccountStore'

interface UserContext {
  schoolName?: string
  classes?: string[]
  subjects?: string[]
  teachers?: string[]
  directorName?: string
}

interface FieldCollectorProps {
  schema: { required: string[]; optional: string[] }
  onComplete: (values: Record<string, string>) => void
  onBack: () => void
  userContext?: UserContext
  shablonType?: string
  fields?: ShablonFieldData[]
  steps?: { header: string; fields: string[] }[]
}

const POSITIONS = [
  "O'qituvchi", "Katta o'qituvchi", "Metodist",
  "Sinf rahbari", "Psixolog", "Direktor o'rinbosari",
  "Direktor", "Kotib", "Laborant",
]

const QUARTERS = [
  { value: '1', label: 'I chorak' },
  { value: '2', label: 'II chorak' },
  { value: '3', label: 'III chorak' },
  { value: '4', label: 'IV chorak' },
]

const ACTION_TYPES = [
  { value: 'Qabul qilish', label: 'Qabul qilish' },
  { value: 'Ishdan bo\'shash', label: 'Ishdan bo\'shatish' },
]

const isDateField = (key: string) =>
  /^(date|start_date|effective_date|issue_date|meeting_date|birth_date|week_start|week_end|replacement_date)$/.test(key)

const isNumericField = (key: string) =>
  /(hours|percent|count|amount|salary|students|total_|gold_|silver_)/.test(key)

const isPercentField = (key: string) =>
  /(percent|mastery|quality)/.test(key)

const isSelectField = (key: string): boolean =>
  ['school', 'class_name', 'classes', 'subject', 'subject_name', 'academic_year', 'quarter',
   'recipient_name', 'director_name', 'sender_position', 'position', 'action_type',
   'commission_members', 'chairman', 'secretary', 'replacement_teacher'].includes(key)

function getSelectOptions(key: string, ctx?: UserContext): { value: string; label: string }[] {
  switch (key) {
    case 'school':
      return ctx?.schoolName ? [{ value: ctx.schoolName, label: ctx.schoolName }] : []
    case 'class_name':
    case 'classes':
      return ctx?.classes?.map(c => ({ value: c, label: c })) || []
    case 'subject':
    case 'subject_name':
      return ctx?.subjects?.map(s => ({ value: s, label: s })) || []
    case 'academic_year': {
      const year = new Date().getFullYear()
      return [
        { value: `${year}-${year + 1}`, label: `${year}-${year + 1} o'quv yili` },
        { value: `${year + 1}-${year + 2}`, label: `${year + 1}-${year + 2} o'quv yili` },
      ]
    }
    case 'quarter':
      return QUARTERS
    case 'recipient_name':
    case 'commission_members':
    case 'chairman':
    case 'secretary':
    case 'replacement_teacher':
      return ctx?.teachers?.map(t => ({ value: t, label: t })) || []
    case 'director_name':
      return ctx?.directorName ? [{ value: ctx.directorName, label: ctx.directorName }] : []
    case 'sender_position':
    case 'position':
    case 'subject_position':
      return POSITIONS.map(p => ({ value: p, label: p }))
    case 'action_type':
      return ACTION_TYPES
    default:
      return []
  }
}

function SearchableSelect({ options, value, onChange, placeholder, hasError, disabled }: {
  options: { value: string; label: string }[]
  value: string
  onChange: (v: string) => void
  placeholder?: string
  hasError?: boolean
  disabled?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState(value || '')
  const ref = useRef<HTMLDivElement>(null)

  const filtered = useMemo(() => {
    if (!query) return options
    const q = query.toLowerCase()
    return options.filter(o => o.label.toLowerCase().includes(q) || o.value.toLowerCase().includes(q))
  }, [options, query])

  useEffect(() => {
    setQuery(value || '')
  }, [value])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div ref={ref} className="relative">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" strokeWidth={1.5} />
        <input
          type="text"
          value={open ? query : value || ''}
          onChange={e => { setQuery(e.target.value); if (!open) setOpen(true) }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder || 'Tanlang...'}
          disabled={disabled}
          className={`w-full pl-8 pr-8 py-2 text-sm bg-transparent border rounded-md outline-none transition-colors
            ${hasError ? 'border-destructive' : 'border-[var(--input-border)] focus:border-[var(--hairline)]'}
            text-foreground placeholder:text-muted-foreground/40
          `}
        />
        {value && (
          <button
            onClick={() => { onChange(''); setQuery('') }}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" strokeWidth={1.5} />
          </button>
        )}
      </div>
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 max-h-48 overflow-y-auto rounded-lg bg-[var(--popover)] border border-[var(--hairline)] shadow-lg z-30">
          {filtered.length === 0 ? (
            <p className="px-3 py-2 text-xs text-muted-foreground">Natija topilmadi</p>
          ) : (
            filtered.map(opt => (
              <button
                key={opt.value}
                onClick={() => { onChange(opt.value); setQuery(opt.label); setOpen(false) }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-xs text-left transition-colors hover:bg-[var(--surface-hover)] ${
                  value === opt.value ? 'text-warm bg-warm/10' : 'text-foreground'
                }`}
              >
                {value === opt.value && <Check className="h-3 w-3 shrink-0 text-warm" strokeWidth={2} />}
                {value !== opt.value && <span className="w-3 shrink-0" />}
                {opt.label}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}

const displayNames: Record<string, string> = {
  school: "Maktab nomi",
  director_name: "Direktor F.I.O",
  recipient_name: "Qabul qiluvchi F.I.O",
  teacher_name: "O'qituvchi F.I.O",
  employee_name: "Xodim F.I.O",
  sender_name: "Yuboruvchi F.I.O",
  sender_position: "Yuboruvchi lavozimi",
  position: "Lavozim",
  subject: "Fan nomi",
  subject_name: "Fan nomi",
  class_name: "Sinf",
  academic_year: "O'quv yili",
  date: "Sana",
  reference_number: "Hujjat raqami",
  reason: "Sabab / ariza matni",
  explanation: "Tushuntirish matni",
  order_title: "Buyruq nomi",
  order_number: "Buyruq raqami",
  order_text: "Buyruq matni",
  basis: "Asos",
  appendix: "Ilova",
  notes: "Izohlar",
  meeting_date: "Majlis sanasi",
  meeting_number: "Majlis raqami",
  agenda: "Kun tartibi",
  agenda_items: "Kun tartibi masalalari",
  speeches: "So'zga chiqqanlar",
  decisions: "Qarorlar",
  present_count: "Qatnashganlar soni",
  absent_list: "Yo'q bo'lganlar",
  invited_guests: "Mehmonlar",
  goals: "Fanning maqsadi",
  conclusions: "Xulosa",
  chairman: "Rais",
  secretary: "Kotib",
  quarter: "Chorak",
  period: "Davr (chorak/yil)",
  mastery: "O'zlashtirish %",
  quality: "Sifat %",
  quality_percent: "Sifat foizi",
  mastery_percent: "O'zlashtirish foizi",
  hours_total: "Jami soatlar",
  hours_week: "Haftalik soat",
  total_hours: "Jami soat",
  class: "Sinf",
  classes: "Sinf(lar)",
  week_start: "Hafta boshi",
  week_end: "Hafta oxiri",
  letter_topic: "Xat mavzusi",
  action_type: "Harakat turi",
  salary: "Ish haqi / stavka",
  trial_period: "Sinov muddati",
  total_salary_fund: "Jami tarif fondi",
  bonus_type: "Qo'shimcha to'lov turi",
  total_amount: "Jami summa",
  additional_terms: "Qo'shimcha shartlar",
  working_hours: "Ish vaqti",
  start_date: "Boshlanish sanasi",
  duration: "Muddat",
  effective_date: "Amal qilish sanasi",
  act_number: "Dalolatnoma raqami",
  commission_members: "Komissiya a'zolari",
  item_list: "Mol-mulk ro'yxati",
  students_list: "O'quvchilar ro'yxati",
  graduates_list: "Bitiruvchilar ro'yxati",
  teachers_list: "O'qituvchilar ro'yxati",
  employees_list: "Xodimlar ro'yxati",
  student_full_name: "O'quvchining F.I.O",
  pupil_name: "O'quvchi F.I.O",
  parent_info: "Ota-ona ma'lumoti",
  birth_date: "Tug'ilgan sanasi",
  address: "Manzil",
  health_info: "Salomatlik haqida ma'lumot",
  full_name: "F.I.O",
  documents_list: "Hujjatlar ro'yxati",
  teacher_phone: "O'qituvchi telefoni",
  school_phone: "Maktab telefoni",
  school_address: "Maktab manzili",
  total_students: "Jami o'quvchilar",
  total_teachers: "Jami o'qituvchilar",
  gold_medals: "Oltin medal",
  silver_medals: "Kumush medal",
  medal_list: "Medal olganlar ro'yxati",
  gold_count: "Oltin medal soni",
  certificate_series: "Shahodatnoma seriyasi",
  certificate_number: "Shahodatnoma raqami",
  issue_date: "Berilgan sana",
  olympiad_winners: "Olimpiada g'oliblari",
  education: "Ma'lumoti",
  work_period: "Ish vaqti",
  qualities: "Tavsif",
  achievements: "Yutuqlari",
  awards: "Mukofotlari",
  students_count: "O'quvchilar soni",
  entries: "Yozuvlar",
  ordering: "Tartib raqam",
  total_missed: "Jami qoldirilgan",
  total_replaced: "Jami o'rni to'ldirilgan",
  replaced_lessons: "O'rni to'ldirilgan darslar",
  missed_reason: "Qoldirish sababi",
  replacement_teacher: "O'rniga chiqqan o'qituvchi",
  replacement_date: "O'rniga chiqilgan sana",
  grading_period: "Baholash davri",
  class_or_general: "Sinf yoki umumiy",
  conclusion: "Xulosa",
}

const fieldOrder = [
  'school', 'recipient_name', 'director_name',
  'sender_name', 'teacher_name', 'employee_name', 'sender_position', 'position', 'subject',
  'class_name', 'academic_year', 'classes', 'quarter', 'period',
  'letter_topic', 'reason', 'explanation', 'order_title', 'order_text', 'basis', 'appendix',
  'date', 'reference_number', 'meeting_date', 'meeting_number', 'start_date', 'effective_date',
  'goals', 'conclusions', 'notes', 'additional_terms',
  'hours_total', 'hours_week', 'total_hours',
  'quality_percent', 'mastery_percent', 'mastery', 'quality',
  'salary', 'trial_period', 'bonus_type', 'total_amount',
  'act_number', 'commission_members', 'item_list',
  'students_list', 'graduates_list', 'teachers_list', 'employees_list',
  'full_name', 'pupil_name', 'student_full_name', 'parent_info', 'birth_date', 'address', 'health_info',
  'week_start', 'week_end', 'working_hours', 'duration',
  'present_count', 'absent_list', 'agenda', 'agenda_items', 'speeches', 'decisions',
  'entries', 'total_missed', 'total_replaced', 'replacement_teacher', 'replacement_date',
]

function getSortedFields(fields: string[]): string[] {
  const ordered = fields.filter(f => fieldOrder.includes(f))
  ordered.sort((a, b) => fieldOrder.indexOf(a) - fieldOrder.indexOf(b))
  const remaining = fields.filter(f => !fieldOrder.includes(f))
  return [...ordered, ...remaining]
}

const complexSteps: Record<string, { header: string; fields: string[] }[]> = {
  buyruq_asosiy: [
    { header: '1-qadam: Ma\'lumot', fields: ['order_title', 'order_number', 'date'] },
    { header: '2-qadam: Buyruq matni', fields: ['order_text', 'basis', 'appendix'] },
  ],
  buyruq_kadr: [
    { header: '1-qadam: Ma\'lumot', fields: ['order_title', 'order_number', 'date'] },
    { header: '2-qadam: Buyruq matni', fields: ['action_type', 'employee_name', 'salary', 'trial_period', 'order_text', 'basis'] },
    { header: '3-qadam: Tasdiqlash', fields: ['appendix', 'notes'] },
  ],
  tarif_malaka: [
    { header: '1-qadam: Xodim ma\'lumotlari', fields: ['teacher_name', 'subject', 'position', 'education', 'work_period'] },
    { header: '2-qadam: Hisob-kitob', fields: ['salary', 'total_salary_fund', 'bonus_type', 'total_amount'] },
    { header: '3-qadam: Tasdiqlash', fields: ['date', 'notes'] },
  ],
  pedagogik_kengash_bayoni: [
    { header: '1-qadam: Majlis ma\'lumotlari', fields: ['meeting_number', 'meeting_date', 'present_count', 'absent_list', 'invited_guests'] },
    { header: '2-qadam: Kun tartibi', fields: ['agenda', 'agenda_items', 'speeches'] },
    { header: '3-qadam: Qarorlar', fields: ['decisions', 'conclusions', 'chairman', 'secretary'] },
  ],
  shaxsiy_delo: [
    { header: '1-qadam: O\'quvchi ma\'lumotlari', fields: ['student_full_name', 'birth_date', 'class_name', 'parent_info', 'address', 'health_info'] },
    { header: '2-qadam: Hujjatlar', fields: ['documents_list', 'entries', 'notes'] },
  ],
  dalolatnoma: [
    { header: '1-qadam: Komissiya', fields: ['act_number', 'date', 'commission_members', 'chairman'] },
    { header: '2-qadam: Mulk ro\'yxati', fields: ['item_list', 'conclusion', 'notes'] },
  ],
}

interface Template {
  fields?: ShablonFieldData[]
  steps?: { header: string; fields: string[] }[]
  schema: { required: string[]; optional: string[] }
  type?: string
}

interface ShablonFieldData {
  key: string
  label: string
  type: string
  required: boolean
  defaultValue?: string
  options?: { value: string; label: string }[]
  placeholder?: string
  autoFill?: string
}

export const FieldCollector = ({ schema, onComplete, onBack, userContext, shablonType, fields: propFields, steps: propSteps }: FieldCollectorProps) => {
  const { isLoggedIn, userName, schoolName } = useAccountStore()

  const getAutoFill = useCallback((field: string): string | null => {
    const fieldDef = propFields?.find(f => f.key === field)

    if (fieldDef?.autoFill) {
      const ctxMap: Record<string, string | null | undefined> = {
        userName: userName || null,
        schoolName: schoolName || null,
        directorName: userContext?.directorName || null,
      }
      return ctxMap[fieldDef.autoFill] ?? null
    }

    const map: Record<string, string | null | undefined> = {
      teacher_name: userName || null,
      employee_name: userName || null,
      sender_name: userName || null,
      sender_position: "O'qituvchi",
      school: schoolName || null,
      director_name: userContext?.directorName || null,
    }
    return map[field] ?? null
  }, [userName, schoolName, userContext, propFields])

  // Use propFields only if it has items, otherwise fall back to schema
  const allFields = (propFields && propFields.length > 0)
    ? propFields.map(f => f.key)
    : [...schema.required, ...schema.optional]

  const initialValues = useMemo(() => {
    const init: Record<string, string> = {}
    allFields.forEach(f => {
      const auto = getAutoFill(f)
      if (auto) init[f] = auto
    })
    return init
  }, [allFields, getAutoFill])

  const [values, setValues] = useState<Record<string, string>>(initialValues)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [currentStep, setCurrentStep] = useState(0)
  const formRef = useRef<HTMLDivElement>(null)

  const steps = propSteps || (shablonType ? (complexSteps[shablonType] ?? null) : null)
  const hasSteps = !!(steps && steps.length > 0)
  const totalSteps = hasSteps ? steps!.length : 1

  const visibleFields = useMemo(() => {
    if (steps && currentStep < steps.length) {
      return steps[currentStep].fields
    }
    return getSortedFields(allFields)
  }, [steps, currentStep, allFields])

  const currentHeader = steps && currentStep < steps.length ? steps[currentStep].header : null

  const getFieldLabel = (key: string) => displayNames[key] || key

  const validateField = useCallback((field: string, value: string) => {
    if (schema.required.includes(field) && !value.trim() && !getAutoFill(field)) {
      return `${getFieldLabel(field)} bo'sh bo'lishi mumkin emas`
    }
    if (value.trim() && isDateField(field) && !/^\d{4}-\d{2}-\d{2}$/.test(value.trim())) {
      return 'Sanani tanlang'
    }
    if (value.trim() && isPercentField(field)) {
      const num = parseInt(value, 10)
      if (isNaN(num) || num < 1 || num > 100) return '1-100 oralig\'ida bo\'lishi kerak'
    }
    if (value.trim() && isNumericField(field) && !isPercentField(field) && !/^\d+$/.test(value.trim())) {
      return 'Faqat raqam kiritilishi mumkin'
    }
    return null
  }, [schema, getAutoFill])

  const handleChange = (key: string, value: string) => {
    setValues(prev => ({ ...prev, [key]: value }))
    const err = validateField(key, value)
    setErrors(prev => {
      const next = { ...prev }
      if (err) next[key] = err
      else delete next[key]
      return next
    })
  }

  const isStepValid = () => {
    const fieldsToCheck = (steps && steps[currentStep]) ? steps[currentStep].fields : schema.required
    return fieldsToCheck.every(f =>
      !schema.required.includes(f) || values[f]?.trim() || getAutoFill(f)
    )
  }

  const handleNext = () => {
    if (!isStepValid()) {
      const fieldsToCheck = (steps && steps[currentStep]) ? steps[currentStep].fields : schema.required
      const newErrors: Record<string, string> = {}
      fieldsToCheck.forEach(f => {
        if (schema.required.includes(f) && !values[f]?.trim() && !getAutoFill(f)) {
          newErrors[f] = `${getFieldLabel(f)} bo'sh bo'lishi mumkin emas`
        }
      })
      setErrors(newErrors)
      const firstErrorField = Object.keys(newErrors)[0]
      if (firstErrorField && formRef.current) {
        formRef.current.querySelector(`[data-field="${firstErrorField}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
      return
    }

    if (steps && currentStep < steps.length - 1) {
      setCurrentStep(s => s + 1)
      setErrors({})
      return
    }

    const finalValues = { ...values }
    allFields.forEach(f => {
      if (!finalValues[f]) {
        const auto = getAutoFill(f)
        if (auto) finalValues[f] = auto
        if (f === 'date') finalValues[f] = new Date().toISOString().split('T')[0]
      }
    })

    onComplete(finalValues)
  }

  const renderField = (field: string) => {
    const fieldDef = propFields?.find(f => f.key === field)
    const auto = getAutoFill(field)
    const defaultValue = auto || fieldDef?.defaultValue || ''
    const isRequired = fieldDef ? fieldDef.required : schema.required.includes(field)
    const hasError = !!errors[field]
    const label = fieldDef?.label || getFieldLabel(field)
    const placeholder = fieldDef?.placeholder || auto || (isRequired ? '' : 'Ixtiyoriy')
    const fieldType = fieldDef?.type || ''
    const options = fieldDef?.options?.length
      ? fieldDef.options
      : isSelectField(field) ? getSelectOptions(field, userContext) : []

    const isDateFieldType = fieldType === 'date' || (isDateField(field) && !fieldType)
    const isPercentFieldType = fieldType === 'percent' || (isPercentField(field) && fieldType !== 'number')
    const isNumericFieldType = fieldType === 'number' || fieldType === 'percent' || (isNumericField(field) && !fieldType)
    const isSelectFieldType = fieldType === 'select' || fieldType === 'multi-select' ||
      fieldType === 'teacher_select' || fieldType === 'class_select' ||
      fieldType === 'subject_select' || fieldType === 'director_select' ||
      (isSelectField(field) && !fieldType)
    const isTextareaType = fieldType === 'textarea'

    return (
      <div key={field} data-field={field} className="mb-4">
        <label className="block text-xs font-medium text-foreground mb-1.5">
          {label}
          {isRequired && <span className="text-destructive ml-1">*</span>}
        </label>

        {isDateFieldType ? (
          <input
            type="date"
            value={values[field] || ''}
            onChange={(e) => handleChange(field, e.target.value)}
            className={`w-full px-3 py-2 text-sm bg-transparent border rounded-md outline-none transition-colors
              ${hasError ? 'border-destructive' : 'border-[var(--input-border)] focus:border-[var(--hairline)]'}
              text-foreground [color-scheme:var(--date-picker-scheme)]
            `}
          />
        ) : isPercentFieldType ? (
          <div className="relative">
            <input
              type="number"
              min={1}
              max={100}
              value={values[field] || ''}
              onChange={(e) => handleChange(field, e.target.value)}
              placeholder={placeholder || (isRequired ? '' : '1-100')}
              className={`w-full px-3 py-2 pr-8 text-sm bg-transparent border rounded-md outline-none transition-colors
                ${hasError ? 'border-destructive' : 'border-[var(--input-border)] focus:border-[var(--hairline)]'}
                text-foreground placeholder:text-muted-foreground/40
              `}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">%</span>
          </div>
        ) : isNumericFieldType ? (
          <input
            type="number"
            min={0}
            value={values[field] || ''}
            onChange={(e) => handleChange(field, e.target.value)}
            placeholder={placeholder || (isRequired ? '' : '0')}
            className={`w-full px-3 py-2 text-sm bg-transparent border rounded-md outline-none transition-colors
              ${hasError ? 'border-destructive' : 'border-[var(--input-border)] focus:border-[var(--hairline)]'}
              text-foreground placeholder:text-muted-foreground/40
            `}
          />
        ) : isTextareaType ? (
          <textarea
            value={values[field] || ''}
            onChange={(e) => handleChange(field, e.target.value)}
            placeholder={placeholder}
            rows={4}
            className={`w-full px-3 py-2 text-sm bg-transparent border rounded-md outline-none transition-colors resize-none
              ${hasError ? 'border-destructive' : 'border-[var(--input-border)] focus:border-[var(--hairline)]'}
              text-foreground placeholder:text-muted-foreground/40
            `}
          />
        ) : isSelectFieldType || options.length > 0 ? (
          options.length <= 2 ? (
            <select
              value={values[field] || defaultValue}
              onChange={(e) => handleChange(field, e.target.value)}
              className={`w-full px-3 py-2 text-sm bg-[var(--surface)] border rounded-md outline-none transition-colors appearance-none cursor-pointer
                ${hasError ? 'border-destructive' : 'border-[var(--input-border)] focus:border-[var(--hairline)]'}
                text-foreground
              `}
            >
              <option value="" disabled>Tanlang...</option>
              {options.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          ) : (
            <SearchableSelect
              options={options}
              value={values[field] || ''}
              onChange={(v) => handleChange(field, v)}
              placeholder={auto || 'Qidirish...'}
              hasError={hasError}
              disabled={options.length === 1 && !!auto}
            />
          )
        ) : (
          <input
            type="text"
            value={values[field] || ''}
            onChange={(e) => handleChange(field, e.target.value)}
            placeholder={placeholder}
            className={`w-full px-3 py-2 text-sm bg-transparent border rounded-md outline-none transition-colors
              ${hasError ? 'border-destructive' : 'border-[var(--input-border)] focus:border-[var(--hairline)]'}
              text-foreground placeholder:text-muted-foreground/40
            `}
          />
        )}

        {auto && (
          <p className="text-[10px] text-muted-foreground/50 mt-0.5">Avtomatik: {auto}</p>
        )}
        {hasError && (
          <p className="text-[11px] text-destructive mt-1">{errors[field]}</p>
        )}
      </div>
    )
  }

  return (
    <div ref={formRef} className="p-7">
      {steps && (
        <div className="flex gap-1.5 mb-5">
          {steps.map((s, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                i <= currentStep ? 'bg-warm/40' : 'bg-[var(--hairline)]'
              }`}
            />
          ))}
        </div>
      )}

      {currentHeader ? (
        <p className="text-sm font-medium text-foreground mb-5 tracking-wide">
          {currentHeader}
        </p>
      ) : (
        <p className="text-sm font-medium text-foreground mb-5 tracking-wide">
          Ma'lumotlarni to'ldiring
        </p>
      )}

      {visibleFields.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-sm text-muted-foreground mb-2">
            Hech qanday maydon topilmadi
          </p>
          <p className="text-xs text-muted-foreground/60">
            Bu shablon hali to'ldirilmagan yoki maydonlar belgilanmagan
          </p>
        </div>
      ) : (
        visibleFields.map(renderField)
      )}

      <div className="flex gap-3 mt-6 pt-4 border-t border-[var(--hairline)]">
        <button
          onClick={currentStep > 0 ? () => setCurrentStep(s => s - 1) : onBack}
          className="flex items-center gap-1.5 px-3 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
          {currentStep > 0 ? 'Avvalgi' : 'Ortga'}
        </button>
        <button
          onClick={handleNext}
          className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-medium text-foreground bg-[var(--warm)]/10 hover:bg-[var(--warm)]/20 border border-[var(--hairline)] rounded-md transition-colors"
        >
          {steps && currentStep < steps.length - 1 ? 'Keyingi' : 'Tayyor'}
          <ChevronRight className="h-3.5 w-3.5" strokeWidth={1.5} />
        </button>
      </div>
    </div>
  )
}
