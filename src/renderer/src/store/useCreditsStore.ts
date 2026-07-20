import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type Tier = 'free' | 'pro' | 'enterprise'
export type BillingPeriod = 'monthly' | 'annual'
export type Currency = 'uzs' | 'usd' | 'rub'

interface CreditsState {
  balance: number
  tier: Tier
  billing: BillingPeriod
  seatCount: number
  nextResetDate: string

  spendCredits: (amount: number) => boolean
  topUp: (amount: number) => void
  resetMonthly: () => void
  upgrade: (tier: Tier, billing: BillingPeriod, seatCount?: number) => void
  downgrade: () => void
  setBilling: (billing: BillingPeriod) => void
  canCreateDocument: () => boolean
}

function getNextMonthDate(): string {
  const d = new Date()
  d.setMonth(d.getMonth() + 1)
  return d.toISOString()
}

function getMonthlyCredits(tier: Tier): number {
  if (tier === 'free') return 10
  if (tier === 'pro') return 100
  return 100
}

export const CREDIT_PACKS: { credits: number; priceUzs: number }[] = [
  { credits: 100, priceUzs: 20000 },
  { credits: 500, priceUzs: 90000 },
  { credits: 1000, priceUzs: 160000 },
]

export const TIER_PRICES = {
  pro: { monthly: 35000, annual: 35000 * 12 * 0.95 },
  enterprise: { monthly: 35000, annual: 35000 * 12 * 0.90 },
}

export const CURRENCY_RATES: Record<Currency, number> = {
  uzs: 1,
  usd: 1 / 12800,
  rub: 1 / 140,
}

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  uzs: 'UZS',
  usd: '$',
  rub: '₽',
}

export function formatPrice(priceUzs: number, currency: Currency): string {
  const rate = CURRENCY_RATES[currency]
  const converted = priceUzs * rate
  if (currency === 'uzs') {
    return `${Math.round(converted).toLocaleString()} UZS`
  }
  if (currency === 'usd') {
    return `$${converted.toFixed(2)}`
  }
  return `${Math.round(converted).toLocaleString()} ₽`
}

export const useCreditsStore = create<CreditsState>()(
  persist(
    (set, get) => ({
      balance: 10,
      tier: 'free',
      billing: 'monthly',
      seatCount: 1,
      nextResetDate: getNextMonthDate(),

      spendCredits: (amount) => {
        const { balance } = get()
        if (balance < amount) return false
        set({ balance: balance - amount })
        return true
      },

      topUp: (amount) => set((s) => ({ balance: s.balance + amount })),

      resetMonthly: () => {
        const { tier } = get()
        set({ balance: getMonthlyCredits(tier), nextResetDate: getNextMonthDate() })
      },

      upgrade: (tier, billing, seatCount = 1) => {
        set({ tier, billing, seatCount, balance: getMonthlyCredits(tier), nextResetDate: getNextMonthDate() })
      },

      downgrade: () => {
        set({ tier: 'free', billing: 'monthly', seatCount: 1, balance: 10, nextResetDate: getNextMonthDate() })
      },

      setBilling: (billing) => set({ billing }),

      canCreateDocument: () => {
        const { balance, tier } = get()
        if (tier === 'free' && balance <= 10) {
          return balance > 10
        }
        return balance >= 1
      },
    }),
    {
      name: 'zunoora-credits',
      storage: createJSONStorage(() => localStorage),
    },
  ),
)
