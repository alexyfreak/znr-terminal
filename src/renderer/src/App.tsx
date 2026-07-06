import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Sidebar } from './components/Sidebar'
import { MainStage } from './components/Stage'
import { SpotlightSearchBar } from './components/Search'
import { DocumentFulfillmentCard } from './components/DocumentFulfillmentCard'
import { SettingsPanel } from './components/SettingsPanel'
import { AccountMenu } from './components/AccountMenu'
import { useSearchStore } from './store/useSearchStore'

const App = () => {
  const [selectedResult, setSelectedResult] = useState<string | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [showAccount, setShowAccount] = useState(false)
  const { isDocked, isFocused, setDocked } = useSearchStore()

  const handleSelect = (result: string) => {
    setSelectedResult(result)
    setDocked(true)
  }

  const handleReset = () => {
    setSelectedResult(null)
    setDocked(false)
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-carbon text-foreground">
      <Sidebar
        onSettingsOpen={() => setShowSettings(true)}
        onAccountOpen={() => setShowAccount(true)}
      />
      <div className="relative flex flex-1 flex-col min-h-0">
        <div className="absolute inset-0 z-0">
          <MainStage showBrand={!isDocked && !isFocused} />
        </div>

        <div className="absolute inset-0 z-10 flex items-center justify-center px-6">
          <SpotlightSearchBar onSelect={handleSelect} />
        </div>

        <AnimatePresence mode="wait">
          {isDocked && selectedResult && (
            <motion.div
              key="fulfillment"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, delay: 0.15 }}
              className="flex-1 flex items-start justify-center pt-20 pb-8 px-4 z-20"
            >
              <DocumentFulfillmentCard isVisible={true} onReset={handleReset} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <SettingsPanel isOpen={showSettings} onClose={() => setShowSettings(false)} />
      <AccountMenu isOpen={showAccount} onClose={() => setShowAccount(false)} />
    </div>
  )
}

export default App
