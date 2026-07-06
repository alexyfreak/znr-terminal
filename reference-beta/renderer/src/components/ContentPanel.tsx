import React, { useState, useCallback } from 'react';
import FieldCollector, { type FieldSchema } from './FieldCollector';
import Preview from './Preview';
import ExportButton from './ExportButton';

interface UserContext {
  full_name: string;
  position?: string | null;
  phone?: string | null;
  subject?: string | null;
  role: string;
}

interface School {
  name: string;
  address?: string | null;
  phone?: string | null;
}

interface TemplateItem {
  type: string;
  name: string;
  template: string;
  schema?: { required: string[]; optional: string[] };
}

interface ExportData {
  template: string;
  values: Record<string, string>;
  shablonType: string;
  userName: string;
  school?: { name: string; address?: string | null; phone?: string | null };
}

type View = 'select' | 'fields' | 'preview' | 'done';

interface ContentPanelProps {
  selectedTemplate: TemplateItem | null;
  user: UserContext;
  school: School | null;
  classes: { name: string; academic_year: string }[];
  onGenerate: (data: ExportData) => Promise<string>;
}

const ContentPanel: React.FC<ContentPanelProps> = ({
  selectedTemplate,
  user,
  school,
  classes,
  onGenerate,
}) => {
  const [view, setView] = useState<View>('select');
  const [schema, setSchema] = useState<FieldSchema | null>(null);
  const [values, setValues] = useState<Record<string, string> | null>(null);
  const [exportPath, setExportPath] = useState<string | null>(null);

  const handleStartFill = useCallback(async () => {
    if (!selectedTemplate) return;

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

    const s = selectedTemplate.schema || { required: [], optional: [] };
    const st = selectedTemplate.type;

    setSchema({
      required: Array.isArray(s.required) ? s.required : [],
      optional: Array.isArray(s.optional) ? s.optional : [],
      displayNames,
      fieldOrder,
      complexSteps: complexSteps[st] ? { [st]: complexSteps[st] } : null,
    });
    setValues(null);
    setExportPath(null);
    setView('fields');
  }, [selectedTemplate]);

  const handleFieldsComplete = useCallback((vals: Record<string, string>) => {
    setValues(vals);
    setView('preview');
  }, []);

  const handleConfirm = useCallback(() => {
    setView('done');
  }, []);

  const handleExport = useCallback(async () => {
    if (!selectedTemplate || !values) throw new Error('Xatolik: ma\'lumotlar topilmadi');
    const path = await onGenerate({
      template: selectedTemplate.template,
      values,
      shablonType: selectedTemplate.type,
      userName: user.full_name,
      school: school ? { name: school.name, address: school.address, phone: school.phone } : undefined,
    });
    setExportPath(path);
  }, [selectedTemplate, values, user, school, onGenerate]);

  const handleBack = useCallback(() => {
    if (view === 'fields') setView('select');
    else if (view === 'preview') setView('fields');
    else if (view === 'done') { setView('select'); setValues(null); setExportPath(null); }
  }, [view]);

  if (!selectedTemplate) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8' }}>
        <p style={{ fontSize: '18px' }}>Chap tomondan shablonni tanlang</p>
      </div>
    );
  }

  if (view === 'fields' && schema) {
    const autoFillContext = {
      school: school ? { name: school.name } : undefined,
      director: school ? { full_name: school.name } : undefined,
      user: {
        full_name: user.full_name,
        position: user.position || undefined,
        phone: user.phone || undefined,
        subject: user.subject || undefined,
      },
      role: user.role,
      classes,
    };

    return (
      <FieldCollector
        schema={schema}
        shablonType={selectedTemplate.type}
        context={autoFillContext}
        onComplete={handleFieldsComplete}
        onBack={handleBack}
      />
    );
  }

  if (view === 'preview' && values) {
    return (
      <Preview
        template={selectedTemplate.template}
        values={values}
        onConfirm={handleConfirm}
        onBack={handleBack}
      />
    );
  }

  if (view === 'done') {
    return (
      <div style={{ padding: '24px' }}>
        <h3 style={{ color: '#475569', marginBottom: '16px', fontSize: '18px', fontWeight: 600 }}>
          Hujjat yaratish
        </h3>
        <ExportButton onExport={handleExport} />
        {exportPath && (
          <div style={{ marginTop: '16px', padding: '12px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px' }}>
            <p style={{ color: '#16a34a', fontSize: '14px' }}>
              Hujjat saqlandi: {exportPath}
            </p>
          </div>
        )}
        <button onClick={handleBack} style={{
          marginTop: '12px', padding: '10px 20px', background: '#e2e8f0', color: '#475569',
          border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 500,
        }}>
          Ortga
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <h2 style={{ color: '#1e293b', fontSize: '22px', fontWeight: 600, marginBottom: '8px' }}>
        {selectedTemplate.name}
      </h2>
      {selectedTemplate.type && (
        <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>
          Shablon turi: {selectedTemplate.type}
        </p>
      )}
      <button onClick={handleStartFill} style={{
        padding: '12px 24px', background: '#3b82f6', color: '#fff',
        border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '16px',
      }}>
        Ma'lumotlarni to'ldirish
      </button>
    </div>
  );
};

export default ContentPanel;
