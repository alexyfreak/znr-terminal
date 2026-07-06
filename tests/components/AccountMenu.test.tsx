import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { AccountMenu } from '../../src/renderer/src/components/AccountMenu/AccountMenu'
import { useAccountStore } from '../../src/renderer/src/store/useAccountStore'
import { useSidebarStore } from '../../src/renderer/src/store/useSidebarStore'

vi.mock('framer-motion')
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const m: Record<string, string> = {
        'account.title': 'Hisob',
        'account.login': 'Kirish',
        'account.password': 'Parol',
        'account.logout': 'Chiqish',
      }
      return m[key] || key
    },
    i18n: { changeLanguage: () => {}, language: 'uz' },
    ready: true,
  }),
}))

describe('AccountMenu', () => {
  const onClose = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    useAccountStore.setState({ isLoggedIn: false, userName: '', schoolName: '', role: '', avatar: '', classes: [], director: null, teachers: [] })
    useSidebarStore.setState({ isExpanded: false })
  })

  it('returns null when not open', () => {
    const { container } = render(<AccountMenu isOpen={false} onClose={onClose} />)
    expect(container.innerHTML).toBe('')
  })

  it('shows login form when not logged in', () => {
    render(<AccountMenu isOpen={true} onClose={onClose} />)
    expect(screen.getByText('Hisob')).toBeInTheDocument()
    expect(screen.getAllByText('Kirish').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByPlaceholderText('TCH00001')).toBeInTheDocument()
  })

  it('shows logged in state with user name', () => {
    useAccountStore.getState().login('Aliyev A.', '1-Maktab', "O'qituvchi")
    render(<AccountMenu isOpen={true} onClose={onClose} />)
    expect(screen.getByText('Aliyev A.')).toBeInTheDocument()
    expect(screen.getByText('1-Maktab · O\'qituvchi')).toBeInTheDocument()
  })

  it('shows logout button when logged in', () => {
    useAccountStore.getState().login('Aliyev A.', '1-Maktab', "O'qituvchi")
    render(<AccountMenu isOpen={true} onClose={onClose} />)
    expect(screen.getByText('Chiqish')).toBeInTheDocument()
  })

  it('logout shows confirmation', () => {
    useAccountStore.getState().login('Aliyev A.', '1-Maktab', "O'qituvchi")
    render(<AccountMenu isOpen={true} onClose={onClose} />)
    fireEvent.click(screen.getByText('Chiqish'))
    expect(screen.getByText('Bekor qilish')).toBeInTheDocument()
  })

  it('confirm logout clears state', () => {
    useAccountStore.getState().login('Aliyev A.', '1-Maktab', "O'qituvchi")
    render(<AccountMenu isOpen={true} onClose={onClose} />)
    fireEvent.click(screen.getByText('Chiqish'))
    const confirmBtns = screen.getAllByText('Chiqish')
    fireEvent.click(confirmBtns[confirmBtns.length - 1])
    expect(useAccountStore.getState().isLoggedIn).toBe(false)
  })

  it('cancel logout stays logged in', () => {
    useAccountStore.getState().login('Aliyev A.', '1-Maktab', "O'qituvchi")
    render(<AccountMenu isOpen={true} onClose={onClose} />)
    fireEvent.click(screen.getByText('Chiqish'))
    fireEvent.click(screen.getByText('Bekor qilish'))
    expect(useAccountStore.getState().isLoggedIn).toBe(true)
  })

  it('empty login click does nothing (no crash)', () => {
    render(<AccountMenu isOpen={true} onClose={onClose} />)
    const loginBtns = screen.getAllByText('Kirish')
    const loginButton = loginBtns.find(b => b.tagName === 'BUTTON')
    if (loginButton) fireEvent.click(loginButton)
    expect(useAccountStore.getState().isLoggedIn).toBe(false)
  })

  it('closes on Escape key', () => {
    render(<AccountMenu isOpen={true} onClose={onClose} />)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalled()
  })
})
