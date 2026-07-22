import 'dotenv/config'
import { Telegraf, Markup } from 'telegraf'
import { createClient } from '@supabase/supabase-js'
import { createServer } from 'http'

const BOT_TOKEN = process.env.BOT_TOKEN
const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY
const WEBAPP_URL = process.env.WEBAPP_URL || 'http://localhost:5173'
const PORT = parseInt(process.env.PORT || '3001', 10)

if (!BOT_TOKEN) {
  console.error('BOT_TOKEN not set')
  process.exit(1)
}

const bot = new Telegraf(BOT_TOKEN)
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

bot.start(async (ctx) => {
  const tgUser = ctx.from

  const { data: existing } = await supabase
    .from('users')
    .select('id, role, full_name')
    .eq('telegram_id', tgUser.id)
    .maybeSingle()

  const webAppUrl = existing
    ? `${WEBAPP_URL}?tg_id=${tgUser.id}&role=${existing.role}`
    : `${WEBAPP_URL}?tg_id=${tgUser.id}`

  await ctx.reply(
    `Assalomu alaykum, ${tgUser.first_name}!\n\nZunoora — maktab hujjat yordamchisi.\nOta-ona yoki Sinf Rahbar sifatida kirish uchun tugmani bosing.`,
    Markup.inlineKeyboard([
      Markup.button.webApp('Zunoora WebApp', webAppUrl),
    ]),
  )
})

async function sendNotification(chatId, text) {
  try {
    await bot.telegram.sendMessage(chatId, text, {
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    })
  } catch (err) {
    console.error(`Failed to send to ${chatId}:`, err.description || err.message)
  }
}

async function notifyArizaStatus(arizaId, status, rejectionReason) {
  const { data: ariza, error: arizaErr } = await supabase
    .from('ariza_requests')
    .select('*, children(full_name), users!parent_id(telegram_id, full_name)')
    .eq('id', arizaId)
    .single()

  if (arizaErr || !ariza) {
    console.error('Ariza not found:', arizaId, arizaErr)
    return
  }

  const parentTgId = ariza.users?.telegram_id
  if (!parentTgId) {
    console.error('Parent telegram_id not found')
    return
  }

  const statusEmoji = status === 'approved' ? '\u2705' : '\u274C'
  const statusText = status === 'approved' ? 'Tasdiqlandi' : 'Rad etildi'
  let text = `${statusEmoji} <b>Ariza ${statusText}</b>\n\n`
  text += `Talaba: ${ariza.children?.full_name || 'Noma\'lum'}\n`
  text += `Sana: ${ariza.date_from} \u2192 ${ariza.date_to}\n`
  text += `Sabab: ${ariza.reason_text}\n`

  if (status === 'rejected' && rejectionReason) {
    text += `\nRad etish sababi: ${rejectionReason}`
  }

  text += `\n\nZunoora WebApp orqali ko'ring: ${WEBAPP_URL}`

  await sendNotification(parentTgId, text)
}

async function notifyBildirgi(bildirgiId) {
  const { data: bildirgi, error: bErr } = await supabase
    .from('bildirgi_records')
    .select('*, children!student_id(full_name, parent_id), users!teacher_id(full_name)')
    .eq('id', bildirgiId)
    .single()

  if (bErr || !bildirgi) {
    console.error('Bildirgi not found:', bildirgiId, bErr)
    return
  }

  const { data: parent } = await supabase
    .from('users')
    .select('telegram_id')
    .eq('id', bildirgi.children?.parent_id)
    .single()

  if (!parent?.telegram_id) {
    console.error('Parent telegram_id not found')
    return
  }

  const typeEmoji = bildirgi.type === 'praise' ? '\uD83C\uDFC6' : '\u26A0\uFE0F'
  const typeLabel = bildirgi.type === 'praise' ? 'Maqtov' : 'Xabar'

  let text = `${typeEmoji} <b>${typeLabel}</b>\n\n`
  text += `Talaba: ${bildirgi.children?.full_name || 'Noma\'lum'}\n`
  text += `Sarlavha: ${bildirgi.title}\n`

  if (bildirgi.description) {
    text += `Tavsif: ${bildirgi.description}\n`
  }

  text += `O'qituvchi: ${bildirgi.users?.full_name || 'Noma\'lum'}\n`
  text += `\nZunoora WebApp orqali ko'ring: ${WEBAPP_URL}`

  await sendNotification(parent.telegram_id, text)
}

async function findParentTgIdByChildId(childId) {
  const { data: child } = await supabase
    .from('children')
    .select('parent_id')
    .eq('id', childId)
    .single()

  if (!child) return null

  const { data: parent } = await supabase
    .from('users')
    .select('telegram_id')
    .eq('id', child.parent_id)
    .single()

  return parent?.telegram_id || null
}

bot.telegram.setMyCommands([
  { command: 'start', description: 'Zunoora WebApp ochish' },
])

console.log('Zunoora bot polling...')
bot.launch()

const server = createServer(async (req, res) => {
  res.setHeader('Content-Type', 'application/json')

  if (req.method !== 'POST') {
    res.writeHead(200)
    res.end(JSON.stringify({ ok: true, message: 'Zunoora Bot running' }))
    return
  }

  let body = ''
  for await (const chunk of req) body += chunk

  let payload
  try { payload = JSON.parse(body) } catch {
    res.writeHead(400)
    res.end(JSON.stringify({ ok: false, error: 'Invalid JSON' }))
    return
  }

  try {
    switch (req.url) {
      case '/notify-ariza': {
        await notifyArizaStatus(payload.arizaId, payload.status, payload.rejectionReason)
        res.writeHead(200)
        res.end(JSON.stringify({ ok: true }))
        break
      }
      case '/notify-bildirgi': {
        await notifyBildirgi(payload.bildirgiId)
        res.writeHead(200)
        res.end(JSON.stringify({ ok: true }))
        break
      }
      default:
        res.writeHead(404)
        res.end(JSON.stringify({ ok: false, error: 'Not found' }))
    }
  } catch (err) {
    console.error('Notification error:', err)
    res.writeHead(500)
    res.end(JSON.stringify({ ok: false, error: err.message }))
  }
})

server.listen(PORT, () => {
  console.log(`Notification server on :${PORT}`)
})

process.once('SIGINT', () => { bot.stop('SIGINT'); server.close() })
process.once('SIGTERM', () => { bot.stop('SIGTERM'); server.close() })

export { notifyArizaStatus, notifyBildirgi, findParentTgIdByChildId }
