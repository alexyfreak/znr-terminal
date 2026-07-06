import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface ClassInfo {
  id: string
  name: string
  school_id: string | null
  form_teacher_id: string | null
  academic_year: string | null
}

interface DirectorInfo {
  id: string
  full_name: string
  position: string | null
}

interface AccountState {
  isLoggedIn: boolean
  userName: string
  schoolName: string
  role: string
  avatar: string
  classes: ClassInfo[]
  director: DirectorInfo | null
  teachers: { id: string; full_name: string }[]
  login: (userName: string, schoolName: string, role: string, avatar?: string) => void
  logout: () => void
  updateProfile: (data: Partial<Pick<AccountState, 'userName' | 'schoolName' | 'role' | 'avatar'>>) => void
  setContext: (data: { classes: ClassInfo[]; director: DirectorInfo | null }) => void
  setTeachers: (teachers: { id: string; full_name: string }[]) => void
}

export const useAccountStore = create<AccountState>()(
  persist(
    (set) => ({
      isLoggedIn: false,
      userName: '',
      schoolName: '',
      role: '',
      avatar: '',
      classes: [],
      director: null,
      teachers: [],
      login: (userName, schoolName, role, avatar = '') =>
        set({ isLoggedIn: true, userName, schoolName, role, avatar }),
      logout: () =>
        set({ isLoggedIn: false, userName: '', schoolName: '', role: '', avatar: '', classes: [], director: null, teachers: [] }),
      updateProfile: (data) => set((s) => ({ ...s, ...data })),
      setContext: (data) => set((s) => ({ ...s, classes: data.classes, director: data.director })),
      setTeachers: (teachers) => set({ teachers }),
    }),
    {
      name: 'zunoora-account',
      storage: createJSONStorage(() => localStorage),
    },
  ),
)
