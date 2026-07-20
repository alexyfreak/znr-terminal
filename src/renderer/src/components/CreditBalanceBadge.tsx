import { useTranslation } from 'react-i18next'
import { Diamond, Zap } from 'lucide-react'
import { useCreditsStore, type Tier } from '@renderer/store/useCreditsStore'

const tierLabels: Record<Tier, string> = {
  free: 'Free',
  pro: 'Pro',
  enterprise: 'Enterprise',
}

export const CreditBalanceBadge = ({ onUpgrade }: { onUpgrade?: () => void }) => {
  const { t } = useTranslation()
  const balance = useCreditsStore((s) => s.balance)
  const tier = useCreditsStore((s) => s.tier)

  return (
    <button
      onClick={onUpgrade}
      className="flex items-center gap-2 rounded-zn-btn px-2.5 py-1.5 text-[11px] transition-all hover:bg-zn-elevated active:scale-[0.98] w-full"
    >
      <Diamond className={`h-3.5 w-3.5 shrink-0 ${tier !== 'free' ? 'text-yellow-400' : 'text-zn-text-faint'}`} strokeWidth={1.5} />
      <span className="flex-1 text-left">
        <span className="text-zn-text font-medium">{balance}</span>
        <span className="text-zn-text-muted ml-1">{t('credits.credits')}</span>
      </span>
      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
        tier !== 'free' ? 'bg-yellow-400/10 text-yellow-400' : 'bg-zn-elevated text-zn-text-faint'
      }`}>
        {tier === 'free' ? t('credits.free') : tierLabels[tier]}
      </span>
    </button>
  )
}

export const CreditIcon = ({ credits }: { credits: number }) => (
  <span className="inline-flex items-center gap-0.5 text-[10px] text-zn-text-muted">
    <Zap className="h-2.5 w-2.5" strokeWidth={2} />
    {credits}
  </span>
)
