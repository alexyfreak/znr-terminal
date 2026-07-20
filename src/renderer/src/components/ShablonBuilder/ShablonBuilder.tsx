import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Send } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useShablonBuilderStore } from '@renderer/store/useShablonBuilderStore'
import { BuilderStepMetadata } from './BuilderStepMetadata'
import { BuilderStepFields } from './BuilderStepFields'
import { BuilderStepTemplate } from './BuilderStepTemplate'

const STEP_LABELS = ['shablonBuilder.stepMetadata', 'shablonBuilder.stepFields', 'shablonBuilder.stepTemplate']

export const ShablonBuilder = () => {
  const { t } = useTranslation()
  const { wizardStep, setWizardStep, draft, updateDraft, resetDraft, saveDraft, saveShablon, saving } = useShablonBuilderStore()

  const debounceRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => saveDraft(), 800)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [draft, saveDraft])

  const canProceed = () => {
    if (wizardStep === 0) return draft.label && draft.label.trim().length > 0
    return true
  }

  const handleNext = () => {
    if (wizardStep < 2) setWizardStep((wizardStep + 1) as 0 | 1 | 2 | 3)
  }

  const handleBack = () => {
    if (wizardStep > 0) setWizardStep((wizardStep - 1) as 0 | 1 | 2 | 3)
  }

  const handleSave = async () => {
    const result = await saveShablon()
    if (result) {
      resetDraft()
    }
  }

  const isTemplateStep = wizardStep === 2

  return (
    <div className="flex flex-col" style={{ height: isTemplateStep ? '100%' : undefined }}>
      {/* Step indicator */}
      {!isTemplateStep && (
        <div className="flex items-center gap-2 mb-6 px-5 pt-5">
          {STEP_LABELS.map((key, i) => (
            <div key={key} className="flex items-center gap-2">
              <button
                onClick={() => i <= wizardStep + 1 && setWizardStep(i as 0 | 1 | 2 | 3)}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-zn-btn transition-all ${
                  i <= wizardStep
                    ? 'bg-zn-elevated text-zn-text'
                    : i === wizardStep + 1
                    ? 'text-zn-text-muted hover:text-zn-text cursor-pointer'
                    : 'text-zn-text-faint/40 cursor-not-allowed'
                }`}
              >
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${
                  i <= wizardStep ? 'bg-zn-text text-zn-page' : 'bg-zn-border text-zn-text-muted'
                }`}>
                  {i + 1}
                </span>
                {t(key)}
              </button>
              {i < STEP_LABELS.length - 1 && (
                <div className={`w-6 h-px ${i < wizardStep ? 'bg-zn-text/30' : 'bg-zn-border'}`} />
              )}
            </div>
          ))}
        </div>
      )}

      {isTemplateStep && (
        <div className="flex items-center gap-2 px-5 py-3 border-b border-zn-border shrink-0">
          {STEP_LABELS.map((key, i) => (
            <div key={key} className="flex items-center gap-2">
              <button
                onClick={() => i <= wizardStep + 1 && setWizardStep(i as 0 | 1 | 2 | 3)}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-zn-btn transition-all ${
                  i <= wizardStep
                    ? 'bg-zn-elevated text-zn-text'
                    : i === wizardStep + 1
                    ? 'text-zn-text-muted hover:text-zn-text cursor-pointer'
                    : 'text-zn-text-faint/40 cursor-not-allowed'
                }`}
              >
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${
                  i <= wizardStep ? 'bg-zn-text text-zn-page' : 'bg-zn-border text-zn-text-muted'
                }`}>
                  {i + 1}
                </span>
                {t(key)}
              </button>
              {i < STEP_LABELS.length - 1 && (
                <div className={`w-6 h-px ${i < wizardStep ? 'bg-zn-text/30' : 'bg-zn-border'}`} />
              )}
            </div>
          ))}
          <div className="flex-1" />
          <button
            onClick={handleSave}
            disabled={saving || !draft.label || !draft.type}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zn-page bg-zn-text hover:opacity-90 disabled:opacity-30 rounded-zn-btn transition-all active:scale-[0.98]"
          >
            {saving ? t('common.loading') : (
              <><Send className="h-3.5 w-3.5" strokeWidth={1.5} /> {t('shablonBuilder.createShablon')}</>
            )}
          </button>
        </div>
      )}

      <div
        className={isTemplateStep ? 'flex-1 flex' : 'min-h-[300px] px-5'}
      >
        {wizardStep === 0 && <BuilderStepMetadata />}
        {wizardStep === 1 && <BuilderStepFields />}
        {wizardStep === 2 && <BuilderStepTemplate />}
      </div>

      {!isTemplateStep && (
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-zn-border px-5 pb-5">
          <div className="flex gap-2">
            {wizardStep > 0 && (
              <button
                onClick={handleBack}
                className="flex items-center gap-1.5 px-3 py-2 text-xs text-zn-text-muted hover:text-zn-text transition-colors"
              >
                <ChevronLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
                {t('common.back')}
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={resetDraft}
              className="px-3 py-2 text-xs text-zn-text-muted hover:text-zn-text transition-colors"
            >
              {t('common.reset')}
            </button>
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-zn-page bg-zn-text hover:opacity-90 disabled:opacity-30 rounded-zn-btn transition-all active:scale-[0.98]"
            >
              {t('common.next')}
              <ChevronRight className="h-3.5 w-3.5" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
