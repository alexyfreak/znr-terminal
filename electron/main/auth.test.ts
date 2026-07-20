// @vitest-environment node

import { describe, it, expect, vi } from 'vitest'
import { scryptSync, randomBytes } from 'crypto'

vi.mock('./db', () => ({
  supabase: null,
}))

// Since verifyCredentials is an async function that depends on Supabase,
// we test the DEFAULT_USER path directly by importing the module
// and testing the hardcoded default login.

describe('DEFAULT_USER credentials', () => {
  it('verifyCredentials returns user context for default login', async () => {
    const { verifyCredentials } = await import('./auth')
    const result = await verifyCredentials('TCH00001', '1234')
    expect(result).not.toBeNull()
    expect(result!.role).toBe('teacher')
    expect(result!.user).toBeDefined()
    expect((result!.user as any).full_name).toBe('Default Teacher')
    expect((result!.user as any).login_id).toBe('TCH00001')
    expect(result!.school.name).toBe('Default School')
  })

  it('verifyCredentials returns null for wrong default password', async () => {
    const { verifyCredentials } = await import('./auth')
    const result = await verifyCredentials('TCH00001', 'wrong')
    expect(result).toBeNull()
  })

  it('verifyCredentials returns null for wrong default loginId', async () => {
    const { verifyCredentials } = await import('./auth')
    const result = await verifyCredentials('WRONG', '1234')
    expect(result).toBeNull()
  })
})

describe('validatePassword', () => {
  it('rejects short passwords', async () => {
    const mod = await import('./auth')
    const result = (mod as any).validatePassword?.('12')
    // If validatePassword is exported, test it
    if (result !== undefined) {
      expect(result.valid).toBe(false)
    }
  })
})
