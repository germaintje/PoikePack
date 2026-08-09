import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { PackObject3D } from './PackObject3D'
import { usePackStore } from '../store/usePackStore'

export function PackOpeningScreen() {
  const selectedPack = usePackStore((s) => s.selectedPack)
  const beginReveal = usePackStore((s) => s.beginReveal)
  const [tearing, setTearing] = useState(false)

  useEffect(() => {
    setTearing(false)
  }, [selectedPack])

  useEffect(() => {
    if (!tearing) return
    const timeout = setTimeout(beginReveal, 1250)
    return () => clearTimeout(timeout)
  }, [tearing, beginReveal])

  if (!selectedPack) return null

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col items-center px-5 pb-16 pt-6 text-center sm:px-8">
      <p className="text-xs uppercase tracking-widest text-white/40">
        {selectedPack.setName}
      </p>
      <h1 className="mt-1 text-2xl font-bold text-white sm:text-3xl">{selectedPack.name}</h1>
      <p className="mt-2 max-w-sm text-sm text-white/50">
        {tearing ? 'Bijna zover…' : 'Tik op de pack om \'m open te scheuren.'}
      </p>

      <div className="relative mt-4 h-80 w-80 sm:h-96 sm:w-96">
        <AnimatePresence>
          {tearing && (
            <motion.div
              className="pointer-events-none absolute inset-0 z-10 rounded-full blur-3xl"
              style={{ background: selectedPack.colorFrom }}
              initial={{ opacity: 0, scale: 0.4 }}
              animate={{ opacity: [0, 0.8, 0], scale: [0.4, 1.4, 1.8] }}
              transition={{ duration: 1.1, ease: 'easeOut' }}
            />
          )}
        </AnimatePresence>
        <PackObject3D
          colorFrom={selectedPack.colorFrom}
          colorTo={selectedPack.colorTo}
          tearing={tearing}
        />
      </div>

      <button
        type="button"
        disabled={tearing}
        onClick={() => setTearing(true)}
        className="mt-2 rounded-full bg-white px-8 py-3 text-sm font-bold uppercase tracking-wide text-black transition hover:scale-105 active:scale-95 disabled:pointer-events-none disabled:opacity-0"
      >
        Scheur open
      </button>
    </div>
  )
}
