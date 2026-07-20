import { readFileSync, writeFileSync } from 'fs'
import { createClient } from '@supabase/supabase-js'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

// --- Load env ---
const envPath = resolve(root, '.env')
const envRaw = readFileSync(envPath, 'utf-8')
const supabaseUrl = envRaw.match(/SUPABASE_URL=(.+)/)?.[1]?.trim()
const supabaseKey = envRaw.match(/SUPABASE_ANON_KEY=(.+)/)?.[1]?.trim()
if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// --- Load JSONs ---
const shablon1 = JSON.parse(readFileSync(resolve(root, 'shablon1.json'), 'utf-8'))
const shablon2 = JSON.parse(readFileSync(resolve(root, 'shablon2.json'), 'utf-8'))

// --- Merge (shablon2 superset, dedup by id) ---
const mergedMap = new Map()
for (const t of shablon1.templates) mergedMap.set(t.id, t)
for (const t of shablon2.templates) mergedMap.set(t.id, t)
const allTemplates = [...mergedMap.values()]

// --- Field type inference ---
function inferFieldType(key) {
  if (/(^|_)date(_|$)/.test(key) || key === 'date') return 'date'
  if (/(salary|amount|count|hours|total_|gold_|silver_|students|price|soat)/.test(key)) return 'number'
  if (/(percent|mastery|quality|foizi)/.test(key)) return 'percent'
  if (key === 'director_name') return 'director_select'
  if (key === 'teacher_name' || key === 'employee_name' || key === 'sender_name' || key === 'applicant_name') return 'teacher_select'
  if (key === 'class_name' || key === 'class') return 'class_select'
  if (key === 'subject' || key === 'subject_name') return 'subject_select'
  if (/(signature|imzo)/.test(key)) return 'signature'
  if (/(_text|_list|_table|_description|_body|_items|_content|duties|rights|responsibility|goals|stages|findings|agenda|decisions)/.test(key)) return 'textarea'
  return 'text'
}

