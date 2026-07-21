import { create } from 'zustand'
import { useAccountStore } from './useAccountStore'
import { useCreditsStore } from './useCreditsStore'

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

  close: () => set({ isOpen: false, submitted: false, submitError: null }),

  setDescription: (text) => set({ description: text }),

  submit: async () => {
    const { mode, error, stackTrace, description } = get()
    set({ submitting: true, submitError: null })

    try {
      const account = useAccountStore.getState()
      const credits = useCreditsStore.getState()

      if (window.electronAPI?.submitBugReport) {
        const res = await window.electronAPI.submitBugReport({
          mode,
          description: description.trim(),
          stackTrace: error?.stack || stackTrace,
          userAgent: navigator.userAgent,
          userFullName: account.userName || '',
          userId: account.userId || '',
          userRole: account.role || '',
          schoolName: account.schoolName || '',
          schoolId: account.schoolId || '',
          creditsBalance: credits.balance,
          creditsTier: credits.tier,
        })
        if (!res.success) throw new Error(res.error || 'Failed to submit')
      } else {
        await new Promise((r) => setTimeout(r, 800))
      }
      set({ submitting: false, submitted: true })
    } catch (err) {
      set({
        submitting: false,
        submitError: err instanceof Error ? err.message : 'Failed to submit report',
      })
    }
  },
}))
