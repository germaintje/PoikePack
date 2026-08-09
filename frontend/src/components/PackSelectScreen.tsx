import { motion } from 'framer-motion'
import { usePackStore } from '../store/usePackStore'
import type { PackType } from '../lib/types'

const PLAYER_LEVEL = 4

export function PackSelectScreen() {
  const coins = usePackStore((s) => s.coins)
  const packTypes = usePackStore((s) => s.packTypes)
  const liveStatus = usePackStore((s) => s.liveStatus)
  const selectPack = usePackStore((s) => s.selectPack)
  const openPack = usePackStore((s) => s.openPack)

  const handleOpen = (pack: PackType) => {
    selectPack(pack)
    openPack()
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-5 pb-16 sm:px-8">
      <div className="mb-8 mt-4 text-center">
        <h1 className="text-2xl font-bold text-white sm:text-3xl">Kies je pack</h1>
        <p className="mt-1 text-sm text-white/50">
          Verdien coins door te spelen en unlock nieuwe sets naarmate je level stijgt.
        </p>
        {liveStatus === 'loading' && (
          <p className="mt-2 text-xs text-violet-300/80">Live kaartdata laden van de Pokémon TCG API…</p>
        )}
        {liveStatus === 'error' && (
          <p className="mt-2 text-xs text-amber-300/80">
            Kon geen live kaartdata laden — voorbeelddata getoond.
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {packTypes.map((pack, i) => {
          const locked = PLAYER_LEVEL < pack.unlockLevel
          const canAfford = coins >= pack.price

          return (
            <motion.div
              key={pack.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="relative overflow-hidden rounded-2xl ring-1 ring-white/10"
              style={{ background: `linear-gradient(160deg, ${pack.colorFrom}33, #0d0b17)` }}
            >
              <div
                className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full blur-3xl"
                style={{ background: pack.colorFrom, opacity: 0.35 }}
              />

              <div className="relative flex flex-col gap-4 p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-white">{pack.name}</h2>
                    <p className="mt-1 text-xs text-white/50">{pack.tagline}</p>
                  </div>
                  {locked && (
                    <span className="rounded-full bg-black/40 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white/60 ring-1 ring-white/10">
                      🔒 Lvl {pack.unlockLevel}
                    </span>
                  )}
                </div>

                <div className="mx-auto flex h-32 w-full items-center justify-center">
                  {pack.logoImage ? (
                    <img
                      src={pack.logoImage}
                      alt={pack.setName}
                      className="max-h-full max-w-[80%] object-contain drop-shadow-lg"
                    />
                  ) : (
                    <div
                      className="flex h-32 w-24 items-center justify-center rounded-lg text-4xl shadow-lg ring-1 ring-white/20"
                      style={{
                        background: `linear-gradient(160deg, ${pack.colorFrom}, ${pack.colorTo})`,
                      }}
                    >
                      🎴
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs text-white/50">
                  <span>
                    {pack.slotConfig.commons + pack.slotConfig.uncommons} basis ·{' '}
                    {pack.slotConfig.reverseHolo} reverse holo · {pack.slotConfig.hits} hit
                  </span>
                </div>

                <button
                  type="button"
                  disabled={locked || !canAfford}
                  onClick={() => handleOpen(pack)}
                  className="flex items-center justify-center gap-2 rounded-xl bg-white/10 py-2.5 text-sm font-semibold text-white ring-1 ring-white/15 transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white/10"
                >
                  <span>🪙 {pack.price}</span>
                  <span className="text-white/40">·</span>
                  <span>{locked ? 'Vergrendeld' : !canAfford ? 'Te weinig coins' : 'Open pack'}</span>
                </button>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
