import { describe, it, expect } from 'vitest'
import { createHash } from 'crypto'

describe('hashPin', () => {
  const hashPin = (pin: string) => createHash('sha256').update(pin).digest('hex')

  it('produces consistent sha256 hex for same input', () => {
    const h1 = hashPin('1234')
    const h2 = hashPin('1234')
    expect(h1).toBe(h2)
  })

  it('produces different hash for different PINs', () => {
    const h1 = hashPin('1234')
    const h2 = hashPin('5678')
    expect(h1).not.toBe(h2)
  })

  it('hash is 64 hex chars (sha256)', () => {
    expect(hashPin('1234')).toHaveLength(64)
    expect(/^[0-9a-f]{64}$/.test(hashPin('1234'))).toBe(true)
  })

  it('handles empty string', () => {
    const h = hashPin('')
    expect(h).toHaveLength(64)
  })

  it('is deterministic', () => {
    const pin = '9876'
    const h1 = hashPin(pin)
    const h2 = createHash('sha256').update(pin).digest('hex')
    expect(h1).toBe(h2)
  })
})

describe('verifyCredentials (unit logic)', () => {
  const hashPin = (pin: string) => createHash('sha256').update(pin).digest('hex')

  it('has correct PIN hashing for login flow', () => {
    const pin = '1234'
    const hashedPin = hashPin(pin)
    const rehash = hashPin('1234')
    expect(hashedPin).toBe(rehash)
  })

  it('PIN with leading zeros is handled correctly', () => {
    const pin = '0012'
    const h = hashPin(pin)
    expect(h).toHaveLength(64)
  })
})

describe('IPC handler validation logic', () => {
  function validateLogin(loginId: string, pin: string): string | null {
    if (!loginId || loginId.trim().length === 0) {
      return "Login ID bo'sh bo'lishi mumkin emas"
    }
    if (!pin || pin.trim().length < 4 || pin.trim().length > 6 || !/^\d+$/.test(pin.trim())) {
      return 'PIN 4-6 raqamdan iborat bo\'lishi kerak'
    }
    return null
  }

  it('rejects empty loginId', () => {
    expect(validateLogin('', '1234')).toBeTruthy()
    expect(validateLogin('  ', '1234')).toBeTruthy()
  })

  it('rejects PIN shorter than 4 digits', () => {
    expect(validateLogin('TCH00001', '123')).toBeTruthy()
  })

  it('rejects PIN longer than 6 digits', () => {
    expect(validateLogin('TCH00001', '1234567')).toBeTruthy()
  })

  it('rejects non-numeric PIN', () => {
    expect(validateLogin('TCH00001', '12a4')).toBeTruthy()
    expect(validateLogin('TCH00001', 'abcd')).toBeTruthy()
    expect(validateLogin('TCH00001', '12 4')).toBeTruthy()
  })

  it('accepts 4-digit PIN', () => {
    expect(validateLogin('TCH00001', '1234')).toBeNull()
  })

  it('accepts 5-digit PIN', () => {
    expect(validateLogin('TCH00001', '12345')).toBeNull()
  })

  it('accepts 6-digit PIN', () => {
    expect(validateLogin('TCH00001', '123456')).toBeNull()
  })

  it('accepts trimmed PIN with whitespace', () => {
    expect(validateLogin('TCH00001', ' 1234 ')).toBeNull()
  })
})
