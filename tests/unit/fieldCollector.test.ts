import { describe, it, expect, beforeEach } from 'vitest'

const displayNames: Record<string, string> = {
  school: "Maktab nomi",
  teacher_name: "O'qituvchi F.I.O",
  date: "Sana",
  hours_total: "Jami soatlar",
  mastery: "O'zlashtirish %",
  quality: "Sifat %",
}

const POSITIONS = ["O'qituvchi", "Katta o'qituvchi", "Metodist", "Sinf rahbari", "Psixolog", "Direktor o'rinbosari", "Direktor", "Kotib", "Laborant"]
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

const isDateField = (key: string) => /^(date|start_date|effective_date|issue_date|meeting_date|birth_date|week_start|week_end|replacement_date)$/.test(key)
const isNumericField = (key: string) => /(hours|percent|count|amount|salary|students|total_|gold_|silver_)/.test(key)
const isPercentField = (key: string) => /(percent|mastery|quality)/.test(key)
const isSelectField = (key: string): boolean =>
  ['school', 'class_name', 'classes', 'subject', 'subject_name', 'academic_year', 'quarter',
   'recipient_name', 'director_name', 'sender_position', 'position', 'action_type',
   'commission_members', 'chairman', 'secretary', 'replacement_teacher'].includes(key)

