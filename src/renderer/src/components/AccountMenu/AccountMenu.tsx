import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, LogOut } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAccountStore } from '@renderer/store/useAccountStore'
import { useSidebarStore } from '@renderer/store/useSidebarStore'

interface AccountMenuProps {
  isOpen: boolean
  onClose: () => void
}

export const AccountMenu = ({ isOpen, onClose }: AccountMenuProps) => {
  const { t } = useTranslation()
  const { isLoggedIn, userName, schoolName, role, login, logout } = useAccountStore()
  const [loginName, setLoginName] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const panelRef = useRef<HTMLDivElement>(null)
  const { isExpanded } = useSidebarStore()

  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'Tab') {
        const panel = panelRef.current
        if (!panel) return
        const focusable = panel.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        if (focusable.length === 0) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    setTimeout(() => panelRef.current?.querySelector<HTMLElement>('input')?.focus(), 50)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  const handleLogin = async () => {
    if (!loginName.trim() || !password.trim()) return
    setLoginError('')

    try {
      if (window.electronAPI?.login) {
        const res = await window.electronAPI.login(loginName.trim(), password.trim())
        if (res.success && res.data) {
          const ctx = res.data as { user: { full_name: string }; school: { name: string }; role: string }
          login(ctx.user.full_name, ctx.school.name, ctx.role)
          setLoginName('')
          setPassword('')
        } else {
          setLoginError(res.error || 'Kirish muvaffaqiyatsiz')
        }
      } else {
        login(loginName.trim(), 'Maktab №1', "O'qituvchi")
        setLoginName('')
        setPassword('')
      }
    } catch (err) {
      setLoginError((err as Error).message || 'Kirish muvaffaqiyatsiz')
    }
  }

  const [confirmLogout, setConfirmLogout] = useState(false)

  const handleLogout = () => {
    logout()
    onClose()
    setConfirmLogout(false)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
            onClick={onClose}
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={isLoggedIn ? userName : t('account.title')}
            initial={{ opacity: 0, scale: 0.95, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="fixed bottom-20 z-50 w-full max-w-[320px] max-h-[70vh] overflow-y-auto p-5 rounded-xl bg-[var(--surface)] border border-[var(--hairline)] shadow-2xl"
            style={{ left: isExpanded ? 276 : 72 }}
          >
            {isLoggedIn ? (
              <>
                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-[var(--hairline)]">
                  <div className="w-10 h-10 rounded-full bg-[var(--surface-hover)] flex items-center justify-center">
                    <User className="h-5 w-5 text-muted-foreground" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{userName}</p>
                    <p className="text-xs text-muted-foreground">{schoolName} · {role}</p>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div>
                    <label className="block text-[11px] text-muted-foreground mb-1">{t('account.login')}</label>
                    <input
                      type="text"
                      value={userName}
                      readOnly
                      className="w-full h-9 px-3 text-xs bg-transparent border border-[var(--input-border)] rounded-md text-foreground"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-muted-foreground mb-1">{t('account.password')}</label>
                    <input
                      type="password"
                      value="········"
                      readOnly
                      className="w-full h-9 px-3 text-xs bg-transparent border border-[var(--input-border)] rounded-md text-muted-foreground opacity-60"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-[var(--hairline)]">
                  {confirmLogout ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setConfirmLogout(false)}
                        className="flex-1 py-2 text-xs text-muted-foreground hover:text-foreground border border-[var(--hairline)] rounded-md transition-colors"
                      >
                        Bekor qilish
                      </button>
                      <button
                        onClick={handleLogout}
                        className="flex-1 py-2 text-xs font-medium text-carbon bg-destructive hover:bg-red-600 rounded-md transition-colors"
                      >
                        Chiqish
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmLogout(true)}
                      className="flex items-center justify-center gap-2 w-full py-2 text-xs text-destructive hover:text-red-400 transition-colors"
                    >
                      <LogOut className="h-3.5 w-3.5" strokeWidth={1.5} />
                      {t('account.logout')}
                    </button>
                  )}
                </div>
              </>
            ) : (
              <>
                <h3 className="text-sm font-medium text-foreground mb-4">{t('account.title')}</h3>
                <div className="space-y-3 mb-4">
                  <div>
                    <label className="block text-[11px] text-muted-foreground mb-1">{t('account.login')}</label>
                    <input
                      type="text"
                      value={loginName}
                      onChange={(e) => setLoginName(e.target.value)}
                      className="w-full h-9 px-3 text-xs bg-transparent border border-[var(--input-border)] rounded-md text-foreground outline-none focus:border-[var(--hairline)] transition-colors"
                      placeholder="TCH00001"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-muted-foreground mb-1">{t('account.password')}</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full h-9 px-3 text-xs bg-transparent border border-[var(--input-border)] rounded-md text-foreground outline-none focus:border-[var(--hairline)] transition-colors"
                    />
                  </div>
                  {loginError && (
                    <p className="text-[11px] text-destructive">{loginError}</p>
                  )}
                </div>
                <button
                  onClick={handleLogin}
                  className="w-full py-2 text-xs font-medium text-carbon bg-warm hover:bg-warm/90 rounded-md transition-colors"
                >
                  {t('account.login')}
                </button>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
