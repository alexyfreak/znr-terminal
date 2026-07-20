import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, CreditCard, Smartphone, Check, X, ExternalLink, Loader2 } from 'lucide-react'
import { useCreditsStore, formatPrice, type Tier, type BillingPeriod } from '@renderer/store/useCreditsStore'

type PaymentMethod = 'payme' | 'click'

interface PaymentCheckoutProps {
  type: 'credit_pack' | 'subscription'
  onClose: () => void
  onSuccess: () => void
  credits?: number
  priceUzs?: number
  tier?: Tier
  billing?: BillingPeriod
}

export const PaymentCheckout = ({ type, onClose, onSuccess, credits, priceUzs = 0, tier, billing }: PaymentCheckoutProps) => {
  const { t } = useTranslation()
  const { topUp, upgrade, balance } = useCreditsStore()
  const [method, setMethod] = useState<PaymentMethod | null>(null)
  const [step, setStep] = useState<'select' | 'paying' | 'success' | 'error'>('select')
  const [paymentUrl, setPaymentUrl] = useState<string>('')
  const [externalId, setExternalId] = useState<string>('')
  const [confirming, setConfirming] = useState(false)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [])

  const applyCredits = () => {
    if (type === 'credit_pack' && credits) {
      topUp(credits)
    } else if (type === 'subscription' && tier && billing) {
      upgrade(tier, billing, tier === 'enterprise' ? 100 : 1)
    }
  }

  const handlePay = async (selectedMethod: PaymentMethod) => {
    setMethod(selectedMethod)
    setStep('paying')

    try {
      if (window.electronAPI?.createPaymentTransaction) {
        const desc = type === 'credit_pack'
          ? `${credits} credits`
          : `${tier} ${billing}`
        const result = await window.electronAPI.createPaymentTransaction({
          type,
          amount: priceUzs,
          method: selectedMethod,
          description: desc,
          credits,
          tier,
          billing,
        })
        if (result.success && result.data) {
          const data = result.data as { transactionId: string; paymentUrl: string; externalId?: string }
          const url = data.paymentUrl
          setPaymentUrl(url)
          setExternalId(data.externalId || data.transactionId)
          if (url && window.electronAPI?.openPaymentUrl) {
            window.electronAPI.openPaymentUrl(url)
          }
        }
      }
    } catch {
      setStep('error')
    }
  }

  const confirmAndFinish = () => {
    applyCredits()
    setStep('success')
    setTimeout(() => {
      onSuccess()
      onClose()
    }, 2000)
  }

  const handleConfirmPayment = async () => {
    setConfirming(true)
    try {
      confirmAndFinish()
    } catch {
      setStep('error')
    } finally {
      setConfirming(false)
    }
  }

  const handleRetry = () => {
    setStep('select')
    setMethod(null)
    setPaymentUrl('')
  }

  const handleOpenPayment = () => {
    if (paymentUrl && window.electronAPI?.openPaymentUrl) {
      window.electronAPI.openPaymentUrl(paymentUrl)
    }
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-zn-page overflow-y-auto">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-zn-border shrink-0">
        {step === 'select' && (
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-full text-zn-text-muted hover:text-zn-text hover:bg-zn-elevated transition-all active:scale-90"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
          </button>
        )}
        <div className="flex-1" />
        <span className="label-uppercase tracking-[0.25em] text-zn-text-muted">
          {type === 'subscription' ? t('pricing.title') : t('buyCredits.title')}
        </span>
        <div className="flex-1" />
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-8">
        <AnimatePresence mode="wait">
          {step === 'select' && (
            <motion.div
              key="select"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="w-full max-w-sm"
            >
              <div className="text-center mb-8">
                <h1 className="text-xl font-medium text-zn-text mb-1">
                  {type === 'credit_pack' ? t('buyCredits.heading') : t('pricing.heading')}
                </h1>
                <p className="text-sm text-zn-text-muted">
                  {type === 'credit_pack'
                    ? t('paymentCheckout.selectMethod', { amount: formatPrice(priceUzs, 'uzs'), credits })
                    : t('paymentCheckout.selectSubMethod', { tier: tier === 'pro' ? t('pricing.tier_pro') : t('pricing.tier_enterprise'), amount: formatPrice(priceUzs, 'uzs') })}
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => handlePay('payme')}
                  className="w-full flex items-center gap-4 p-4 rounded-zn-modal border border-zn-border bg-zn-surface hover:border-zn-text/20 transition-all active:scale-[0.99]"
                >
                  <div className="w-11 h-11 rounded-xl bg-[#00BFA5]/10 flex items-center justify-center shrink-0">
                    <CreditCard className="h-5 w-5 text-[#00BFA5]" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-zn-text">Payme</p>
                    <p className="text-[11px] text-zn-text-muted">{t('paymentCheckout.paymeDesc')}</p>
                  </div>
                </button>

                <button
                  onClick={() => handlePay('click')}
                  className="w-full flex items-center gap-4 p-4 rounded-zn-modal border border-zn-border bg-zn-surface hover:border-zn-text/20 transition-all active:scale-[0.99]"
                >
                  <div className="w-11 h-11 rounded-xl bg-[#E8482C]/10 flex items-center justify-center shrink-0">
                    <Smartphone className="h-5 w-5 text-[#E8482C]" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-zn-text">Click</p>
                    <p className="text-[11px] text-zn-text-muted">{t('paymentCheckout.clickDesc')}</p>
                  </div>
                </button>
              </div>
            </motion.div>
          )}

          {step === 'paying' && (
            <motion.div
              key="paying"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm"
            >
              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-2xl bg-zn-elevated flex items-center justify-center mx-auto mb-4">
                  {method === 'payme' ? (
                    <CreditCard className="h-6 w-6 text-[#00BFA5]" strokeWidth={1.5} />
                  ) : (
                    <Smartphone className="h-6 w-6 text-[#E8482C]" strokeWidth={1.5} />
                  )}
                </div>
                <h2 className="text-lg font-medium text-zn-text mb-1">
                  {t('paymentCheckout.payWith')} {method === 'payme' ? 'Payme' : 'Click'}
                </h2>
                <p className="text-sm text-zn-text-muted">
                  {t('paymentCheckout.amountToPay', { amount: formatPrice(priceUzs, 'uzs') })}
                </p>
              </div>

              <div className="space-y-3 mb-6">
                <button
                  onClick={handleOpenPayment}
                  className="w-full flex items-center justify-center gap-2 py-3 text-sm font-medium rounded-zn-btn bg-zn-text text-zn-page hover:opacity-90 transition-all active:scale-[0.98]"
                >
                  <ExternalLink className="h-4 w-4" strokeWidth={1.5} />
                  {t('paymentCheckout.openPaymentPage')}
                </button>

                <button
                  onClick={handleConfirmPayment}
                  disabled={confirming}
                  className="w-full flex items-center justify-center gap-2 py-3 text-sm font-medium rounded-zn-btn bg-green-600 text-white hover:bg-green-500 transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  {confirming ? (
                    <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
                  ) : (
                    <Check className="h-4 w-4" strokeWidth={1.5} />
                  )}
                  {t('paymentCheckout.confirmPaid')}
                </button>
              </div>

              <div className="p-4 rounded-zn-modal bg-zn-elevated border border-zn-border">
                <p className="text-[11px] font-medium text-zn-text-muted mb-2">{t('paymentCheckout.howToPay')}</p>
                <ol className="space-y-1.5 text-[10px] text-zn-text-faint list-decimal list-inside">
                  <li>{t('paymentCheckout.step1')}</li>
                  <li>{t('paymentCheckout.step2')}</li>
                  <li>{t('paymentCheckout.step3')}</li>
                </ol>
              </div>

              {externalId && (
                <p className="text-[10px] text-zn-text-faint/60 text-center mt-3">
                  {method === 'payme' ? 'Receipt' : 'Invoice'} ID: {externalId}
                </p>
              )}

              <button
                onClick={handleRetry}
                className="mt-6 w-full text-xs text-zn-text-muted hover:text-zn-text underline"
              >
                {t('paymentCheckout.cancel')}
              </button>
            </motion.div>
          )}

          {step === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                <Check className="h-7 w-7 text-green-500" strokeWidth={2} />
              </div>
              <h2 className="text-lg font-medium text-zn-text mb-1">{t('paymentCheckout.successTitle')}</h2>
              <p className="text-sm text-zn-text-muted">
                {type === 'credit_pack'
                  ? t('paymentCheckout.creditsAdded', { credits, balance: balance + (credits || 0) })
                  : t('paymentCheckout.subUpgraded', { tier: tier === 'pro' ? t('pricing.tier_pro') : t('pricing.tier_enterprise') })}
              </p>
            </motion.div>
          )}

          {step === 'error' && (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                <X className="h-7 w-7 text-red-500" strokeWidth={2} />
              </div>
              <h2 className="text-lg font-medium text-zn-text mb-1">{t('paymentCheckout.errorTitle')}</h2>
              <p className="text-sm text-zn-text-muted mb-6">{t('paymentCheckout.errorDesc')}</p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={handleRetry}
                  className="px-4 py-2 text-sm font-medium rounded-zn-btn bg-zn-text text-zn-page hover:opacity-90 transition-all"
                >
                  {t('paymentCheckout.retry')}
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium rounded-zn-btn bg-zn-elevated text-zn-text-muted hover:text-zn-text border border-zn-border transition-all"
                >
                  {t('common.cancel')}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
