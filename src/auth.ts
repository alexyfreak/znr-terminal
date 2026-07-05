import inquirer from 'inquirer';
import { createHash } from 'crypto';
import { supabase, type UserContext, type Teacher, type Director, type School, type Class } from './db.js';

const MAX_INFRA_RETRIES = 3;

function hashPin(pin: string): string {
  return createHash('sha256').update(pin).digest('hex');
}

export async function authenticate(): Promise<UserContext> {
  console.log('');
  console.log('╔═══════════════════════════════════════╗');
  console.log('║            Zunoora                    ║');
  console.log('╚═══════════════════════════════════════╝');
  console.log('');

  let infraFailures = 0;

  while (true) {
    const { loginId } = await inquirer.prompt([
      {
        type: 'input',
        name: 'loginId',
        message: 'Login ID (8 symbol):',
        validate: (input: string) => {
          if (!input || input.trim().length === 0) return 'ID bo\'sh bo\'lishi mumkin emas';
          return true;
        },
      },
    ]);

    const { pin } = await inquirer.prompt([
      {
        type: 'password',
        name: 'pin',
        message: 'PIN kod:',
        mask: '*',
        validate: (input: string) => {
          if (!input || input.trim().length === 0) return 'PIN kiritish shart';
          if (input.length < 4 || input.length > 6) return 'PIN 4-6 raqamdan iborat bo\'lishi kerak';
          if (!/^\d+$/.test(input)) return 'PIN faqat raqamlardan iborat bo\'lishi kerak';
          return true;
        },
      },
    ]);

    const id = loginId.trim().toUpperCase();
    const hashedPin = hashPin(pin.trim());

    let { data: teacher, error: teacherError } = await supabase
      .from('teachers')
      .select('*, school_data:schools(*)')
      .eq('login_id', id)
      .eq('pin_hash', hashedPin)
      .maybeSingle();

    if (teacherError) {
      infraFailures = handleQueryError(teacherError, infraFailures);
      continue;
    }

    if (teacher) {
      infraFailures = 0;

      if (!teacher.school_data) {
        console.log('Bu hisob hech qanday maktabga bog\'lanmagan. Administrator bilan bog\'laning.');
        continue;
      }

      let { data: director, error: directorError } = await supabase
        .from('directors')
        .select('*')
        .eq('school_id', teacher.school_id)
        .maybeSingle();

      if (directorError) {
        console.error('Ogohlantirish: direktor ma\'lumotini yuklab bo\'lmadi:', directorError.message);
      }

      let { data: classes, error: classesError } = await supabase
        .from('classes')
        .select('*')
        .eq('form_teacher_id', teacher.id);

      if (classesError) {
        console.error('Ogohlantirish: sinf ma\'lumotini yuklab bo\'lmadi:', classesError.message);
      }

      return {
        user: teacher as unknown as Teacher,
        school: teacher.school_data as unknown as School,
        director: (director as unknown as Director) || null,
        classes: (classes as unknown as Class[]) || [],
        role: 'teacher',
      };
    }

    let { data: director, error: directorError } = await supabase
      .from('directors')
      .select('*, school_data:schools(*)')
      .eq('login_id', id)
      .eq('pin_hash', hashedPin)
      .maybeSingle();

    if (directorError) {
      infraFailures = handleQueryError(directorError, infraFailures);
      continue;
    }

    if (director) {
      infraFailures = 0;

      if (!director.school_data) {
        console.log('Bu hisob hech qanday maktabga bog\'lanmagan. Administrator bilan bog\'laning.');
        continue;
      }

      let { data: teachers, error: teachersError } = await supabase
        .from('teachers')
        .select('*')
        .eq('school_id', director.school_id);

      if (teachersError) {
        console.error('Ogohlantirish: o\'qituvchilar ro\'yxatini yuklab bo\'lmadi:', teachersError.message);
      }

      let { data: classes, error: classesError } = await supabase
        .from('classes')
        .select('*')
        .eq('school_id', director.school_id);

      if (classesError) {
        console.error('Ogohlantirish: sinf ma\'lumotini yuklab bo\'lmadi:', classesError.message);
      }

      return {
        user: director as unknown as Director,
        school: director.school_data as unknown as School,
        director: null,
        teachers: (teachers as unknown as Teacher[]) || [],
        classes: (classes as unknown as Class[]) || [],
        role: 'director',
      };
    }

    infraFailures = 0;
    console.log('ID yoki PIN noto\'g\'ri. Qaytadan urinib ko\'ring.');
  }
}

function handleQueryError(error: { message: string }, infraFailures: number): number {
  console.error('Ma\'lumotlar bazasiga ulanishda xatolik:', error.message);
  infraFailures += 1;

  if (infraFailures >= MAX_INFRA_RETRIES) {
    console.error('');
    console.error('Serverga ulanishning imkoni bo\'lmadi. Iltimos, internet aloqangizni tekshiring');
    console.error('yoki qo\'llab-quvvatlash xizmatiga murojaat qiling.');
    process.exit(1);
  }

  return infraFailures;
}
