import { ipcMain, BrowserWindow, dialog, app, shell } from 'electron'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import nodemailer from 'nodemailer'
import { resolve } from 'path'
import { verifyCredentials, registerUser, generateUniqueId } from './auth'
import type { RegisterInput } from './auth'
import type { AdminConfig } from './types'
import {
  loadShablons, filterShablonsByRole,
  listMarketplaceShablons, searchMarketplaceShablons,
  createShablon, updateShablon, deleteShablon,
  installShablon, listInstalledShablons, uninstallShablon,
  togglePublish, getShablonById
} from './templates'
import { renderTemplate } from './renderer'
import { generateDocx, generateOutputFilename } from './docx'
import { supabase } from './db'
import type { UserContext, Shablon } from './db'
import { registerSafeHandler } from './ipc-wrapper'
import { createTransaction, createPaymeTransaction, createClickTransaction } from './payment'

let currentContext: UserContext | null = null

const loginAttempts = new Map<string, { count: number; lockUntil: number }>()
const MAX_LOGIN_ATTEMPTS = 5
const LOCKOUT_DURATION_MS = 30000

function checkLoginRateLimit(key: string): boolean {
  const now = Date.now()
  const entry = loginAttempts.get(key)
  if (entry) {
    if (now < entry.lockUntil) return false
    if (now >= entry.lockUntil) loginAttempts.delete(key)
  }
  return true
}

function recordLoginAttempt(key: string, success: boolean): void {
  if (success) { loginAttempts.delete(key); return }
  const now = Date.now()
  const entry = loginAttempts.get(key) || { count: 0, lockUntil: 0 }
  entry.count++
  if (entry.count >= MAX_LOGIN_ATTEMPTS) {
    entry.lockUntil = now + LOCKOUT_DURATION_MS
  }
  loginAttempts.set(key, entry)
}

export function getCurrentContext(): UserContext | null {
  return currentContext
}

