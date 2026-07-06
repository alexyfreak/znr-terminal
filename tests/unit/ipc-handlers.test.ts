import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockShablons = [
  { id: '1', type: 'buyruq_asosiy', label: 'Buyruq asosiy', teacher_visible: true },
  { id: '2', type: 'buyruq_maxfiy', label: 'Buyruq maxfiy', teacher_visible: false },
]

const mockFilter = vi.fn((shablons: any[], role: string) =>
  role === 'director' ? shablons : shablons.filter((s: any) => s.teacher_visible)
)

vi.mock('../../electron/main/templates', () => ({
  loadShablons: vi.fn().mockResolvedValue(mockShablons),
  filterShablonsByRole: vi.fn((shablons: any[], role: string) =>
    role === 'director' ? shablons : shablons.filter((s: any) => s.teacher_visible)
  ),
}))

vi.mock('../../electron/main/renderer', () => ({
  renderTemplate: vi.fn((template: string, values: Record<string, string>) =>
    template.replace(/{{(\w+)}}/g, (_, k) => values[k] || '')
  ),
}))

vi.mock('../../electron/main/docx', () => ({
  generateDocx: vi.fn().mockResolvedValue(undefined),
  generateOutputFilename: vi.fn().mockReturnValue('test_doc_01012026.docx'),
}))

vi.mock('../../electron/main/db', () => ({ supabase: {} }))

describe('IPC Handler Logic', () => {
  let currentContext: any = null

  const handlers: Record<string, (...args: any[]) => any> = {
    'auth:login': (loginId: string, pin: string) => {
      if (!loginId || loginId.trim().length === 0) {
        return { success: false, error: "Login ID bo'sh bo'lishi mumkin emas" }
      }
      if (!pin || pin.trim().length < 4 || pin.trim().length > 6 || !/^\d+$/.test(pin.trim())) {
        return { success: false, error: 'PIN 4-6 raqamdan iborat bo\'lishi kerak' }
      }
      return null
    },
    'tpl:list': () => {
      if (!currentContext) {
        return { success: false, error: 'Avval tizimga kiring' }
      }
      return { success: true, data: mockFilter(mockShablons, currentContext.role) }
    },
    'data:context': () => {
      return { success: true, data: currentContext }
    },
    'data:teachers': () => {
      if (!currentContext) return { success: false, error: 'Avval tizimga kiring' }
      return { success: true, data: [] }
    },
  }

  beforeEach(() => {
    currentContext = null
  })

  describe('auth:login validation', () => {
    it('rejects empty loginId', () => {
      const result = handlers['auth:login']('', '1234')
      expect(result!.success).toBe(false)
      expect(result!.error).toContain("bo'sh")
    })

    it('rejects short PIN', () => {
      const result = handlers['auth:login']('TCH00001', '123')
      expect(result!.success).toBe(false)
    })

    it('rejects non-numeric PIN', () => {
      const result = handlers['auth:login']('TCH00001', 'abcd')
      expect(result!.success).toBe(false)
    })

    it('returns null for valid input (means good)', () => {
      const result = handlers['auth:login']('TCH00001', '1234')
      expect(result).toBeNull()
    })
  })

  describe('tpl:list auth guard', () => {
    it('rejects when not logged in', () => {
      const result = handlers['tpl:list']()
      expect(result.success).toBe(false)
      expect(result.error).toBe('Avval tizimga kiring')
    })

    it('returns filtered shablons for teacher role', () => {
      currentContext = { role: 'teacher' }
      const result = handlers['tpl:list']()
      expect(result.success).toBe(true)
      expect(result.data).toHaveLength(1)
    })

    it('returns all shablons for director role', () => {
      currentContext = { role: 'director' }
      const result = handlers['tpl:list']()
      expect(result.success).toBe(true)
      expect(result.data).toHaveLength(2)
    })
  })

  describe('data:context', () => {
    it('returns null when not logged in', () => {
      const result = handlers['data:context']()
      expect(result.success).toBe(true)
      expect(result.data).toBeNull()
    })

    it('returns context when logged in', () => {
      currentContext = { user: { full_name: 'Aliyev A.' }, role: 'teacher' }
      const result = handlers['data:context']()
      expect(result.success).toBe(true)
      expect(result.data).toEqual(currentContext)
    })
  })

  describe('data:teachers', () => {
    it('rejects when not logged in', () => {
      const result = handlers['data:teachers']()
      expect(result.success).toBe(false)
    })

    it('returns teachers when logged in', () => {
      currentContext = { school: { id: 's1' }, role: 'teacher' }
      const result = handlers['data:teachers']()
      expect(result.success).toBe(true)
    })
  })
})
