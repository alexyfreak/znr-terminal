import { create } from 'zustand'

interface BugReportState {
  isOpen: boolean
  mode: 'manual' | 'auto'
  error: Error | null
  stackTrace: string
  description: string
  submitting: boolean
  submitted: boolean
  submitError: string | null

  open: (mode?: 'manual' | 'auto', error?: Error) => void
  close: () => void
  setDescription: (text: string) => void
  submit: () => Promise<void>
}

const BACKEND_URL = 'https://api.zunoora.uz/bug-report'

export const useBugReportStore = create<BugReportState>()((set, get) => ({
  isOpen: false,
  mode: 'manual',
  error: null,
  stackTrace: '',
  description: '',
  submitting: false,
  submitted: false,
  submitError: null,

  open: (mode = 'manual', error?: Error) => {
    set({
      isOpen: true,
      mode,
      error: error || null,
      stackTrace: error?.stack || '',
      description: '',
      submitted: false,
      submitError: null,
    })
  },

  close: () => set({ isOpen: false }),

  setDescription: (text) => set({ description: text }),

  submit: async () => {
    const { mode, error, stackTrace, description } = get()
    set({ submitting: true, submitError: null })

    const payload = {
      mode,
      error: error ? { message: error.message, name: error.name, stack: stackTrace } : null,
      description: description.trim(),
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
    }

    try {
      const res = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      set({ submitting: false, submitted: true })
    } catch (err) {
      set({
        submitting: false,
        submitError: err instanceof Error ? err.message : 'Failed to submit report',
      })
    }
  },
}))
