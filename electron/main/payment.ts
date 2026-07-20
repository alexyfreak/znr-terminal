import { shell, app } from 'electron'
import { randomUUID } from 'crypto'
import { createServer, type Server } from 'http'
import { request as httpsRequest, type RequestOptions } from 'https'
import { resolve } from 'path'
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs'

export interface PaymentTransaction {
  id: string
  type: 'credit_pack' | 'subscription'
  amount: number
  currency: 'uzs'
  method: 'payme' | 'click'
  status: 'pending' | 'processing' | 'success' | 'failed' | 'cancelled'
  credits?: number
  tier?: 'free' | 'pro' | 'enterprise'
  billing?: 'monthly' | 'annual'
  paymentUrl?: string
  externalId?: string
  createdAt: string
  updatedAt: string
}

const TRANSACTIONS_PATH = resolve(app.getPath('userData'), 'payments')
const TRANSACTIONS_FILE = resolve(TRANSACTIONS_PATH, 'transactions.json')

function ensureDir(): void {
  if (!existsSync(TRANSACTIONS_PATH)) {
    mkdirSync(TRANSACTIONS_PATH, { recursive: true })
  }
}

function loadTransactions(): PaymentTransaction[] {
  ensureDir()
  try {
    if (existsSync(TRANSACTIONS_FILE)) {
      return JSON.parse(readFileSync(TRANSACTIONS_FILE, 'utf-8'))
    }
  } catch { /* ignore */ }
  return []
}

function saveTransactions(txns: PaymentTransaction[]): void {
  ensureDir()
  writeFileSync(TRANSACTIONS_FILE, JSON.stringify(txns, null, 2), 'utf-8')
}

// Config – set via environment or defaults
const PAYME_ID = process.env.PAYME_ID || ''
const PAYME_KEY = process.env.PAYME_KEY || ''
const PAYME_IS_TEST = process.env.PAYME_IS_TEST !== 'false'

const CLICK_SERVICE_ID = process.env.CLICK_SERVICE_ID || ''
const CLICK_MERCHANT_ID = process.env.CLICK_MERCHANT_ID || ''
const CLICK_SECRET_KEY = process.env.CLICK_SECRET_KEY || ''
const CLICK_IS_TEST = process.env.CLICK_IS_TEST !== 'false'

// ---------------------------------------------------------------------------
// JSON‑RPC helper
// ---------------------------------------------------------------------------
function jsonRpcRequest(
  url: string,
  method: string,
  params: Record<string, unknown>,
  auth?: { username: string; password: string },
): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ id: Date.now(), method, params })
    const urlObj = new URL(url)
    const opts: RequestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
      rejectUnauthorized: true,
    }
    if (auth) {
      opts.auth = `${auth.username}:${auth.password}`
    }
    const req = httpsRequest(opts, (res) => {
      let data = ''
      res.on('data', (chunk) => { data += chunk })
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data)
          if (parsed.error) {
            reject(new Error(`Payme API error: ${parsed.error.message || JSON.stringify(parsed.error)}`))
          } else {
            resolve(parsed.result)
          }
        } catch (e) {
          reject(new Error(`Payme API parse error: ${data}`))
        }
      })
    })
    req.on('error', reject)
    req.write(body)
    req.end()
  })
}

// ---------------------------------------------------------------------------
// Payme API
// ---------------------------------------------------------------------------
const PAYME_API = PAYME_IS_TEST ? 'https://test.payme.uz/api' : 'https://checkout.payme.uz/api'

export async function createPaymeReceipt(params: {
  amount: number
  orderId: string
  description: string
  returnUrl?: string
}): Promise<{ receiptId: string; paymentUrl: string }> {
  const result = await jsonRpcRequest(PAYME_API, 'receipts.create', {
    amount: params.amount,
    account: { order_id: params.orderId },
    description: params.description,
  }) as { receipt: { _id: string } }

  const receiptId = (result as any).receipt._id
  const baseUrl = PAYME_IS_TEST ? 'https://test.payme.uz' : 'https://checkout.payme.uz'
  let paymentUrl = `${baseUrl}/m/${receiptId}`

  if (params.returnUrl) {
    paymentUrl += `?redirect=${encodeURIComponent(params.returnUrl)}`
  }

  return { receiptId, paymentUrl }
}

export async function checkPaymeReceipt(receiptId: string): Promise<{ state: number; paid: boolean }> {
  const result = await jsonRpcRequest(PAYME_API, 'receipts.check', {
    receipt_id: receiptId,
  }, { username: PAYME_ID, password: PAYME_KEY }) as { state: number }

  const state = (result as any).state
  return { state, paid: state === 2 }
}

export async function cancelPaymeReceipt(receiptId: string): Promise<void> {
  await jsonRpcRequest(PAYME_API, 'receipts.cancel', {
    receipt_id: receiptId,
    reason: 1,
  }, { username: PAYME_ID, password: PAYME_KEY })
}

export async function getPaymeReceipt(receiptId: string): Promise<Record<string, unknown>> {
  const result = await jsonRpcRequest(PAYME_API, 'receipts.get', {
    receipt_id: receiptId,
  }, { username: PAYME_ID, password: PAYME_KEY })
  return result as Record<string, unknown>
}

export function generatePaymePayLink(params: {
  id: string
  amount: number
  returnUrl?: string
}): string {
  const baseUrl = PAYME_IS_TEST ? 'https://test.payme.uz' : 'https://checkout.payme.uz'
  let url = `${baseUrl}/m/${PAYME_ID}?a=${params.amount}&ac[order_id]=${params.id}`
  if (params.returnUrl) {
    url += `&r=${encodeURIComponent(params.returnUrl)}`
  }
  return url
}

