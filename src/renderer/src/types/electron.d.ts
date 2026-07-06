declare global {
  interface Window {
    electronAPI: {
      getStoreValue(key: string): Promise<unknown>
      setStoreValue(key: string, value: unknown): Promise<void>
    }
  }
}

export {}
