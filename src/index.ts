import inquirer from 'inquirer';
import { resolve } from 'path';
import { authenticate } from './auth.js';
import { showMenu } from './menu.js';
import { renderTemplate } from './renderer.js';
import { generateDocx, generateOutputFilename, ensureOutputDir } from './docx.js';
import { type Teacher } from './db.js';

const displayNames: Record<string, string> = {
  recipient_title: "Qabul qiluvchi unvoni (Direktor/v.b.)",
  recipient_name: "Qabul qiluvchi F.I.O",
  sender_name: "Yuboruvchi F.I.O",
  sender_position: "Yuboruvchi lavozimi",
  reason: "Sabab / ariza matni",
  date: "Sana (KK.OO.YYYY)",
  reference_number: "Hujjat raqami",
  classes: "Sinf(lar)",
  week_start: "Hafta boshi",
  week_end: "Hafta oxiri",
  total_hours: "Jami soat",
  class_name: "Sinf",
  hours_total: "Jami soatlar",
  hours_week: "Haftalik soat",
  quarter: "Chorak (I/II/III/IV)",
  quality_percent: "Sifat foizi",
  mastery_percent: "O'zlashtirish foizi",
  goals: "Fanning maqsadi",
  period: "Davr (chorak/yil)",
  mastery: "O'zlashtirish %",
  quality: "Sifat %",
  conclusions: "Xulosa",
  letter_topic: "Xat mavzusi",
  explanation: "Tushuntirish matni",
  order_number: "Buyruq raqami",
  order_title: "Buyruq nomi",
  order_text: "Buyruq matni",
  basis: "Asos",
  appendix: "Ilova",
  action_type: "Harakat turi (qabul/ishdan bo'shatish)",
  salary: "Ish haqi / stavka",
  trial_period: "Sinov muddati",
  notes: "Izohlar",
  act_number: "Dalolatnoma raqami",
  commission_members: "Komissiya a'zolari",
  item_list: "Mol-mulk ro'yxati",
  school: "Maktab nomi",
  director_name: "Direktor F.I.O",
  teacher_name: "O'qituvchi F.I.O",
  employee_name: "Xodim F.I.O",
  teacher_phone: "O'qituvchi telefoni",
  school_phone: "Maktab telefoni",
  school_address: "Maktab manzili",
  subject: "Fan nomi",
  position: "Lavozim",
  academic_year: "O'quv yili",
  conclusion: "Xulosa",
  chairman: "Rais",
  secretary: "Kotib",
  meeting_date: "Majlis sanasi",
  meeting_number: "Majlis raqami",
  agenda: "Kun tartibi",
  agenda_items: "Kun tartibi masalalari",
  speeches: "So'zga chiqqanlar",
  decisions: "Qarorlar",
  present_count: "Qatnashganlar soni",
  absent_list: "Yo'q bo'lganlar",
  invited_guests: "Mehmonlar",
  total_students: "Jami o'quvchilar",
  total_teachers: "Jami o'qituvchilar",
  students_list: "O'quvchilar ro'yxati",
  graduates_list: "Bitiruvchilar ro'yxati",
  olympiad_winners: "Olimpiada g'oliblari",
  gold_medals: "Oltin medal",
  silver_medals: "Kumush medal",
  medal_list: "Medal olganlar ro'yxati",
  total_salary_fund: "Jami tarif fondi",
  teachers_list: "O'qituvchilar ro'yxati",
  employees_list: "Xodimlar ro'yxati",
  total_amount: "Jami summa",
  bonus_type: "Qo'shimcha to'lov turi",
  subject_name: "Fan nomi",
  subject_position: "Lavozim",
  education: "Ma'lumoti",
  work_period: "Ish vaqti",
  qualities: "Tavsif",
  achievements: "Yutuqlari",
  awards: "Mukofotlari",
  students_count: "O'quvchilar soni",
  entries: "Yozuvlar",
  ordering: "Tartib raqam",
  full_name: "F.I.O",
  class: "Sinf",
  gold_count: "Oltin medal soni",
  certificate_series: "Shahodatnoma seriyasi",
  certificate_number: "Shahodatnoma raqami",
  issue_date: "Berilgan sana",
  pupil_name: "O'quvchi F.I.O",
  parent_info: "Ota-ona ma'lumoti",
  birth_date: "Tug'ilgan sanasi",
  address: "Manzil",
  health_info: "Salomatlik haqida ma'lumot",
  documents_list: "Hujjatlar ro'yxati",
  weekday_schedule: "Haftalik dars jadvali",
  effective_date: "Amal qilish sanasi",
  grading_period: "Baholash davri",
  student_full_name: "O'quvchining F.I.O",
  class_or_general: "Sinf yoki umumiy",
  total_missed: "Jami qoldirilgan",
  total_replaced: "Jami o'rni to'ldirilgan",
  replaced_lessons: "O'rni to'ldirilgan darslar",
  missed_reason: "Qoldirish sababi",
  replacement_teacher: "O'rniga chiqqan o'qituvchi",
  replacement_date: "O'rniga chiqilgan sana",
  additional_terms: "Qo'shimcha shartlar",
  working_hours: "Ish vaqti",
  start_date: "Boshlanish sanasi",
  duration: "Muddat",
};

