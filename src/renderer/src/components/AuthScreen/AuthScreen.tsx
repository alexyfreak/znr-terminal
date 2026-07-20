import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useAccountStore } from '@renderer/store/useAccountStore'
import { Eye, EyeOff, Check, X, AlertCircle, Building2, GraduationCap, ChevronDown, Search, User, Shield, RefreshCw, Copy, CheckCheck } from 'lucide-react'

type AuthTab = 'login' | 'register'
type RegisterStep = 'account' | 'personal' | 'school' | 'professional'

const SUBJECTS = [
  'Matematika', "O'zbek tili", 'Adabiyot', 'Ingliz tili',
  'Fizika', 'Kimyo', 'Biologiya', 'Tarix',
  'Geografiya', 'Informatika', 'Jismoniy tarbiya', "San'at",
]

interface School {
  id: string
  name: string
  address: string | null
}

function getPasswordStrength(pw: string, t: (key: string) => string): { score: number; label: string; bars: number } {
  let score = 0
  if (pw.length >= 8) score++
  if (pw.length >= 12) score++
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^a-zA-Z0-9]/.test(pw)) score++
  const labels = ['', t('auth.passwordWeak'), t('auth.passwordMedium'), t('auth.passwordStrong'), t('auth.passwordVeryStrong'), t('auth.passwordPerfect')]
  return { score, label: labels[score] || t('auth.passwordStrong'), bars: score }
}

