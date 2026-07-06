declare global {
  interface Window {
    electronAPI: {
      login: (loginId: string, pin: string) => Promise<{ success: boolean; data?: unknown; error?: string }>
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
    }
  }
}

export {}
