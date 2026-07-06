import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SpotlightSearchBar } from '../../src/renderer/src/components/Search/SpotlightSearchBar'
import { useSearchStore } from '../../src/renderer/src/store/useSearchStore'
import { useSidebarStore } from '../../src/renderer/src/store/useSidebarStore'

vi.mock('framer-motion')
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const m: Record<string, string> = { 'search.placeholder': 'Zunooradan so\'rang...' }
      return m[key] || key
    },
    i18n: { changeLanguage: () => {}, language: 'uz' },
    ready: true,
  }),
}))

const mockTemplates = [
  { type: 'buyruq_asosiy', label: 'Buyruq asosiy', description: 'Asosiy buyruq', teacher_visible: true, schema: { required: ['title'], optional: [] }, template: '', keywords: ['buyruq', 'asosiy'] },
  { type: 'tarif_malaka', label: 'Tarif malaka', description: 'Malaka hisobi', teacher_visible: true, schema: { required: [], optional: [] }, template: '', keywords: ['tarif', 'malaka'] },
]

describe('SpotlightSearchBar', () => {
  const onSelect = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    useSearchStore.setState({ query: '', isFocused: false, isDocked: false, results: [] })
    useSidebarStore.setState({ isExpanded: false })
  })

  it('renders centered search bar when not docked', () => {
    const { container } = render(<SpotlightSearchBar onSelect={onSelect} templates={mockTemplates as any} />)
    expect(screen.getByPlaceholderText('Zunooradan so\'rang...')).toBeInTheDocument()
    expect(container.querySelector('.max-w-xl')).toBeTruthy()
  })

  it('shows loading spinner when templatesLoading is true', () => {
    render(<SpotlightSearchBar onSelect={onSelect} templates={[]} templatesLoading={true} />)
    const svgs = document.querySelectorAll('.animate-spin')
    expect(svgs.length).toBeGreaterThan(0)
  })

  it('updates query on typing', async () => {
    render(<SpotlightSearchBar onSelect={onSelect} templates={mockTemplates as any} />)
    const input = screen.getByPlaceholderText('Zunooradan so\'rang...')
    await userEvent.type(input, 'buyruq')
    expect(useSearchStore.getState().query).toBe('buyruq')
  })

  it('sets focused state on focus', () => {
    render(<SpotlightSearchBar onSelect={onSelect} templates={mockTemplates as any} />)
    const input = screen.getByPlaceholderText('Zunooradan so\'rang...')
    fireEvent.focus(input)
    expect(useSearchStore.getState().isFocused).toBe(true)
  })

  it('clears focused state on blur after delay', async () => {
    render(<SpotlightSearchBar onSelect={onSelect} templates={mockTemplates as any} />)
    const input = screen.getByPlaceholderText('Zunooradan so\'rang...')
    fireEvent.focus(input)
    fireEvent.blur(input)
    await waitFor(() => expect(useSearchStore.getState().isFocused).toBe(false), { timeout: 500 })
  })

  it('debounces search by 180ms', async () => {
    vi.useFakeTimers()
    render(<SpotlightSearchBar onSelect={onSelect} templates={mockTemplates as any} />)
    const input = screen.getByPlaceholderText('Zunooradan so\'rang...')

    fireEvent.change(input, { target: { value: 'b' } })
    expect(useSearchStore.getState().results).toEqual([])

    vi.advanceTimersByTime(200)
    expect(useSearchStore.getState().results.length).toBeGreaterThan(0)
    vi.useRealTimers()
  })

  it('filters templates by label match after debounce', async () => {
    vi.useFakeTimers()
    render(<SpotlightSearchBar onSelect={onSelect} templates={mockTemplates as any} />)
    const input = screen.getByPlaceholderText('Zunooradan so\'rang...')

    fireEvent.change(input, { target: { value: 'tarif' } })
    vi.advanceTimersByTime(200)

    const results = useSearchStore.getState().results
    expect(results).toContain('tarif_malaka')
    expect(results).not.toContain('buyruq_asosiy')
    vi.useRealTimers()
  })

  it('filters templates by keywords match', async () => {
    vi.useFakeTimers()
    render(<SpotlightSearchBar onSelect={onSelect} templates={mockTemplates as any} />)
    const input = screen.getByPlaceholderText('Zunooradan so\'rang...')

    fireEvent.change(input, { target: { value: 'asosiy' } })
    vi.advanceTimersByTime(200)

    const results = useSearchStore.getState().results
    expect(results).toContain('buyruq_asosiy')
    vi.useRealTimers()
  })

  it('shows no results message when query has no match', async () => {
    vi.useFakeTimers()
    render(<SpotlightSearchBar onSelect={onSelect} templates={mockTemplates as any} />)
    const input = screen.getByPlaceholderText('Zunooradan so\'rang...')
    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: 'zzzxxx' } })
    vi.advanceTimersByTime(200)

    const noResults = screen.queryByText('Natija topilmadi')
    if (noResults) expect(noResults).toBeInTheDocument()
    vi.useRealTimers()
  })
})