export const AuthScreen = () => {
  const { t } = useTranslation()
  const { login } = useAccountStore()

  const [tab, setTab] = useState<AuthTab>('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [loginId, setLoginId] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)

  const [regStep, setRegStep] = useState<RegisterStep>('account')
  const [regLoginId, setRegLoginId] = useState('')
  const [regIdLoading, setRegIdLoading] = useState(false)
  const [regPassword, setRegPassword] = useState('')
  const [regConfirmPassword, setRegConfirmPassword] = useState('')
  const [regFullName, setRegFullName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPhone, setRegPhone] = useState('')
  const [regAge, setRegAge] = useState('')
  const [regPosition, setRegPosition] = useState<'teacher' | 'director'>('teacher')
  const [regSubject, setRegSubject] = useState('')
  const [regSchoolId, setRegSchoolId] = useState<string | null>(null)
  const [regSchoolName, setRegSchoolName] = useState('')
  const [regSchoolAddress, setRegSchoolAddress] = useState('')
  const [schoolSearch, setSchoolSearch] = useState('')
  const [schools, setSchools] = useState<School[]>([])
  const [schoolsLoading, setSchoolsLoading] = useState(false)
  const [showSchoolDropdown, setShowSchoolDropdown] = useState(false)
  const [schoolNotFound, setSchoolNotFound] = useState(false)
  const [showRegPassword, setShowRegPassword] = useState(false)
  const [showRegConfirm, setShowRegConfirm] = useState(false)
  const [regErrors, setRegErrors] = useState<Record<string, string>>({})
  const [copiedId, setCopiedId] = useState(false)

  const schoolInputRef = useRef<HTMLDivElement>(null)
  const idFetchingRef = useRef(false)

  const fetchNewId = useCallback(async () => {
    if (idFetchingRef.current) return
    idFetchingRef.current = true
    setRegIdLoading(true)
    try {
      if (window.electronAPI?.generateId) {
        const res = await window.electronAPI.generateId()
        if (res.success && res.data) {
          setRegLoginId(res.data)
        }
      }
    } finally {
      setRegIdLoading(false)
      idFetchingRef.current = false
    }
  }, [])

  useEffect(() => {
    if (tab === 'register' && !regLoginId && !regIdLoading) {
      fetchNewId()
    }
  }, [tab, regLoginId, regIdLoading, fetchNewId])

  useEffect(() => {
    setError('')
    setRegErrors({})
  }, [tab])

  useEffect(() => {
    if (schools.length === 0 && !schoolsLoading) {
      setSchoolsLoading(true)
      window.electronAPI?.listSchools().then(res => {
        if (res.success && res.data) setSchools(res.data as School[])
        setSchoolsLoading(false)
      }).catch(() => setSchoolsLoading(false))
    }
  }, [])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (schoolInputRef.current && !schoolInputRef.current.contains(e.target as Node)) {
        setShowSchoolDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(regLoginId)
      setCopiedId(true)
      setTimeout(() => setCopiedId(false), 2000)
    } catch {}
  }

  const filteredSchools = schoolSearch.trim()
    ? schools.filter(s => s.name.toLowerCase().includes(schoolSearch.toLowerCase()))
    : schools

  const handleLogin = async () => {
    if (!loginId.trim()) { setError(t('auth.errorRequired')); return }
    if (!password.trim()) { setError(t('auth.errorRequired')); return }
    setLoading(true)
    setError('')
    try {
      if (window.electronAPI?.login) {
        const res = await window.electronAPI.login(loginId.trim().toUpperCase(), password.trim())
        if (res.success && res.data) {
          const ctx = res.data as {
            user: { id: string; full_name: string; email?: string; phone?: string; subject?: string }
            school: { id: string; name: string }
            role: string
          }
          login({
            userName: ctx.user.full_name,
            schoolName: ctx.school.name,
            role: ctx.role,
            userId: ctx.user.id,
            schoolId: ctx.school.id,
            email: ctx.user.email || '',
            phone: ctx.user.phone || '',
            subject: ctx.user.subject || '',
          })
        } else {
          setError(res.error || t('auth.errorGeneric'))
        }
      }
    } catch (err) {
      setError((err as Error).message || t('auth.errorGeneric'))
    } finally {
      setLoading(false)
    }
  }

  const validateRegister = (): boolean => {
    const errors: Record<string, string> = {}
    if (!regPassword.trim()) errors.password = t('auth.errorRequired')
    else if (regPassword.length < 8) errors.password = t('auth.errorPasswordWeak')
    else if (getPasswordStrength(regPassword, t).score < 2) errors.password = t('auth.errorPasswordWeak')
    if (regPassword !== regConfirmPassword) errors.confirmPassword = t('auth.errorPasswordMismatch')
    if (!regFullName.trim()) errors.fullName = t('auth.errorRequired')
    if (regEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regEmail)) errors.email = t('auth.errorEmailInvalid')
    if (regPosition === 'teacher' && !regSubject) errors.subject = t('auth.errorRequired')
    if (!schoolNotFound && !regSchoolId && !regSchoolName.trim()) errors.school = t('auth.errorRequired')
    if (schoolNotFound && !regSchoolName.trim()) errors.school = t('auth.errorRequired')
    setRegErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleRegister = async () => {
    if (!validateRegister()) return
    setLoading(true)
    setError('')
    try {
      if (window.electronAPI?.register) {
        const res = await window.electronAPI.register({
          loginId: regLoginId,
          password: regPassword,
          fullName: regFullName.trim(),
          email: regEmail.trim(),
          phone: regPhone.trim(),
          age: parseInt(regAge) || 0,
          position: regPosition,
          subject: regSubject,
          schoolId: regSchoolId,
          schoolName: schoolNotFound ? regSchoolName.trim() : (schools.find(s => s.id === regSchoolId)?.name || regSchoolName.trim()),
          schoolAddress: regSchoolAddress.trim(),
        })
        if (res.success && res.data) {
          const ctx = res.data as {
            user: { id: string; full_name: string; email?: string; phone?: string; subject?: string }
            school: { id: string; name: string }
            role: string
          }
          login({
            userName: ctx.user.full_name,
            schoolName: ctx.school.name,
            role: ctx.role,
            userId: ctx.user.id,
            schoolId: ctx.school.id,
            email: ctx.user.email || '',
            phone: ctx.user.phone || '',
            subject: ctx.user.subject || '',
          })
        } else {
          setError(res.error || t('auth.errorGeneric'))
        }
      }
    } catch (err) {
      setError((err as Error).message || t('auth.errorGeneric'))
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter') action()
  }

  const renderPasswordStrength = (pw: string) => {
    if (!pw) return null
    const { bars, label } = getPasswordStrength(pw, t)
    return (
      <div className="mt-1.5 space-y-1">
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map(i => (
            <div
              key={i}
              className={`h-0.5 flex-1 rounded-full transition-all duration-300 ${
                i <= bars ? 'bg-zn-text' : 'bg-zn-border'
              }`}
            />
          ))}
        </div>
        <p className="text-[10px] text-zn-text-muted">{label}</p>
      </div>
    )
  }

  const stepLabels: Record<RegisterStep, string> = {
    account: t('auth.step1'),
    personal: t('auth.step2'),
    school: t('auth.step3'),
    professional: t('auth.step4'),
  }
  const stepIndex: Record<RegisterStep, number> = { account: 1, personal: 2, school: 3, professional: 4 }

  const canAdvance = (): boolean => {
    switch (regStep) {
      case 'account': return !!regLoginId && !!regPassword.trim() && regPassword === regConfirmPassword
      case 'personal': return !!regFullName.trim()
      case 'school': return !!(regSchoolId || regSchoolName.trim())
      case 'professional': return regPosition === 'director' || !!regSubject
    }
  }

  const nextStep = () => {
    if (!canAdvance()) return
    switch (regStep) {
      case 'account': setRegStep('personal'); break
      case 'personal': setRegStep('school'); break
      case 'school': setRegStep('professional'); break
    }
  }

  const prevStep = () => {
    switch (regStep) {
      case 'personal': setRegStep('account'); break
      case 'school': setRegStep('personal'); break
      case 'professional': setRegStep('school'); break
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-zn-page overflow-hidden">
      <div className="absolute inset-0 desk-vignette" />
      <div className="absolute inset-0 paper-noise opacity-20" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_20%,rgba(255,255,255,0.02),transparent_60%)]" />

      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-[420px] mx-4"
      >
        <div className="flex flex-col items-center mb-8 select-none">
          <span className="label-uppercase text-[13px] tracking-[0.35em] text-zn-text-muted">
            Zunoora
          </span>
        </div>

        <div className="glass-strong rounded-zn-modal overflow-hidden">
          <div className="flex border-b border-zn-border">
            <button
              onClick={() => setTab('login')}
              className={`flex-1 py-3.5 text-sm font-medium transition-colors relative ${
                tab === 'login' ? 'text-zn-text' : 'text-zn-text-muted hover:text-zn-text/80'
              }`}
            >
              {t('auth.signIn')}
              {tab === 'login' && (
                <motion.div layoutId="auth-tab" className="absolute bottom-0 left-2 right-2 h-[2px] bg-zn-text rounded-full" />
              )}
            </button>
            <button
              onClick={() => setTab('register')}
              className={`flex-1 py-3.5 text-sm font-medium transition-colors relative ${
                tab === 'register' ? 'text-zn-text' : 'text-zn-text-muted hover:text-zn-text/80'
              }`}
            >
              {t('auth.signUp')}
              {tab === 'register' && (
                <motion.div layoutId="auth-tab" className="absolute bottom-0 left-2 right-2 h-[2px] bg-zn-text rounded-full" />
              )}
            </button>
          </div>

          <AnimatePresence mode="wait">
            {tab === 'login' ? (
              <motion.div
                key="login"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="p-6 space-y-4"
              >
                <div>
                  <label className="block text-xs text-zn-text-muted mb-1.5 flex items-center gap-1.5">
                    {t('auth.loginId')}
                    <span className="text-[10px] text-zn-error-text/80 font-medium">*</span>
                  </label>
                  <input
                    type="text"
                    value={loginId}
                    onChange={e => setLoginId(e.target.value)}
                    onKeyDown={e => handleKeyDown(e, handleLogin)}
                    className="w-full h-10 px-3.5 text-sm bg-zn-elevated border border-zn-border rounded-zn-input text-zn-text outline-none transition-all placeholder:text-zn-text-faint/50 focus:border-zn-text/30"
                    placeholder={t('auth.loginIdPlaceholder')}
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-xs text-zn-text-muted mb-1.5 flex items-center gap-1.5">
                    {t('auth.password')}
                    <span className="text-[10px] text-zn-error-text/80 font-medium">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      onKeyDown={e => handleKeyDown(e, handleLogin)}
                      className="w-full h-10 px-3.5 pr-10 text-sm bg-zn-elevated border border-zn-border rounded-zn-input text-zn-text outline-none transition-all placeholder:text-zn-text-faint/50 focus:border-zn-text/30"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zn-text-muted hover:text-zn-text transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={e => setRememberMe(e.target.checked)}
                      className="w-3.5 h-3.5 accent-zn-text"
                    />
                    <span className="text-xs text-zn-text-muted">{t('auth.rememberMe')}</span>
                  </label>
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.p
                      role="alert"
                      aria-live="polite"
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="text-[12px] text-zn-error-text flex items-center gap-1.5"
                    >
                      <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                      {error}
                    </motion.p>
                  )}
                </AnimatePresence>

                <button
                  onClick={handleLogin}
                  disabled={loading}
                  className="w-full h-10 text-sm font-medium text-zn-page bg-zn-text hover:opacity-90 disabled:opacity-30 rounded-zn-btn transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 border-2 border-zn-page/30 border-t-zn-page rounded-full animate-spin" />
                      {t('auth.loading')}
                    </span>
                  ) : (
                    t('auth.loginButton')
                  )}
                </button>

                <p className="text-xs text-center text-zn-text-muted">
                  {t('auth.noAccount')}{' '}
                  <button onClick={() => setTab('register')} className="text-zn-text hover:underline">
                    {t('auth.registerHere')}
                  </button>
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="register"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="p-6"
              >
                <div className="flex items-center justify-between mb-5">
                  <div className="flex gap-1.5 flex-1">
                    {(['account', 'personal', 'school', 'professional'] as RegisterStep[]).map(s => (
                      <div
                        key={s}
                        className={`h-0.5 flex-1 rounded-full transition-all duration-500 ${
                          stepIndex[s] <= stepIndex[regStep] ? 'bg-zn-text' : 'bg-zn-border'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-[11px] text-zn-text-muted ml-3 shrink-0">{stepLabels[regStep]}</span>
                </div>

                <AnimatePresence mode="wait">
                  {regStep === 'account' && (
                    <motion.div
                      key="step-account"
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -12 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-3.5"
                    >
                      <div>
                        <label className="block text-xs text-zn-text-muted mb-1.5">
                          {t('auth.loginId')}
                          <span className="text-[10px] text-zn-text-faint ml-1">(avtomatik)</span>
                        </label>
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <div className="w-full h-10 px-3.5 flex items-center text-sm bg-zn-elevated border border-zn-border rounded-zn-input text-zn-text-muted font-mono tracking-wider select-all cursor-pointer" onClick={copyId}>
                              {regIdLoading ? (
                                <span className="h-4 w-4 border-2 border-zn-text-faint/30 border-t-zn-text-muted rounded-full animate-spin" />
                              ) : (
                                regLoginId || '---'
                              )}
                            </div>
                          </div>
                          <button
                            onClick={copyId}
                            className="h-10 w-10 flex items-center justify-center border border-zn-border rounded-zn-input text-zn-text-muted hover:text-zn-text hover:border-zn-text/30 transition-all active:scale-90"
                            title={t('auth.copy')}
                          >
                            {copiedId ? <CheckCheck className="h-4 w-4 text-zn-success-text" /> : <Copy className="h-4 w-4" />}
                          </button>
                          <button
                            onClick={fetchNewId}
                            disabled={regIdLoading}
                            className="h-10 w-10 flex items-center justify-center border border-zn-border rounded-zn-input text-zn-text-muted hover:text-zn-text hover:border-zn-text/30 transition-all active:scale-90 disabled:opacity-40"
                            title={t('auth.newId')}
                          >
                            <RefreshCw className={`h-4 w-4 ${regIdLoading ? 'animate-spin' : ''}`} />
                          </button>
                        </div>
                        {copiedId && <p className="text-[10px] text-zn-success-text mt-1">{t('auth.copied')}</p>}
                      </div>
                      <div>
                        <label className="block text-xs text-zn-text-muted mb-1.5 flex items-center gap-1.5">
                          {t('auth.password')}
                          <span className="text-[10px] text-zn-error-text/80 font-medium">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type={showRegPassword ? 'text' : 'password'}
                            value={regPassword}
                            onChange={e => setRegPassword(e.target.value)}
                            className="w-full h-10 px-3.5 pr-10 text-sm bg-zn-elevated border border-zn-border rounded-zn-input text-zn-text outline-none transition-all placeholder:text-zn-text-faint/50 focus:border-zn-text/30"
                          />
                          <button
                            type="button"
                            onClick={() => setShowRegPassword(!showRegPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zn-text-muted hover:text-zn-text transition-colors"
                            tabIndex={-1}
                          >
                            {showRegPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        {renderPasswordStrength(regPassword)}
                        <p className="text-[10px] text-zn-text-muted mt-1">{t('auth.passwordHint')}</p>
                        {regErrors.password && <p className="text-[11px] text-zn-error-text mt-1">{regErrors.password}</p>}
                      </div>
                      <div>
                        <label className="block text-xs text-zn-text-muted mb-1.5 flex items-center gap-1.5">
                          {t('auth.confirmPassword')}
                          <span className="text-[10px] text-zn-error-text/80 font-medium">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type={showRegConfirm ? 'text' : 'password'}
                            value={regConfirmPassword}
                            onChange={e => setRegConfirmPassword(e.target.value)}
                            className="w-full h-10 px-3.5 pr-10 text-sm bg-zn-elevated border border-zn-border rounded-zn-input text-zn-text outline-none transition-all placeholder:text-zn-text-faint/50 focus:border-zn-text/30"
                          />
                          <button
                            type="button"
                            onClick={() => setShowRegConfirm(!showRegConfirm)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zn-text-muted hover:text-zn-text transition-colors"
                            tabIndex={-1}
                          >
                            {showRegConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        {regConfirmPassword && (
                          <div className="flex items-center gap-1 mt-1">
                            {regPassword === regConfirmPassword ? (
                              <Check className="h-3 w-3 text-zn-success-text" />
                            ) : (
                              <X className="h-3 w-3 text-zn-error-text" />
                            )}
                            <span className={`text-[10px] ${regPassword === regConfirmPassword ? 'text-zn-success-text' : 'text-zn-error-text'}`}>
                              {regPassword === regConfirmPassword ? t('auth.match') : t('auth.noMatch')}
                            </span>
                          </div>
                        )}
                        {regErrors.confirmPassword && <p className="text-[11px] text-zn-error-text mt-1">{regErrors.confirmPassword}</p>}
                      </div>
                    </motion.div>
                  )}

                  {regStep === 'personal' && (
                    <motion.div
                      key="step-personal"
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -12 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-3.5"
                    >
                      <div>
                        <label className="block text-xs text-zn-text-muted mb-1.5 flex items-center gap-1.5">
                          {t('auth.fullName')}
                          <span className="text-[10px] text-zn-error-text/80 font-medium">*</span>
                        </label>
                        <input
                          type="text"
                          value={regFullName}
                          onChange={e => setRegFullName(e.target.value)}
                          className="w-full h-10 px-3.5 text-sm bg-zn-elevated border border-zn-border rounded-zn-input text-zn-text outline-none transition-all placeholder:text-zn-text-faint/50 focus:border-zn-text/30"
                          placeholder={t('auth.fullNamePlaceholder')}
                        />
                        {regErrors.fullName && <p className="text-[11px] text-zn-error-text mt-1">{regErrors.fullName}</p>}
                      </div>
                      <div>
                        <label className="block text-xs text-zn-text-muted mb-1.5">{t('auth.email')}</label>
                        <input
                          type="email"
                          value={regEmail}
                          onChange={e => setRegEmail(e.target.value)}
                          className="w-full h-10 px-3.5 text-sm bg-zn-elevated border border-zn-border rounded-zn-input text-zn-text outline-none transition-all placeholder:text-zn-text-faint/50 focus:border-zn-text/30"
                          placeholder={t('auth.emailPlaceholder')}
                        />
                        {regErrors.email && <p className="text-[11px] text-zn-error-text mt-1">{regErrors.email}</p>}
                      </div>
                      <div className="flex gap-3">
                        <div className="flex-1">
                          <label className="block text-xs text-zn-text-muted mb-1.5">{t('auth.phone')}</label>
                          <input
                            type="tel"
                            value={regPhone}
                            onChange={e => setRegPhone(e.target.value)}
                            className="w-full h-10 px-3.5 text-sm bg-zn-elevated border border-zn-border rounded-zn-input text-zn-text outline-none transition-all placeholder:text-zn-text-faint/50 focus:border-zn-text/30"
                            placeholder={t('auth.phonePlaceholder')}
                          />
                        </div>
                        <div className="w-20">
                          <label className="block text-xs text-zn-text-muted mb-1.5">{t('auth.age')}</label>
                          <input
                            type="number"
                            value={regAge}
                            onChange={e => setRegAge(e.target.value)}
                            min="18"
                            max="80"
                            className="w-full h-10 px-3.5 text-sm bg-zn-elevated border border-zn-border rounded-zn-input text-zn-text outline-none transition-all focus:border-zn-text/30"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-zn-text-muted mb-1.5 flex items-center gap-1.5">
                          {t('auth.position')}
                          <span className="text-[10px] text-zn-error-text/80 font-medium">*</span>
                        </label>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setRegPosition('teacher')}
                            className={`flex-1 h-10 flex items-center justify-center gap-2 text-sm rounded-zn-btn border transition-all active:scale-[0.98] ${
                              regPosition === 'teacher'
                                ? 'bg-zn-elevated border-zn-text/30 text-zn-text'
                                : 'border-zn-border text-zn-text-muted hover:text-zn-text'
                            }`}
                          >
                            <GraduationCap className="h-4 w-4" />
                            {t('auth.positionTeacher')}
                          </button>
                          <button
                            onClick={() => setRegPosition('director')}
                            className={`flex-1 h-10 flex items-center justify-center gap-2 text-sm rounded-zn-btn border transition-all active:scale-[0.98] ${
                              regPosition === 'director'
                                ? 'bg-zn-elevated border-zn-text/30 text-zn-text'
                                : 'border-zn-border text-zn-text-muted hover:text-zn-text'
                            }`}
                          >
                            <Shield className="h-4 w-4" />
                            {t('auth.positionDirector')}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {regStep === 'school' && (
                    <motion.div
                      key="step-school"
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -12 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-3.5"
                    >
                      <div ref={schoolInputRef} className="relative">
                        <label className="block text-xs text-zn-text-muted mb-1.5 flex items-center gap-1.5">
                          {t('auth.school')}
                          <span className="text-[10px] text-zn-error-text/80 font-medium">*</span>
                        </label>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zn-text-muted" />
                          <input
                            type="text"
                            value={schoolNotFound ? regSchoolName : schoolSearch}
                            onChange={e => {
                              if (schoolNotFound) {
                                setRegSchoolName(e.target.value)
                              } else {
                                setSchoolSearch(e.target.value)
                                setRegSchoolId(null)
                                setShowSchoolDropdown(true)
                              }
                            }}
                            onFocus={() => !schoolNotFound && setShowSchoolDropdown(true)}
                            className="w-full h-10 pl-9 pr-9 text-sm bg-zn-elevated border border-zn-border rounded-zn-input text-zn-text outline-none transition-all placeholder:text-zn-text-faint/50 focus:border-zn-text/30"
                            placeholder={t('auth.schoolPlaceholder')}
                          />
                          {!schoolNotFound && (
                            <button
                              type="button"
                              onClick={() => setShowSchoolDropdown(!showSchoolDropdown)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-zn-text-muted"
                              tabIndex={-1}
                            >
                              <ChevronDown className={`h-4 w-4 transition-transform ${showSchoolDropdown ? 'rotate-180' : ''}`} />
                            </button>
                          )}
                        </div>

                        <AnimatePresence>
                          {showSchoolDropdown && !schoolNotFound && (
                            <motion.div
                              role="listbox"
                              aria-label={t('auth.school')}
                              initial={{ opacity: 0, y: -4 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -4 }}
                              className="absolute z-10 left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-zn-surface border border-zn-border rounded-zn-popover shadow-lg"
                            >
                              {schoolsLoading ? (
                                <div className="p-3 text-xs text-zn-text-muted text-center">Yuklanmoqda...</div>
                              ) : filteredSchools.length === 0 ? (
                                <div className="p-3 text-xs text-zn-text-muted text-center">
                                  {t('auth.schoolNotFound')}
                                </div>
                              ) : (
                                filteredSchools.map(s => (
                                  <button
                                    key={s.id}
                                    role="option"
                                    aria-selected={regSchoolId === s.id}
                                    onClick={() => {
                                      setRegSchoolId(s.id)
                                      setSchoolSearch(s.name)
                                      setShowSchoolDropdown(false)
                                    }}
                                    className={`w-full px-3.5 py-2.5 text-xs text-left hover:bg-zn-elevated transition-colors flex items-center gap-2.5 ${
                                      regSchoolId === s.id ? 'text-zn-text bg-zn-elevated' : 'text-zn-text-muted'
                                    }`}
                                  >
                                    <Building2 className="h-3.5 w-3.5 flex-shrink-0" />
                                    <div>
                                      <p className="text-zn-text">{s.name}</p>
                                      {s.address && <p className="text-[10px] text-zn-text-muted">{s.address}</p>}
                                    </div>
                                  </button>
                                ))
                              )}
                              <button
                                role="option"
                                onClick={() => { setSchoolNotFound(true); setShowSchoolDropdown(false); setRegSchoolId(null); setSchoolSearch('') }}
                                className="w-full px-3.5 py-2.5 text-xs text-left text-zn-text hover:bg-zn-elevated transition-colors border-t border-zn-border"
                              >
                                + {t('auth.schoolNotFound')}
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {schoolNotFound && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mt-2"
                          >
                            <textarea
                              value={regSchoolAddress}
                              onChange={e => setRegSchoolAddress(e.target.value)}
                              className="w-full h-16 px-3.5 py-2 text-sm bg-zn-elevated border border-zn-border rounded-zn-input text-zn-text outline-none transition-all placeholder:text-zn-text-faint/50 focus:border-zn-text/30 resize-none"
                              placeholder={t('auth.schoolAddressPlaceholder')}
                            />
                            <button
                              onClick={() => { setSchoolNotFound(false); setRegSchoolName(''); setRegSchoolAddress('') }}
                              className="text-[11px] text-zn-text-muted hover:text-zn-text mt-1"
                            >
                              ← {t('auth.selectSchool')}
                            </button>
                          </motion.div>
                        )}
                        {regErrors.school && <p className="text-[11px] text-zn-error-text mt-1">{regErrors.school}</p>}
                      </div>
                    </motion.div>
                  )}

                  {regStep === 'professional' && (
                    <motion.div
                      key="step-professional"
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -12 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-4"
                    >
                      {regPosition === 'teacher' && (
                        <div>
                          <label className="block text-xs text-zn-text-muted mb-1.5 flex items-center gap-1.5">
                            {t('auth.subject')}
                            <span className="text-[10px] text-zn-error-text/80 font-medium">*</span>
                          </label>
                          <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto pr-1">
                            {SUBJECTS.map(s => (
                              <button
                                key={s}
                                onClick={() => setRegSubject(s)}
                                className={`px-3 py-2 text-xs rounded-zn-btn border text-left transition-all active:scale-[0.98] ${
                                  regSubject === s
                                    ? 'bg-zn-elevated border-zn-text/30 text-zn-text'
                                    : 'border-zn-border text-zn-text-muted hover:text-zn-text hover:border-zn-text/20'
                                }`}
                              >
                                {s}
                              </button>
                            ))}
                          </div>
                          {regErrors.subject && <p className="text-[11px] text-zn-error-text mt-1">{regErrors.subject}</p>}
                        </div>
                      )}
                      {regPosition === 'director' && (
                        <div className="py-8 flex flex-col items-center gap-3 text-center">
                          <Building2 className="h-10 w-10 text-zn-text-faint/40" strokeWidth={1} />
                          <p className="text-sm text-zn-text-muted">
                            {t('auth.registerAsDirector')}
                          </p>
                        </div>
                      )}

                      <AnimatePresence>
                        {error && (
                          <motion.p
                            role="alert"
                            aria-live="polite"
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            className="text-[12px] text-zn-error-text flex items-center gap-1.5"
                          >
                            <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                            {error}
                          </motion.p>
                        )}
                      </AnimatePresence>

                      <button
                        onClick={handleRegister}
                        disabled={loading}
                        className="w-full h-10 text-sm font-medium text-zn-page bg-zn-text hover:opacity-90 disabled:opacity-30 rounded-zn-btn transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <span className="flex items-center gap-2">
                            <span className="h-4 w-4 border-2 border-zn-page/30 border-t-zn-page rounded-full animate-spin" />
                            {t('auth.loading')}
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            {t('auth.registerButton')}
                          </span>
                        )}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-zn-border">
                  <div>
                    {regStep !== 'account' ? (
                      <button onClick={prevStep} className="text-xs text-zn-text-muted hover:text-zn-text transition-colors">
                        ← {t('common.back')}
                      </button>
                    ) : (
                      <p className="text-xs text-zn-text-muted">
                        {t('auth.hasAccount')}{' '}
                        <button onClick={() => setTab('login')} className="text-zn-text hover:underline">
                          {t('auth.loginHere')}
                        </button>
                      </p>
                    )}
                  </div>
                  {regStep !== 'professional' && (
                    <button
                      onClick={nextStep}
                      disabled={!canAdvance()}
                      className="px-4 py-1.5 text-xs font-medium text-zn-page bg-zn-text/80 hover:bg-zn-text disabled:opacity-30 rounded-zn-btn transition-all active:scale-[0.98]"
                    >
                      {t('common.next')}
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <p className="text-center mt-6 text-[11px] text-zn-text-muted select-none">
          {t('auth.tagline')}
        </p>
      </motion.div>
    </div>
  )
}