describe('Field Collector Helpers', () => {
  describe('isDateField', () => {
    it('returns true for date field names', () => {
      expect(isDateField('date')).toBe(true)
      expect(isDateField('start_date')).toBe(true)
      expect(isDateField('birth_date')).toBe(true)
    })
    it('returns false for non-date fields', () => {
      expect(isDateField('school')).toBe(false)
      expect(isDateField('teacher_name')).toBe(false)
    })
  })

  describe('isNumericField', () => {
    it('returns true for numeric field names', () => {
      expect(isNumericField('hours_total')).toBe(true)
      expect(isNumericField('students_count')).toBe(true)
      expect(isNumericField('salary')).toBe(true)
    })
    it('returns false for non-numeric fields', () => {
      expect(isNumericField('school')).toBe(false)
      expect(isNumericField('teacher_name')).toBe(false)
    })
  })

  describe('isPercentField', () => {
    it('returns true for percent field names', () => {
      expect(isPercentField('mastery')).toBe(true)
      expect(isPercentField('quality')).toBe(true)
      expect(isPercentField('quality_percent')).toBe(true)
    })
    it('returns false for non-percent fields', () => {
      expect(isPercentField('hours_total')).toBe(false)
      expect(isPercentField('school')).toBe(false)
    })
  })

  describe('isSelectField', () => {
    it('returns true for known select fields', () => {
      expect(isSelectField('school')).toBe(true)
      expect(isSelectField('class_name')).toBe(true)
      expect(isSelectField('subject')).toBe(true)
      expect(isSelectField('quarter')).toBe(true)
      expect(isSelectField('action_type')).toBe(true)
    })
    it('returns false for non-select fields', () => {
      expect(isSelectField('date')).toBe(false)
      expect(isSelectField('reason')).toBe(false)
      expect(isSelectField('notes')).toBe(false)
    })
  })

  describe('getSelectOptions', () => {
    const ctx = {
      schoolName: '1-Maktab',
      classes: ['9-A', '9-B'],
      subjects: ['Matematika', 'Fizika'],
      teachers: ['Aliyev A.', 'Valiyev V.'],
      directorName: 'Karimov K.',
    }

    const getSelectOptions = (key: string, userCtx?: typeof ctx) => {
      switch (key) {
        case 'school': return userCtx?.schoolName ? [{ value: userCtx.schoolName, label: userCtx.schoolName }] : []
        case 'class_name': case 'classes': return userCtx?.classes?.map(c => ({ value: c, label: c })) || []
        case 'subject': case 'subject_name': return userCtx?.subjects?.map(s => ({ value: s, label: s })) || []
        case 'academic_year': {
          const year = new Date().getFullYear()
          return [
            { value: `${year}-${year + 1}`, label: `${year}-${year + 1} o'quv yili` },
            { value: `${year + 1}-${year + 2}`, label: `${year + 1}-${year + 2} o'quv yili` },
          ]
        }
        case 'quarter': return QUARTERS
        case 'recipient_name': case 'commission_members': case 'chairman': case 'secretary': case 'replacement_teacher':
          return userCtx?.teachers?.map(t => ({ value: t, label: t })) || []
        case 'director_name': return userCtx?.directorName ? [{ value: userCtx.directorName, label: userCtx.directorName }] : []
        case 'sender_position': case 'position': case 'subject_position': return POSITIONS.map(p => ({ value: p, label: p }))
        case 'action_type': return ACTION_TYPES
        default: return []
      }
    }

    it('returns school from context', () => {
      expect(getSelectOptions('school', ctx)).toEqual([{ value: '1-Maktab', label: '1-Maktab' }])
    })

    it('returns empty school when no context', () => {
      expect(getSelectOptions('school')).toEqual([])
    })

    it('returns classes from context', () => {
      expect(getSelectOptions('class_name', ctx)).toEqual([{ value: '9-A', label: '9-A' }, { value: '9-B', label: '9-B' }])
    })

    it('returns subjects from context', () => {
      expect(getSelectOptions('subject', ctx)).toEqual([{ value: 'Matematika', label: 'Matematika' }, { value: 'Fizika', label: 'Fizika' }])
    })

    it('returns dynamic academic years', () => {
      const year = new Date().getFullYear()
      const options = getSelectOptions('academic_year', ctx)
      expect(options).toHaveLength(2)
      expect(options[0].value).toBe(`${year}-${year + 1}`)
      expect(options[1].value).toBe(`${year + 1}-${year + 2}`)
    })

    it('returns quarters', () => {
      expect(getSelectOptions('quarter')).toEqual(QUARTERS)
    })

    it('returns teachers for recipient_name', () => {
      expect(getSelectOptions('recipient_name', ctx)).toEqual([{ value: 'Aliyev A.', label: 'Aliyev A.' }, { value: 'Valiyev V.', label: 'Valiyev V.' }])
    })

    it('returns director name from context', () => {
      expect(getSelectOptions('director_name', ctx)).toEqual([{ value: 'Karimov K.', label: 'Karimov K.' }])
    })

    it('returns empty for unknown field', () => {
      expect(getSelectOptions('unknown_field')).toEqual([])
    })
  })

  describe('Complex Steps Schemas', () => {
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
    }

    it.each(Object.keys(complexSteps))('%s schema has valid structure', (type) => {
      const steps = complexSteps[type]
      expect(steps.length).toBeGreaterThanOrEqual(2)
      steps.forEach((step, i) => {
        expect(step.header).toContain(`${i + 1}-qadam`)
        expect(step.fields.length).toBeGreaterThan(0)
      })
    })

    it('all step fields are unique within a schema', () => {
      for (const [type, steps] of Object.entries(complexSteps)) {
        const allFields = steps.flatMap(s => s.fields)
        const uniqueFields = new Set(allFields)
        expect(uniqueFields.size, `${type}: duplicate fields in steps`).toBe(allFields.length)
      }
    })
  })

  describe('fieldOrder array', () => {
    const fieldOrder = [
      'school', 'recipient_name', 'director_name',
      'sender_name', 'teacher_name', 'employee_name', 'sender_position', 'position', 'subject',
    ]

    it('defines order for common fields at the front', () => {
      expect(fieldOrder[0]).toBe('school')
      expect(fieldOrder[1]).toBe('recipient_name')
    })

    it('getSortedFields puts known fields first in order, then unknown', () => {
      const fields = ['unknown1', 'school', 'unknown2', 'teacher_name']
      const getSortedFields = (f: string[]) => {
        const ordered = f.filter(f2 => fieldOrder.includes(f2))
        ordered.sort((a, b) => fieldOrder.indexOf(a) - fieldOrder.indexOf(b))
        const remaining = f.filter(f2 => !fieldOrder.includes(f2))
        return [...ordered, ...remaining]
      }
      expect(getSortedFields(fields)).toEqual(['school', 'teacher_name', 'unknown1', 'unknown2'])
    })
  })

  describe('validateField', () => {
    const schema = { required: ['teacher_name', 'date'], optional: ['notes'] }
    const getAutoFill = (field: string) => field === 'school' ? '1-Maktab' : null

    const validateField = (field: string, value: string) => {
      if (schema.required.includes(field) && !value.trim() && !getAutoFill(field)) {
        return `${field} bo'sh bo'lishi mumkin emas`
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
    }

    it('returns error for empty required field', () => {
      expect(validateField('teacher_name', '')).toBeTruthy()
    })

    it('returns null for filled required field', () => {
      expect(validateField('teacher_name', 'Aliyev A.')).toBeNull()
    })

    it('returns null for empty optional field', () => {
      expect(validateField('notes', '')).toBeNull()
    })

    it('validates date format (YYYY-MM-DD)', () => {
      expect(validateField('date', '2025-01-01')).toBeNull()
      expect(validateField('date', '01/01/2025')).toBe('Sanani tanlang')
      expect(validateField('date', 'abc')).toBe('Sanani tanlang')
    })

    it('validates percent range', () => {
      expect(validateField('mastery', '50')).toBeNull()
      expect(validateField('mastery', '0')).toBe('1-100 oralig\'ida bo\'lishi kerak')
      expect(validateField('mastery', '101')).toBe('1-100 oralig\'ida bo\'lishi kerak')
      expect(validateField('mastery', 'abc')).toBe('1-100 oralig\'ida bo\'lishi kerak')
    })

    it('validates numeric fields accept only digits', () => {
      expect(validateField('hours_total', '40')).toBeNull()
      expect(validateField('hours_total', 'abc')).toBe('Faqat raqam kiritilishi mumkin')
    })
  })
})
