import { describe, it, expect, beforeAll } from 'vitest'

let renderTemplate: ReturnType<typeof Function>

beforeAll(async () => {
  const mod = await import('../../electron/main/renderer')
  renderTemplate = mod.renderTemplate
})

const empty: Record<string, string> = {}

describe('renderTemplate', () => {
  it('replaces {{field}} placeholders with values', () => {
    const template = 'Maktab: {{school}}, O\'qituvchi: {{teacher}}'
    const values = { school: '1-Maktab', teacher: 'Aliyev A.' }
    expect(renderTemplate(template, values)).toBe('Maktab: 1-Maktab, O\'qituvchi: Aliyev A.')
  })

  it('replaces missing values with empty string', () => {
    const template = 'Salom {{name}}!'
    expect(renderTemplate(template, {})).toBe('Salom !')
  })

  it('collapses excessive newlines to max 2', () => {
    const template = 'Line1\n\n\n\nLine2\n\n\nLine3'
    expect(renderTemplate(template, empty)).toBe('Line1\n\nLine2\n\nLine3')
  })

  it('trims leading newlines', () => {
    const template = '\n\n\nHello'
    expect(renderTemplate(template, empty)).toBe('Hello')
  })

  it('trims trailing newlines', () => {
    const template = 'Hello\n\n\n'
    expect(renderTemplate(template, empty)).toBe('Hello')
  })

  it('trims whitespace-only lines to empty', () => {
    const template = 'A\n   \nB'
    expect(renderTemplate(template, empty)).toBe('A\n\nB')
  })

  it('handles null/undefined values as empty', () => {
    const template = '{{a}}-{{b}}-{{c}}'
    const values = { a: 'x', b: undefined as any, c: null as any }
    expect(renderTemplate(template, values)).toBe('x--')
  })

  it('returns empty string for empty template', () => {
    expect(renderTemplate('', {})).toBe('')
  })

  it('ignores placeholders with special chars (non-word)', () => {
    const template = '{{user-name}} {{user.name}}'
    expect(renderTemplate(template, {})).toBe('{{user-name}} {{user.name}}')
  })
})
