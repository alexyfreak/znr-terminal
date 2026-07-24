import { contextBridge, ipcRenderer } from 'electron'

const electronAPI = {
  login: (loginId: string, pin: string): Promise<{ success: boolean; data?: unknown; error?: string }> =>
    ipcRenderer.invoke('auth:login', loginId, pin),

  register: (data: unknown): Promise<{ success: boolean; data?: unknown; error?: string }> =>
    ipcRenderer.invoke('auth:register', data),

  listSchools: (): Promise<{ success: boolean; data?: { id: string; name: string; address: string | null }[]; error?: string }> =>
    ipcRenderer.invoke('auth:list-schools'),

  generateId: (): Promise<{ success: boolean; data?: string; error?: string }> =>
    ipcRenderer.invoke('auth:generate-id'),

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

  getSubjects: (): Promise<{ success: boolean; data?: string[]; error?: string }> =>
    ipcRenderer.invoke('data:subjects'),

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

  // Payment API
  createPaymentTransaction: (params: {
    type: 'credit_pack' | 'subscription'
    amount: number
    method: 'payme' | 'click'
    description: string
    credits?: number
    tier?: string
    billing?: string
  }): Promise<{ success: boolean; data?: { transactionId: string; paymentUrl: string }; error?: string }> =>
    ipcRenderer.invoke('payment:create-transaction', params),

  openPaymentUrl: (url: string): Promise<{ success: boolean; data?: unknown; error?: string }> =>
    ipcRenderer.invoke('payment:open-url', url),

  checkPaymentStatus: (txnId: string, method: 'payme' | 'click'): Promise<{ success: boolean; data?: { paid: boolean }; error?: string }> =>
    ipcRenderer.invoke('payment:check-status', txnId, method),

  submitBugReport: (data: {
    mode: string
    description: string
    stackTrace?: string
    userAgent?: string
    userFullName?: string
    userId?: string
    userRole?: string
    schoolName?: string
    schoolId?: string
    creditsBalance?: number
    creditsTier?: string
  }): Promise<{ success: boolean; data?: { savedPath: string }; error?: string }> =>
    ipcRenderer.invoke('bug:report', data),

  // Admin API
  getAdminConfig: (): Promise<{ success: boolean; data?: { reportRecipientEmail: string }; error?: string }> =>
    ipcRenderer.invoke('admin:get-config'),

  setAdminConfig: (config: { reportRecipientEmail: string }): Promise<{ success: boolean; data?: boolean; error?: string }> =>
    ipcRenderer.invoke('admin:set-config', config),

  // Admin Dashboard
  getAdminDashboard: (): Promise<{ success: boolean; data?: Record<string, unknown>; error?: string }> =>
    ipcRenderer.invoke('admin:dashboard'),

  getAdminSchoolDetail: (schoolId: string): Promise<{ success: boolean; data?: Record<string, unknown>; error?: string }> =>
    ipcRenderer.invoke('admin:school-detail', schoolId),

  // Admin DB CRUD
  adminListTable: (params: {
    table: string
    search?: string
    orderColumn?: string
    orderDirection?: 'asc' | 'desc'
    limit?: number
    offset?: number
  }): Promise<{ success: boolean; data?: { rows: Record<string, unknown>[]; count: number }; error?: string }> =>
    ipcRenderer.invoke('admin:list-table', params),

  adminGetRow: (table: string, id: string): Promise<{ success: boolean; data?: Record<string, unknown>; error?: string }> =>
    ipcRenderer.invoke('admin:get-row', table, id),

  adminCreateRow: (table: string, data: Record<string, unknown>): Promise<{ success: boolean; data?: Record<string, unknown>; error?: string }> =>
    ipcRenderer.invoke('admin:create-row', table, data),

  adminUpdateRow: (table: string, id: string, data: Record<string, unknown>): Promise<{ success: boolean; data?: Record<string, unknown>; error?: string }> =>
    ipcRenderer.invoke('admin:update-row', table, id, data),

  adminDeleteRow: (table: string, id: string): Promise<{ success: boolean; data?: boolean; error?: string }> =>
    ipcRenderer.invoke('admin:delete-row', table, id),

  adminListAll: (table: string): Promise<{ success: boolean; data?: Record<string, unknown>[]; error?: string }> =>
    ipcRenderer.invoke('admin:list-all', table),
}

contextBridge.exposeInMainWorld('electronAPI', electronAPI)
