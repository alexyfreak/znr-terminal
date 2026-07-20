import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { ArrowLeft, Check, Diamond, Users, Sparkles, X } from 'lucide-react'
import {
  useCreditsStore, TIER_PRICES, formatPrice,
  type Currency, type BillingPeriod, type Tier,
} from '@renderer/store/useCreditsStore'

const CURRENCIES: { key: Currency; label: string }[] = [
  { key: 'uzs', label: 'UZS' },
  { key: 'usd', label: 'USD' },
  { key: 'rub', label: 'RUB' },
]

const TIERS: { key: Tier; icon: typeof Diamond; highlight: string }[] = [
  { key: 'free', icon: Diamond, highlight: '' },
  { key: 'pro', icon: Sparkles, highlight: 'ring-2 ring-yellow-400/40 border-yellow-400/20' },
  { key: 'enterprise', icon: Users, highlight: '' },
]

interface PricingPageProps {
  onClose: () => void
  onCheckout?: (tier: Tier, billing: BillingPeriod, priceUzs: number) => void
}

export const PricingPage = ({ onClose, onCheckout }: PricingPageProps) => {
  const { t } = useTranslation()
  const { tier, billing, upgrade } = useCreditsStore()
  const [currency, setCurrency] = useState<Currency>('uzs')
  const [period, setPeriod] = useState<BillingPeriod>(billing)

  const handleUpgrade = (t: Tier, p: BillingPeriod) => {
    if (t === 'free') return
    if (onCheckout) {
      const price = t === 'pro'
        ? (p === 'monthly' ? TIER_PRICES.pro.monthly : TIER_PRICES.pro.annual)
        : (p === 'monthly' ? TIER_PRICES.enterprise.monthly : TIER_PRICES.enterprise.annual)
      onCheckout(t, p, Math.round(price))
    } else {
      upgrade(t, p, t === 'enterprise' ? 100 : 1)
      onClose()
    }
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-zn-page overflow-y-auto">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-zn-border shrink-0">
        <button
          onClick={onClose}
          className="grid h-8 w-8 place-items-center rounded-full text-zn-text-muted hover:text-zn-text hover:bg-zn-elevated transition-all active:scale-90"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
        </button>
        <div className="flex-1" />
        <span className="label-uppercase tracking-[0.25em] text-zn-text-muted">
          {t('pricing.title')}
        </span>
        <div className="flex-1" />
      </div>

      <div className="flex-1 px-6 py-8 max-w-5xl mx-auto w-full">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-medium tracking-tight text-zn-text mb-2">{t('pricing.heading')}</h1>
          <p className="text-sm text-zn-text-muted">{t('pricing.subtitle')}</p>
        </div>

        {/* Currency + Period toggles */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="inline-flex items-center gap-1 rounded-zn-popover bg-zn-elevated border border-zn-border p-0.5">
            {(['monthly', 'annual'] as BillingPeriod[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  period === p ? 'bg-zn-text text-zn-page' : 'text-zn-text-muted hover:text-zn-text'
                }`}
              >
                {t(`pricing.${p}`)}
              </button>
            ))}
          </div>
          <div className="inline-flex items-center gap-1 rounded-zn-popover bg-zn-elevated border border-zn-border p-0.5">
            {CURRENCIES.map((c) => (
              <button
                key={c.key}
                onClick={() => setCurrency(c.key)}
                className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-all ${
                  currency === c.key ? 'bg-zn-text text-zn-page' : 'text-zn-text-muted hover:text-zn-text'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tiers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {TIERS.map(({ key: tk, icon: Icon, highlight }) => {
            const isCurrent = tier === tk
            const price = tk === 'pro'
              ? (period === 'monthly' ? TIER_PRICES.pro.monthly : TIER_PRICES.pro.annual)
              : tk === 'enterprise'
                ? (period === 'monthly' ? TIER_PRICES.enterprise.monthly : TIER_PRICES.enterprise.annual)
                : 0

            return (
              <motion.div
                key={tk}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className={`relative rounded-zn-modal border p-6 flex flex-col transition-all ${
                  highlight || 'border-zn-border bg-zn-surface'
                } ${isCurrent ? 'ring-1 ring-zn-text/10' : ''}`}
              >
                {tk === 'pro' && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-yellow-400 text-black text-[10px] font-semibold tracking-wider uppercase">
                    {t('pricing.popular')}
                  </div>
                )}

                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${
                  tk === 'free' ? 'bg-zn-elevated' : tk === 'pro' ? 'bg-yellow-400/10' : 'bg-zn-elevated'
                }`}>
                  <Icon className={`h-5 w-5 ${
                    tk === 'free' ? 'text-zn-text-muted' : tk === 'pro' ? 'text-yellow-400' : 'text-zn-text'
                  }`} strokeWidth={1.5} />
                </div>

                <h3 className="text-base font-medium text-zn-text mb-1">
                  {t(`pricing.tier_${tk}`)}
                </h3>

                {tk === 'free' ? (
                  <p className="text-2xl font-semibold text-zn-text mb-4">{t('pricing.free')}</p>
                ) : (
                  <div className="mb-4">
                    <p className="text-2xl font-semibold text-zn-text">
                      {formatPrice(period === 'annual' ? price / 12 : price, currency)}
                    </p>
                    <p className="text-[11px] text-zn-text-muted">
                      /{t(`pricing.per_${period}`)}
                      {tk === 'enterprise' && (
                        <span className="ml-1 text-zn-text-faint">{t('pricing.perSeat')}</span>
                      )}
                    </p>
                    {period === 'annual' && tk === 'pro' && (
                      <p className="text-[10px] text-green-500 mt-0.5">{t('pricing.saved5')}</p>
                    )}
                    {period === 'annual' && tk === 'enterprise' && (
                      <p className="text-[10px] text-green-500 mt-0.5">{t('pricing.saved10')}</p>
                    )}
                    {period === 'annual' && (
                      <p className="text-[11px] text-zn-text-muted mt-1">
                        {formatPrice(price, currency)} /{t(`pricing.per_year`)}
                      </p>
                    )}
                  </div>
                )}

                <ul className="flex-1 space-y-2 mb-6">
                  {features(tk, period).map((feat, i) => (
                    <li key={i} className={`flex items-start gap-2 text-xs ${
                      feat.included ? 'text-zn-text' : 'text-zn-text-faint/50'
                    }`}>
                      {feat.included ? (
                        <Check className="h-3 w-3 shrink-0 mt-0.5 text-green-500" strokeWidth={2} />
                      ) : (
                        <X className="h-3 w-3 shrink-0 mt-0.5 text-zn-text-faint/30" strokeWidth={2} />
                      )}
                      {feat.label}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleUpgrade(tk, period)}
                  disabled={tk === 'free' || isCurrent}
                  className={`w-full py-2.5 text-sm font-medium rounded-zn-btn transition-all active:scale-[0.98] disabled:opacity-40 ${
                    isCurrent
                      ? 'bg-zn-elevated text-zn-text-muted border border-zn-border'
                      : tk === 'pro'
                        ? 'bg-yellow-400 text-black hover:bg-yellow-300'
                        : 'bg-zn-text text-zn-page hover:opacity-90'
                  }`}
                >
                  {isCurrent ? t('pricing.current') : t(`pricing.${tk === 'free' ? 'getStarted' : 'subscribe'}`)}
                </button>
              </motion.div>
            )
          })}
        </div>

        {/* Enterprise note */}
        <div className="mt-8 text-center">
          <p className="text-xs text-zn-text-muted">
            {t('pricing.enterpriseNote')}
          </p>
        </div>
      </div>
    </div>
  )
}

function features(tier: Tier, period: BillingPeriod) {
  const all: { label: string; included: boolean }[] = [
    { label: '10 credits / month', included: tier === 'free' },
    { label: '100 credits / month', included: tier !== 'free' },
    { label: 'Document generation', included: tier !== 'free' },
    { label: 'Marketplace access', included: tier !== 'free' },
    { label: 'Blank editor', included: tier !== 'free' },
    { label: 'AI text helper', included: tier !== 'free' },
    { label: 'Priority support', included: tier !== 'free' },
    { label: '5% annual discount', included: tier !== 'free' && period === 'annual' },
    { label: '10% discount (100+ seats)', included: tier === 'enterprise' && period === 'annual' },
  ]
  return all
}
