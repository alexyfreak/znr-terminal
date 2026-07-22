import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useTelegram } from '@/hooks/useTelegram'
import type { Role } from '@/hooks/types'
import { ClipboardList, UserCheck, User } from 'lucide-react'
import Button from '@/components/ui/Button'

const roles: { value: Role; label: string; icon: typeof User }[] = [
  { value: 'parent', label: 'Parent', icon: User },
  { value: 'sinf_rahbar', label: 'Sinf Rahbar', icon: UserCheck },
]

export default function Auth() {
  const { login, isLoading } = useAuth()
  const { user: tgUser, haptic } = useTelegram()
  const [selectedRole, setSelectedRole] = useState<Role>('parent')

  const handleLogin = async () => {
    haptic('heavy')
    const id = tgUser?.id || 1000001
    await login(id, selectedRole)
  }

  return (
    <div className="safe-top safe-x flex min-h-dvh flex-col items-center justify-center bg-zn-page px-6">
      <div className="mb-10 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-zn-card bg-zn-surface">
          <ClipboardList size={32} className="text-zn-text" />
        </div>
        <h1 className="font-sans text-2xl font-bold text-zn-text">Zunoora</h1>
        <p className="mt-1 text-sm text-zn-text-muted">School Document Assistant</p>
      </div>

      <div className="mb-8 w-full max-w-xs">
        <p className="mb-3 text-center text-xs font-medium uppercase tracking-wider text-zn-text-faint">
          Login as
        </p>
        <div className="flex gap-3">
          {roles.map((r) => {
            const Icon = r.icon
            const isActive = selectedRole === r.value
            return (
              <button
                key={r.value}
                onClick={() => {
                  setSelectedRole(r.value)
                  haptic('light')
                }}
                className={`flex flex-1 flex-col items-center gap-2 rounded-zn-btn border-2 px-4 py-5 transition ${
                  isActive
                    ? 'border-zn-text bg-zn-surface'
                    : 'border-transparent bg-zn-elevated'
                }`}
              >
                <Icon
                  size={28}
                  className={isActive ? 'text-zn-text' : 'text-zn-text-muted'}
                />
                <span
                  className={`text-xs font-semibold ${isActive ? 'text-zn-text' : 'text-zn-text-muted'}`}
                >
                  {r.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <Button fullWidth disabled={isLoading} onClick={handleLogin}>
        {isLoading ? 'Connecting...' : 'Continue via Telegram'}
      </Button>

      {tgUser && (
        <p className="mt-4 text-xs text-zn-text-faint">
          Telegram: {tgUser.first_name} {tgUser.last_name || ''}
        </p>
      )}
    </div>
  )
}
