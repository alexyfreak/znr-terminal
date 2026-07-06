import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { FieldCollector } from '../../src/renderer/src/components/FieldCollector/FieldCollector'
import { useAccountStore } from '../../src/renderer/src/store/useAccountStore'

vi.mock('framer-motion')
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k, i18n: { changeLanguage: () => {} }, ready: true }),
}))

const basicSchema = { required: ['teacher_name', 'date'], optional: ['notes'] }
const multiStepSchema = { required: ['order_title', 'order_number', 'date', 'order_text', 'basis'], optional: [] }

const userContext = {
  schoolName: '1-Maktab',
  classes: ['9-A', '9-B'],
  subjects: ['Matematika', 'Fizika'],
  teachers: ['Aliyev A.', 'Valiyev V.'],
  directorName: 'Karimov K.',
}

describe('FieldCollector', () => {
  const onComplete = vi.fn()
  const onBack = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    useAccountStore.setState({
      isLoggedIn: true, userName: 'Aliyev A.', schoolName: '1-Maktab', role: "O'qituvchi",
      avatar: '', classes: [], director: null, teachers: [],
    })
  })

  it('renders flat form when no shablonType (no complexSteps)', () => {
    render(
      <FieldCollector schema={basicSchema} onComplete={onComplete} onBack={onBack} userContext={userContext} />
    )
    expect(screen.getByText("Ma'lumotlarni to'ldiring")).toBeInTheDocument()
  })

  it('renders multi-step form for buyruq_asosiy', () => {
    render(
      <FieldCollector schema={multiStepSchema} onComplete={onComplete} onBack={onBack} userContext={userContext} shablonType="buyruq_asosiy" />
    )
    expect(screen.getByText('1-qadam: Ma\'lumot')).toBeInTheDocument()
  })

  it('shows autofill hints for known fields', () => {
    render(
      <FieldCollector schema={basicSchema} onComplete={onComplete} onBack={onBack} userContext={userContext} />
    )
    const hints = screen.getAllByText(/Avtomatik:/)
    expect(hints.length).toBeGreaterThan(0)
  })

  it('validates required fields on next click', () => {
    const schema = { required: ['teacher_name', 'date'], optional: [] }
    render(
      <FieldCollector schema={schema} onComplete={onComplete} onBack={onBack} userContext={userContext} />
    )
    fireEvent.click(screen.getByText('Tayyor'))
    const errors = document.querySelectorAll('.text-destructive')
    expect(errors.length).toBeGreaterThan(0)
  })

  it('navigates between steps in multi-step form', () => {
    render(
      <FieldCollector schema={multiStepSchema} onComplete={onComplete} onBack={onBack} userContext={userContext} shablonType="buyruq_asosiy" />
    )
    expect(screen.getByText('1-qadam: Ma\'lumot')).toBeInTheDocument()

    const inputs = document.querySelectorAll<HTMLInputElement>('input')
    fireEvent.change(inputs[0], { target: { value: 'Test buyruq' } })
    fireEvent.change(inputs[1], { target: { value: '42' } })
    fireEvent.change(inputs[2], { target: { value: '2025-01-15' } })
    fireEvent.click(screen.getByText('Keyingi'))
    expect(screen.getByText('2-qadam: Buyruq matni')).toBeInTheDocument()
  })

  it('goes back from step 2 to step 1', () => {
    render(
      <FieldCollector schema={multiStepSchema} onComplete={onComplete} onBack={onBack} userContext={userContext} shablonType="buyruq_asosiy" />
    )
    const inputs = document.querySelectorAll<HTMLInputElement>('input')
    fireEvent.change(inputs[0], { target: { value: 'Test buyruq' } })
    fireEvent.change(inputs[1], { target: { value: '42' } })
    fireEvent.change(inputs[2], { target: { value: '2025-01-15' } })
    fireEvent.click(screen.getByText('Keyingi'))
    fireEvent.click(screen.getByText('Avvalgi'))
    expect(screen.getByText('1-qadam: Ma\'lumot')).toBeInTheDocument()
  })

  it('calls onComplete when all steps done', () => {
    const schema = { required: ['teacher_name'], optional: [] }
    useAccountStore.setState({ isLoggedIn: true, userName: 'Aliyev A.', schoolName: '1-Maktab', role: "O'qituvchi" })
    render(
      <FieldCollector schema={schema} onComplete={onComplete} onBack={onBack} userContext={userContext} />
    )
    fireEvent.click(screen.getByText('Tayyor'))
    expect(onComplete).toHaveBeenCalled()
  })

  it('calls onBack when back button clicked on step 0', () => {
    render(
      <FieldCollector schema={basicSchema} onComplete={onComplete} onBack={onBack} userContext={userContext} />
    )
    fireEvent.click(screen.getByText('Ortga'))
    expect(onBack).toHaveBeenCalled()
  })

  it('shows percent field with % suffix', () => {
    const schema = { required: ['mastery'], optional: [] }
    render(
      <FieldCollector schema={schema} onComplete={onComplete} onBack={onBack} userContext={userContext} />
    )
    expect(screen.getByText('%')).toBeInTheDocument()
  })

  it('renders date field as date input', () => {
    const schema = { required: ['date'], optional: [] }
    render(
      <FieldCollector schema={schema} onComplete={onComplete} onBack={onBack} userContext={userContext} />
    )
    const dateInput = document.querySelector('input[type="date"]')
    expect(dateInput).toBeTruthy()
  })

  it('renders select field for school', () => {
    const schema = { required: ['school'], optional: [] }
    render(
      <FieldCollector schema={schema} onComplete={onComplete} onBack={onBack} userContext={userContext} />
    )
    expect(screen.getByText('1-Maktab')).toBeInTheDocument()
  })

  it('renders progress bar for multi-step', () => {
    const schema = { required: ['order_title', 'order_text'], optional: [] }
    const { container } = render(
      <FieldCollector schema={schema} onComplete={onComplete} onBack={onBack} userContext={userContext} shablonType="buyruq_asosiy" />
    )
    const progressBars = container.querySelectorAll('.rounded-full')
    expect(progressBars.length).toBeGreaterThanOrEqual(2)
  })

  it('renders 3-step form for tarif_malaka', () => {
    render(
      <FieldCollector schema={{ required: ['salary', 'date'], optional: [] }} onComplete={onComplete} onBack={onBack} userContext={userContext} shablonType="tarif_malaka" />
    )
    expect(screen.getByText("1-qadam: Xodim ma'lumotlari")).toBeInTheDocument()
  })
})