const FIELD_ORDER: string[] = [
  'school', 'recipient_title', 'recipient_name', 'director_name',
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
  'week_start', 'week_end', 'weekday_schedule', 'working_hours', 'duration',
  'present_count', 'absent_list', 'agenda', 'agenda_items', 'speeches', 'decisions',
  'entries', 'total_missed', 'total_replaced', 'replacement_teacher', 'replacement_date',
];

function sortFieldsByPriority(fields: string[]): string[] {
  const ordered = fields.filter(f => FIELD_ORDER.includes(f));
  ordered.sort((a, b) => FIELD_ORDER.indexOf(a) - FIELD_ORDER.indexOf(b));
  const remaining = fields.filter(f => !FIELD_ORDER.includes(f));
  return [...ordered, ...remaining];
}

const COMPLEX_DOC_STEPS: Record<string, { header: string; fields: string[] }[]> = {
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
};

function isDateField(field: string): boolean {
  return /^(date|start_date|effective_date|issue_date|meeting_date|birth_date|week_start|week_end|replacement_date)$/.test(field);
}

function isNumericField(field: string): boolean {
  return /(hours|percent|count|amount|salary|students|total_|gold_|silver_)/.test(field);
}

function autoFillValue(fieldName: string, context: Awaited<ReturnType<typeof authenticate>>): string | null {
  const map: Record<string, string | null | undefined> = {
    school: context.school?.name,
    recipient_name: context.director?.full_name,
    director_name: context.director?.full_name,
    sender_name: context.user?.full_name,
    teacher_name: context.user?.full_name,
    employee_name: context.user?.full_name,
    sender_position: context.user?.position,
    position: context.user?.position,
    class_name: context.classes?.[0]?.name,
    academic_year: context.classes?.[0]?.academic_year,
    school_phone: context.school?.phone,
    school_address: context.school?.address,
    teacher_phone: context.user?.phone,
  };

  if (context.role === 'teacher') {
    const teacher = context.user as Teacher;
    map.subject = teacher.subject;
  }

  return map[fieldName] ?? null;
}

