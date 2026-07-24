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
    if (!password || password.length < 1) {
      throw new Error('Parol kiritilmagan')
    }
    if (password.length > 128) {
      throw new Error('Parol juda uzun')
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

    try {
      const activity = existsSync(ACTIVITY_LOG_PATH)
        ? JSON.parse(readFileSync(ACTIVITY_LOG_PATH, 'utf-8'))
        : []
      activity.push({
        type: 'doc_generated',
        userName: data.userName,
        shablonType: data.shablonType,
        schoolName: data.school?.name || '—',
        timestamp: new Date().toISOString(),
      })
      const recent = activity.slice(-500)
      writeFileSync(ACTIVITY_LOG_PATH, JSON.stringify(recent, null, 2), 'utf-8')
    } catch { /* ignore */ }

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
  const ACTIVITY_LOG_PATH = resolve(app.getPath('userData'), 'activity-log.json')

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

  registerSafeHandler('admin:dashboard', async () => {
    if (!supabase) return { error: 'Database not connected' }

    const now = new Date()
    const day = 86400000
    const weekAgo = new Date(now.getTime() - 7 * day).toISOString()
    const monthAgo = new Date(now.getTime() - 30 * day).toISOString()

    const [schoolsRes, teachersRes, directorsRes] = await Promise.all([
      supabase.from('schools').select('id, name, address, created_at'),
      supabase.from('teachers').select('id, full_name, school_id, last_login, created_at'),
      supabase.from('directors').select('id, full_name, school_id, last_login, created_at'),
    ])

    const schools = (schoolsRes.data || []) as { id: string; name: string; address: string | null; created_at: string | null }[]
    const teachers = (teachersRes.data || []) as { id: string; full_name: string; school_id: string; last_login: string | null; created_at: string | null }[]
    const directors = (directorsRes.data || []) as { id: string; full_name: string; school_id: string; last_login: string | null; created_at: string | null }[]
    const allUsers = [...teachers, ...directors]

    const weeklyActive = allUsers.filter(u => u.last_login && u.last_login >= weekAgo).length
    const monthlyActive = allUsers.filter(u => u.last_login && u.last_login >= monthAgo).length
    const activeNow = allUsers.filter(u => {
      if (!u.last_login) return false
      return now.getTime() - new Date(u.last_login).getTime() < 15 * 60000
    }).length

    const usersBySchool = schools.map(s => ({
      id: s.id,
      name: s.name,
      address: s.address || '',
      userCount: allUsers.filter(u => u.school_id === s.id).length,
      teacherCount: teachers.filter(t => t.school_id === s.id).length,
      directorCount: directors.filter(d => d.school_id === s.id).length,
      weeklyActive: allUsers.filter(u => u.school_id === s.id && u.last_login && u.last_login >= weekAgo).length,
      monthlyActive: allUsers.filter(u => u.school_id === s.id && u.last_login && u.last_login >= monthAgo).length,
    }))

    const recentActivity = allUsers
      .filter(u => u.last_login)
      .sort((a, b) => new Date(b.last_login!).getTime() - new Date(a.last_login!).getTime())
      .slice(0, 50)
      .map(u => ({
        id: u.id,
        name: u.full_name,
        schoolId: u.school_id,
        lastLogin: u.last_login,
        schoolName: schools.find(s => s.id === u.school_id)?.name || '—',
      }))

    return {
      stats: {
        totalSchools: schools.length,
        totalUsers: allUsers.length,
        totalTeachers: teachers.length,
        totalDirectors: directors.length,
        weeklyActive,
        monthlyActive,
        activeNow,
      },
      schools: usersBySchool,
      recentActivity,
    }
  })

  registerSafeHandler('admin:school-detail', async (_event, schoolId: string) => {
    if (!supabase) return { error: 'Database not connected' }

    const [schoolRes, teachersRes, directorsRes] = await Promise.all([
      supabase.from('schools').select('*').eq('id', schoolId).maybeSingle(),
      supabase.from('teachers').select('id, full_name, email, phone, subject, last_login, created_at').eq('school_id', schoolId),
      supabase.from('directors').select('id, full_name, email, phone, last_login, created_at').eq('school_id', schoolId),
    ])

    const school = schoolRes.data as { id: string; name: string; address: string | null; phone: string | null; created_at: string | null } | null
    const teachers = (teachersRes.data || []) as { id: string; full_name: string; email: string | null; phone: string | null; subject: string | null; last_login: string | null; created_at: string | null }[]
    const directors = (directorsRes.data || []) as { id: string; full_name: string; email: string | null; phone: string | null; last_login: string | null; created_at: string | null }[]

    return {
      school,
      teachers,
      directors,
    }
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

  registerSafeHandler('payment:check-status', async (_event, txnId: string, method: 'payme' | 'click') => {
    try {
      if (method === 'payme') {
        const { checkPaymeReceipt } = await import('./payment')
        const receiptId = txnId
        const result = await checkPaymeReceipt(receiptId)
        return { success: true, data: { paid: result.paid } }
      } else {
        const { checkClickInvoice } = await import('./payment')
        const invoiceId = txnId
        const result = await checkClickInvoice(invoiceId)
        return { success: true, data: { paid: result.paid } }
      }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  })

  registerSafeHandler('bug:report', async (_event, payload: {
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
  }) => {
    const reportsDir = resolve(app.getPath('userData'), 'bug-reports')
    if (!existsSync(reportsDir)) mkdirSync(reportsDir, { recursive: true })

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const ctx = getCurrentContext()

    const schoolAddress = ctx?.school?.address || ''
    const schoolInfo = payload.schoolName
      ? `${payload.schoolName}${schoolAddress ? ` (${schoolAddress})` : ''}`
      : 'N/A'

    const bodyText =
      `── User Info ──\n` +
      `Full Name: ${payload.userFullName || 'N/A'}\n` +
      `User ID: ${payload.userId || 'N/A'}\n` +
      `Role: ${payload.userRole || 'N/A'}\n` +
      `School: ${schoolInfo}\n` +
      `Credits: ${payload.creditsBalance ?? 'N/A'}\n` +
      `Subscription: ${payload.creditsTier || 'N/A'}\n` +
      `\n── Report ──\n` +
      `Mode: ${payload.mode}\n` +
      `Description: ${payload.description}\n` +
      (payload.stackTrace ? `\nStack Trace:\n${payload.stackTrace}\n` : '') +
      `\n── System ──\n` +
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

  // ── Admin DB CRUD ──────────────────────────────────────────────

  const ADMIN_TABLES = ['schools', 'teachers', 'directors', 'classes', 'shablons'] as const

  function searchableCols(table: string): string[] {
    switch (table) {
      case 'schools':   return ['name', 'address', 'phone']
      case 'teachers':  return ['login_id', 'full_name', 'email', 'phone', 'subject']
      case 'directors': return ['login_id', 'full_name', 'email', 'phone']
      case 'classes':   return ['name', 'academic_year']
      case 'shablons':  return ['type', 'label', 'description', 'category']
      default:          return []
    }
  }

  registerSafeHandler('admin:list-table', async (_event, params: {
    table: string
    search?: string
    orderColumn?: string
    orderDirection?: 'asc' | 'desc'
    limit?: number
    offset?: number
  }) => {
    if (!supabase) throw new Error('Database not connected')
    if (!ADMIN_TABLES.includes(params.table as any)) throw new Error('Invalid table')

    let query = supabase.from(params.table).select('*', { count: 'exact' })

    if (params.search) {
      const term = `%${params.search}%`
      const cols = searchableCols(params.table)
      if (cols.length > 0) {
        query = query.or(cols.map(c => `${c}.ilike.${term}`).join(','))
      }
    }

    if (params.orderColumn) {
      query = query.order(params.orderColumn, { ascending: params.orderDirection !== 'desc' })
    } else {
      query = query.order('created_at', { ascending: false, nullsFirst: false })
    }

    if (params.limit) {
      const from = params.offset || 0
      query = query.range(from, from + params.limit - 1)
    }

    const { data, error, count } = await query
    if (error) throw new Error(error.message)
    return { rows: data as Record<string, unknown>[] || [], count: count || 0 }
  })

  registerSafeHandler('admin:get-row', async (_event, table: string, id: string) => {
    if (!supabase) throw new Error('Database not connected')
    if (!ADMIN_TABLES.includes(table as any)) throw new Error('Invalid table')

    const { data, error } = await supabase.from(table).select('*').eq('id', id).maybeSingle()
    if (error) throw new Error(error.message)
    if (!data) throw new Error('Row not found')
    return data
  })

  registerSafeHandler('admin:create-row', async (_event, table: string, rowData: Record<string, unknown>) => {
    if (!supabase) throw new Error('Database not connected')
    if (!ADMIN_TABLES.includes(table as any)) throw new Error('Invalid table')

    const { data, error } = await supabase.from(table).insert(rowData).select().maybeSingle()
    if (error) throw new Error(error.message)
    return data
  })

  registerSafeHandler('admin:update-row', async (_event, table: string, id: string, rowData: Record<string, unknown>) => {
    if (!supabase) throw new Error('Database not connected')
    if (!ADMIN_TABLES.includes(table as any)) throw new Error('Invalid table')

    const { data, error } = await supabase.from(table).update(rowData).eq('id', id).select().maybeSingle()
    if (error) throw new Error(error.message)
    return data
  })

  registerSafeHandler('admin:delete-row', async (_event, table: string, id: string) => {
    if (!supabase) throw new Error('Database not connected')
    if (!ADMIN_TABLES.includes(table as any)) throw new Error('Invalid table')

    const { error } = await supabase.from(table).delete().eq('id', id)
    if (error) throw new Error(error.message)
    return true
  })

  registerSafeHandler('admin:list-all', async (_event, table: string) => {
    if (!supabase) throw new Error('Database not connected')
    if (!ADMIN_TABLES.includes(table as any)) throw new Error('Invalid table')

    const nameCol = table === 'schools' ? 'name' : 'full_name'
    const { data, error } = await supabase
      .from(table)
      .select(`id, ${nameCol}`)
      .order(nameCol, { ascending: true })
    if (error) throw new Error(error.message)
    return data as Record<string, unknown>[] || []
  })
}
