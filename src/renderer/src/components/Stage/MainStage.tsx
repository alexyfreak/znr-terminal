import { useTranslation } from 'react-i18next'

export const MainStage = () => {
  const { t } = useTranslation()

  return (
    <main className="relative flex min-h-0 flex-1 flex-col desk-vignette items-center justify-center">
      <div className="text-center max-w-2xl w-full px-6">
        <h1 className="serif-italic text-3xl text-warm mb-3">Zunoora</h1>
        <p className="text-2xl font-medium text-foreground mb-1">
          What shall we draft today?
        </p>
        <p className="text-sm text-muted-foreground">
          A lesson plan, a quiz...
        </p>
      </div>
    </main>
  )
}
