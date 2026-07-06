import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Send } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useShablonBuilderStore } from '@renderer/store/useShablonBuilderStore'
import { BuilderStepMetadata } from './BuilderStepMetadata'
import { BuilderStepFields } from './BuilderStepFields'
import { BuilderStepTemplate } from './BuilderStepTemplate'

const STEP_LABELS = ['Metadata', 'Fields', 'Template']

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
    console.log('Saving shablon...', draft)
    const result = await saveShablon()
    console.log('Save result:', result)
    if (result) {
      console.log('Shablon saved successfully!')
      alert('Shablon muvaffaqiyatli saqlandi! ✅')
      resetDraft()
    } else {
      console.error('Failed to save shablon')
      const errorMessage = `Shablon saqlashda xatolik yuz berdi.

Ehtimoliy sabab: Supabase Row Level Security (RLS) sozlamalari

Yechim:
1. Supabase Dashboard-ga kiring
2. Authentication → Policies → shablons jadvaliga o'ting  
3. INSERT policy qo'shing

Batafsil ma'lumot uchun SUPABASE_RLS_FIX.md faylini o'qing.

Yoki terminalda "npm run dev" buyrug'i bilan ishga tushiring va konsolni tekshiring.`
      
      alert(errorMessage)
    }
  }

  const isTemplateStep = wizardStep === 2

  return (
    <div className="flex flex-col" style={{ height: isTemplateStep ? '100%' : undefined }}>
      {/* Step indicator */}
      {!isTemplateStep && (
        <div className="flex items-center gap-2 mb-6 px-5 pt-5">
          {STEP_LABELS.map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <button
                onClick={() => i <= wizardStep + 1 && setWizardStep(i as 0 | 1 | 2 | 3)}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg transition-colors ${
                  i <= wizardStep
                    ? 'bg-[var(--warm)]/10 text-warm'
                    : i === wizardStep + 1
                    ? 'text-muted-foreground hover:text-foreground cursor-pointer'
                    : 'text-muted-foreground/40 cursor-not-allowed'
                }`}
              >
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${
                  i <= wizardStep ? 'bg-warm text-carbon' : 'bg-[var(--hairline)] text-muted-foreground'
                }`}>
                  {i + 1}
                </span>
                {label}
              </button>
              {i < STEP_LABELS.length - 1 && (
                <div className={`w-6 h-px ${i < wizardStep ? 'bg-warm/30' : 'bg-[var(--hairline)]'}`} />
              )}
            </div>
          ))}
        </div>
      )}

      {isTemplateStep && (
        <div className="flex items-center gap-2 px-5 py-3 border-b border-[var(--hairline)] shrink-0">
          {STEP_LABELS.map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <button
                onClick={() => i <= wizardStep + 1 && setWizardStep(i as 0 | 1 | 2 | 3)}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg transition-colors ${
                  i <= wizardStep
                    ? 'bg-[var(--warm)]/10 text-warm'
                    : i === wizardStep + 1
                    ? 'text-muted-foreground hover:text-foreground cursor-pointer'
                    : 'text-muted-foreground/40 cursor-not-allowed'
                }`}
              >
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${
                  i <= wizardStep ? 'bg-warm text-carbon' : 'bg-[var(--hairline)] text-muted-foreground'
                }`}>
                  {i + 1}
                </span>
                {label}
              </button>
              {i < STEP_LABELS.length - 1 && (
                <div className={`w-6 h-px ${i < wizardStep ? 'bg-warm/30' : 'bg-[var(--hairline)]'}`} />
              )}
            </div>
          ))}
          <div className="flex-1" />
          <button
            onClick={handleSave}
            disabled={saving || !draft.label || !draft.type}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-foreground bg-[var(--warm)]/10 hover:bg-[var(--warm)]/20 disabled:opacity-40 border border-[var(--hairline)] rounded-lg transition-colors"
          >
            {saving ? t('common.loading') : (
              <><Send className="h-3.5 w-3.5" strokeWidth={1.5} /> {t('shablonBuilder.createShablon')}</>
            )}
          </button>
        </div>
      )}

      {/* Step content - full height when template step */}
      <div
        className={isTemplateStep ? 'flex-1 flex' : 'min-h-[300px] px-5'}
      >
        {wizardStep === 0 && <BuilderStepMetadata />}
        {wizardStep === 1 && <BuilderStepFields />}
        {wizardStep === 2 && <BuilderStepTemplate />}
      </div>

      {/* Actions */}
      {!isTemplateStep && (
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-[var(--hairline)] px-5 pb-5">
          <div className="flex gap-2">
            {wizardStep > 0 && (
              <button
                onClick={handleBack}
                className="flex items-center gap-1.5 px-3 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
                {t('common.back')}
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={resetDraft}
              className="px-3 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {t('common.reset')}
            </button>
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-foreground bg-[var(--warm)]/10 hover:bg-[var(--warm)]/20 disabled:opacity-40 border border-[var(--hairline)] rounded-lg transition-colors"
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
