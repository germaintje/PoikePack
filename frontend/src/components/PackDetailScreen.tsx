import { motion } from 'framer-motion'
import { usePackStore } from '../store/usePackStore'
import { PackVisual } from './PackVisual'
import { CardTile } from './CardTile'
import { rarityRank } from '../lib/rarity'

function OddStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-white/5 py-3 ring-1 ring-white/10">
      <div className="font-mono text-lg font-bold text-white">{value}</div>
      <div className="mt-0.5 text-[10px] uppercase tracking-wide text-white/40">{label}</div>
    </div>
  )
}

export function PackDetailScreen() {
  const selectedPack = usePackStore((s) => s.selectedPack)
  const coins = usePackStore((s) => s.coins)
  const playerLevel = usePackStore((s) => s.playerLevel)
  const setCards = usePackStore((s) => s.setCards)
  const openPack = usePackStore((s) => s.openPack)
  const reset = usePackStore((s) => s.reset)
  const actionError = usePackStore((s) => s.actionError)

  if (!selectedPack) return null

  const locked = playerLevel < selectedPack.unlockLevel
  const canAfford = coins >= selectedPack.price
  const disabled = locked || !canAfford

  const cards = setCards[selectedPack.setId] ?? []
  const chaseCards = [...cards]
    .filter((c) => rarityRank(c.rarity) >= 2)
    .sort((a, b) => rarityRank(b.rarity) - rarityRank(a.rarity))
    .slice(0, 8)

  const { commons, uncommons, reverseHolo, hits } = selectedPack.slotConfig

  return (
    <div className="mx-auto w-full max-w-2xl px-5 pb-16 sm:px-8">
      <button
        type="button"
        onClick={reset}
        className="mb-4 flex items-center gap-1.5 text-xs font-semibold text-white/50 transition hover:text-white"
      >
        <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 15l-5-5 5-5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Terug naar packs
      </button>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <p className="text-xs uppercase tracking-widest text-white/40">{selectedPack.setName}</p>
        <h1 className="mt-1 text-2xl font-bold text-white sm:text-3xl">{selectedPack.name}</h1>
        {selectedPack.tagline && <p className="mx-auto mt-2 max-w-sm text-sm text-white/50">{selectedPack.tagline}</p>}
      </motion.div>

      <div className="relative mx-auto mt-6 h-56 w-56 sm:h-64 sm:w-64">
        <PackVisual
          colorFrom={selectedPack.colorFrom}
          colorTo={selectedPack.colorTo}
          logoImage={selectedPack.logoImage}
          tearing={false}
        />
      </div>

      <div className="mt-6">
        <h2 className="mb-2 text-center text-[11px] font-semibold uppercase tracking-wide text-white/40">
          Wat zit erin — 9 kaarten
        </h2>
        <div className="grid grid-cols-4 gap-2">
          <OddStat label="Common" value={commons} />
          <OddStat label="Uncommon" value={uncommons} />
          <OddStat label="Rev. holo" value={reverseHolo} />
          <OddStat label="Hit" value={hits} />
        </div>
      </div>

      {chaseCards.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-white/40">
            Chase cards uit deze set
          </h2>
          <div className="-mx-5 flex gap-3 overflow-x-auto px-5 pb-2 sm:mx-0 sm:px-0">
            {chaseCards.map((card) => (
              <div key={card.id} className="shrink-0">
                <CardTile card={card} size="sm" isClimax={rarityRank(card.rarity) >= 3} />
              </div>
            ))}
          </div>
        </div>
      )}

      {actionError && <p className="mt-5 text-center text-xs text-rose-300/90">{actionError}</p>}

      <button
        type="button"
        disabled={disabled}
        onClick={openPack}
        className="mt-8 flex w-full items-center justify-center gap-2 rounded-full bg-white py-3.5 text-sm font-bold uppercase tracking-wide text-black transition hover:scale-[1.01] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {locked
          ? `🔒 Vergrendeld — level ${selectedPack.unlockLevel}`
          : !canAfford
            ? 'Te weinig coins'
            : `Open pack — 🪙 ${selectedPack.price.toLocaleString('nl-NL')}`}
      </button>
    </div>
  )
}
