import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SearchResultsList } from '../../src/renderer/src/components/Search/SearchResultsList'
import { useSearchStore } from '../../src/renderer/src/store/useSearchStore'

vi.mock('framer-motion')
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const m: Record<string, string> = {
        'search.noResults': 'Natija topilmadi',
        'search.newShablon': 'Yangi shablon',
      }
      return m[key] || key
    },
    i18n: { changeLanguage: () => {}, language: 'uz' },
    ready: true,
  }),
}))

const mockTemplates = [
  { type: 'buyruq_asosiy', label: 'Buyruq asosiy', description: 'Asosiy buyruq', teacher_visible: true, schema: { required: [], optional: [] }, template: '', keywords: [] },
  { type: 'tarif_malaka', label: 'Tarif malaka', description: 'Malaka hisobi', teacher_visible: true, schema: { required: [], optional: [] }, template: '', keywords: [] },
]

describe('SearchResultsList', () => {
  const onSelect = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    useSearchStore.setState({ query: 'test', results: ['buyruq_asosiy', 'tarif_malaka'], isFocused: true })
  })

  it('renders new shablon action button', () => {
    render(<SearchResultsList onSelect={onSelect} templates={mockTemplates as any} />)
    expect(screen.getByText('Yangi shablon')).toBeInTheDocument()
  })

  it('renders matching result items', () => {
    render(<SearchResultsList onSelect={onSelect} templates={mockTemplates as any} />)
    expect(screen.getByText('Buyruq asosiy')).toBeInTheDocument()
    expect(screen.getByText('Tarif malaka')).toBeInTheDocument()
  })

  it('shows template description when available', () => {
    render(<SearchResultsList onSelect={onSelect} templates={mockTemplates as any} />)
    expect(screen.getByText('Asosiy buyruq')).toBeInTheDocument()
    expect(screen.getByText('Malaka hisobi')).toBeInTheDocument()
  })

  it('calls onSelect with type when clicked', () => {
    render(<SearchResultsList onSelect={onSelect} templates={mockTemplates as any} />)
    fireEvent.click(screen.getByText('Buyruq asosiy'))
    expect(onSelect).toHaveBeenCalledWith('buyruq_asosiy')
  })

  it('shows no results message when results empty and query non-empty', () => {
    useSearchStore.setState({ query: 'zzz', results: [] })
    render(<SearchResultsList onSelect={onSelect} templates={mockTemplates as any} />)
    expect(screen.getByText('Natija topilmadi')).toBeInTheDocument()
  })
})
