import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SettingsPanel } from '../../src/renderer/src/components/SettingsPanel/SettingsPanel'
import { useThemeStore } from '../../src/renderer/src/store/useThemeStore'
import { useLanguageStore } from '../../src/renderer/src/store/useLanguageStore'

vi.mock('framer-motion')
vi.mock('react-i18next', () => ({
  initReactI18next: { type: '3rdParty', init: () => {} },
  useTranslation: () => ({
    t: (key: string) => {
      const m: Record<string, string> = {
        'settings.title': 'Sozlamalar',
        'settings.theme': 'Mavzu',
        'settings.language': 'Til',
        'settings.dark': "Qorong'i",
        'settings.light': 'Yorug\'',
      }
      return m[key] || key
    },
    i18n: { changeLanguage: () => {}, language: 'uz' },
    ready: true,
  }),
}))

describe('SettingsPanel', () => {
  const onClose = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    useThemeStore.setState({ theme: 'dark' })
    useLanguageStore.setState({ language: 'uz' })
  })

  it('returns null when not open', () => {
    const { container } = render(<SettingsPanel isOpen={false} onClose={onClose} />)
    expect(container.innerHTML).toBe('')
  })

  it('renders when open', () => {
    render(<SettingsPanel isOpen={true} onClose={onClose} />)
    expect(screen.getByText('Sozlamalar')).toBeInTheDocument()
  })

  it('shows close button', () => {
    render(<SettingsPanel isOpen={true} onClose={onClose} />)
    const closeBtn = document.querySelector('button')
    expect(closeBtn).toBeTruthy()
  })

  it('shows theme toggle with dark label', () => {
    render(<SettingsPanel isOpen={true} onClose={onClose} />)
    expect(screen.getByText("Qorong'i")).toBeInTheDocument()
  })

  it('theme toggle changes theme', () => {
    const { container } = render(<SettingsPanel isOpen={true} onClose={onClose} />)
    const allButtons = container.querySelectorAll('button')
    const themeToggle = allButtons[1]
    fireEvent.click(themeToggle)
    expect(useThemeStore.getState().theme).toBe('light')
  })

  it('shows language options', () => {
    render(<SettingsPanel isOpen={true} onClose={onClose} />)
    expect(screen.getByText("O'zbek")).toBeInTheDocument()
    expect(screen.getByText('Русский')).toBeInTheDocument()
    expect(screen.getByText('English')).toBeInTheDocument()
  })

  it('language click changes language', () => {
    render(<SettingsPanel isOpen={true} onClose={onClose} />)
    fireEvent.click(screen.getByText('English'))
    expect(useLanguageStore.getState().language).toBe('en')
  })

  it('language click changes to Russian', () => {
    render(<SettingsPanel isOpen={true} onClose={onClose} />)
    fireEvent.click(screen.getByText('Русский'))
    expect(useLanguageStore.getState().language).toBe('ru')
  })

  it('closes on Escape key', () => {
    render(<SettingsPanel isOpen={true} onClose={onClose} />)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalled()
  })
})
