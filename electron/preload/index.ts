import { contextBridge, ipcRenderer } from 'electron'

const electronAPI = {
  login: (loginId: string, pin: string): Promise<{ success: boolean; data?: unknown; error?: string }> =>
    ipcRenderer.invoke('auth:login', loginId, pin),

  loadTemplates: (): Promise<{ success: boolean; data?: unknown[]; error?: string }> =>
    ipcRenderer.invoke('tpl:list'),

  renderAndGenerate: (data: {
    template: string
    values: Record<string, string>
    shablonType: string
    userName: string
    school?: { name: string; address?: string; phone?: string }
  }): Promise<{ success: boolean; data?: string; error?: string }> =>
    ipcRenderer.invoke('docx:generate', data),

  showSaveDialog: (defaultName: string): Promise<string | null> =>
    ipcRenderer.invoke('dialog:save', defaultName),

  getStoreValue: (key: string): Promise<unknown> =>
    ipcRenderer.invoke('store:get', key),

  setStoreValue: (key: string, value: unknown): Promise<void> =>
    ipcRenderer.invoke('store:set', key, value),

  getContext: (): Promise<{ success: boolean; data?: unknown; error?: string }> =>
    ipcRenderer.invoke('data:context'),

  getTeachers: (): Promise<{ success: boolean; data?: { id: string; full_name: string }[]; error?: string }> =>
    ipcRenderer.invoke('data:teachers'),

  // Shablon Builder & Marketplace
  listInstalledShablons: (): Promise<{ success: boolean; data?: unknown[]; error?: string }> =>
    ipcRenderer.invoke('shablon:list-installed'),

  listMarketplaceShablons: (): Promise<{ success: boolean; data?: unknown[]; error?: string }> =>
    ipcRenderer.invoke('shablon:list-marketplace'),

  searchMarketplaceShablons: (query: string): Promise<{ success: boolean; data?: unknown[]; error?: string }> =>
    ipcRenderer.invoke('shablon:search-marketplace', query),

  createShablon: (shablon: unknown): Promise<{ success: boolean; data?: unknown; error?: string }> =>
    ipcRenderer.invoke('shablon:create', shablon),

  updateShablon: (id: string, updates: unknown): Promise<{ success: boolean; data?: unknown; error?: string }> =>
    ipcRenderer.invoke('shablon:update', id, updates),

  deleteShablon: (id: string): Promise<{ success: boolean; data?: boolean; error?: string }> =>
    ipcRenderer.invoke('shablon:delete', id),

  installShablon: (shablonId: string): Promise<{ success: boolean; data?: boolean; error?: string }> =>
    ipcRenderer.invoke('shablon:install', shablonId),

  uninstallShablon: (shablonId: string): Promise<{ success: boolean; data?: boolean; error?: string }> =>
    ipcRenderer.invoke('shablon:uninstall', shablonId),

  publishShablon: (id: string, publish: boolean): Promise<{ success: boolean; data?: boolean; error?: string }> =>
    ipcRenderer.invoke('shablon:publish', id, publish),

  getShablonById: (id: string): Promise<{ success: boolean; data?: unknown; error?: string }> =>
    ipcRenderer.invoke('shablon:get', id),
}

contextBridge.exposeInMainWorld('electronAPI', electronAPI)
