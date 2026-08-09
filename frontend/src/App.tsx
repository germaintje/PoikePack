import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { usePackStore } from './store/usePackStore'
import { TopBar } from './components/TopBar'
import { PackSelectScreen } from './components/PackSelectScreen'
import { PackOpeningScreen } from './components/PackOpeningScreen'
import { CardRevealScreen } from './components/CardRevealScreen'
import { SummaryScreen } from './components/SummaryScreen'

function App() {
  const stage = usePackStore((s) => s.stage)
  const loadLiveData = usePackStore((s) => s.loadLiveData)

  useEffect(() => {
    loadLiveData()
  }, [loadLiveData])

  return (
    <div className="min-h-screen bg-[#0a0812] text-white">
      <div
        className="pointer-events-none fixed inset-0 opacity-60"
        style={{
          background:
            'radial-gradient(60% 50% at 50% 0%, rgba(124,58,237,0.18), transparent 70%)',
        }}
      />
      <div className="relative mx-auto min-h-screen max-w-5xl">
        <TopBar />
        <AnimatePresence mode="wait">
          <motion.main
            key={stage}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
          >
            {stage === 'select' && <PackSelectScreen />}
            {stage === 'opening' && <PackOpeningScreen />}
            {stage === 'reveal' && <CardRevealScreen />}
            {stage === 'summary' && <SummaryScreen />}
          </motion.main>
        </AnimatePresence>
      </div>
    </div>
  )
}

export default App
