import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useAccountStore } from '@renderer/store/useAccountStore'

interface FieldDef {
  key: string
  label: string
  required: boolean
}

interface FieldCollectorProps {
  schema: { required: string[]; optional: string[] }
  onComplete: (values: Record<string, string>) => void
  onBack: () => void
}

const isDateField = (key: string) =>
  /^(date|start_date|effective_date|issue_date|meeting_date|birth_date|week_start|week_end|replacement_date)$/.test(key)

const isNumericField = (key: string) =>
  /(hours|percent|count|amount|salary|students|total_|gold_|silver_)/.test(key)

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
  class_name: "Sinf",
  academic_year: "O'quv yili",
  date: "Sana (KK.OO.YYYY)",
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
  quarter: "Chorak (I/II/III/IV)",
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
  action_type: "Harakat turi (qabul/ishdan bo'shatish)",
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
  subject_name: "Fan nomi",
  subject_position: "Lavozim",
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

function getSortedFields(fields: string[]): string[] {
  const ordered = fields.filter(f => fieldOrder.includes(f))
  ordered.sort((a, b) => fieldOrder.indexOf(a) - fieldOrder.indexOf(b))
  const remaining = fields.filter(f => !fieldOrder.includes(f))
  return [...ordered, ...remaining]
}

export const FieldCollector = ({ schema, onComplete, onBack }: FieldCollectorProps) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [values, setValues] = useState<Record<string, string>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const { isLoggedIn, userName, schoolName } = useAccountStore()

  const allFields = [...schema.required, ...schema.optional]
  const steps = complexSteps

  const getAutoFill = useCallback((field: string): string | null => {
    const map: Record<string, string | null | undefined> = {
      teacher_name: userName || null,
      employee_name: userName || null,
      sender_name: userName || null,
      school: schoolName || null,
    }
    return map[field] ?? null
  }, [userName, schoolName])

  const visibleFields = getSortedFields(allFields)

  const getFieldLabel = (key: string) => displayNames[key] || key

  const validateField = useCallback((field: string, value: string) => {
    if (schema.required.includes(field) && !value.trim() && !getAutoFill(field)) {
      return `${getFieldLabel(field)} bo'sh bo'lishi mumkin emas`
    }
    if (value.trim() && isDateField(field) && !/^\d{2}\.\d{2}\.\d{4}$/.test(value.trim())) {
      return 'Sana KK.OO.YYYY formatida bo\'lishi kerak'
    }
    if (value.trim() && isNumericField(field) && !/^\d+$/.test(value.trim())) {
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

  const isStepValid = () =>
    schema.required.every(f => values[f]?.trim() || getAutoFill(f))

  const handleNext = () => {
    if (!isStepValid()) {
      const newErrors: Record<string, string> = {}
      schema.required.forEach(f => {
        if (!values[f]?.trim() && !getAutoFill(f)) {
          newErrors[f] = `${getFieldLabel(f)} bo'sh bo'lishi mumkin emas`
        }
      })
      setErrors(newErrors)
      return
    }

    const finalValues = { ...values }
    allFields.forEach(f => {
      if (!finalValues[f]) {
        const auto = getAutoFill(f)
        if (auto) finalValues[f] = auto
        if (f === 'date') finalValues[f] = new Date().toLocaleDateString('ru-RU')
      }
    })

    onComplete(finalValues)
  }

  return (
    <div className="p-7">
      <p className="text-sm font-medium text-[var(--paper-text)] mb-5 tracking-wide">
        Ma'lumotlarni to'ldiring
      </p>

      {visibleFields.map((field) => {
        const auto = getAutoFill(field)
        const defaultValue = auto || ''
        const isRequired = schema.required.includes(field)
        const hasError = !!errors[field]
        const label = getFieldLabel(field)

        return (
          <div key={field} className="mb-4">
            <label className="block text-xs font-medium text-[var(--paper-text)] mb-1.5">
              {label}
              {isRequired && <span className="text-destructive ml-1">*</span>}
            </label>
            <input
              type="text"
              value={values[field] || ''}
              onChange={(e) => handleChange(field, e.target.value)}
              placeholder={defaultValue || (isRequired ? '' : 'Ixtiyoriy')}
              className={`w-full px-3 py-2 text-sm bg-transparent border rounded-md outline-none transition-colors
                ${hasError
                  ? 'border-destructive'
                  : 'border-[var(--input-border)] focus:border-[var(--hairline)]'
                }
                text-[var(--paper-text)] placeholder:text-[var(--paper-text)]/40
              `}
            />
            {auto && (
              <p className="text-[10px] text-[var(--paper-text)]/50 mt-0.5">
                Avtomatik: {auto}
              </p>
            )}
            {hasError && (
              <p className="text-[11px] text-destructive mt-1">{errors[field]}</p>
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
          Tayyor
          <ChevronRight className="h-3.5 w-3.5" strokeWidth={1.5} />
        </button>
      </div>
    </div>
  )
}
