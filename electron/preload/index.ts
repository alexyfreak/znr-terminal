import { contextBridge, ipcRenderer } from 'electron';

const electronAPI = {
  login: (loginId: string, pin: string): Promise<{ success: boolean; data?: unknown; error?: string }> =>
    ipcRenderer.invoke('auth:login', loginId, pin),

  loadTemplates: (): Promise<{ success: boolean; data?: unknown[]; error?: string }> =>
    ipcRenderer.invoke('tpl:list'),

  getTemplateSchema: (type: string): Promise<{ success: boolean; data?: unknown; error?: string }> =>
    ipcRenderer.invoke('tpl:schema', type),

  renderAndGenerate: (data: {
    template: string;
    values: Record<string, string>;
    shablonType: string;
    userName: string;
    school?: { name: string; address?: string; phone?: string };
  }): Promise<{ success: boolean; data?: string; error?: string }> =>
    ipcRenderer.invoke('docx:generate', data),

  showSaveDialog: (defaultName: string): Promise<string | null> =>
    ipcRenderer.invoke('dialog:save', defaultName),
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);
