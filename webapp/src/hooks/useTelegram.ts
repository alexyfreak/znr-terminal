import { useEffect, useState } from 'react'

declare global {
  interface Window {
    Telegram?: {
      WebApp?: TelegramWebApp
    }
  }
}

interface TelegramWebAppUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
  language_code?: string
}

interface TelegramWebApp {
  initData: string
  initDataUnsafe: {
    query_id?: string
    user?: TelegramWebAppUser
    auth_date?: string
    hash?: string
  }
  ready: () => void
  expand: () => void
  close: () => void
  MainButton: {
    text: string
    color: string
    textColor: string
    isVisible: boolean
    isActive: boolean
    show: () => void
    hide: () => void
    enable: () => void
    disable: () => void
  }
  HapticFeedback: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy') => void
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void
  }
  colorScheme: 'light' | 'dark'
  themeParams: {
    bg_color?: string
    text_color?: string
    hint_color?: string
    link_color?: string
    button_color?: string
    button_text_color?: string
  }
  isExpanded: boolean
  viewportHeight: number
  viewportStableHeight: number
  setHeaderColor: (color: string) => void
  setBackgroundColor: (color: string) => void
  onEvent: (event: string, cb: () => void) => void
  offEvent: (event: string, cb: () => void) => void
  version: string
}

export interface TelegramUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
}

export function useTelegram() {
  const [user, setUser] = useState<TelegramUser | null>(null)
  const [ready, setReady] = useState(false)
  const [tg, setTg] = useState<TelegramWebApp | null>(null)

  useEffect(() => {
    const webapp = window.Telegram?.WebApp
    if (!webapp) return

    setTg(webapp)
    webapp.ready()
    webapp.expand()
    webapp.setHeaderColor('#0A0A0A')
    webapp.setBackgroundColor('#0A0A0A')

    const raw = webapp.initDataUnsafe?.user
    if (raw) {
      setUser({
        id: raw.id,
        first_name: raw.first_name,
        last_name: raw.last_name,
        username: raw.username,
      })
    }
    setReady(true)
  }, [])

  const haptic = (style: 'light' | 'medium' | 'heavy' = 'medium') => {
    tg?.HapticFeedback.impactOccurred(style)
  }

  const notify = (type: 'error' | 'success' | 'warning' = 'success') => {
    tg?.HapticFeedback.notificationOccurred(type)
  }

  return { tg, user, ready, haptic, notify }
}
