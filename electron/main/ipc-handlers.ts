import { ipcMain, BrowserWindow, dialog } from 'electron'
import { createHash } from 'crypto'
import { verifyCredentials } from './auth'
import { loadShablons, filterShablonsByRole } from './templates'
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
}
