import { describe, it, expect, beforeEach, afterEach } from 'vitest'

describe('getSystemLanguage', () => {
  let originalLanguage: PropertyDescriptor | undefined
  let getSystemLanguage: (() => 'uz' | 'ru' | 'en') | null = null

  beforeEach(async () => {
    originalLanguage = Object.getOwnPropertyDescriptor(
      Object.getPrototypeOf(navigator),
      'language',
    ) ?? Object.getOwnPropertyDescriptor(navigator, 'language')

    vi.resetModules()
    const mod = await import('../../src/renderer/src/i18n/config')
    getSystemLanguage = mod.getSystemLanguage
  })

  afterEach(() => {
    if (originalLanguage) {
      Object.defineProperty(navigator, 'language', originalLanguage)
    }
  })

  it('returns "uz" when navigator.language is "uz"', () => {
    Object.defineProperty(navigator, 'language', { value: 'uz', configurable: true })
    expect(getSystemLanguage!()).toBe('uz')
  })

  it('returns "uz" when navigator.language is "uz-UZ"', () => {
    Object.defineProperty(navigator, 'language', { value: 'uz-UZ', configurable: true })
    expect(getSystemLanguage!()).toBe('uz')
  })

  it('returns "ru" when navigator.language is "ru"', () => {
    Object.defineProperty(navigator, 'language', { value: 'ru', configurable: true })
    expect(getSystemLanguage!()).toBe('ru')
  })

  it('returns "en" when navigator.language is "en"', () => {
    Object.defineProperty(navigator, 'language', { value: 'en', configurable: true })
    expect(getSystemLanguage!()).toBe('en')
  })

  it('returns "en" when navigator.language is "en-US"', () => {
    Object.defineProperty(navigator, 'language', { value: 'en-US', configurable: true })
    expect(getSystemLanguage!()).toBe('en')
  })

  it('returns "uz" fallback for unsupported language', () => {
    Object.defineProperty(navigator, 'language', { value: 'fr', configurable: true })
    expect(getSystemLanguage!()).toBe('uz')
  })

  it('returns "uz" fallback when navigator.language is undefined', () => {
    Object.defineProperty(navigator, 'language', { value: undefined, configurable: true })
    expect(getSystemLanguage!()).toBe('uz')
  })
})
