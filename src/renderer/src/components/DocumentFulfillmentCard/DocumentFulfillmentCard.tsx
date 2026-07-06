import { motion } from 'framer-motion'

interface DocumentFulfillmentCardProps {
  isVisible: boolean
}

export const DocumentFulfillmentCard = ({ isVisible }: DocumentFulfillmentCardProps) => {
  if (!isVisible) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.97 }}
      transition={{
        type: 'spring',
        stiffness: 160,
        damping: 24,
        delay: 0.15,
      }}
      className="mx-auto w-full max-w-[595px] min-h-[400px] rounded-lg bg-[var(--paper-bg)] text-[var(--paper-text)] paper-noise shadow-xl"
    >
      <div className="p-8">
        <h2 className="text-lg font-serif font-semibold mb-4">Shablon Fulfillment</h2>
        <p className="text-sm text-[var(--paper-text)]/70">
          This is where the document form will appear.
        </p>
      </div>
    </motion.div>
  )
}
