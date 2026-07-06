import { create } from 'zustand'

export interface ShablonField {
  key: string
  label: string
  type: 'text' | 'textarea' | 'date' | 'number' | 'percent' | 'select'
    | 'multi-select' | 'teacher_select' | 'class_select' | 'subject_select'
    | 'director_select' | 'signature'
  required: boolean
  defaultValue?: string
  options?: { value: string; label: string }[]
  placeholder?: string
  validation?: {
    min?: number
    max?: number
    pattern?: string
    message?: string
  }
  autoFill?: string
}

export interface ShablonStep {
  header: string
  fields: string[]
}

export interface Shablon {
  id: string
  type: string
  label: string
  description: string | null
  keywords: string[]
  teacher_visible: boolean
  schema: { required: string[]; optional: string[] }
  template: string
  fields?: ShablonField[]
  steps?: ShablonStep[]
  category?: string | null
  author_id?: string | null
  published?: boolean
  version?: number
  created_at?: string
  updated_at?: string
}

type BuilderTab = 'library' | 'marketplace' | 'builder'

type WizardStep = 0 | 1 | 2 | 3

interface ShablonBuilderState {
  isOpen: boolean
  activeTab: BuilderTab
  wizardStep: WizardStep
  draft: Partial<Shablon>
  installed: Shablon[]
  favorites: string[]
  marketplace: Shablon[]
  loading: boolean
  saving: boolean

  open: () => void
  close: () => void
  setTab: (tab: BuilderTab) => void
  setWizardStep: (step: WizardStep) => void
  updateDraft: (patch: Partial<Shablon>) => void
  resetDraft: () => void
  fetchInstalled: () => Promise<void>
  fetchMarketplace: () => Promise<void>
  searchMarketplace: (query: string) => Promise<void>
  saveDraft: () => Promise<void>
  loadDraft: () => Promise<void>
  createShablon: () => Promise<Shablon | null>
  updateExistingShablon: () => Promise<Shablon | null>
  saveShablon: () => Promise<Shablon | null>
  installShablon: (id: string) => Promise<boolean>
  uninstallShablon: (id: string) => Promise<boolean>
  publishShablon: (id: string, publish: boolean) => Promise<boolean>
  deleteShablon: (id: string) => Promise<boolean>
}

const DEFAULT_DRAFT: Partial<Shablon> = {
  type: '',
  label: '',
  description: '',
  keywords: [],
  teacher_visible: true,
  schema: { required: [], optional: [] },
  template: '',
  fields: [],
  steps: [],
  category: null,
  published: false,
}

