import { useState, useCallback, createContext, useContext, type ReactNode } from 'react'
import { getSupabase } from './useSupabase'
import type { User } from './types'

export type { Role } from './types'

interface AuthState {
  user: User | null
  isLoading: boolean
  error: string | null
}

interface AuthContextType extends AuthState {
  login: (telegramId: number, role: User['role']) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: false,
    error: null,
  })

  const login = useCallback(async (telegramId: number, role: User['role']) => {
    setState({ user: null, isLoading: true, error: null })
    try {
      const sb = getSupabase()

      if (!sb) {
        const mockUser: User = {
          id: crypto.randomUUID(),
          telegram_id: telegramId,
          full_name: telegramId === 2000001 ? 'Dilorom Salimova' : 'Aliya Karimova',
          phone: '+998901234567',
          role,
          avatar_url: null,
          created_at: new Date().toISOString(),
        }
        await new Promise((r) => setTimeout(r, 400))
        setState({ user: mockUser, isLoading: false, error: null })
        return
      }

      const { data, error } = await sb
        .from('users')
        .select('*')
        .eq('telegram_id', telegramId)
        .maybeSingle()

      if (error) throw error

      if (data) {
        setState({ user: data as User, isLoading: false, error: null })
      } else {
        const name = telegramId === 2000001 ? 'Dilorom Salimova' : 'Aliya Karimova'
        const phone = '+998901234567'
        const { data: created, error: createErr } = await sb
          .from('users')
          .insert({ telegram_id: telegramId, full_name: name, phone, role })
          .select()
          .single()
        if (createErr) throw createErr
        setState({ user: created as User, isLoading: false, error: null })
      }
    } catch (err) {
      setState({ user: null, isLoading: false, error: err instanceof Error ? err.message : 'Login failed' })
    }
  }, [])

  const logout = useCallback(() => {
    setState({ user: null, isLoading: false, error: null })
  }, [])

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
