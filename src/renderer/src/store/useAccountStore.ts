import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface AccountState {
  isLoggedIn: boolean
  userName: string
  schoolName: string
  role: string
  avatar: string
  login: (userName: string, schoolName: string, role: string, avatar?: string) => void
  logout: () => void
  updateProfile: (data: Partial<Pick<AccountState, 'userName' | 'schoolName' | 'role' | 'avatar'>>) => void
}

export const useAccountStore = create<AccountState>()(
  persist(
    (set) => ({
      isLoggedIn: false,
      userName: '',
      schoolName: '',
      role: '',
      avatar: '',
      login: (userName, schoolName, role, avatar = '') =>
        set({ isLoggedIn: true, userName, schoolName, role, avatar }),
      logout: () =>
        set({ isLoggedIn: false, userName: '', schoolName: '', role: '', avatar: '' }),
      updateProfile: (data) => set((s) => ({ ...s, ...data })),
    }),
    {
      name: 'zunoora-account',
      storage: createJSONStorage(() => localStorage),
    },
  ),
)
