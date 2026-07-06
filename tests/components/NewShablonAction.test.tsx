import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { NewShablonAction } from '../../src/renderer/src/components/Search/NewShablonAction'
import { useSearchStore } from '../../src/renderer/src/store/useSearchStore'

vi.mock('framer-motion')
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const m: Record<string, string> = { 'search.newShablon': 'Yangi shablon' }
      return m[key] || key
    },
    i18n: { changeLanguage: () => {}, language: 'uz' },
    ready: true,
  }),
}))

describe('NewShablonAction', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useSearchStore.setState({ query: 'old query', isFocused: false })
  })

  it('renders with translation text', () => {
    render(<NewShablonAction />)
    expect(screen.getByText('Yangi shablon')).toBeInTheDocument()
  })

  it('renders a plus icon', () => {
    const { container } = render(<NewShablonAction />)
    expect(container.querySelector('svg')).toBeTruthy()
  })

  it('clears query and closes focus on click', () => {
    render(<NewShablonAction />)
    fireEvent.click(screen.getByRole('button'))
    expect(useSearchStore.getState().query).toBe('')
    expect(useSearchStore.getState().isFocused).toBe(false)
  })
})
