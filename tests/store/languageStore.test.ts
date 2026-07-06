import { describe, it, expect, beforeEach } from 'vitest'
import { useLanguageStore } from '../../src/renderer/src/store/useLanguageStore'

describe('useLanguageStore', () => {
  beforeEach(() => {
    useLanguageStore.setState({ language: 'uz' })
    localStorage.clear()
  })

  it('defaults to uz', () => {
    expect(useLanguageStore.getState().language).toBe('uz')
  })

  it('setLanguage updates the language', () => {
    useLanguageStore.getState().setLanguage('en')
    expect(useLanguageStore.getState().language).toBe('en')
  })

  it('setLanguage accepts ru', () => {
    useLanguageStore.getState().setLanguage('ru')
    expect(useLanguageStore.getState().language).toBe('ru')
  })

  it('persists to localStorage', () => {
    useLanguageStore.getState().setLanguage('en')
    const stored = JSON.parse(localStorage.getItem('zunoora-language') || '{}')
    expect(stored.state.language).toBe('en')
  })
})
