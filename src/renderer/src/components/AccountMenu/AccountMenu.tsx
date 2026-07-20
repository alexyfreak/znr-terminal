import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, LogOut } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAccountStore } from '@renderer/store/useAccountStore'
import { useFocusTrap } from '@renderer/hooks/useFocusTrap'

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
  const trapRef = useFocusTrap(isOpen)

  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    setTimeout(() => trapRef.current?.querySelector<HTMLElement>('input')?.focus(), 50)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  const handleLogin = async () => {
    if (!loginName.trim() || !password.trim()) return
    setLoginError('')

    try {
      if (window.electronAPI?.login) {
        const res = await window.electronAPI.login(loginName.trim(), password.trim())
        if (res.success && res.data) {
          const ctx = res.data as { user: { id: string; full_name: string; email?: string; phone?: string; subject?: string }; school: { id: string; name: string }; role: string }
          login({ userName: ctx.user.full_name, schoolName: ctx.school.name, role: ctx.role, userId: ctx.user.id, schoolId: ctx.school.id, email: ctx.user.email || '', phone: ctx.user.phone || '', subject: ctx.user.subject || '' })
          setLoginName('')
          setPassword('')
        } else {
          setLoginError(res.error || 'Kirish muvaffaqiyatsiz')
        }
      } else {
        login({ userName: loginName.trim(), schoolName: 'Maktab №1', role: "O'qituvchi" })
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
            ref={trapRef}
            role="dialog"
            aria-modal="true"
            aria-label={isLoggedIn ? userName : t('account.title')}
            initial={{ opacity: 0, scale: 0.95, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="fixed bottom-20 z-50 w-full max-w-[320px] max-h-[70vh] overflow-y-auto p-6 rounded-zn-popover glass-strong shadow-2xl"
            style={{ right: 16 }}
          >
            {isLoggedIn ? (
              <>
                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-zn-border">
                  <div className="w-10 h-10 rounded-full bg-zn-elevated flex items-center justify-center">
                    <User className="h-5 w-5 text-zn-text-muted" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zn-text">{userName}</p>
                    <p className="text-xs text-zn-text-muted">{schoolName} · {role}</p>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div>
                    <label className="block text-[11px] text-zn-text-muted mb-1">{t('account.login')}</label>
                    <input
                      type="text"
                      value={userName}
                      readOnly
                      className="w-full h-9 px-3 text-xs bg-zn-elevated border border-zn-border rounded-zn-input text-zn-text"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-zn-text-muted mb-1">{t('account.password')}</label>
                    <input
                      type="password"
                      value="········"
                      readOnly
                      className="w-full h-9 px-3 text-xs bg-zn-elevated border border-zn-border rounded-zn-input text-zn-text-muted opacity-60"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-zn-border">
                  {confirmLogout ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setConfirmLogout(false)}
                        className="flex-1 py-2 text-xs text-zn-text-muted hover:text-zn-text border border-zn-border rounded-zn-btn transition-all active:scale-[0.98]"
                      >
                        {t('common.cancel')}
                      </button>
                      <button
                        onClick={handleLogout}
                        className="flex-1 py-2 text-xs font-medium text-zn-page bg-zn-error-text hover:opacity-90 rounded-zn-btn transition-all active:scale-[0.98]"
                      >
                        {t('account.logout')}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmLogout(true)}
                      className="flex items-center justify-center gap-2 w-full py-2 text-xs text-zn-error-text hover:opacity-80 transition-all"
                    >
                      <LogOut className="h-3.5 w-3.5" strokeWidth={1.5} />
                      {t('account.logout')}
                    </button>
                  )}
                </div>
              </>
            ) : (
              <>
                <h3 className="text-sm font-medium text-zn-text mb-4">{t('account.title')}</h3>
                <div className="space-y-3 mb-4">
                  <div>
                    <label className="block text-[11px] text-zn-text-muted mb-1">{t('account.login')}</label>
                    <input
                      type="text"
                      value={loginName}
                      onChange={(e) => setLoginName(e.target.value)}
                      className="w-full h-9 px-3 text-xs bg-zn-elevated border border-zn-border rounded-zn-input text-zn-text outline-none transition-all focus:border-zn-text/30"
                      placeholder={t('auth.loginIdPlaceholder')}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-zn-text-muted mb-1">{t('account.password')}</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full h-9 px-3 text-xs bg-zn-elevated border border-zn-border rounded-zn-input text-zn-text outline-none transition-all focus:border-zn-text/30"
                    />
                  </div>
                  {loginError && (
                    <p className="text-[11px] text-zn-error-text">{loginError}</p>
                  )}
                </div>
                <button
                  onClick={handleLogin}
                  className="w-full py-2 text-xs font-medium text-zn-page bg-zn-text hover:opacity-90 rounded-zn-btn transition-all active:scale-[0.98]"
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