function getFieldLabel(key) {
  const labels = {
    school_name: 'Maktab nomi',
    school_address: 'Maktab manzili',
    founder_name: 'Muassis nomi',
    approval_date: 'Tasdiqlash sanasi',
    approving_authority: 'Tasdiqlovchi organ',
    legal_status: 'Yuridik maqomi',
    activity_goals: 'Faoliyat maqsadlari',
    management_structure: 'Boshqaruv tuzilmasi',
    director_name: 'Direktor F.I.O.',
    work_hours: 'Ish vaqti tartibi',
    duties_list: 'Majburiyatlar ro\'yxati',
    rest_days: 'Dam olish kunlari',
    responsibility_measures: 'Javobgarlik choralari',
    position_name: 'Lavozim nomi',
    qualification_requirements: 'Malaka talablari',
    rights_list: 'Huquqlar ro\'yxati',
    responsibility_list: 'Javobgarlik',
    guvohnoma_number: 'Guvohnoma raqami',
    employee_name: 'Xodim F.I.O.',
    issue_date: 'Berilgan sana',
    photo_note: 'Rasm haqida eslatma',
    validity_period: 'Amal qilish muddati',
    academic_year: 'O\'quv yili',
    positions_table: 'Lavozimlar jadvali',
    total_staff_count: 'Jami shtat birliklari',
    fund_amount: 'Ish haqi jamg\'armasi',
    vacation_table: 'Ta\'til jadvali',
    union_agreement_note: 'Kasaba uyushmasi kelishuvi',
    employer_name: 'Ish beruvchi nomi',
    start_date: 'Boshlanish sanasi',
    salary_amount: 'Oylik maosh',
    contract_number: 'Shartnoma raqami',
    contract_duration: 'Shartnoma muddati',
    probation_period: 'Sinov muddati',
    additional_terms: 'Qo\'shimcha shartlar',
    contractor_name: 'Ijrochi nomi',
    work_description: 'Ish tavsifi',
    payment_amount: 'To\'lov miqdori',
    deadline_date: 'Bajarish muddati',
    agreement_number: 'Bitim raqami',
    acceptance_terms: 'Qabul qilish shartlari',
    order_date: 'Buyruq sanasi',
    order_number: 'Buyruq raqami',
    city: 'Shahar',
    hire_date: 'Ishga qabul sanasi',
    basis_document: 'Asos hujjat',
    dismissal_date: 'Bo\'shatish sanasi',
    dismissal_reason: 'Bo\'shatish sababi',
    vacation_start_date: 'Ta\'til boshlanish sanasi',
    vacation_days: 'Ta\'til kunlari',
    destination: 'Boriladigan joy',
    trip_start_date: 'Safarning boshlanishi',
    trip_end_date: 'Safarning tugashi',
    trip_purpose: 'Safar maqsadi',
    acting_person: 'Vazifani bajaruvchi',
    reward_reason: 'Rag\'batlantirish sababi',
    reward_type: 'Rag\'batlantirish turi',
    violation_description: 'Huquqbuzarlik tavsifi',
    penalty_type: 'Jazo turi',
    qualification_category: 'Malaka toifasi',
    attestation_date: 'Attestatsiya sanasi',
    old_position: 'Avvalgi lavozim',
    new_position: 'Yangi lavozim',
    transfer_date: 'O\'tkazish sanasi',
    new_salary_amount: 'Yangi oylik maosh',
    subject: 'Mavzu',
    relevant_excerpt: 'Tegishli ko\'chirma',
    certifying_person: 'Tasdiqlovchi shaxs',
    instruction_text: 'Ko\'rsatma matni',
    directive_text: 'Farmoyish matni',
    control_person: 'Nazorat qiluvchi shaxs',
    parent_name: 'Ota-ona F.I.O.',
    parent_address: 'Ota-ona manzili',
    student_name: 'O\'quvchi F.I.O.',
    class_name: 'Sinf',
    application_date: 'Ariza sanasi',
    attachments_list: 'Ilova qilingan hujjatlar',
    applicant_name: 'Arizachi F.I.O.',
    resignation_date: 'Bo\'shatish sanasi',
    resignation_reason: 'Bo\'shatish sababi',
    current_class: 'Joriy sinf',
    target_class_or_school: 'Mo\'ljallangan sinf/maktab',
    transfer_reason: 'O\'tkazish sababi',
    meeting_date: 'Yig\'ilish sanasi',
    protocol_number: 'Bayonnoma raqami',
    chairperson_name: 'Raislik qiluvchi',
    secretary_name: 'Kotib',
    agenda_items: 'Kun tartibi masalalari',
    attendees_count: 'Qatnashchilar soni',
    decisions_text: 'Qarorlar matni',
    absent_count: 'Yo\'qlar soni',
    sender_name: 'Jo\'natuvchi F.I.O.',
    sender_position: 'Jo\'natuvchi lavozimi',
    recipient_name: 'Qabul qiluvchi F.I.O.',
    notification_text: 'Bildirish matni',
    notification_date: 'Bildirish sanasi',
    commission_members: 'Komissiya a\'zolari',
    inspection_date: 'Tekshiruv sanasi',
    inspection_subject: 'Tekshiruv predmeti',
    findings_text: 'Aniqlangan holatlar',
    grantor_name: 'Ishonch bildiruvchi',
    trustee_name: 'Ishonch oluvchi',
    authority_description: 'Vakolat tavsifi',
    validity_date: 'Amal qilish muddati',
    certificate_number: 'Ma\'lumotnoma raqami',
    purpose_organization: 'Taqdim etiladigan tashkilot',
    birth_date: 'Tug\'ilgan sanasi',
    work_period: 'Ish davri',
    characteristics_text: 'Tavsif matni',
    recommender_name: 'Tavsiya beruvchi',
    recommender_position: 'Tavsiya beruvchi lavozimi',
    candidate_name: 'Nomzod F.I.O.',
    recommendation_text: 'Tavsiya matni',
    full_name: 'F.I.O.',
    birth_place: 'Tug\'ilgan joyi',
    education_history: 'Ta\'lim tarixi',
    work_history: 'Mehnat faoliyati',
    family_status: 'Oilaviy holati',
    current_address: 'Yashash manzili',
    awards_and_activities: 'Mukofotlar va faoliyat',
    receiver_name: 'Oluvchi F.I.O.',
    giver_name: 'Beruvchi F.I.O.',
    item_description: 'Narsa tavsifi',
    receipt_date: 'Olingan sana',
    return_deadline: 'Qaytarish muddati',
    incident_date: 'Voqea sanasi',
    explanation_text: 'Tushuntirish matni',
    letter_date: 'Xat sanasi',
    event_title: 'Tadbir nomi',
    event_date: 'Tadbir sanasi',
    event_place: 'Tadbir joyi',
    organizer_name: 'Tashkilotchi',
    event_description: 'Tadbir tavsifi',
    report_period: 'Hisobot davri',
    achievements_text: 'Erishilgan natijalar',
    problems_text: 'Muammolar',
    statistics_table: 'Statistik ma\'lumotlar',
    recipient_organization: 'Qabul qiluvchi tashkilot',
    letter_body: 'Xat matni',
    reference_number: 'Chiquvchi raqami',
    telegram_text: 'Telegramma matni',
    message_text: 'Xabar matni',
    sent_by: 'Yuborgan shaxs',
    received_by: 'Qabul qilgan shaxs',
    sent_time: 'Yuborilgan vaqt',
    information_text: 'Axborot matni',
    claim_description: 'Da\'vo tavsifi',
    claim_demand: 'Da\'vo talabi',
    request_description: 'Talab tavsifi',
    request_text: 'Iltimos matni',
    guarantee_text: 'Kafolat matni',
    bank_details: 'Bank rekvizitlari',
    inquiry_text: 'So\'rov matni',
    confirmation_text: 'Tasdiq matni',
    teacher_name: 'O\'qituvchi F.I.O.',
    subject: 'Fan nomi',
    goals: 'Maqsadlar',
    textbooks: 'Darsliklar',
    grading_policy: 'Baholash tizimi',
    weekly_topics: 'Haftalik mavzular',
    total_hours: 'Jami soatlar',
    topics_table: 'Mavzular jadvali',
    lesson_topic: 'Dars mavzusi',
    lesson_date: 'Dars sanasi',
    lesson_goals: 'Dars maqsadlari',
    lesson_stages: 'Dars bosqichlari',
    homework: 'Uyga vazifa',
    resources_needed: 'Kerakli resurslar',
    plan_table: 'Reja jadvali',
    class_characteristics: 'Sinf tavsifi',
    absent_parents_count: 'Yo\'q ota-onalar soni',
    assessment_date: 'Baholash sanasi',
    assessment_type: 'Baholash turi',
    scores_table: 'Baholar jadvali',
    assessment_notes: 'Baholash izohlari',
    test_date: 'Nazorat sanasi',
    test_topic: 'Nazorat mavzusi',
    questions_list: 'Savollar ro\'yxati',
    time_limit: 'Vaqt chegarasi',
    grading_criteria: 'Baholash mezonlari',
    observers_list: 'Kuzatuvchilar ro\'yxati',
    results_text: 'Natijalar matni',
    recommendations_text: 'Tavsiyalar',
    analysis_period: 'Tahlil davri',
    strengths_text: 'Kuchli tomonlar',
    improvement_areas: 'Rivojlantirish sohalari',
    goals_next_period: 'Keyingi davr maqsadlari',
    student_results_text: 'O\'quvchilar natijalari',
    professional_development_text: 'Malaka oshirish',
    course_name: 'Kurs nomi',
    course_dates: 'Kurs sanalari',
    current_category: 'Joriy toifa',
    target_category: 'Mo\'ljallangan toifa',
    excursion_place: 'Ekskursiya joyi',
    excursion_date: 'Ekskursiya sanasi',
    students_count: 'O\'quvchilar soni',
    safety_notes: 'Xavfsizlik choralari',
    event_goals: 'Tadbir maqsadlari',
    event_stages: 'Tadbir bosqichlari',
    month_period: 'Oy davri',
    attendance_table: 'Davomat jadvali',
    absence_notes: 'Davomat izohlari',
    program_content: 'Dastur mazmuni',
    olympiad_name: 'Olimpiada nomi',
    achievements_text: 'Yutuqlar',
    olympiad_date: 'Olimpiada sanasi',
    work_period: 'Ish davri',
    activities_plan: 'Ish rejasi',
    expected_results: 'Kutilayotgan natijalar',
    requested_items: 'So\'ralgan jihozlar',
    request_reason: 'So\'rov sababi',
    target_class: 'Mo\'ljallangan sinf',
    program_goals: 'Dastur maqsadlari',
    work_experience_years: 'Ish staji (yil)',
    self_assessment_text: 'O\'zini baholash matni',
    supporting_documents_list: 'Tasdiqlovchi hujjatlar',
  }
  return labels[key] || key.replace(/_/g, ' ')
}