export function registerIpcHandlers(_win: BrowserWindow): void {
  registerSafeHandler('auth:register', async (_event, payload: RegisterInput) => {
    if (!payload.loginId || !payload.password || !payload.fullName) {
      throw new Error('Majburiy maydonlar to\'ldirilmagan')
    }
    const id = payload.loginId.trim().toUpperCase()
    const input: RegisterInput = { ...payload, loginId: id }
    const context = await registerUser(input)
    if (!context) {
      throw new Error('Ro\'yxatdan o\'tishda xatolik. Login ID band yoki ma\'lumotlar noto\'g\'ri.')
    }
    currentContext = context
    return context
  })

  registerSafeHandler('auth:list-schools', async () => {
    if (!supabase) throw new Error('Ma\'lumotlar bazasi ulanishi mavjud emas')
    const { data } = await supabase.from('schools').select('id, name, address').order('name')
    return (data as { id: string; name: string; address: string | null }[]) || []
  })

  registerSafeHandler('auth:generate-id', async () => {
    const id = await generateUniqueId()
    if (!id) throw new Error('ID yaratishda xatolik')
    return id
  })

  registerSafeHandler('auth:login', async (_event, loginId: string, password: string) => {
    if (!loginId || loginId.trim().length === 0) {
      throw new Error('Login ID bo\'sh bo\'lishi mumkin emas')
    }
    if (!password || password.trim().length < 1) {
      throw new Error('Parol kiritilmagan')
    }
    const id = loginId.trim().toUpperCase()
    if (!checkLoginRateLimit(id)) {
      throw new Error('Ko\'p urinishlar. 30 soniya kuting.')
    }
    const context = await verifyCredentials(id, password.trim())
    if (!context) {
      recordLoginAttempt(id, false)
      throw new Error('ID yoki parol noto\'g\'ri')
    }
    recordLoginAttempt(id, true)
    currentContext = context
    return context
  })

  registerSafeHandler('tpl:list', async () => {
    if (!currentContext) throw new Error('Avval tizimga kiring')
    const all = await loadShablons()
    return filterShablonsByRole(all, currentContext.role)
  })

  registerSafeHandler('docx:generate', async (_event, data: {
    template: string
    values: Record<string, string>
    shablonType: string
    userName: string
    school?: { name: string; address?: string | null; phone?: string | null }
  }) => {
    const rendered = renderTemplate(data.template, data.values)
    const defaultName = generateOutputFilename(data.shablonType, data.userName)
    const { filePath, canceled } = await dialog.showSaveDialog({
      defaultPath: defaultName,
      filters: [{ name: 'Word Hujjati', extensions: ['docx'] }],
      title: 'Hujjatni saqlash',
    })
    if (canceled || !filePath) throw new Error('Saqlash bekor qilindi')
    await generateDocx(rendered, filePath, data.school)
    return filePath
  })

  ipcMain.handle('dialog:save', async (_event, defaultName: string): Promise<string | null> => {
    try {
      const { filePath, canceled } = await dialog.showSaveDialog({
        defaultPath: defaultName,
        filters: [{ name: 'Word Hujjati', extensions: ['docx'] }],
        title: 'Hujjatni saqlash',
      })
      return canceled ? null : (filePath ?? null)
    } catch {
      return null
    }
  })

  const STORE_PATH = resolve(app.getPath('userData'), 'zunoora-store.json')

  function readStore(): Record<string, unknown> {
    try {
      if (existsSync(STORE_PATH)) {
        return JSON.parse(readFileSync(STORE_PATH, 'utf-8'))
      }
    } catch { /* ignore */ }
    return {}
  }

  function writeStore(data: Record<string, unknown>): void {
    try {
      writeFileSync(STORE_PATH, JSON.stringify(data, null, 2), 'utf-8')
    } catch { /* ignore */ }
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

  const ADMIN_CONFIG_PATH = resolve(app.getPath('userData'), 'admin-config.json')

  function readAdminConfig(): AdminConfig {
    try {
      if (existsSync(ADMIN_CONFIG_PATH)) {
        return JSON.parse(readFileSync(ADMIN_CONFIG_PATH, 'utf-8'))
      }
    } catch { /* ignore */ }
    return { reportRecipientEmail: 'matritsah4cker@gmail.com' }
  }

  function writeAdminConfig(config: AdminConfig): void {
    try {
      writeFileSync(ADMIN_CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8')
    } catch { /* ignore */ }
  }

  registerSafeHandler('admin:get-config', async () => {
    return readAdminConfig()
  })

  registerSafeHandler('admin:set-config', async (_event, config: AdminConfig) => {
    writeAdminConfig(config)
    return true
  })

  registerSafeHandler('data:context', async () => {
    return currentContext
  })

  registerSafeHandler('data:teachers', async () => {
    if (!currentContext) throw new Error('Avval tizimga kiring')
    if (!supabase) throw new Error('Ma\'lumotlar bazasi ulanishi mavjud emas')
    const { data } = await supabase
      .from('teachers')
      .select('id, full_name')
      .eq('school_id', currentContext.school.id)
    return (data as { id: string; full_name: string }[]) || []
  })

  registerSafeHandler('data:subjects', async () => {
    if (!currentContext) throw new Error('Avval tizimga kiring')
    if (!supabase) throw new Error('Ma\'lumotlar bazasi ulanishi mavjud emas')
    const { data } = await supabase
      .from('teachers')
      .select('subject')
      .eq('school_id', currentContext.school.id)
      .not('subject', 'is', null)
    const subjects = [...new Set((data as { subject: string }[] || []).map(r => r.subject).filter(Boolean))]
    subjects.sort()
    return subjects
  })

  registerSafeHandler('shablon:list-installed', async () => {
    if (!currentContext) throw new Error('Avval tizimga kiring')
    return listInstalledShablons(currentContext.user.id)
  })

  registerSafeHandler('shablon:list-marketplace', async () => {
    return listMarketplaceShablons()
  })

  registerSafeHandler('shablon:search-marketplace', async (_event, query: string) => {
    return searchMarketplaceShablons(query)
  })

  registerSafeHandler('shablon:create', async (_event, shablon: Omit<Shablon, 'id' | 'created_at' | 'updated_at'>) => {
    const userId = currentContext?.user?.id || undefined
    const data = await createShablon(shablon, userId)
    if (!data) throw new Error('Shablon yaratishda xatolik yuz berdi.')
    return data
  })

  registerSafeHandler('shablon:update', async (_event, id: string, updates: Partial<Shablon>) => {
    const data = await updateShablon(id, updates)
    if (!data) throw new Error('Shablon yangilanmadi')
    return data
  })

  registerSafeHandler('shablon:delete', async (_event, id: string) => {
    return deleteShablon(id)
  })

  registerSafeHandler('shablon:install', async (_event, shablonId: string) => {
    if (!currentContext) throw new Error('Avval tizimga kiring')
    return installShablon(currentContext.user.id, shablonId)
  })

  registerSafeHandler('shablon:uninstall', async (_event, shablonId: string) => {
    if (!currentContext) throw new Error('Avval tizimga kiring')
    return uninstallShablon(currentContext.user.id, shablonId)
  })

  registerSafeHandler('shablon:publish', async (_event, id: string, publish: boolean) => {
    return togglePublish(id, publish)
  })

  registerSafeHandler('shablon:get', async (_event, id: string) => {
    const data = await getShablonById(id)
    if (!data) throw new Error('Shablon topilmadi')
    return data
  })

  registerSafeHandler('payment:create-transaction', async (_event, params: {
    type: 'credit_pack' | 'subscription'
    amount: number
    method: 'payme' | 'click'
    description: string
    credits?: number
    tier?: string
    billing?: string
  }) => {
    let paymentUrl: string
    let transactionId: string
    const returnUrl = 'zunoora://payment/success'

    if (params.method === 'payme') {
      const result = await createPaymeTransaction({
        amount: params.amount,
        description: params.description,
        returnUrl,
      })
      transactionId = result.transactionId
      paymentUrl = result.paymentUrl
    } else {
      const result = await createClickTransaction({
        amount: params.amount,
        description: params.description,
        returnUrl,
      })
      transactionId = result.transactionId
      paymentUrl = result.paymentUrl
    }

    const txn = createTransaction({
      type: params.type,
      amount: params.amount,
      currency: 'uzs',
      method: params.method,
      credits: params.credits,
      tier: params.tier as any,
      billing: params.billing as any,
      paymentUrl,
      externalId: transactionId,
    })

    return { transactionId, paymentUrl, externalId: txn.id }
  })

  registerSafeHandler('payment:open-url', async (_event, url: string) => {
    shell.openExternal(url)
  })

  registerSafeHandler('bug:report', async (_event, payload: {
    mode: string
    description: string
    stackTrace?: string
    userAgent?: string
  }) => {
    const reportsDir = resolve(app.getPath('userData'), 'bug-reports')
    if (!existsSync(reportsDir)) mkdirSync(reportsDir, { recursive: true })

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const bodyText =
      `Description: ${payload.description}\n\n` +
      (payload.stackTrace ? `Stack Trace:\n${payload.stackTrace}\n\n` : '') +
      `User Agent: ${payload.userAgent || 'N/A'}\n` +
      `Platform: ${process.platform}\n` +
      `App Version: ${app.getVersion()}`

    const report = {
      ...payload,
      timestamp: new Date().toISOString(),
      appVersion: app.getVersion(),
      platform: process.platform,
    }
    const filePath = resolve(reportsDir, `bug-report-${timestamp}.json`)
    writeFileSync(filePath, JSON.stringify(report, null, 2), 'utf-8')

    const gmailUser = process.env.GMAIL_USER
    const gmailPass = process.env.GMAIL_APP_PASSWORD

    if (gmailUser && gmailPass) {
      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: { user: gmailUser, pass: gmailPass },
      })

      const adminConfig = readAdminConfig()
      const recipient = adminConfig.reportRecipientEmail || 'matritsah4cker@gmail.com'

      await transporter.sendMail({
        from: `Zunoora Bug Report <${gmailUser}>`,
        to: recipient,
        subject: `Bug Report (${payload.mode}) — ${new Date().toLocaleString()}`,
        text: bodyText,
      })
    }

    return { savedPath: filePath }
  })
}
