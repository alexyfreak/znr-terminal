import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { DocumentFulfillmentCard } from '../../src/renderer/src/components/DocumentFulfillmentCard/DocumentFulfillmentCard'
import { useAccountStore } from '../../src/renderer/src/store/useAccountStore'
import { useHistoryStore } from '../../src/renderer/src/store/useHistoryStore'

vi.mock('framer-motion')
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k, i18n: { changeLanguage: () => {} }, ready: true }),
}))

const mockTemplate = {
  type: 'buyruq_asosiy',
  label: 'Buyruq asosiy',
  description: 'Test',
  teacher_visible: true,
  schema: { required: ['teacher_name', 'date'], optional: ['notes'] },
  template: 'Buyruq: {{teacher_name}}, Sana: {{date}}',
  keywords: [],
}

const userContext = {
  schoolName: '1-Maktab',
  classes: ['9-A'],
  subjects: ['Matematika'],
  teachers: ['Aliyev A.'],
  directorName: 'Karimov K.',
}

function completeMultiStepForm() {
  const inputs = document.querySelectorAll<HTMLInputElement>('input')
  const dateInput = Array.from(inputs).find(i => i.type === 'date')
  if (dateInput) fireEvent.change(dateInput, { target: { value: '2025-01-15' } })
  fireEvent.click(screen.getByText('Keyingi'))
  fireEvent.click(screen.getByText('Tayyor'))
}

describe('DocumentFulfillmentCard', () => {
  const onReset = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    useAccountStore.setState({
      isLoggedIn: true, userName: 'Aliyev A.', schoolName: '1-Maktab', role: "O'qituvchi",
      avatar: '', classes: [], director: null, teachers: [],
    })
    useHistoryStore.setState({ items: [], sortOrder: 'newest', activeId: null })
    vi.mocked(window.electronAPI.renderAndGenerate).mockResolvedValue({ success: true, data: '~/Documents/test.docx' })
  })

  it('returns null when not visible', () => {
    const { container } = render(
      <DocumentFulfillmentCard isVisible={false} onReset={onReset} template={mockTemplate as any} userContext={userContext} />
    )
    expect(container.innerHTML).toBe('')
  })

  it('renders template name header', () => {
    render(
      <DocumentFulfillmentCard isVisible={true} onReset={onReset} template={mockTemplate as any} userContext={userContext} />
    )
    expect(screen.getByText('Buyruq asosiy')).toBeInTheDocument()
  })

  it('shows VersionPicker in header', () => {
    render(
      <DocumentFulfillmentCard isVisible={true} onReset={onReset} template={mockTemplate as any} userContext={userContext} />
    )
    expect(screen.getByText('Versiyalar')).toBeInTheDocument()
  })

  it('shows field form by default', () => {
    render(
      <DocumentFulfillmentCard isVisible={true} onReset={onReset} template={mockTemplate as any} userContext={userContext} />
    )
    expect(screen.getByText("1-qadam: Ma'lumot")).toBeInTheDocument()
  })

  it('shows preview after form completion', () => {
    render(
      <DocumentFulfillmentCard isVisible={true} onReset={onReset} template={mockTemplate as any} userContext={userContext} />
    )
    completeMultiStepForm()
    expect(screen.getByText('Tayyor matn')).toBeInTheDocument()
  })

  it('renders template preview text after completion', () => {
    render(
      <DocumentFulfillmentCard isVisible={true} onReset={onReset} template={mockTemplate as any} userContext={userContext} />
    )
    completeMultiStepForm()
    const previewDiv = document.querySelector('.whitespace-pre-wrap')
    expect(previewDiv).toBeTruthy()
    expect(previewDiv?.textContent).toContain('Buyruq:')
  })

  it('back from preview returns to fields', () => {
    render(
      <DocumentFulfillmentCard isVisible={true} onReset={onReset} template={mockTemplate as any} userContext={userContext} />
    )
    completeMultiStepForm()
    fireEvent.click(screen.getByText('Ortga'))
    expect(screen.getByText('1-qadam: Ma\'lumot')).toBeInTheDocument()
  })

  it('shows done view after export', () => {
    render(
      <DocumentFulfillmentCard isVisible={true} onReset={onReset} template={mockTemplate as any} userContext={userContext} />
    )
    completeMultiStepForm()
    const exportBtn = screen.getByText('Hujjat yaratish')
    fireEvent.click(exportBtn)
    expect(screen.getByText('Hujjat tayyor')).toBeInTheDocument()
  })

  it('shows export path in done view', async () => {
    render(
      <DocumentFulfillmentCard isVisible={true} onReset={onReset} template={mockTemplate as any} userContext={userContext} />
    )
    completeMultiStepForm()
    fireEvent.click(screen.getByText('Hujjat yaratish'))
    await waitFor(() => {
      expect(screen.getByText(/Hujjat saqlandi:/)).toBeInTheDocument()
    })
  })

  it('new document button calls onReset', () => {
    render(
      <DocumentFulfillmentCard isVisible={true} onReset={onReset} template={mockTemplate as any} userContext={userContext} />
    )
    completeMultiStepForm()
    fireEvent.click(screen.getByText('Hujjat yaratish'))
    fireEvent.click(screen.getByText('Yangi hujjat yaratish'))
    expect(onReset).toHaveBeenCalled()
  })

  it('renders with history item in done state', () => {
    const historyItem = {
      id: 'hist-1', title: 'Buyruq asosiy', type: 'buyruq_asosiy',
      date: new Date().toISOString(), docCount: 1,
      exportPath: '~/Documents/test.docx', fieldValues: { teacher_name: 'Aliyev', date: '2025-01-01' },
    }
    render(
      <DocumentFulfillmentCard isVisible={true} onReset={onReset} template={mockTemplate as any} userContext={userContext} historyItem={historyItem as any} />
    )
    expect(screen.getByText('Hujjat tayyor')).toBeInTheDocument()
    expect(screen.getByText(/test.docx/)).toBeInTheDocument()
  })

  it('shows export error when renderAndGenerate fails', async () => {
    vi.mocked(window.electronAPI.renderAndGenerate).mockResolvedValue({ success: false, error: 'Disk error' })
    render(
      <DocumentFulfillmentCard isVisible={true} onReset={onReset} template={mockTemplate as any} userContext={userContext} />
    )
    completeMultiStepForm()
    fireEvent.click(screen.getByText('Hujjat yaratish'))
    await waitFor(() => {
      expect(screen.getByText(/Disk error/)).toBeInTheDocument()
    })
  })

  it('falls back to local path when electronAPI.renderAndGenerate is missing', async () => {
    vi.mocked(window.electronAPI.renderAndGenerate).mockRestore()
    ;(window.electronAPI as any).renderAndGenerate = undefined
    render(
      <DocumentFulfillmentCard isVisible={true} onReset={onReset} template={mockTemplate as any} userContext={userContext} />
    )
    completeMultiStepForm()
    fireEvent.click(screen.getByText('Hujjat yaratish'))
    await waitFor(() => {
      expect(screen.getByText(/Hujjat saqlandi:/)).toBeInTheDocument()
    })
  })
})