function inferFieldOptions(key) {
  return undefined
}

function generateSteps(required, optional) {
  const steps = []
  if (required.length > 0) {
    steps.push({ header: 'Majburiy maydonlar', fields: required })
  }
  if (optional.length > 0) {
    steps.push({ header: 'Ixtiyoriy maydonlar', fields: optional })
  }
  return steps
}

function generateKeywords(template) {
  const words = new Set()
  words.add(template.id.replace(/_/g, ' '))
  if (template.category) {
    template.category.split(/[\s,]+/).forEach(w => { if (w) words.add(w.toLowerCase()) })
  }
  const labelWords = template.title_uz.split(/[\s,()]+/).filter(w => w.length > 2)
  labelWords.forEach(w => words.add(w.toLowerCase()))
  return [...words]
}

function generateFields(keys, required) {
  return keys.map(key => ({
    key,
    label: getFieldLabel(key),
    type: inferFieldType(key),
    required: required.includes(key),
  }))
}

async function main() {
  console.log(`Loaded ${shablon1.templates.length} templates from shablon1.json`)
  console.log(`Loaded ${shablon2.templates.length} templates from shablon2.json`)
  console.log(`Merged: ${allTemplates.length} unique templates`)

  // Get existing types
  const { data: existing } = await supabase.from('shablons').select('type')
  const existingTypes = new Set((existing || []).map(r => r.type))
  console.log(`Existing templates in DB: ${existingTypes.size}`)

  let inserted = 0
  let skipped = 0

  for (const t of allTemplates) {
    if (existingTypes.has(t.id)) {
      skipped++
      continue
    }

    const requiredFields = generateFields(t.required, t.required)
    const optionalFields = generateFields(t.optional, t.optional)
    const allFields = [...requiredFields, ...optionalFields]
    const steps = generateSteps(t.required, t.optional)
    const keywords = generateKeywords(t)
    const teacherVisible = t.category === 'Pedagogik hujjatlar' || true

    const shablon = {
      type: t.id,
      label: t.title_uz,
      description: null,
      keywords,
      teacher_visible: teacherVisible,
      schema: { required: t.required, optional: t.optional },
      template: t.template,
      fields: allFields,
      steps,
      category: t.category,
      author_id: null,
      published: true,
      version: 1,
    }

    const { error } = await supabase.from('shablons').insert(shablon)
    if (error) {
      console.error(`  FAILED: ${t.id} (${t.title_uz}) — ${error.message}`)
    } else {
      inserted++
    }
  }

  console.log(`\nDone. Inserted: ${inserted}, Skipped (already exist): ${skipped}`)
}

main().catch(console.error)
