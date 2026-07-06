import { vi, describe, it, expect, beforeEach } from 'vitest'

const { mockSupabase } = vi.hoisted(() => {
  function makeThenable(data: any, error: any = null) {
    return new Proxy({}, {
      get(_, prop) {
        if (prop === 'then') return (resolve: Function) => resolve({ data, error })
        return () => makeThenable(data, error)
      },
    })
  }

  const fromResults = [{ data: null, error: null }]
  let callIdx = 0

  const supabaseObj = {
    from: vi.fn(() => {
      const r = fromResults[Math.min(callIdx++, fromResults.length - 1)]
      return makeThenable(r.data, r.error)
    }),
    _setResults: (results: any[]) => {
      fromResults.length = 0
      fromResults.push(...results)
      callIdx = 0
    },
  }
  return { mockSupabase: supabaseObj }
})

vi.mock('../../electron/main/db', () => ({
  supabase: mockSupabase,
}))

import { verifyCredentials } from '../../electron/main/auth'

const mockTeacherWithSchool = {
  id: 't1', full_name: 'Aliyev A.', login_id: 'TCH00001',
  pin_hash: 'hash', position: "O'qituvchi", subject: 'Matematika',
  school_id: 's1',
  school_data: { id: 's1', name: '31-maktab', address: 'Toshkent', phone: '+998' },
}

describe('verifyCredentials', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSupabase._setResults([{ data: null, error: null }])
  })

  it('returns null when no teacher or director matches', async () => {
    const result = await verifyCredentials('TCH00001', 'hashed_pin')
    expect(result).toBeNull()
    expect(mockSupabase.from).toHaveBeenCalledWith('teachers')
  })

  it('returns teacher UserContext when teacher found with school', async () => {
    mockSupabase._setResults([
      { data: mockTeacherWithSchool, error: null },
      { data: { id: 'd1', full_name: 'Dir' }, error: null },
    ])
    const result = await verifyCredentials('TCH00001', 'hash')
    expect(result).not.toBeNull()
    expect(result!.role).toBe('teacher')
    expect(result!.user.full_name).toBe('Aliyev A.')
    expect(result!.school.name).toBe('31-maktab')
  })

  it('returns null when teacher has no school_data', async () => {
    mockSupabase._setResults([{ data: { id: 't1', school_id: 's1', school_data: null }, error: null }])
    const result = await verifyCredentials('TCH00001', 'hash')
    expect(result).toBeNull()
  })
})
