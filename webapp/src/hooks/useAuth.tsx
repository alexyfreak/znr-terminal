import { useState, useCallback, createContext, useContext, type ReactNode } from 'react'
import { requireSupabase } from './useSupabase'
import type { User, Child, Profile, LoginResponse } from './types'

interface AuthState {
  user: User | null
  availableProfiles: Profile[]
  activeProfile: Profile | null
  isLoading: boolean
  error: string | null
}

interface AuthContextType extends AuthState {
  login: (userId: string, password: string) => Promise<void>
  logout: () => void
  setProfile: (profile: Profile) => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    availableProfiles: [],
    activeProfile: null,
    isLoading: false,
    error: null,
  })

  const login = useCallback(async (userId: string, password: string) => {
    setState({ user: null, availableProfiles: [], activeProfile: null, isLoading: true, error: null })
    try {
      if (!userId || userId.trim().length === 0) {
        throw new Error('Login ID cannot be empty')
      }
      if (!password || password.length < 1) {
        throw new Error('Password cannot be empty')
      }
      if (password.length > 128) {
        throw new Error('Password is too long')
      }
      const sb = requireSupabase()
      const { data, error } = await sb.rpc('login_user', {
        p_user_id: userId.trim().toUpperCase(),
        p_password: password,
      })

      if (error) throw error

      const result = data as LoginResponse

      if (!result.success) {
        setState({ user: null, availableProfiles: [], activeProfile: null, isLoading: false, error: result.error || 'Login failed' })
        return
      }

      const profiles = (result.available_profiles || [result.user!.role]) as Profile[]

      const user: User = {
        user_id: result.user!.user_id,
        role: result.user!.role,
        full_name: result.user!.full_name,
        phone: result.user!.phone,
        children: result.children as Child[],
      }

      setState({ user, availableProfiles: profiles, activeProfile: profiles[0], isLoading: false, error: null })
    } catch (err) {
      setState({ user: null, availableProfiles: [], activeProfile: null, isLoading: false, error: err instanceof Error ? err.message : 'Login failed' })
    }
  }, [])

  const logout = useCallback(() => {
    setState({ user: null, availableProfiles: [], activeProfile: null, isLoading: false, error: null })
  }, [])

  const setProfile = useCallback((profile: Profile) => {
    setState((prev) => ({ ...prev, activeProfile: profile }))
  }, [])

  return (
    <AuthContext.Provider value={{ ...state, login, logout, setProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
