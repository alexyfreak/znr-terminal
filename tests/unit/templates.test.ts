import { describe, it, expect, vi, beforeAll } from 'vitest'

const mockShablons = [
  { id: '1', type: 'buyruq_asosiy', label: 'Buyruq asosiy', teacher_visible: true },
  { id: '2', type: 'buyruq_maxfiy', label: 'Buyruq maxfiy', teacher_visible: false },
  { id: '3', type: 'tarif_malaka', label: 'Tarif malaka', teacher_visible: true },
]

vi.mock('../../electron/main/db', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => ({
          data: mockShablons,
          error: null,
        })),
      })),
    })),
  },
}))

let filterShablonsByRole: Function
let loadShablons: Function
let supabase: any

beforeAll(async () => {
  const templates = await import('../../electron/main/templates')
  filterShablonsByRole = templates.filterShablonsByRole
  loadShablons = templates.loadShablons
  const db = await import('../../electron/main/db')
  supabase = db.supabase
})

describe('filterShablonsByRole', () => {
  it('returns all shablons for director role', () => {
    expect(filterShablonsByRole(mockShablons as any, 'director')).toHaveLength(3)
  })

  it('filters out teacher_visible=false for teacher role', () => {
    const result = filterShablonsByRole(mockShablons as any, 'teacher')
    expect(result).toHaveLength(2)
    expect(result.every(s => s.teacher_visible)).toBe(true)
  })

  it('returns empty array for empty input', () => {
    expect(filterShablonsByRole([], 'director')).toHaveLength(0)
  })

  it('returns empty array when all hidden from teacher', () => {
    const allHidden = [
      { id: '1', teacher_visible: false },
      { id: '2', teacher_visible: false },
    ]
    expect(filterShablonsByRole(allHidden as any, 'teacher')).toHaveLength(0)
  })
})

describe('loadShablons', () => {
  it('calls supabase.from shablons select order label', async () => {
    const result = await loadShablons()
    expect(result).toEqual(mockShablons)
    expect(supabase.from).toHaveBeenCalledWith('shablons')
  })
})
