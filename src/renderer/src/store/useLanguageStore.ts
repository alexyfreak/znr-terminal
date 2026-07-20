import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type Language = 'uz' | 'ru' | 'en'

interface LanguageState {
  language: Language
  setLanguage: (language: Language) => void
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: 'uz',
      setLanguage: (language) => set({ language }),
    }),
    {
      name: 'zunoora-language',
      storage: createJSONStorage(() => localStorage),
    },
  ),
)
