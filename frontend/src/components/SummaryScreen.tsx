import { motion } from 'framer-motion'
import { usePackStore } from '../store/usePackStore'
import { CardTile } from './CardTile'

export function SummaryScreen() {
  const pulls = usePackStore((s) => s.pulls)
  const reset = usePackStore((s) => s.reset)
  const openPack = usePackStore((s) => s.openPack)
  const selectedPack = usePackStore((s) => s.selectedPack)
  const coins = usePackStore((s) => s.coins)

  const duplicateValue = pulls
    .filter((p) => p.isDuplicate)
    .reduce((sum, p) => sum + p.sellValue + 2, 0)
  const bestPull = [...pulls].sort((a, b) => b.sellValue - a.sellValue)[0]

  const canReopen = selectedPack && coins >= selectedPack.price

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col items-center px-5 pb-16 pt-4 sm:px-8">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-2 text-center"
      >
        <h1 className="text-2xl font-bold text-white sm:text-3xl">Pack geopend!</h1>
        <p className="mt-1 text-sm text-white/50">
          Beste pull: <span className="text-white/80">{bestPull?.name}</span> (
          {bestPull?.rarity})
        </p>
      </motion.div>

      <div className="mt-6 grid grid-cols-4 gap-3 sm:grid-cols-8">
        {pulls.map((p, i) => (
          <motion.div
            key={p.id + i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <CardTile card={p} size="sm" isDuplicate={p.isDuplicate} />
          </motion.div>
        ))}
      </div>

      <div className="mt-8 flex w-full max-w-sm items-center justify-between rounded-xl bg-white/5 px-4 py-3 text-sm ring-1 ring-white/10">
        <span className="text-white/60">Duplicates verkopen (preview)</span>
        <span className="font-mono font-semibold text-amber-300">+{duplicateValue} 🪙</span>
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-full bg-white/10 px-6 py-2.5 text-sm font-semibold text-white ring-1 ring-white/15 transition hover:bg-white/20"
        >
          Terug naar packs
        </button>
        <button
          type="button"
          disabled={!canReopen}
          onClick={openPack}
          className="rounded-full bg-white px-6 py-2.5 text-sm font-bold text-black transition hover:scale-105 active:scale-95 disabled:pointer-events-none disabled:opacity-40"
        >
          Nog een pack openen ({selectedPack?.price} 🪙)
        </button>
      </div>
    </div>
  )
}
