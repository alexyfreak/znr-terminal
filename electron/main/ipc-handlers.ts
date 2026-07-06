import { ipcMain, BrowserWindow, dialog, app } from 'electron'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { resolve } from 'path'
import { createHash } from 'crypto'
import { verifyCredentials } from './auth'
import {
  loadShablons, filterShablonsByRole,
  listMarketplaceShablons, searchMarketplaceShablons,
  createShablon, updateShablon, deleteShablon,
  installShablon, listInstalledShablons, uninstallShablon,
  togglePublish, getShablonById
} from './templates'
import { renderTemplate } from './renderer'
import { generateDocx, generateOutputFilename } from './docx'
import type { UserContext, Shablon } from './db'

type IpcResult<T> = { success: true; data: T } | { success: false; error: string }

let currentContext: UserContext | null = null

export function getCurrentContext(): UserContext | null {
  return currentContext
}

export function registerIpcHandlers(_win: BrowserWindow): void {
  ipcMain.handle('auth:login', async (_event, loginId: string, pin: string): Promise<IpcResult<UserContext>> => {
    if (!loginId || loginId.trim().length === 0) {
      return { success: false, error: 'Login ID bo\'sh bo\'lishi mumkin emas' }
    }
    if (!pin || pin.trim().length < 4 || pin.trim().length > 6 || !/^\d+$/.test(pin.trim())) {
      return { success: false, error: 'PIN 4-6 raqamdan iborat bo\'lishi kerak' }
    }

    const id = loginId.trim().toUpperCase()
    const hashedPin = createHash('sha256').update(pin.trim()).digest('hex')

    try {
      const context = await verifyCredentials(id, hashedPin)
      if (!context) {
        return { success: false, error: 'ID yoki PIN noto\'g\'ri' }
      }
      currentContext = context
      return { success: true, data: context }
    } catch (err) {
      return { success: false, error: `Ma'lumotlar bazasiga ulanishda xatolik: ${(err as Error).message}` }
    }
  })

  ipcMain.handle('tpl:list', async (): Promise<IpcResult<Shablon[]>> => {
    if (!currentContext) {
      return { success: false, error: 'Avval tizimga kiring' }
    }
    try {
      const all = await loadShablons()
      const filtered = filterShablonsByRole(all, currentContext.role)
      return { success: true, data: filtered }
    } catch (err) {
      return { success: false, error: (err as Error).message }
    }
  })

  ipcMain.handle('docx:generate', async (_event, data: {
    template: string
    values: Record<string, string>
    shablonType: string
    userName: string
    school?: { name: string; address?: string | null; phone?: string | null }
  }): Promise<IpcResult<string>> => {
    try {
      const rendered = renderTemplate(data.template, data.values)

      const defaultName = generateOutputFilename(data.shablonType, data.userName)
      const { filePath, canceled } = await dialog.showSaveDialog({
        defaultPath: defaultName,
        filters: [{ name: 'Word Hujjati', extensions: ['docx'] }],
        title: 'Hujjatni saqlash',
      })

      if (canceled || !filePath) {
        return { success: false, error: 'Saqlash bekor qilindi' }
      }

      await generateDocx(rendered, filePath, data.school)
      return { success: true, data: filePath }
    } catch (err) {
      return { success: false, error: (err as Error).message }
    }
  })

  ipcMain.handle('dialog:save', async (_event, defaultName: string): Promise<string | null> => {
    const { filePath, canceled } = await dialog.showSaveDialog({
      defaultPath: defaultName,
      filters: [{ name: 'Word Hujjati', extensions: ['docx'] }],
      title: 'Hujjatni saqlash',
    })
    if (canceled) return null
    return filePath ?? null
  })

  // Simple JSON-file store for persisting small data (drafts, preferences)
  const STORE_PATH = resolve(app.getPath('userData'), 'zunoora-store.json')

  function readStore(): Record<string, unknown> {
    try {
      if (existsSync(STORE_PATH)) {
        return JSON.parse(readFileSync(STORE_PATH, 'utf-8'))
      }
    } catch { /* ignore corrupt file */ }
    return {}
  }

  function writeStore(data: Record<string, unknown>): void {
    try {
      writeFileSync(STORE_PATH, JSON.stringify(data, null, 2), 'utf-8')
    } catch { /* ignore write errors */ }
  }

  ipcMain.handle('store:get', async (_event, key: string): Promise<unknown> => {
    const store = readStore()
    return store[key]
  })

  ipcMain.handle('store:set', async (_event, key: string, value: unknown): Promise<void> => {
    const store = readStore()
    store[key] = value
    writeStore(store)
  })

  ipcMain.handle('data:context', async (): Promise<IpcResult<UserContext | null>> => {
    return { success: true, data: currentContext }
  })

  ipcMain.handle('data:teachers', async (): Promise<IpcResult<{ id: string; full_name: string }[]>> => {
    if (!currentContext) return { success: false, error: 'Avval tizimga kiring' }
    try {
      const { supabase } = await import('./db')
      if (!supabase) return { success: false, error: 'Ma\'lumotlar bazasi ulanishi mavjud emas' }
      const { data } = await supabase
        .from('teachers')
        .select('id, full_name')
        .eq('school_id', currentContext.school.id)
      return { success: true, data: (data as { id: string; full_name: string }[]) || [] }
    } catch (err) {
      return { success: false, error: (err as Error).message }
    }
  })

  // ── Shablon Builder / Marketplace IPC handlers ──

  ipcMain.handle('shablon:list-installed', async (): Promise<IpcResult<Shablon[]>> => {
    if (!currentContext) return { success: false, error: 'Avval tizimga kiring' }
    try {
      const data = await listInstalledShablons(currentContext.user.id)
      return { success: true, data }
    } catch (err) {
      return { success: false, error: (err as Error).message }
    }
  })

  ipcMain.handle('shablon:list-marketplace', async (): Promise<IpcResult<Shablon[]>> => {
    try {
      const data = await listMarketplaceShablons()
      return { success: true, data }
    } catch (err) {
      return { success: false, error: (err as Error).message }
    }
  })

  ipcMain.handle('shablon:search-marketplace', async (_event, query: string): Promise<IpcResult<Shablon[]>> => {
    try {
      const data = await searchMarketplaceShablons(query)
      return { success: true, data }
    } catch (err) {
      return { success: false, error: (err as Error).message }
    }
  })

  ipcMain.handle('shablon:create', async (_event, shablon: Omit<Shablon, 'id' | 'created_at' | 'updated_at'>): Promise<IpcResult<Shablon>> => {
    // Allow creating shablons even without login for local use
    const userId = currentContext?.user?.id || null
    console.log('[IPC shablon:create] Received request:', {
      type: shablon.type,
      label: shablon.label,
      userId,
      hasCurrentContext: !!currentContext
    })
    try {
      const data = await createShablon(shablon, userId)
      if (!data) {
        console.error('[IPC shablon:create] createShablon returned null')
        // Return a more helpful error message
        return { 
          success: false, 
          error: 'Shablon yaratishda xatolik. Iltimos terminalda "npm run dev" buyrug\'i bilan ishga tushiring va konsolni tekshiring, yoki Supabase RLS (Row Level Security) sozlamalarini tekshiring.' 
        }
      }
      console.log('[IPC shablon:create] Success:', data.id)
      return { success: true, data }
    } catch (err) {
      console.error('[IPC shablon:create] Exception:', err)
      const errorMessage = err instanceof Error ? err.message : String(err)
      return { success: false, error: `Xatolik: ${errorMessage}` }
    }
  })

  ipcMain.handle('shablon:update', async (_event, id: string, updates: Partial<Shablon>): Promise<IpcResult<Shablon>> => {
    try {
      const data = await updateShablon(id, updates)
      if (!data) return { success: false, error: 'Shablon yangilanmadi' }
      return { success: true, data }
    } catch (err) {
      return { success: false, error: (err as Error).message }
    }
  })

  ipcMain.handle('shablon:delete', async (_event, id: string): Promise<IpcResult<boolean>> => {
    try {
      const ok = await deleteShablon(id)
      return { success: true, data: ok }
    } catch (err) {
      return { success: false, error: (err as Error).message }
    }
  })

  ipcMain.handle('shablon:install', async (_event, shablonId: string): Promise<IpcResult<boolean>> => {
    if (!currentContext) return { success: false, error: 'Avval tizimga kiring' }
    try {
      const ok = await installShablon(currentContext.user.id, shablonId)
      return { success: true, data: ok }
    } catch (err) {
      return { success: false, error: (err as Error).message }
    }
  })

  ipcMain.handle('shablon:uninstall', async (_event, shablonId: string): Promise<IpcResult<boolean>> => {
    if (!currentContext) return { success: false, error: 'Avval tizimga kiring' }
    try {
      const ok = await uninstallShablon(currentContext.user.id, shablonId)
      return { success: true, data: ok }
    } catch (err) {
      return { success: false, error: (err as Error).message }
    }
  })

  ipcMain.handle('shablon:publish', async (_event, id: string, publish: boolean): Promise<IpcResult<boolean>> => {
    try {
      const ok = await togglePublish(id, publish)
      return { success: true, data: ok }
    } catch (err) {
      return { success: false, error: (err as Error).message }
    }
  })

  ipcMain.handle('shablon:get', async (_event, id: string): Promise<IpcResult<Shablon>> => {
    try {
      const data = await getShablonById(id)
      if (!data) return { success: false, error: 'Shablon topilmadi' }
      return { success: true, data }
    } catch (err) {
      return { success: false, error: (err as Error).message }
    }
  })
}
