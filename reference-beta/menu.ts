import inquirer from 'inquirer';
import { type UserContext, type Shablon } from './db.js';
import { loadShablons, filterShablonsByRole } from './templates.js';

export async function showMenu(context: UserContext): Promise<Shablon> {
  console.log('');
  const nameStr = `Xush kelibsiz, ${context.user?.full_name || 'Foydalanuvchi'}`;
  const schoolStr = context.school?.name || 'Maktab';
  const maxLen = Math.max(nameStr.length, schoolStr.length) + 2;
  const border = '═'.repeat(maxLen + 2);

  console.log(`╔${border}╗`);
  console.log(`║ ${nameStr.padEnd(maxLen)} ║`);
  console.log(`║ ${schoolStr.padEnd(maxLen)} ║`);
  console.log(`╚${border}╝`);
  console.log('');

  const allShablons = await loadShablons();
  const shablons = filterShablonsByRole(allShablons, context.role);

  if (shablons.length === 0) {
    console.log('Hech qanday shablon mavjud emas.');
    process.exit(0);
  }

  console.log('Hujjat turini tanlang:');
  console.log('');

  const choices: { name: string; value: Shablon | null }[] = shablons.map((s, i) => ({
    name: `${String(i + 1).padStart(2, ' ')} ${s.label}`,
    value: s,
  }));

  choices.push({ name: '  Chiqish', value: null });

  const { shablon } = await inquirer.prompt<{ shablon: Shablon | null }>([
    {
      type: 'list',
      name: 'shablon',
      message: 'Tanlang:',
      choices,
      pageSize: 30,
    },
  ]);

  if (!shablon) {
    console.log('Dastur yakunlandi.');
    process.exit(0);
  }

  return shablon;
}
