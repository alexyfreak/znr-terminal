import { ipcMain, BrowserWindow, dialog } from 'electron';
import { createHash } from 'crypto';
import { verifyCredentials } from '../../src/auth.js';
import { loadShablons, filterShablonsByRole } from '../../src/templates.js';
import { renderTemplate } from '../../src/renderer.js';
import { generateDocx, generateOutputFilename } from '../../src/docx.js';
import type { UserContext, Shablon } from '../../src/db.js';

type IpcResult<T> = { success: true; data: T } | { success: false; error: string };

let currentContext: UserContext | null = null;

export function getCurrentContext(): UserContext | null {
  return currentContext;
}

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

const fieldOrder = [
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
  'week_start', 'week_end', 'working_hours', 'duration',
  'present_count', 'absent_list', 'agenda', 'agenda_items', 'speeches', 'decisions',
  'entries', 'total_missed', 'total_replaced', 'replacement_teacher', 'replacement_date',
];

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
};

export function registerIpcHandlers(_win: BrowserWindow): void {
  ipcMain.handle('auth:login', async (_event, loginId: string, pin: string): Promise<IpcResult<UserContext>> => {
    if (!loginId || loginId.trim().length === 0) {
      return { success: false, error: 'Login ID bo\'sh bo\'lishi mumkin emas' };
    }
    if (!pin || pin.trim().length < 4 || pin.trim().length > 6 || !/^\d+$/.test(pin.trim())) {
      return { success: false, error: 'PIN 4-6 raqamdan iborat bo\'lishi kerak' };
    }

    const id = loginId.trim().toUpperCase();
    const hashedPin = createHash('sha256').update(pin.trim()).digest('hex');

    try {
      const context = await verifyCredentials(id, hashedPin);
      if (!context) {
        return { success: false, error: 'ID yoki PIN noto\'g\'ri' };
      }
      currentContext = context;
      return { success: true, data: context };
    } catch (err) {
      const message = (err as Error).message;
      return { success: false, error: `Ma'lumotlar bazasiga ulanishda xatolik: ${message}` };
    }
  });

  ipcMain.handle('tpl:list', async (): Promise<IpcResult<Shablon[]>> => {
    if (!currentContext) {
      return { success: false, error: 'Avval tizimga kiring' };
    }
    try {
      const all = await loadShablons();
      const filtered = filterShablonsByRole(all, currentContext.role);
      return { success: true, data: filtered };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  });

  ipcMain.handle('tpl:schema', async (_event, shablonType: string): Promise<IpcResult<{
    required: string[];
    optional: string[];
    displayNames: Record<string, string>;
    fieldOrder: string[];
    complexSteps: Record<string, { header: string; fields: string[] }[]> | null;
  }>> => {
    if (!currentContext) {
      return { success: false, error: 'Avval tizimga kiring' };
    }
    try {
      const all = await loadShablons();
      const shablon = all.find((s: Shablon) => s.type === shablonType);
      if (!shablon) {
        return { success: false, error: 'Shablon topilmadi' };
      }
      const schema = shablon.schema || { required: [], optional: [] };

      return {
        success: true,
        data: {
          required: Array.isArray(schema.required) ? schema.required : [],
          optional: Array.isArray(schema.optional) ? schema.optional : [],
          displayNames,
          fieldOrder,
          complexSteps: complexSteps[shablonType] ? { [shablonType]: complexSteps[shablonType] } : null,
        },
      };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  });

  ipcMain.handle('docx:generate', async (_event, data: {
    template: string;
    values: Record<string, string>;
    shablonType: string;
    userName: string;
    school?: { name: string; address?: string | null; phone?: string | null };
  }): Promise<IpcResult<string>> => {
    try {
      const rendered = renderTemplate(data.template, data.values);

      const defaultName = generateOutputFilename(data.shablonType, data.userName);
      const { filePath, canceled } = await dialog.showSaveDialog({
        defaultPath: defaultName,
        filters: [{ name: 'Word Hujjati', extensions: ['docx'] }],
        title: 'Hujjatni saqlash',
      });

      if (canceled || !filePath) {
        return { success: false, error: 'Saqlash bekor qilindi' };
      }

      await generateDocx(rendered, filePath, data.school);
      return { success: true, data: filePath };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  });

  ipcMain.handle('dialog:save', async (_event, defaultName: string): Promise<string | null> => {
    const { filePath, canceled } = await dialog.showSaveDialog({
      defaultPath: defaultName,
      filters: [{ name: 'Word Hujjati', extensions: ['docx'] }],
      title: 'Hujjatni saqlash',
    });
    if (canceled) return null;
    return filePath ?? null;
  });
}
