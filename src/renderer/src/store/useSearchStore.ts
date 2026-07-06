import { create } from 'zustand'

interface SearchState {
  query: string
  isFocused: boolean
  isDocked: boolean
  results: string[]
  recentSuggestions: string[]
  setQuery: (query: string) => void
  setFocused: (focused: boolean) => void
  setDocked: (docked: boolean) => void
  setResults: (results: string[]) => void
  clear: () => void
}

const defaultSuggestions = [
  'Yillik Taqvim-Mavzu Reja',
  'Dars Ishlanmasi',
  'Ochiq Dars Konspekti',
  'Sinflar Kesimida Hisobot',
  'O\'quvchilar Ro\'yxati',
]

export const useSearchStore = create<SearchState>()((set) => ({
  query: '',
  isFocused: false,
  isDocked: false,
  results: [],
  recentSuggestions: defaultSuggestions,
  setQuery: (query) => set({ query }),
  setFocused: (isFocused) => set({ isFocused }),
  setDocked: (isDocked) => set({ isDocked }),
  setResults: (results) => set({ results }),
  clear: () => set({ query: '', results: [], isFocused: false }),
}))
