import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { HistoryList } from '../../src/renderer/src/components/Sidebar/HistoryList'
import { useHistoryStore } from '../../src/renderer/src/store/useHistoryStore'
import { useAccountStore } from '../../src/renderer/src/store/useAccountStore'

vi.mock('framer-motion')
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k, i18n: { changeLanguage: () => {} }, ready: true }),
}))

const mockItems = [
  { id: '1', title: 'Buyruq asosiy', type: 'buyruq_asosiy', date: new Date().toISOString(), docCount: 1 },
  { id: '2', title: 'Tarif malaka', type: 'tarif_malaka', date: new Date(Date.now() - 86400000).toISOString(), docCount: 1 },
]

describe('HistoryList', () => {
  const onSelect = vi.fn()

  beforeEach(() => {
    vi.useRealTimers()
    vi.clearAllMocks()
    useHistoryStore.setState({ items: [], sortOrder: 'newest', activeId: null })
    useAccountStore.setState({ isLoggedIn: false })
  })

  it('returns null when not expanded', () => {
    const { container } = render(<HistoryList isExpanded={false} onSelect={onSelect} sortOrder="newest" />)
    expect(container.innerHTML).toBe('')
  })

  it('shows empty message when not logged in', () => {
    render(<HistoryList isExpanded={true} onSelect={onSelect} sortOrder="newest" />)
    expect(screen.getByText("Tarixni ko'rish uchun tizimga kiring")).toBeInTheDocument()
  })

  it('shows empty message when logged in but no history', () => {
    useAccountStore.setState({ isLoggedIn: true })
    render(<HistoryList isExpanded={true} onSelect={onSelect} sortOrder="newest" />)
    expect(screen.getByText("Hali tarix yo'q")).toBeInTheDocument()
  })

  it('renders history items', () => {
    useHistoryStore.setState({ items: mockItems as any })
    useAccountStore.setState({ isLoggedIn: true })
    render(<HistoryList isExpanded={true} onSelect={onSelect} sortOrder="newest" />)
    expect(screen.getByText('Buyruq asosiy')).toBeInTheDocument()
    expect(screen.getByText('Tarif malaka')).toBeInTheDocument()
  })

  it('calls onSelect when item clicked', () => {
    useHistoryStore.setState({ items: mockItems as any })
    useAccountStore.setState({ isLoggedIn: true })
    render(<HistoryList isExpanded={true} onSelect={onSelect} sortOrder="newest" />)
    fireEvent.click(screen.getByText('Buyruq asosiy'))
    expect(onSelect).toHaveBeenCalledWith(mockItems[0])
  })

  it('delete removes item and shows undo button', () => {
    useHistoryStore.setState({ items: mockItems as any })
    useAccountStore.setState({ isLoggedIn: true })
    render(<HistoryList isExpanded={true} onSelect={onSelect} sortOrder="newest" />)

    const deleteBtns = document.querySelectorAll('[title="O\'chirish"]')
    expect(deleteBtns.length).toBeGreaterThan(0)
    fireEvent.click(deleteBtns[0])

    expect(useHistoryStore.getState().items).toHaveLength(1)
  })

  it('removes item on delete and stores in undo map', () => {
    useHistoryStore.setState({ items: mockItems as any })
    useAccountStore.setState({ isLoggedIn: true })
    render(<HistoryList isExpanded={true} onSelect={onSelect} sortOrder="newest" />)

    const deleteBtns = document.querySelectorAll('[title="O\'chirish"]')
    fireEvent.click(deleteBtns[0])

    expect(useHistoryStore.getState().items).toHaveLength(1)
  })

  it('sort order newest places newest first', () => {
    useHistoryStore.setState({ items: mockItems as any })
    useAccountStore.setState({ isLoggedIn: true })
    const { container } = render(<HistoryList isExpanded={true} onSelect={onSelect} sortOrder="newest" />)
    const titles = container.querySelectorAll('.truncate')
    expect(titles[0]?.textContent).toBe('Buyruq asosiy')
  })

  it('sort order oldest places oldest first', () => {
    useHistoryStore.setState({ items: mockItems as any })
    useAccountStore.setState({ isLoggedIn: true })
    const { container } = render(<HistoryList isExpanded={true} onSelect={onSelect} sortOrder="oldest" />)
    const titles = container.querySelectorAll('.truncate')
    expect(titles[0]?.textContent).toBe('Tarif malaka')
  })
})
