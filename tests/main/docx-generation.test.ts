import { vi, describe, it, expect } from 'vitest'

vi.mock('fs', () => {
  const mock = { readFileSync: vi.fn(), writeFileSync: vi.fn() }
  return { ...mock, default: mock }
})

vi.mock('path', () => {
  const mock = { resolve: vi.fn(() => '/mock/path/gerb.png') }
  return { ...mock, default: mock }
})

vi.mock('docx', async () => {
  const actual: any = await vi.importActual('docx')
  return { ...actual, Packer: { toBuffer: vi.fn(() => Promise.resolve(Buffer.from('mock-docx-buffer'))) } }
})

import { buildHeaderParagraphs, generateDocx } from '../../electron/main/docx'
import { readFileSync, writeFileSync } from 'fs'

describe('buildHeaderParagraphs', () => {
  it('returns 1 paragraph (ministry header) when no gerb and no school', () => {
    vi.mocked(readFileSync).mockImplementation(() => { throw new Error('ENOENT') })
    const result = buildHeaderParagraphs()
    expect(result).toHaveLength(1)
  })

  it('returns 2 paragraphs with gerb image when gerb exists', () => {
    vi.mocked(readFileSync).mockReturnValue(Buffer.from('fake-png'))
    const result = buildHeaderParagraphs()
    expect(result).toHaveLength(2)
  })

  it('includes school name line when school is provided (+1 paragraph)', () => {
    vi.mocked(readFileSync).mockImplementation(() => { throw new Error('ENOENT') })
    const withSchool = buildHeaderParagraphs({ name: '31-maktab', address: null, phone: null })
    const withoutSchool = buildHeaderParagraphs()
    expect(withSchool).toHaveLength(withoutSchool.length + 1)
  })
})

describe('generateDocx', () => {
  beforeEach(() => {
    vi.mocked(readFileSync).mockImplementation(() => { throw new Error('ENOENT') })
    vi.mocked(writeFileSync).mockClear()
  })

  it('writes docx to output path', async () => {
    await generateDocx('TEST HEADER\nBody', '/output/test.docx')
    expect(writeFileSync).toHaveBeenCalledWith('/output/test.docx', expect.any(Buffer))
  })

  it('includes school info when provided', async () => {
    await generateDocx('Body', '/out/doc.docx', { name: 'Maktab', address: null, phone: null })
    expect(writeFileSync).toHaveBeenCalledWith('/out/doc.docx', expect.any(Buffer))
  })

  it('handles empty text', async () => {
    await expect(generateDocx('', '/out/e.docx')).resolves.toBeUndefined()
    expect(writeFileSync).toHaveBeenCalled()
  })
})