async function main() {
  const context = await authenticate();

  while (true) {
    const shablon = await showMenu(context);

    const rawSchema = shablon.schema || {};
    const schema = {
      required: Array.isArray(rawSchema.required) ? rawSchema.required : [],
      optional: Array.isArray(rawSchema.optional) ? rawSchema.optional : [],
    };

    const values: Record<string, string> = {};
    const allFields = [...schema.required, ...schema.optional];
    const steps = COMPLEX_DOC_STEPS[shablon.type];

    console.log('');
    console.log(`  ${shablon.label} uchun ma'lumotlar:`);
    console.log('');

    if (steps) {
      for (const step of steps) {
        console.log(`  --- ${step.header} ---`);
        console.log('');

        const stepRequired = step.fields.filter(f => schema.required.includes(f));
        const stepOptional = step.fields.filter(f => schema.optional.includes(f));
        const remainingRequired = schema.required.filter(f => !step.fields.includes(f));
        const remainingOptional = schema.optional.filter(f => !step.fields.includes(f));

        for (const field of [...stepRequired, ...stepOptional]) {
          await promptField(field, values, context, schema);
        }
      }

      const promptedInSteps = steps.flatMap(s => s.fields);
      const leftoverRequired = schema.required.filter(f => !promptedInSteps.includes(f));
      const leftoverOptional = schema.optional.filter(f => !promptedInSteps.includes(f));

      if (leftoverRequired.length > 0 || leftoverOptional.length > 0) {
        console.log('  --- Qo\'shimcha ma\'lumotlar ---');
        console.log('');
      }

      for (const field of sortFieldsByPriority(leftoverRequired)) {
        await promptField(field, values, context, schema);
      }
      for (const field of sortFieldsByPriority(leftoverOptional)) {
        await promptField(field, values, context, schema);
      }
    } else {
      for (const field of sortFieldsByPriority(schema.required)) {
        await promptField(field, values, context, schema);
      }
      for (const field of sortFieldsByPriority(schema.optional)) {
        await promptField(field, values, context, schema);
      }
    }

    const rendered = renderTemplate(shablon.template, values);

    console.log('');
    console.log('  Tayyor matn:');
    console.log('  ' + '-'.repeat(50));
    rendered.split('\n').forEach(l => console.log(`  ${l}`));
    console.log('  ' + '-'.repeat(50));

    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: 'Hujjat yaratilsinmi?',
        default: true,
      },
    ]);

    if (confirm) {
      const outputDir = resolve(process.cwd(), 'output');
      ensureOutputDir(outputDir);
      const filename = generateOutputFilename(shablon.type, context.user.full_name);
      const outputPath = resolve(outputDir, filename);

      console.log('');
      console.log(`  Hujjat yaratilmoqda...`);

      await generateDocx(rendered, outputPath, context.school ? { name: context.school.name, address: context.school.address, phone: context.school.phone } : undefined);

      console.log(`  ${'='.repeat(45)}`);
      console.log(`  ✅ Hujjat saqlandi: ${outputPath}`);
      console.log(`  ${'='.repeat(45)}`);
    }

    const { again } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'again',
        message: 'Yana hujjat yaratish?',
        default: true,
      },
    ]);

    if (!again) {
      console.log('');
      console.log('Dastur yakunlandi. Xayr!');
      break;
    }
  }
}

async function promptField(
  field: string,
  values: Record<string, string>,
  context: Awaited<ReturnType<typeof authenticate>>,
  schema: { required: string[]; optional: string[] },
): Promise<void> {
  const auto = autoFillValue(field, context);
  const label = displayNames[field] || field;
  const isRequired = schema.required.includes(field);
  const fieldDefaults: Record<string, string> = {
    date: new Date().toLocaleDateString('ru-RU'),
  };
  const defaultValue = auto || fieldDefaults[field] || undefined;

  if (isRequired) {
    const { value } = await inquirer.prompt([
      {
        type: 'input',
        name: 'value',
        message: `${label}:`,
        default: defaultValue,
        validate: (input: string) => {
          if (defaultValue) return true;
          if (!input || input.trim().length === 0) {
            return `${label} bo'sh bo'lishi mumkin emas`;
          }
          if (isDateField(field) && !/^\d{2}\.\d{2}\.\d{4}$/.test(input)) {
            return 'Sana KK.OO.YYYY formatida bo\'lishi kerak';
          }
          if (isNumericField(field) && !/^\d+$/.test(input.trim())) {
            return 'Faqat raqam kiritilishi mumkin';
          }
          return true;
        },
      },
    ]);
    values[field] = value || auto || '';
  } else {
    if (auto) {
      const { include } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'include',
          message: `${label}: ${auto} (avtomatik)`,
          default: true,
        },
      ]);
      if (include) {
        values[field] = auto;
      }
    } else {
      const { include } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'include',
          message: `${label} qo'shilsinmi?`,
          default: false,
        },
      ]);
      if (include) {
        const { value } = await inquirer.prompt([
          {
            type: 'input',
            name: 'value',
            message: `${label}:`,
            validate: (input: string) => {
              if (isDateField(field) && !/^\d{2}\.\d{2}\.\d{4}$/.test(input)) {
                return 'Sana KK.OO.YYYY formatida bo\'lishi kerak';
              }
              if (isNumericField(field) && !/^\d+$/.test(input.trim())) {
                return 'Faqat raqam kiritilishi mumkin';
              }
              return true;
            },
          },
        ]);
        values[field] = value;
      }
    }
  }
}

function isExitPrompt(err: Error): boolean {
  return err.name === 'ExitPromptError' || err.message?.includes('force closed');
}

main().catch((err) => {
  if (isExitPrompt(err)) {
    console.log('');
    console.log('Dastur yakunlandi. Xayr!');
    process.exit(0);
  }
  console.error('Xatolik yuz berdi:', err.message);
  process.exit(1);
});
