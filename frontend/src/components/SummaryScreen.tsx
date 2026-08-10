import { useState } from 'react'
import { motion } from 'framer-motion'
import { usePackStore } from '../store/usePackStore'
import { CardTile } from './CardTile'

export function SummaryScreen() {
  const pulls = usePackStore((s) => s.pulls)
  const reset = usePackStore((s) => s.reset)
  const openPack = usePackStore((s) => s.openPack)
  const sellDuplicates = usePackStore((s) => s.sellDuplicates)
  const selectedPack = usePackStore((s) => s.selectedPack)
  const coins = usePackStore((s) => s.coins)
  const lastOpenExtras = usePackStore((s) => s.lastOpenExtras)
  const [sold, setSold] = useState(false)

  const duplicateValue = pulls
    .filter((p) => p.isDuplicate)
    .reduce((sum, p) => sum + p.sellValue + 2, 0)
  const bestPull = [...pulls].sort((a, b) => b.sellValue - a.sellValue)[0]

  const canReopen = selectedPack && coins >= selectedPack.price

  const handleSell = async () => {
    await sellDuplicates()
    setSold(true)
  }

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
        {lastOpenExtras.xpGained > 0 && (
          <motion.p
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-violet-400/15 px-4 py-1.5 text-sm font-bold text-violet-300 ring-1 ring-violet-400/25"
          >
            ✨ +{lastOpenExtras.xpGained} XP
          </motion.p>
        )}
      </motion.div>

      {(lastOpenExtras.setCompletionBonusCoins ||
        lastOpenExtras.unlockedAchievementNames.length > 0 ||
        lastOpenExtras.completedQuestNames.length > 0 ||
        lastOpenExtras.leveledUpTo) && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-4 flex flex-col items-center gap-1.5"
        >
          {lastOpenExtras.leveledUpTo && (
            <p className="rounded-full bg-violet-400/15 px-4 py-1.5 text-sm font-semibold text-violet-300 ring-1 ring-violet-400/25">
              ⬆️ Level {lastOpenExtras.leveledUpTo} bereikt!
            </p>
          )}
          {lastOpenExtras.setCompletionBonusCoins && (
            <p className="rounded-full bg-emerald-400/15 px-4 py-1.5 text-sm font-semibold text-emerald-300 ring-1 ring-emerald-400/25">
              ✨ Set compleet! +{lastOpenExtras.setCompletionBonusCoins} 🪙
            </p>
          )}
          {lastOpenExtras.completedQuestNames.map((name) => (
            <p
              key={name}
              className="rounded-full bg-sky-400/15 px-4 py-1.5 text-sm font-semibold text-sky-300 ring-1 ring-sky-400/25"
            >
              🎯 Missie voltooid: {name}
            </p>
          ))}
          {lastOpenExtras.unlockedAchievementNames.map((name) => (
            <p
              key={name}
              className="rounded-full bg-amber-400/15 px-4 py-1.5 text-sm font-semibold text-amber-300 ring-1 ring-amber-400/25"
            >
              🏆 Achievement: {name}
            </p>
          ))}
        </motion.div>
      )}

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
        <div>
          <span className="text-white/60">Al je duplicates verkopen</span>
          <p className="text-[11px] text-white/30">Uit deze pack: +{duplicateValue} 🪙 (indicatie)</p>
        </div>
        {sold ? (
          <span className="font-mono font-semibold text-emerald-300">Verkocht ✓</span>
        ) : (
          <button
            type="button"
            onClick={handleSell}
            className="rounded-full bg-amber-400/20 px-3 py-1.5 text-xs font-semibold text-amber-300 ring-1 ring-amber-300/30 transition hover:bg-amber-400/30"
          >
            Verkoop
          </button>
        )}
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
