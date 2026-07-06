import { describe, it, expect, beforeEach } from 'vitest'
import { useThemeStore } from '../../src/renderer/src/store/useThemeStore'

describe('useThemeStore', () => {
  beforeEach(() => {
    useThemeStore.setState({ theme: 'dark' })
    localStorage.clear()
  })

  it('defaults to dark', () => {
    expect(useThemeStore.getState().theme).toBe('dark')
  })

  it('setTheme changes theme', () => {
    useThemeStore.getState().setTheme('light')
    expect(useThemeStore.getState().theme).toBe('light')
  })

  it('toggle switches dark to light', () => {
    useThemeStore.getState().toggle()
    expect(useThemeStore.getState().theme).toBe('light')
  })

  it('toggle switches light to dark', () => {
    useThemeStore.getState().setTheme('light')
    useThemeStore.getState().toggle()
    expect(useThemeStore.getState().theme).toBe('dark')
  })

  it('persists to localStorage', () => {
    useThemeStore.getState().setTheme('light')
    const stored = JSON.parse(localStorage.getItem('zunoora-theme') || '{}')
    expect(stored.state.theme).toBe('light')
  })
})
