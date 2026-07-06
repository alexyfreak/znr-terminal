import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, LogOut } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAccountStore } from '@renderer/store/useAccountStore'

interface AccountMenuProps {
  isOpen: boolean
  onClose: () => void
}

export const AccountMenu = ({ isOpen, onClose }: AccountMenuProps) => {
  const { t } = useTranslation()
  const { isLoggedIn, userName, schoolName, role, login, logout } = useAccountStore()
  const [loginName, setLoginName] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = () => {
    if (!loginName.trim()) return
    login(loginName.trim(), 'Maktab №1', 'O\'qituvchi')
    setLoginName('')
    setPassword('')
  }

  const handleLogout = () => {
    logout()
    onClose()
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
            initial={{ opacity: 0, scale: 0.95, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="fixed bottom-20 left-[72px] z-50 w-full max-w-[320px] p-5 rounded-xl bg-[var(--surface)] border border-[var(--hairline)] shadow-2xl"
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
                  <button
                    onClick={handleLogout}
                    className="flex items-center justify-center gap-2 w-full py-2 text-xs text-destructive hover:text-red-400 transition-colors"
                  >
                    <LogOut className="h-3.5 w-3.5" strokeWidth={1.5} />
                    {t('account.logout')}
                  </button>
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
                      placeholder="F.I.O"
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
