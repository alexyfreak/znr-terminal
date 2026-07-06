import { describe, it, expect, beforeAll } from 'vitest'

let generateOutputFilename: Function
let parseRenderedText: Function
let isAllCaps: Function

beforeAll(async () => {
  const mod = await import('../../electron/main/docx')
  generateOutputFilename = mod.generateOutputFilename
  parseRenderedText = mod.parseRenderedText
  isAllCaps = mod.isAllCaps
})

describe('generateOutputFilename', () => {
  it('produces correct filename format', () => {
    const name = generateOutputFilename('buyruq_asosiy', 'Aliyev A.')
    expect(name).toMatch(/^buyruq_asosiy_aliyev_a\._\d{8}\.docx$/)
  })

  it('handles special characters in username', () => {
    const name = generateOutputFilename('tarif', "O'ktamova Iroda")
    expect(name).toMatch(/^tarif_oktamova_iroda_\d{8}\.docx$/)
  })

  it('handles Unicode apostrophe chars', () => {
    const name = generateOutputFilename('test', 'Toshmatov Oʻktam')
    expect(name).toMatch(/^test_toshmatov_oktam_\d{8}\.docx$/)
  })

  it('always includes today date as DDMMYYYY', () => {
    const now = new Date()
    const dd = String(now.getDate()).padStart(2, '0')
    const mm = String(now.getMonth() + 1).padStart(2, '0')
    const yyyy = now.getFullYear()
    const name = generateOutputFilename('doc', 'User')
    expect(name).toBe(`doc_user_${dd}${mm}${yyyy}.docx`)
  })
})

describe('parseRenderedText', () => {
  it('classifies first all-caps line as centered bold', () => {
    const result = parseRenderedText("O'ZBEKISTON RESPUBLIKASI\nBody text")
    expect(result[0]).toMatchObject({ type: 'simple', alignment: 'center', bold: true, text: "O'ZBEKISTON RESPUBLIKASI" })
  })

  it('classifies short all-caps as normal', () => {
    const result = parseRenderedText('OK\nBody')
    expect(result[0].type).toBe('simple')
    if (result[0].type === 'simple') {
      expect(result[0].alignment).toBe('both')
    }
  })

  it('handles || split delimiter for left/right text', () => {
    const result = parseRenderedText('Left side || Right side')
    expect(result[0]).toMatchObject({ type: 'split', leftText: 'Left side', rightText: 'Right side' })
  })

  it('classifies signature lines as right-aligned', () => {
    const result = parseRenderedText('Some text\n__________')
    expect(result[1]).toMatchObject({ type: 'simple', alignment: 'right' })
  })

  it('classifies "Direktor" line as right-aligned', () => {
    const result = parseRenderedText('Direktor: A.Aliyev')
    expect(result[0]).toMatchObject({ type: 'simple', alignment: 'right' })
  })

  it('classifies "Imzo" line as right-aligned', () => {
    const result = parseRenderedText('Imzo')
    expect(result[0]).toMatchObject({ type: 'simple', alignment: 'right' })
  })

  it('defaults normal text to justified', () => {
    const result = parseRenderedText('Normal paragraph text here')
    expect(result[0]).toMatchObject({ type: 'simple', alignment: 'both', bold: false })
  })
})

describe('isAllCaps', () => {
  it('returns true for long uppercase text', () => {
    expect(isAllCaps("O'ZBEKISTON RESPUBLIKASI")).toBe(true)
  })

  it('returns false for short text (<3 letters)', () => {
    expect(isAllCaps('OK')).toBe(false)
  })

  it('returns false for mixed case', () => {
    expect(isAllCaps("O'zbekiston")).toBe(false)
  })

  it('handles Cyrillic uppercase', () => {
    expect(isAllCaps('УЗБЕКИСТАН')).toBe(true)
  })
})
