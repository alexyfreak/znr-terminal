declare global {
  interface Window {
    electronAPI: {
      login: (loginId: string, pin: string) => Promise<{ success: boolean; data?: unknown; error?: string }>
      register: (data: RegisterPayload) => Promise<{ success: boolean; data?: unknown; error?: string }>
      listSchools: () => Promise<{ success: boolean; data?: { id: string; name: string; address: string | null }[]; error?: string }>
      loadTemplates: () => Promise<{ success: boolean; data?: unknown[]; error?: string }>
      renderAndGenerate: (data: {
        template: string
        values: Record<string, string>
        shablonType: string
        userName: string
        school?: { name: string; address?: string; phone?: string }
      }) => Promise<{ success: boolean; data?: string; error?: string }>
      showSaveDialog: (defaultName: string) => Promise<string | null>
      getStoreValue: (key: string) => Promise<unknown>
      setStoreValue: (key: string, value: unknown) => Promise<void>
      getContext: () => Promise<{ success: boolean; data?: unknown; error?: string }>
      getTeachers: () => Promise<{ success: boolean; data?: { id: string; full_name: string }[]; error?: string }>
      getSubjects: () => Promise<{ success: boolean; data?: string[]; error?: string }>

      // Shablon Builder & Marketplace
      listInstalledShablons: () => Promise<{ success: boolean; data?: unknown[]; error?: string }>
      listMarketplaceShablons: () => Promise<{ success: boolean; data?: unknown[]; error?: string }>
      searchMarketplaceShablons: (query: string) => Promise<{ success: boolean; data?: unknown[]; error?: string }>
      createShablon: (shablon: unknown) => Promise<{ success: boolean; data?: unknown; error?: string }>
      updateShablon: (id: string, updates: unknown) => Promise<{ success: boolean; data?: unknown; error?: string }>
      deleteShablon: (id: string) => Promise<{ success: boolean; data?: boolean; error?: string }>
      installShablon: (shablonId: string) => Promise<{ success: boolean; data?: boolean; error?: string }>
      uninstallShablon: (shablonId: string) => Promise<{ success: boolean; data?: boolean; error?: string }>
      publishShablon: (id: string, publish: boolean) => Promise<{ success: boolean; data?: boolean; error?: string }>
      getShablonById: (id: string) => Promise<{ success: boolean; data?: unknown; error?: string }>
      generateId: () => Promise<{ success: boolean; data?: string; error?: string }>

      // Payment API
      createPaymentTransaction: (params: {
        type: 'credit_pack' | 'subscription'
        amount: number
        method: 'payme' | 'click'
        description: string
        credits?: number
        tier?: string
        billing?: string
      }) => Promise<{ success: boolean; data?: { transactionId: string; paymentUrl: string }; error?: string }>
      openPaymentUrl: (url: string) => Promise<{ success: boolean; data?: unknown; error?: string }>
    }
  }
}

export interface RegisterPayload {
  loginId: string
  password: string
  fullName: string
  email: string
  phone: string
  age: number
  position: 'teacher' | 'director'
  subject: string
  schoolId: string | null
  schoolName: string
  schoolAddress: string
}

export {}