export const useShablonBuilderStore = create<ShablonBuilderState>()((set, get) => ({
  isOpen: false,
  activeTab: 'library',
  wizardStep: 0,
  draft: { ...DEFAULT_DRAFT },
  installed: [],
  favorites: [],
  marketplace: [],
  loading: false,
  saving: false,

  open: () => set({ isOpen: true, activeTab: 'library' }),
  close: () => set({ isOpen: false }),
  setTab: (tab) => set({ activeTab: tab }),
  setWizardStep: (step) => set({ wizardStep: step }),
  updateDraft: (patch) => set((s) => ({ draft: { ...s.draft, ...patch } })),
  resetDraft: () => set({ draft: { ...DEFAULT_DRAFT }, wizardStep: 0 }),

  fetchInstalled: async () => {
    set({ loading: true })
    try {
      if (window.electronAPI?.listInstalledShablons) {
        const res = await window.electronAPI.listInstalledShablons()
        if (res.success && res.data) {
          set({ installed: res.data as Shablon[] })
        }
      }
    } finally {
      set({ loading: false })
    }
  },

  fetchMarketplace: async () => {
    set({ loading: true })
    try {
      if (window.electronAPI?.listMarketplaceShablons) {
        const res = await window.electronAPI.listMarketplaceShablons()
        if (res.success && res.data) {
          set({ marketplace: res.data as Shablon[] })
        }
      }
    } finally {
      set({ loading: false })
    }
  },

  searchMarketplace: async (query: string) => {
    if (!query.trim()) {
      get().fetchMarketplace()
      return
    }
    set({ loading: true })
    try {
      if (window.electronAPI?.searchMarketplaceShablons) {
        const res = await window.electronAPI.searchMarketplaceShablons(query)
        if (res.success && res.data) {
          set({ marketplace: res.data as Shablon[] })
        }
      }
    } finally {
      set({ loading: false })
    }
  },

  saveDraft: async () => {
    try {
      if (window.electronAPI?.setStoreValue) {
        await window.electronAPI.setStoreValue('shablon-builder-draft', get().draft)
      }
    } catch { /* ignore */ }
  },

  loadDraft: async () => {
    try {
      if (window.electronAPI?.getStoreValue) {
        const stored = await window.electronAPI.getStoreValue('shablon-builder-draft')
        if (stored && typeof stored === 'object') {
          set({ draft: stored as Partial<Shablon> })
        }
      }
    } catch { /* ignore */ }
  },

  createShablon: async () => {
    const { draft } = get()
    console.log('[createShablon] Starting with draft:', draft)
    if (!draft.type || !draft.label) {
      console.error('[createShablon] Missing required fields:', { type: draft.type, label: draft.label })
      return null
    }
    set({ saving: true })
    try {
      if (window.electronAPI?.createShablon) {
        console.log('[createShablon] Calling electronAPI.createShablon...')
        const res = await window.electronAPI.createShablon(draft)
        console.log('[createShablon] Response:', res)
        if (res.success && res.data) {
          set({ draft: { ...DEFAULT_DRAFT }, wizardStep: 0 })
          get().fetchInstalled()
          return res.data as Shablon
        } else {
          console.error('[createShablon] API returned error:', res.error)
        }
      } else {
        console.error('[createShablon] electronAPI.createShablon not available')
      }
      return null
    } catch (err) {
      console.error('[createShablon] Exception:', err)
      return null
    } finally {
      set({ saving: false })
    }
  },

  updateExistingShablon: async () => {
    const { draft } = get()
    if (!draft.id || !draft.type || !draft.label) return null
    set({ saving: true })
    try {
      if (window.electronAPI?.updateShablon) {
        const res = await window.electronAPI.updateShablon(draft.id, draft)
        if (res.success && res.data) {
          set({ draft: { ...DEFAULT_DRAFT }, wizardStep: 0 })
          get().fetchInstalled()
          return res.data as Shablon
        }
      }
      return null
    } finally {
      set({ saving: false })
    }
  },

  saveShablon: async () => {
    const { draft } = get()
    if (draft.id) {
      return get().updateExistingShablon()
    }
    return get().createShablon()
  },

  installShablon: async (shablonId: string) => {
    if (window.electronAPI?.installShablon) {
      const res = await window.electronAPI.installShablon(shablonId)
      if (res.success) {
        await get().fetchInstalled()
        return true
      }
    }
    return false
  },

  uninstallShablon: async (shablonId: string) => {
    if (window.electronAPI?.uninstallShablon) {
      const res = await window.electronAPI.uninstallShablon(shablonId)
      if (res.success) {
        await get().fetchInstalled()
        return true
      }
    }
    return false
  },

  publishShablon: async (id: string, publish: boolean) => {
    if (window.electronAPI?.publishShablon) {
      const res = await window.electronAPI.publishShablon(id, publish)
      if (res.success) {
        await get().fetchInstalled()
        if (publish) await get().fetchMarketplace()
        return true
      }
    }
    return false
  },

  deleteShablon: async (id: string) => {
    if (window.electronAPI?.deleteShablon) {
      const res = await window.electronAPI.deleteShablon(id)
      if (res.success) {
        await get().fetchInstalled()
        return true
      }
    }
    return false
  },
}))
