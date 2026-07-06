import inquirer from 'inquirer';
import { createHash } from 'crypto';
import { supabase, type UserContext, type Teacher, type Director, type School, type Class } from './db.js';

const MAX_INFRA_RETRIES = 3;

function hashPin(pin: string): string {
  return createHash('sha256').update(pin).digest('hex');
}

export async function verifyCredentials(loginId: string, pinHash: string): Promise<UserContext | null> {
  const { data: teacher, error: teacherError } = await supabase
    .from('teachers')
    .select('*, school_data:schools(*)')
    .eq('login_id', loginId)
    .eq('pin_hash', pinHash)
    .maybeSingle();

  if (teacherError) throw teacherError;

  if (teacher) {
    if (!teacher.school_data) return null;

    const { data: director } = await supabase
      .from('directors')
      .select('*')
      .eq('school_id', teacher.school_id)
      .maybeSingle();

    const { data: classes } = await supabase
      .from('classes')
      .select('*')
      .eq('form_teacher_id', teacher.id);

    return {
      user: teacher as unknown as Teacher,
      school: teacher.school_data as unknown as School,
      director: (director as unknown as Director) || null,
      classes: (classes as unknown as Class[]) || [],
      role: 'teacher',
    };
  }

  const { data: director, error: directorError } = await supabase
    .from('directors')
    .select('*, school_data:schools(*)')
    .eq('login_id', loginId)
    .eq('pin_hash', pinHash)
    .maybeSingle();

  if (directorError) throw directorError;

  if (director) {
    if (!director.school_data) return null;

    const { data: teachers } = await supabase
      .from('teachers')
      .select('*')
      .eq('school_id', director.school_id);

    const { data: classes } = await supabase
      .from('classes')
      .select('*')
      .eq('school_id', director.school_id);

    return {
      user: director as unknown as Director,
      school: director.school_data as unknown as School,
      director: null,
      teachers: (teachers as unknown as Teacher[]) || [],
      classes: (classes as unknown as Class[]) || [],
      role: 'director',
    };
  }

  return null;
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

    let result: UserContext | null = null;
    try {
      result = await verifyCredentials(id, hashedPin);
    } catch (error) {
      infraFailures = handleQueryError(error as { message: string }, infraFailures);
      continue;
    }

    if (result) {
      infraFailures = 0;
      console.log('');
      return result;
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
