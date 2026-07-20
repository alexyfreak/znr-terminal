import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { ArrowLeft, Zap, Check } from 'lucide-react'
import { useCreditsStore, CREDIT_PACKS, formatPrice, type Currency } from '@renderer/store/useCreditsStore'

const CURRENCIES: { key: Currency; label: string }[] = [
  { key: 'uzs', label: 'UZS' },
  { key: 'usd', label: 'USD' },
  { key: 'rub', label: 'RUB' },
]

interface BuyCreditsPageProps {
  onClose: () => void
  onBuy: (credits: number, priceUzs: number) => void
}

export const BuyCreditsPage = ({ onClose, onBuy }: BuyCreditsPageProps) => {
  const { t } = useTranslation()
  const { balance, topUp } = useCreditsStore()
  const [currency, setCurrency] = useState<Currency>('uzs')
  const [purchasing, setPurchasing] = useState<number | null>(null)
  const [success, setSuccess] = useState<number | null>(null)

  const handlePurchase = (credits: number, priceUzs: number) => {
    setPurchasing(credits)
    setTimeout(() => {
      setPurchasing(null)
      onBuy(credits, priceUzs)
    }, 400)
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
          {t('buyCredits.title')}
        </span>
        <div className="flex-1" />
      </div>

      <div className="flex-1 px-6 py-8 max-w-lg mx-auto w-full">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-gradient-to-br from-yellow-400/20 to-yellow-400/5 border border-yellow-400/10">
            <Zap className="h-6 w-6 text-yellow-400" strokeWidth={1.5} />
          </div>
          <h1 className="text-xl font-medium text-zn-text mb-1">{t('buyCredits.heading')}</h1>
          <p className="text-sm text-zn-text-muted">
            {t('buyCredits.subtitle', { balance })}
          </p>
        </div>

        {/* Currency toggle */}
        <div className="flex justify-center mb-6">
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

        {/* Credit packs */}
        <div className="space-y-3">
          {CREDIT_PACKS.map((pack, index) => {
            const isBuying = purchasing === pack.credits
            const isSuccess = success === pack.credits

            return (
              <motion.div
                key={pack.credits}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="relative"
              >
                <button
                  onClick={() => handlePurchase(pack.credits, pack.priceUzs)}
                  disabled={isBuying || isSuccess}
                  className={`w-full flex items-center gap-4 p-4 rounded-zn-modal border transition-all active:scale-[0.99] disabled:opacity-60 ${
                    isSuccess
                      ? 'border-green-500/30 bg-green-500/5'
                      : 'border-zn-border bg-zn-surface hover:border-zn-text/20'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-zn-elevated flex items-center justify-center">
                    {isSuccess ? (
                      <Check className="h-5 w-5 text-green-500" strokeWidth={2} />
                    ) : (
                      <Zap className="h-5 w-5 text-yellow-400" strokeWidth={1.5} />
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-zn-text">
                      {pack.credits} {t('buyCredits.credits')}
                    </p>
                    <p className="text-[11px] text-zn-text-muted">
                      {formatPrice(pack.priceUzs, currency)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-zn-text">
                      {formatPrice(pack.priceUzs, currency)}
                    </p>
                    <p className="text-[10px] text-zn-text-faint">
                      {formatPrice(Math.round(pack.priceUzs / pack.credits), currency)}/{t('buyCredits.credit')}
                    </p>
                  </div>
                </button>

                {isBuying && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-zn-modal bg-zn-surface/80">
                    <span className="inline-block h-4 w-4 rounded-full border-2 border-zn-text border-t-transparent animate-spin" />
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>

        <p className="text-[11px] text-zn-text-faint/60 text-center mt-6">
          {t('buyCredits.note')}
        </p>
      </div>
    </div>
  )
}
