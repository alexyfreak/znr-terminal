import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface SidebarState {
  isExpanded: boolean
  isAnimating: boolean
  toggle: () => void
  setExpanded: (expanded: boolean) => void
  setAnimating: (animating: boolean) => void
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      isExpanded: false,
      isAnimating: false,
      toggle: () => set((s) => ({ isExpanded: !s.isExpanded })),
      setExpanded: (expanded) => set({ isExpanded: expanded }),
      setAnimating: (animating) => set({ isAnimating: animating }),
    }),
    {
      name: 'zunoora-sidebar',
      storage: createJSONStorage(() => localStorage),
    },
  ),
)
