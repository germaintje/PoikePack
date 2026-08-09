import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { usePackStore } from '../store/usePackStore'
import { CardTile, LockedCardTile } from './CardTile'

type RarityFilter = 'all' | 'common' | 'uncommon' | 'holo'

function matchesRarityFilter(rarity: string, filter: RarityFilter): boolean {
  if (filter === 'all') return true
  const r = rarity.toLowerCase()
  if (filter === 'common') return r === 'common'
  if (filter === 'uncommon') return r === 'uncommon'
  return r !== 'common' && r !== 'uncommon'
}

export function BinderScreen() {
  const packTypes = usePackStore((s) => s.packTypes)
  const setCards = usePackStore((s) => s.setCards)
  const owned = usePackStore((s) => s.owned)
  const setView = usePackStore((s) => s.setView)

  const [ownedOnly, setOwnedOnly] = useState(false)
  const [rarityFilter, setRarityFilter] = useState<RarityFilter>('all')

  const sets = useMemo(() => {
    return packTypes.map((pack) => {
      const cards = setCards[pack.setId] ?? []
      const ownedCount = cards.filter((c) => (owned[c.id] ?? 0) > 0).length
      return { pack, cards, ownedCount, total: cards.length }
    })
  }, [packTypes, setCards, owned])

  const totalOwned = sets.reduce((sum, s) => sum + s.ownedCount, 0)
  const totalCards = sets.reduce((sum, s) => sum + s.total, 0)

  return (
    <div className="mx-auto w-full max-w-4xl px-5 pb-16 sm:px-8">
      <div className="mb-6 mt-4 text-center">
        <h1 className="text-2xl font-bold text-white sm:text-3xl">Binder</h1>
        <p className="mt-1 text-sm text-white/50">
          {totalOwned} van {totalCards} kaarten verzameld over alle sets.
        </p>
      </div>

      <div className="mb-8 flex flex-wrap items-center justify-center gap-2">
        <div className="flex items-center gap-1 rounded-full bg-white/5 p-1 ring-1 ring-white/10">
          {(
            [
              ['all', 'Alle'],
              ['common', 'Common'],
              ['uncommon', 'Uncommon'],
              ['holo', 'Holo+'],
            ] as [RarityFilter, string][]
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setRarityFilter(value)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                rarityFilter === value ? 'bg-white text-black' : 'text-white/60 hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setOwnedOnly((v) => !v)}
          className={`rounded-full px-3 py-1.5 text-xs font-semibold ring-1 transition ${
            ownedOnly
              ? 'bg-white text-black ring-white'
              : 'bg-white/5 text-white/60 ring-white/10 hover:text-white'
          }`}
        >
          Alleen bezit
        </button>
      </div>

      {totalCards === 0 && (
        <p className="text-center text-sm text-white/40">Kaartdata wordt nog geladen…</p>
      )}

      <div className="flex flex-col gap-10">
        {sets.map(({ pack, cards, ownedCount, total }) => {
          const visibleCards = cards.filter((c) => {
            if (!matchesRarityFilter(c.rarity, rarityFilter)) return false
            if (ownedOnly && !(owned[c.id] ?? 0)) return false
            return true
          })
          const progress = total > 0 ? Math.round((ownedCount / total) * 100) : 0

          return (
            <div key={pack.id}>
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white">{pack.setName}</h2>
                  <p className="text-xs text-white/50">
                    {ownedCount} van {total} compleet
                  </p>
                </div>
                <span className="text-sm font-mono text-white/60">{progress}%</span>
              </div>
              <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: `linear-gradient(90deg, ${pack.colorFrom}, ${pack.colorTo})` }}
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                />
              </div>

              {visibleCards.length === 0 ? (
                <p className="text-sm text-white/30">Geen kaarten die aan dit filter voldoen.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {visibleCards.map((card) => {
                    const qty = owned[card.id] ?? 0
                    return qty > 0 ? (
                      <CardTile key={card.id} card={card} size="sm" quantity={qty} />
                    ) : (
                      <LockedCardTile key={card.id} size="sm" />
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="mt-10 flex justify-center">
        <button
          type="button"
          onClick={() => setView('packs')}
          className="rounded-full bg-white/10 px-6 py-2.5 text-sm font-semibold text-white ring-1 ring-white/15 transition hover:bg-white/20"
        >
          Naar packs
        </button>
      </div>
    </div>
  )
}
