import { AnimatePresence, motion } from 'framer-motion'

interface MainStageProps {
  showBrand: boolean
}

export const MainStage = ({ showBrand }: MainStageProps) => {
  return (
    <main className="relative flex min-h-0 flex-1 flex-col desk-vignette items-center justify-center">
      <AnimatePresence>
        {showBrand && (
          <motion.div
            key="brand"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="text-center max-w-2xl w-full px-6"
          >
            <h1 className="serif-italic text-3xl text-warm mb-3">Zunoora</h1>
            <p className="text-2xl font-medium text-foreground mb-1">
              What shall we draft today?
            </p>
            <p className="text-sm text-muted-foreground">
              A lesson plan, a quiz...
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}
