import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { ClipboardList, LogIn, Eye, EyeOff } from 'lucide-react'
import Button from '@/components/ui/Button'

export default function Auth() {
  const { login, isLoading, error } = useAuth()
  const [userId, setUserId] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId.trim() || !password.trim()) return
    await login(userId.trim(), password)
  }

  return (
    <div className="safe-top safe-x flex min-h-dvh flex-col items-center justify-center bg-zn-page px-6">
      <div className="mb-10 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-zn-card bg-zn-surface">
          <ClipboardList size={32} className="text-zn-text" />
        </div>
        <h1 className="font-sans text-2xl font-bold text-zn-text">Zunoora</h1>
        <p className="mt-1 text-sm text-zn-text-muted">Maktab hujjat aylanish tizimi</p>
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-xs space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-zn-text-muted">ID</label>
          <input
            value={userId}
            onChange={(e) => setUserId(e.target.value.toUpperCase())}
            placeholder="PRT00001 / STCH00001"
            autoCapitalize="characters"
            autoFocus
            className="w-full rounded-zn-input bg-zn-elevated px-4 py-3 text-sm text-zn-text placeholder-zn-text-faint outline-none"
          />
        </div>

        <div className="relative">
          <label className="mb-1.5 block text-xs font-medium text-zn-text-muted">Parol</label>
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••"
            className="w-full rounded-zn-input bg-zn-elevated px-4 py-3 pr-10 text-sm text-zn-text placeholder-zn-text-faint outline-none"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-[34px] text-zn-text-faint"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {error && (
          <p className="rounded-zn-input bg-zn-error-bg px-3 py-2 text-xs text-zn-error-text">
            {error}
          </p>
        )}

        <Button type="submit" fullWidth disabled={isLoading || !userId.trim() || !password.trim()}>
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black" />
              Kirish...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <LogIn size={18} />
              Kirish
            </span>
          )}
        </Button>
      </form>

      <div className="mt-8 w-full max-w-xs">
        <p className="mb-2 text-center text-xs font-medium text-zn-text-faint">Test hisoblari</p>
        <div className="space-y-1 text-[11px] text-zn-text-faint">
          <p>PRT00001 - parent123 (Ota-ona)</p>
          <p>STCH00001 - sinf123 (Sinf rahbar)</p>
          <p>TCH00001 - tch123 (O'qituvchi)</p>
          <p>DRK00001 - dir123 (Direktor)</p>
          <p>SCH00001 - school123 (Maktab)</p>
          <p>PPL000001 - pupil123 (O'quvchi)</p>
        </div>
      </div>
    </div>
  )
}