// ---------------------------------------------------------------------------
// Click API
// ---------------------------------------------------------------------------
const CLICK_API = CLICK_IS_TEST ? 'https://api.test.click.uz/v2' : 'https://api.click.uz/v2'

function clickRequest(path: string, body: Record<string, unknown>): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const fullBody = JSON.stringify({
      ...body,
      service_id: CLICK_SERVICE_ID,
      merchant_id: CLICK_MERCHANT_ID,
      secret_key: CLICK_SECRET_KEY,
    })
    const urlObj = new URL(`${CLICK_API}${path}`)
    const opts: RequestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(fullBody),
        'Accept': 'application/json',
      },
      rejectUnauthorized: true,
    }
    const req = httpsRequest(opts, (res) => {
      let data = ''
      res.on('data', (chunk) => { data += chunk })
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data)
          if (parsed.error || parsed.error_code) {
            reject(new Error(`Click API error: ${parsed.error_note || parsed.error || JSON.stringify(parsed)}`))
          } else {
            resolve(parsed)
          }
        } catch (e) {
          reject(new Error(`Click API parse error: ${data}`))
        }
      })
    })
    req.on('error', reject)
    req.write(fullBody)
    req.end()
  })
}

export async function createClickInvoice(params: {
  amount: number
  transactionId: string
  description: string
  returnUrl?: string
}): Promise<{ invoiceId: string; paymentUrl: string }> {
  const result = await clickRequest('/merchant/invoice/create', {
    transaction_parameter: params.transactionId,
    amount: params.amount,
    description: params.description,
  }) as { invoice_id: string }

  const invoiceId = (result as any).invoice_id
  const baseUrl = CLICK_IS_TEST ? 'https://test.click.uz' : 'https://my.click.uz'
  let paymentUrl = `${baseUrl}/services/pay?service_id=${CLICK_SERVICE_ID}&merchant_id=${CLICK_MERCHANT_ID}&amount=${params.amount}&transaction_id=${params.transactionId}`
  if (params.returnUrl) {
    paymentUrl += `&return_url=${encodeURIComponent(params.returnUrl)}`
  }

  return { invoiceId, paymentUrl }
}

export async function checkClickInvoice(invoiceId: string): Promise<{ status: number; paid: boolean }> {
  const result = await clickRequest('/merchant/invoice/status', {
    invoice_id: invoiceId,
  }) as { status: number }

  const status = (result as any).status
  return { status, paid: status === 2 }
}

export function generateClickPayLink(params: {
  transactionId: string
  amount: number
  returnUrl?: string
}): string {
  const baseUrl = CLICK_IS_TEST ? 'https://test.click.uz' : 'https://my.click.uz'
  let url = `${baseUrl}/services/pay?service_id=${CLICK_SERVICE_ID}&merchant_id=${CLICK_MERCHANT_ID}&amount=${params.amount}&transaction_id=${params.transactionId}`
  if (params.returnUrl) {
    url += `&return_url=${encodeURIComponent(params.returnUrl)}`
  }
  return url
}

// ---------------------------------------------------------------------------
// Transaction persistence
// ---------------------------------------------------------------------------
export function createTransaction(txn: Omit<PaymentTransaction, 'id' | 'createdAt' | 'updatedAt' | 'status'>): PaymentTransaction {
  const txns = loadTransactions()
  const newTx: PaymentTransaction = {
    ...txn,
    id: randomUUID(),
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  txns.push(newTx)
  saveTransactions(txns)
  return newTx
}

export function getTransaction(txId: string): PaymentTransaction | undefined {
  const txns = loadTransactions()
  return txns.find(t => t.id === txId)
}

export function updateTransactionStatus(txId: string, status: PaymentTransaction['status']): PaymentTransaction | undefined {
  const txns = loadTransactions()
  const idx = txns.findIndex(t => t.id === txId)
  if (idx === -1) return undefined
  txns[idx].status = status
  txns[idx].updatedAt = new Date().toISOString()
  saveTransactions(txns)
  return txns[idx]
}

// ---------------------------------------------------------------------------
// High-level helpers
// ---------------------------------------------------------------------------
export async function createPaymeTransaction(params: {
  amount: number
  description: string
  returnUrl: string
}): Promise<{ transactionId: string; paymentUrl: string }> {
  const txId = randomUUID()
  let paymentUrl: string

  if (PAYME_ID && PAYME_KEY) {
    const receipt = await createPaymeReceipt({
      amount: params.amount,
      orderId: txId,
      description: params.description,
      returnUrl: params.returnUrl,
    })
    paymentUrl = receipt.paymentUrl
  } else {
    paymentUrl = generatePaymePayLink({
      id: txId,
      amount: params.amount,
      returnUrl: params.returnUrl,
    })
  }

  return { transactionId: txId, paymentUrl }
}

export async function createClickTransaction(params: {
  amount: number
  description: string
  returnUrl: string
}): Promise<{ transactionId: string; paymentUrl: string }> {
  const txId = randomUUID()
  let paymentUrl: string

  if (CLICK_SERVICE_ID && CLICK_MERCHANT_ID) {
    const invoice = await createClickInvoice({
      amount: params.amount,
      transactionId: txId,
      description: params.description,
      returnUrl: params.returnUrl,
    })
    paymentUrl = invoice.paymentUrl
  } else {
    paymentUrl = generateClickPayLink({
      transactionId: txId,
      amount: params.amount,
      returnUrl: params.returnUrl,
    })
  }

  return { transactionId: txId, paymentUrl }
}

export function openPaymentUrl(url: string): void {
  shell.openExternal(url)
}

export function cleanup(): void {
  // nothing to clean up currently
}
