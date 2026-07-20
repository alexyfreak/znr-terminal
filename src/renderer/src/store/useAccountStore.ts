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
  userId: string
  userName: string
  schoolName: string
  schoolId: string
  role: string
  avatar: string
  email: string
  phone: string
  subject: string
  classes: ClassInfo[]
  director: DirectorInfo | null
  teachers: { id: string; full_name: string }[]
  subjects: string[]
  login: (data: {
    userName: string
    schoolName: string
    role: string
    userId?: string
    schoolId?: string
    email?: string
    phone?: string
    subject?: string
    avatar?: string
  }) => void
  logout: () => void
  updateProfile: (data: Partial<Pick<AccountState, 'userName' | 'schoolName' | 'role' | 'avatar' | 'email' | 'phone' | 'subject'>>) => void
  setContext: (data: { classes: ClassInfo[]; director: DirectorInfo | null }) => void
  setTeachers: (teachers: { id: string; full_name: string }[]) => void
  setSubjects: (subjects: string[]) => void
}

export const useAccountStore = create<AccountState>()(
  persist(
    (set) => ({
      isLoggedIn: false,
      userId: '',
      userName: '',
      schoolName: '',
      schoolId: '',
      role: '',
      avatar: '',
      email: '',
      phone: '',
      subject: '',
      classes: [],
      director: null,
      teachers: [],
      subjects: [],
      login: ({ userName, schoolName, role, userId = '', schoolId = '', email = '', phone = '', subject = '', avatar = '' }) =>
        set({ isLoggedIn: true, userName, schoolName, role, userId, schoolId, email, phone, subject, avatar }),
      logout: () =>
        set({ isLoggedIn: false, userId: '', userName: '', schoolName: '', schoolId: '', role: '', avatar: '', email: '', phone: '', subject: '', classes: [], director: null, teachers: [], subjects: [] }),
      updateProfile: (data) => set((s) => ({ ...s, ...data })),
      setContext: (data) => set((s) => ({ ...s, classes: data.classes, director: data.director })),
      setTeachers: (teachers) => set({ teachers }),
      setSubjects: (subjects) => set({ subjects }),
    }),
    {
      name: 'zunoora-account',
      storage: createJSONStorage(() => localStorage),
    },
  ),
)
