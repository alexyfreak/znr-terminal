import { describe, it, expect } from 'vitest'

function getRelativeDate(isoString: string): string {
  const now = Date.now()
  const date = new Date(isoString).getTime()
  const diffMs = now - date
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)

  if (diffSec < 10) return 'Hozir'
  if (diffMin < 1) return `${diffSec} soniya oldin`
  if (diffMin < 60) return `${diffMin} min oldin`
  if (diffHour < 24) return `${diffHour} soat oldin`
  if (diffDay === 1) return 'Kecha'
  if (diffDay < 7) return `${diffDay} kun oldin`

  const d = new Date(isoString)
  const months = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyun', 'Iyul', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek']
  return `${d.getDate()} ${months[d.getMonth()]}`
}

describe('getRelativeDate', () => {
  it('returns "Hozir" for < 10 seconds', () => {
    expect(getRelativeDate(new Date().toISOString())).toBe('Hozir')
  })

  it('returns seconds ago for < 1 minute', () => {
    const date = new Date(Date.now() - 30 * 1000).toISOString()
    expect(getRelativeDate(date)).toBe('30 soniya oldin')
  })

  it('returns minutes ago for < 60 minutes', () => {
    const date = new Date(Date.now() - 5 * 60 * 1000).toISOString()
    expect(getRelativeDate(date)).toBe('5 min oldin')
  })

  it('returns hours ago for < 24 hours', () => {
    const date = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
    expect(getRelativeDate(date)).toBe('3 soat oldin')
  })

  it('returns "Kecha" for 1 day ago', () => {
    const date = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    expect(getRelativeDate(date)).toBe('Kecha')
  })

  it('returns days ago for < 7 days', () => {
    const date = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    expect(getRelativeDate(date)).toBe('5 kun oldin')
  })

  it('returns date/month for older dates', () => {
    const date = '2025-01-15T10:00:00Z'
    const result = getRelativeDate(date)
    expect(result).toMatch(/^\d+ \w{3}$/)
  })

  it('handles future dates gracefully', () => {
    const future = new Date(Date.now() + 3600000).toISOString()
    const result = getRelativeDate(future)
    expect(result).toBe('Hozir')
  })
})
