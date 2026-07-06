import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Sidebar } from '../../src/renderer/src/components/Sidebar'
import { useSidebarStore } from '../../src/renderer/src/store/useSidebarStore'
import { useSearchStore } from '../../src/renderer/src/store/useSearchStore'
import { useHistoryStore } from '../../src/renderer/src/store/useHistoryStore'

vi.mock('framer-motion')
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const m: Record<string, string> = {
        'sidebar.history': 'Tarix',
        'sidebar.settings': 'Sozlamalar',
        'sidebar.account': 'Hisob',
        'sidebar.newChat': 'Yangi suhbat',
      }
      return m[key] || key
    },
    i18n: { changeLanguage: () => {}, language: 'uz' },
    ready: true,
  }),
}))

describe('Sidebar', () => {
  const onSettingsOpen = vi.fn()
  const onAccountOpen = vi.fn()
  const onHistorySelect = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    useSidebarStore.setState({ isExpanded: false })
    useSearchStore.setState({ query: '', results: [], isFocused: false, isDocked: false })
    useHistoryStore.setState({ items: [], sortOrder: 'newest', activeId: null })
  })

  it('renders collapsed by default (60px)', () => {
    const { container } = render(
      <Sidebar onSettingsOpen={onSettingsOpen} onAccountOpen={onAccountOpen} onHistorySelect={onHistorySelect} />
    )
    expect(container.querySelector('aside')).toBeTruthy()
  })

  it('shows expanded content when expanded', () => {
    useSidebarStore.setState({ isExpanded: true })
    render(
      <Sidebar onSettingsOpen={onSettingsOpen} onAccountOpen={onAccountOpen} onHistorySelect={onHistorySelect} />
    )
    expect(screen.getByText('Tarix')).toBeInTheDocument()
    expect(screen.getByText('Sozlamalar')).toBeInTheDocument()
    expect(screen.getByText('Hisob')).toBeInTheDocument()
    expect(screen.getByText('Yangi suhbat')).toBeInTheDocument()
  })

  it('toggle expands on diamond click', () => {
    const { container } = render(
      <Sidebar onSettingsOpen={onSettingsOpen} onAccountOpen={onAccountOpen} onHistorySelect={onHistorySelect} />
    )
    const buttons = container.querySelectorAll('button')
    fireEvent.click(buttons[0])
    expect(useSidebarStore.getState().isExpanded).toBe(true)
  })

  it('new chat button clears search and undocks', () => {
    useSidebarStore.setState({ isExpanded: true })
    useSearchStore.setState({ query: 'test', isDocked: true })
    render(
      <Sidebar onSettingsOpen={onSettingsOpen} onAccountOpen={onAccountOpen} onHistorySelect={onHistorySelect} />
    )
    fireEvent.click(screen.getByText('Yangi suhbat'))
    expect(useSearchStore.getState().query).toBe('')
    expect(useSearchStore.getState().isDocked).toBe(false)
  })

  it('settings button calls onSettingsOpen', () => {
    useSidebarStore.setState({ isExpanded: true })
    render(
      <Sidebar onSettingsOpen={onSettingsOpen} onAccountOpen={onAccountOpen} onHistorySelect={onHistorySelect} />
    )
    fireEvent.click(screen.getByText('Sozlamalar'))
    expect(onSettingsOpen).toHaveBeenCalledOnce()
  })

  it('account button calls onAccountOpen', () => {
    useSidebarStore.setState({ isExpanded: true })
    render(
      <Sidebar onSettingsOpen={onSettingsOpen} onAccountOpen={onAccountOpen} onHistorySelect={onHistorySelect} />
    )
    fireEvent.click(screen.getByText('Hisob'))
    expect(onAccountOpen).toHaveBeenCalledOnce()
  })
})
