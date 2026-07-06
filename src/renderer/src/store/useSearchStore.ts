import { create } from 'zustand'

interface SearchState {
  query: string
  isFocused: boolean
  isDocked: boolean
  results: string[]
  setQuery: (query: string) => void
  setFocused: (focused: boolean) => void
  setDocked: (docked: boolean) => void
  setResults: (results: string[]) => void
  clear: () => void
}

export const useSearchStore = create<SearchState>()((set) => ({
  query: '',
  isFocused: false,
  isDocked: false,
  results: [],
  setQuery: (query) => set({ query }),
  setFocused: (isFocused) => set({ isFocused }),
  setDocked: (isDocked) => set({ isDocked }),
  setResults: (results) => set({ results }),
  clear: () => set({ query: '', results: [], isFocused: false }),
}))
