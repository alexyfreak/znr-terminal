export interface UserCtx {
  schoolName?: string
  classes?: string[]
  subjects?: string[]
  teachers?: string[]
  directorName?: string
}

export const displayNames: Record<string, string> = {
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

export function getFieldLabel(key: string): string {
  return displayNames[key] || key
}

export function isDateField(key: string): boolean {
  return /^(date|start_date|effective_date|issue_date|meeting_date|birth_date|week_start|week_end|replacement_date)$/.test(key)
}

export function isNumericField(key: string): boolean {
  return /(hours|percent|count|amount|salary|students|total_|gold_|silver_)/.test(key)
}

export function isPercentField(key: string): boolean {
  return /(percent|mastery|quality)/.test(key)
}

export function isSelectField(key: string): boolean {
  return ['school', 'class_name', 'classes', 'subject', 'subject_name', 'academic_year', 'quarter',
    'recipient_name', 'director_name', 'sender_position', 'position', 'action_type',
    'commission_members', 'chairman', 'secretary', 'replacement_teacher'].includes(key)
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

export function getSelectOptions(key: string, ctx?: UserCtx): { value: string; label: string }[] {
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
      return ctx?.teachers?.map(t => ({ value: t.full_name, label: t.full_name })) || []
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

export function getAutoFillValue(key: string, userCtx?: UserCtx, userName?: string | null, schoolName?: string | null): string | null {
  const map: Record<string, string | null | undefined> = {
    teacher_name: userName || null,
    employee_name: userName || null,
    sender_name: userName || null,
    sender_position: "O'qituvchi",
    school: schoolName || null,
    director_name: userCtx?.directorName || null,
  }
  return map[key] ?? null
}
