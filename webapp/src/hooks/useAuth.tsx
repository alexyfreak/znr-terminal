import { useState, useCallback, createContext, useContext, type ReactNode } from 'react'
import { requireSupabase } from './useSupabase'
import type { User, Child, LoginResponse } from './types'

interface AuthState {
  user: User | null
  isLoading: boolean
  error: string | null
}

interface AuthContextType extends AuthState {
  login: (userId: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: false,
    error: null,
  })

  const login = useCallback(async (userId: string, password: string) => {
    setState({ user: null, isLoading: true, error: null })
    try {
      const sb = requireSupabase()
      const { data, error } = await sb.rpc('login_user', {
        p_user_id: userId.trim().toUpperCase(),
        p_password: password,
      })

      if (error) throw error

      const result = data as LoginResponse

      if (!result.success) {
        setState({ user: null, isLoading: false, error: result.error || 'Login failed' })
        return
      }

      const user: User = {
        user_id: result.user!.user_id,
        role: result.user!.role,
        full_name: result.user!.full_name,
        phone: result.user!.phone,
        children: result.children as Child[],
      }

      setState({ user, isLoading: false, error: null })
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
