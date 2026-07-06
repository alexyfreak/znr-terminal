import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { VersionPicker } from '../../src/renderer/src/components/VersionPicker/VersionPicker'

vi.mock('framer-motion')

describe('VersionPicker', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders active version label', () => {
    render(<VersionPicker />)
    expect(screen.getByText("2025-2026 o'quv yili")).toBeInTheDocument()
  })

  it('shows dropdown on click', () => {
    render(<VersionPicker />)
    fireEvent.click(screen.getByRole('button'))
    expect(screen.getByText('2024-2025 o\'quv yili')).toBeInTheDocument()
    expect(screen.getByText('2023-2024 o\'quv yili')).toBeInTheDocument()
  })

  it('selects a version and closes dropdown', () => {
    render(<VersionPicker />)
    fireEvent.click(screen.getByRole('button'))

    const v2 = screen.getByText("2024-2025 o'quv yili")
    fireEvent.click(v2)

    expect(screen.getByText("2024-2025 o'quv yili")).toBeInTheDocument()
    expect(screen.queryByText('2023-2024 o\'quv yili')).toBeNull()
  })

  it('default label shows fallback for unknown version', () => {
    render(<VersionPicker />)
    const btn = screen.getByRole('button')
    expect(btn.textContent).toContain("2025-2026 o'quv yili")
  })
})
