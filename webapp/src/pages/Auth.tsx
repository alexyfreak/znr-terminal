import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { ClipboardCheck, LogIn, Eye, EyeOff, User, Lock } from 'lucide-react'

const testAccounts = [
  { id: 'PRT00001', pw: 'parent123', label: 'Ota-ona' },
  { id: 'STCH00001', pw: 'sinf123', label: 'Sinf rahbar' },
  { id: 'TCH00001', pw: 'tch123', label: "O'qituvchi" },
  { id: 'DRK00001', pw: 'dir123', label: 'Direktor' },
]

export default function Auth() {
  const { login, isLoading, error } = useAuth()
  const [userId, setUserId] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showHints, setShowHints] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId.trim() || !password.trim()) return
    await login(userId.trim(), password)
  }

  const quickFill = (id: string, pw: string) => {
    setUserId(id)
    setPassword(pw)
  }

  return (
    <div className="flex min-h-dvh flex-col bg-zn-page">
      <div className="flex flex-1 flex-col items-center justify-center px-6 pb-8">
        <div className="animate-scaleIn mb-10 text-center">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl gradient-accent shadow-lg shadow-blue-500/20">
            <ClipboardCheck size={40} className="text-white" />
          </div>
          <h1 className="font-sans text-3xl font-bold tracking-tight text-zn-text">Zunoora</h1>
          <p className="mt-1.5 text-sm text-zn-text-muted">Maktab hujjat aylanish tizimi</p>
        </div>

        <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4 animate-slideUp">
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-zn-text-muted">
              <User size={12} />
              ID
            </label>
            <div className="relative">
              <input
                value={userId}
                onChange={(e) => setUserId(e.target.value.toUpperCase())}
                placeholder="PRT00001"
                autoCapitalize="characters"
                autoFocus
                className="w-full rounded-2xl border border-white/8 bg-white/4 px-4 py-3.5 pl-11 text-sm text-zn-text placeholder-zn-text-faint outline-none transition-all duration-200 focus:border-white/20 focus:bg-white/6"
              />
              <User size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zn-text-faint" />
            </div>
          </div>

          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-zn-text-muted">
              <Lock size={12} />
              Parol
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                className="w-full rounded-2xl border border-white/8 bg-white/4 px-4 py-3.5 pl-11 pr-11 text-sm text-zn-text placeholder-zn-text-faint outline-none transition-all duration-200 focus:border-white/20 focus:bg-white/6"
              />
              <Lock size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zn-text-faint" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zn-text-faint transition-colors hover:text-zn-text-muted"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="animate-slideDown rounded-2xl bg-zn-error-bg/80 px-4 py-3 text-xs text-zn-error-text">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !userId.trim() || !password.trim()}
            className="gradient-accent flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition-all duration-200 hover:brightness-110 disabled:opacity-40"
          >
            {isLoading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              <>
                <LogIn size={18} />
                Kirish
              </>
            )}
          </button>
        </form>

        <div className="mt-8 w-full max-w-sm animate-fadeIn animate-delay-300">
          <button
            onClick={() => setShowHints(!showHints)}
            className="flex w-full items-center justify-center gap-1.5 rounded-2xl bg-white/4 px-4 py-2.5 text-xs font-medium text-zn-text-faint transition-colors hover:bg-white/6 hover:text-zn-text-muted"
          >
            Test hisoblari
          </button>

          {showHints && (
            <div className="animate-slideDown mt-2 space-y-1.5">
              {testAccounts.map((acc) => (
                <button
                  key={acc.id}
                  onClick={() => quickFill(acc.id, acc.pw)}
                  className="flex w-full items-center justify-between rounded-xl border border-white/6 bg-white/4 px-4 py-2.5 text-left transition-colors hover:bg-white/8"
                >
                  <div>
                    <span className="text-xs font-medium text-zn-text">{acc.id}</span>
                    <span className="ml-2 text-[11px] text-zn-text-faint">{acc.label}</span>
                  </div>
                  <span className="text-[11px] text-zn-text-muted">Kiritish</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <p className="pb-6 text-center text-[11px] text-zn-text-faint">Zunoora v1.0</p>
    </div>
  )
}
