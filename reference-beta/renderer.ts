export function renderTemplate(template: string, values: Record<string, string>): string {
  if (!template) return '';

  let result = template.replace(/{{(\w+)}}/g, (_, key) => {
    return values[key] !== undefined && values[key] !== null ? values[key] : '';
  });

  result = result
    .split('\n')
    .map(line => (line.trim() === '' ? '' : line))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/^\n+/, '')
    .replace(/\n+$/, '');

  const leftover = result.match(/{{[^{}]*}}/g);
  if (leftover) {
    console.error(
      `Warning: template still contains unresolved placeholder(s): ${leftover.join(', ')}. ` +
      'Check that the shablon schema and template field names match.'
    );
  }

  return result;
}
