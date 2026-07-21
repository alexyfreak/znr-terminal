import { motion, AnimatePresence } from 'framer-motion'
import { X, Bug, Send, CheckCircle, AlertCircle, Loader2, Terminal, ThumbsUp } from 'lucide-react'
import { useBugReportStore } from '@renderer/store/useBugReportStore'
import { useEffect, useRef } from 'react'
import { useFocusTrap } from '@renderer/hooks/useFocusTrap'
import { useTranslation } from 'react-i18next'

export const BugReportModal = () => {
  const { t } = useTranslation()
  const {
    isOpen, close, mode, stackTrace, description, setDescription,
    submit, submitting, submitted, submitError,
  } = useBugReportStore()

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const trapRef = useFocusTrap(isOpen)

  useEffect(() => {
    if (isOpen && mode === 'manual') {
      setTimeout(() => textareaRef.current?.focus(), 100)
    }
  }, [isOpen, mode])

  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, close])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-zn-page/60 backdrop-blur-sm"
          onClick={close}
        >
          <motion.div
            ref={trapRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="bug-report-title"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg mx-4 rounded-zn-modal overflow-hidden outline-none bg-zn-surface"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-zn-border">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-zn-elevated">
                  <Bug className="h-4 w-4 text-zn-text" strokeWidth={1.5} />
                </div>
                <div>
                  <h2 id="bug-report-title" className="text-sm font-medium text-zn-text">{t('bugReport.title')}</h2>
                  <p className="text-[10px] text-zn-text-muted">
                    {mode === 'auto' ? t('bugReport.autoDetected') : t('bugReport.helpImprove')}
                  </p>
                </div>
              </div>
              <button
                onClick={close}
                aria-label="Close"
                className="grid h-7 w-7 place-items-center rounded-full text-zn-text-muted hover:text-zn-text hover:bg-zn-elevated transition-all active:scale-90"
              >
                <X className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </div>

            <div className="px-5 py-4 space-y-4">
              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className="flex flex-col items-center gap-4 py-10"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.15, type: 'spring', stiffness: 200, damping: 15 }}
                    className="w-16 h-16 rounded-full flex items-center justify-center bg-zn-success-bg"
                  >
                    <ThumbsUp className="h-8 w-8 text-zn-success-accent" strokeWidth={1.5} />
                  </motion.div>
                  <motion.p
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-base font-semibold text-zn-text"
                  >
                    {t('bugReport.sent')}
                  </motion.p>
                  <motion.p
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-xs text-center text-zn-text-muted max-w-xs"
                  >
                    {t('bugReport.thanks')}
                  </motion.p>
                  <motion.button
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    onClick={close}
                    className="mt-2 px-8 py-2.5 text-sm font-medium rounded-zn-btn transition-all active:scale-[0.98] text-zn-page bg-zn-text hover:opacity-90"
                  >
                    {t('bugReport.done')}
                  </motion.button>
                </motion.div>
              ) : (
                <>
                  {mode === 'auto' && stackTrace && (
                    <div>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Terminal className="h-3 w-3 text-zn-text-muted" strokeWidth={1.5} />
                        <span className="text-[10px] font-medium tracking-wider text-zn-text-muted uppercase">{t('bugReport.exceptionTrace')}</span>
                      </div>
                      <pre className="text-[11px] leading-relaxed p-3 rounded-zn-alert overflow-auto font-mono bg-zn-elevated text-zn-text-muted border border-zn-border" style={{ maxHeight: 160 }}>
                        <code>{stackTrace}</code>
                      </pre>
                    </div>
                  )}

                  <div>
                    <label className="block text-[10px] font-medium tracking-wider text-zn-text-muted uppercase mb-1.5">
                      {mode === 'auto' ? t('bugReport.whatDoing') : t('bugReport.describeIssue')}
                    </label>
                    <textarea
                      ref={textareaRef}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder={mode === 'auto'
                        ? t('bugReport.autoPlaceholder')
                        : t('bugReport.manualPlaceholder')
                      }
                      rows={4}
                      className="w-full px-3 py-2.5 text-xs rounded-zn-input outline-none resize-none transition-all focus:ring-1 bg-zn-elevated text-zn-text border border-zn-border caret-zn-text placeholder:text-zn-text-faint/50"
                    />
                  </div>

                  {submitError && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      role="alert"
                      aria-live="polite"
                      className="flex items-center gap-2 px-3 py-2 rounded-zn-alert bg-zn-error-bg"
                    >
                      <AlertCircle className="h-3.5 w-3.5 shrink-0 text-zn-error-text" strokeWidth={1.5} />
                      <span className="text-[11px] text-zn-error-text">
                        {t('bugReport.failed')} {submitError}
                      </span>
                    </motion.div>
                  )}

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      onClick={close}
                      className="px-3 py-2 text-xs rounded-zn-btn transition-colors text-zn-text-muted hover:text-zn-text"
                    >
                      {t('bugReport.cancel')}
                    </button>
                    <button
                      onClick={submit}
                      disabled={submitting || !description.trim()}
                      className={`flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-zn-btn transition-all active:scale-[0.98] disabled:opacity-30 ${
                        description.trim()
                          ? 'bg-zn-text text-zn-page hover:opacity-90'
                          : 'bg-zn-elevated text-zn-text-muted'
                      }`}
                    >
                      {submitting ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={1.5} />
                      ) : (
                        <Send className="h-3.5 w-3.5" strokeWidth={1.5} />
                      )}
                      {submitting ? t('bugReport.submitting') : t('bugReport.send')}
                    </button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
