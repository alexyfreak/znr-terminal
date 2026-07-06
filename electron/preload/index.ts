import { contextBridge, ipcRenderer } from 'electron'

const electronAPI = {
  getStoreValue: (key: string): Promise<unknown> =>
    ipcRenderer.invoke('store:get', key),
  setStoreValue: (key: string, value: unknown): Promise<void> =>
    ipcRenderer.invoke('store:set', key, value),
}

contextBridge.exposeInMainWorld('electronAPI', electronAPI)
