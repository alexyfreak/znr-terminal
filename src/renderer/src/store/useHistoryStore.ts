import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface HistoryItem {
  id: string
  title: string
  type: string
  date: string
  docCount: number
}

interface HistoryState {
  items: HistoryItem[]
  addItem: (item: HistoryItem) => void
  removeItem: (id: string) => void
  setItems: (items: HistoryItem[]) => void
  clear: () => void
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) => set((s) => ({ items: [item, ...s.items] })),
      removeItem: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
      setItems: (items) => set({ items }),
      clear: () => set({ items: [] }),
    }),
    {
      name: 'zunoora-history',
      storage: createJSONStorage(() => localStorage),
    },
  ),
)
