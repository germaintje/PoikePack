import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { usePackStore } from '../store/usePackStore'
import { CardBack, CardTile } from './CardTile'

export function CardRevealScreen() {
  const pulls = usePackStore((s) => s.pulls)
  const revealedCount = usePackStore((s) => s.revealedCount)
  const revealNext = usePackStore((s) => s.revealNext)
  const finishReveal = usePackStore((s) => s.finishReveal)
  const [flipped, setFlipped] = useState(false)

  const currentIndex = revealedCount
  const current = pulls[currentIndex]
  const isLast = currentIndex === pulls.length - 1
  const allDone = revealedCount >= pulls.length

  const handleFlip = () => {
    if (!current) return
    if (!flipped) {
      setFlipped(true)
      return
    }
    revealNext()
    setFlipped(false)
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col items-center px-5 pb-16 pt-4 sm:px-8">
      <div className="mb-6 flex items-center gap-1.5">
        {pulls.map((p, i) => (
          <span
            key={p.id + i}
            className={`h-1.5 rounded-full transition-all ${
              i < revealedCount
                ? 'w-6 bg-white/70'
                : i === revealedCount
                  ? 'w-6 bg-violet-400'
                  : 'w-3 bg-white/15'
            }`}
          />
        ))}
      </div>

      <div className="flex min-h-[24rem] w-full items-center justify-center">
        {!allDone && current ? (
          <div className="flex flex-col items-center gap-6">
            {isLast && !flipped && (
              <motion.p
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-300"
              >
                ✨ De hit-kaart ✨
              </motion.p>
            )}
            <button
              type="button"
              onClick={handleFlip}
              className="[perspective:1200px]"
              aria-label={flipped ? 'Volgende kaart' : 'Kaart onthullen'}
            >
              <motion.div
                className="relative [transform-style:preserve-3d]"
                animate={{ rotateY: flipped ? 180 : 0 }}
                transition={{
                  duration: isLast ? 1.1 : 0.6,
                  ease: isLast ? [0.16, 1, 0.3, 1] : 'easeOut',
                }}
              >
                <div className="[backface-visibility:hidden]">
                  <CardBack size="lg" />
                </div>
                <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)]">
                  <CardTile card={current} size="lg" isDuplicate={current.isDuplicate} isClimax={isLast} />
                </div>
              </motion.div>
            </button>

            <AnimatePresence mode="wait">
              <motion.p
                key={flipped ? 'flipped' : 'unflipped'}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-sm text-white/50"
              >
                {flipped
                  ? currentIndex + 1 < pulls.length
                    ? 'Tik voor de volgende kaart'
                    : 'Tik om je resultaat te bekijken'
                  : 'Tik om te onthullen'}
              </motion.p>
            </AnimatePresence>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-5"
          >
            <p className="text-lg font-semibold text-white">Alle kaarten onthuld!</p>
            <button
              type="button"
              onClick={finishReveal}
              className="rounded-full bg-white px-8 py-3 text-sm font-bold uppercase tracking-wide text-black transition hover:scale-105 active:scale-95"
            >
              Bekijk resultaat
            </button>
          </motion.div>
        )}
      </div>

      {revealedCount > 0 && (
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {pulls.slice(0, revealedCount).map((p) => (
            <CardTile key={p.id} card={p} size="sm" isDuplicate={p.isDuplicate} />
          ))}
        </div>
      )}
    </div>
  )
}
