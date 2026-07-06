import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface HistoryItem {
  id: string
  title: string
  type: string
  date: string
  docCount: number
  fieldValues?: Record<string, string>
  exportPath?: string
  shablonType?: string
  rendered?: string
  templateLabel?: string
}

type SortOrder = 'newest' | 'oldest'

interface HistoryState {
  items: HistoryItem[]
  sortOrder: SortOrder
  activeId: string | null
  addItem: (item: HistoryItem) => void
  removeItem: (id: string) => void
  setItems: (items: HistoryItem[]) => void
  setSortOrder: (order: SortOrder) => void
  setActiveId: (id: string | null) => void
  clear: () => void
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set) => ({
      items: [],
      sortOrder: 'newest',
      activeId: null,
      addItem: (item) => set((s) => ({ items: [item, ...s.items.filter(i => i.id !== item.id)] })),
      removeItem: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
      setItems: (items) => set({ items }),
      setSortOrder: (sortOrder) => set({ sortOrder }),
      setActiveId: (id) => set({ activeId: id }),
      clear: () => set({ items: [], activeId: null }),
    }),
    {
      name: 'zunoora-history',
      storage: createJSONStorage(() => localStorage),
    },
  ),
)
