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
    rpc: vi.fn(),
  }
  return { mockSupabase: supabaseObj }
})

vi.mock('../../electron/main/db', () => ({
  supabase: mockSupabase,
}))

import {
  loadShablons, listMarketplaceShablons, searchMarketplaceShablons,
  createShablon, deleteShablon, getShablonById, togglePublish,
  installShablon, uninstallShablon, listInstalledShablons,
} from '../../electron/main/templates'

const mockShablon = {
  id: '1', type: 'buyruq_asosiy', label: 'Buyruq asosiy',
  description: 'Asosiy buyruq', keywords: ['buyruq'],
  teacher_visible: true, schema: { required: ['field1'], optional: [] }, template: '{{field1}}',
}

describe('loadShablons', () => {
  beforeEach(() => { vi.clearAllMocks(); mockSupabase._setResults([{ data: null, error: null }]) })

  it('returns shablons from supabase', async () => {
    mockSupabase._setResults([{ data: [mockShablon], error: null }])
    const result = await loadShablons()
    expect(result).toHaveLength(1)
    expect(result[0].type).toBe('buyruq_asosiy')
    expect(mockSupabase.from).toHaveBeenCalledWith('shablons')
  })

  it('returns empty array on error', async () => {
    mockSupabase._setResults([{ data: null, error: new Error('DB error') }])
    const result = await loadShablons()
    expect(result).toEqual([])
  })

  it('returns empty array when no data', async () => {
    mockSupabase._setResults([{ data: null, error: null }])
    const result = await loadShablons()
    expect(result).toEqual([])
  })
})

describe('listMarketplaceShablons', () => {
  beforeEach(() => { vi.clearAllMocks(); mockSupabase._setResults([{ data: null, error: null }]) })

  it('returns published shablons', async () => {
    mockSupabase._setResults([{ data: [mockShablon], error: null }])
    const result = await listMarketplaceShablons()
    expect(result).toHaveLength(1)
    expect(mockSupabase.from).toHaveBeenCalledWith('shablons')
  })

  it('returns empty on error', async () => {
    mockSupabase._setResults([{ data: null, error: new Error('err') }])
    const result = await listMarketplaceShablons()
    expect(result).toEqual([])
  })
})

describe('searchMarketplaceShablons', () => {
  beforeEach(() => { vi.clearAllMocks(); mockSupabase._setResults([{ data: null, error: null }]) })

  it('returns matching shablons', async () => {
    mockSupabase._setResults([{ data: [mockShablon], error: null }])
    const result = await searchMarketplaceShablons('buyruq')
    expect(result).toHaveLength(1)
    expect(mockSupabase.from).toHaveBeenCalledWith('shablons')
  })

  it('returns empty on error', async () => {
    mockSupabase._setResults([{ data: null, error: new Error('err') }])
    const result = await searchMarketplaceShablons('test')
    expect(result).toEqual([])
  })
})

describe('createShablon', () => {
  beforeEach(() => { vi.clearAllMocks(); mockSupabase._setResults([{ data: null, error: null }]) })

  it('creates a shablon and returns it', async () => {
    mockSupabase._setResults([{ data: mockShablon, error: null }])
    const result = await createShablon({ type: 'test', label: 'Test', teacher_visible: true, schema: { required: [], optional: [] }, template: '', keywords: [] })
    expect(result).not.toBeNull()
    expect(result!.type).toBe('buyruq_asosiy')
  })

  it('returns null on error', async () => {
    mockSupabase._setResults([{ data: null, error: new Error('err') }])
    const result = await createShablon({ type: 'test', label: 'Test', teacher_visible: true, schema: { required: [], optional: [] }, template: '', keywords: [] })
    expect(result).toBeNull()
  })
})

describe('deleteShablon', () => {
  beforeEach(() => { vi.clearAllMocks(); mockSupabase._setResults([{ data: null, error: null }]) })

  it('returns true on success', async () => {
    mockSupabase._setResults([{ data: null, error: null }])
    const result = await deleteShablon('1')
    expect(result).toBe(true)
  })

  it('returns false on error', async () => {
    mockSupabase._setResults([{ data: null, error: new Error('err') }])
    const result = await deleteShablon('1')
    expect(result).toBe(false)
  })
})

describe('getShablonById', () => {
  beforeEach(() => { vi.clearAllMocks(); mockSupabase._setResults([{ data: null, error: null }]) })

  it('returns shablon found by id', async () => {
    mockSupabase._setResults([{ data: mockShablon, error: null }])
    const result = await getShablonById('1')
    expect(result).not.toBeNull()
    expect(result!.id).toBe('1')
  })

  it('returns null on error', async () => {
    mockSupabase._setResults([{ data: null, error: new Error('err') }])
    const result = await getShablonById('1')
    expect(result).toBeNull()
  })
})

describe('togglePublish', () => {
  beforeEach(() => { vi.clearAllMocks(); mockSupabase._setResults([{ data: null, error: null }]) })

  it('returns true on success', async () => {
    mockSupabase._setResults([{ data: null, error: null }])
    const result = await togglePublish('1', true)
    expect(result).toBe(true)
  })

  it('returns false on error', async () => {
    mockSupabase._setResults([{ data: null, error: new Error('err') }])
    const result = await togglePublish('1', false)
    expect(result).toBe(false)
  })
})

describe('installShablon', () => {
  beforeEach(() => { vi.clearAllMocks(); mockSupabase._setResults([{ data: null, error: null }]) })

  it('returns true on success', async () => {
    mockSupabase._setResults([{ data: null, error: null }])
    const result = await installShablon('u1', 's1')
    expect(result).toBe(true)
    expect(mockSupabase.from).toHaveBeenCalledWith('user_shablons')
  })
})

describe('uninstallShablon', () => {
  beforeEach(() => { vi.clearAllMocks(); mockSupabase._setResults([{ data: null, error: null }]) })

  it('returns true on success', async () => {
    mockSupabase._setResults([{ data: null, error: null }])
    const result = await uninstallShablon('u1', 's1')
    expect(result).toBe(true)
  })
})

describe('listInstalledShablons', () => {
  beforeEach(() => { vi.clearAllMocks(); mockSupabase._setResults([{ data: null, error: null }]) })

  it('returns installed shablons', async () => {
    mockSupabase._setResults([{ data: [{ shablon_id: '1' }], error: null }, { data: [mockShablon], error: null }])
    const result = await listInstalledShablons('u1')
    expect(result).toHaveLength(1)
  })

  it('returns empty when no installations', async () => {
    mockSupabase._setResults([{ data: [], error: null }])
    const result = await listInstalledShablons('u1')
    expect(result).toEqual([])
  })

  it('returns empty on error fetching installations', async () => {
    mockSupabase._setResults([{ data: null, error: new Error('err') }])
    const result = await listInstalledShablons('u1')
    expect(result).toEqual([])
  })
})
