import { motion } from 'framer-motion'
import { usePackStore } from '../store/usePackStore'

export function PackSelectScreen() {
  const playerLevel = usePackStore((s) => s.playerLevel)
  const packTypes = usePackStore((s) => s.packTypes)
  const packsStatus = usePackStore((s) => s.packsStatus)
  const actionError = usePackStore((s) => s.actionError)
  const viewPackDetail = usePackStore((s) => s.viewPackDetail)

  return (
    <div className="mx-auto w-full max-w-6xl px-5 pb-16 sm:px-8">
      <div className="mb-8 mt-4 text-center">
        <h1 className="text-2xl font-bold text-white sm:text-3xl">Kies je pack</h1>
        <p className="mt-1 text-sm text-white/50">Tik op een pack om de odds en chase cards te bekijken.</p>
        {packsStatus === 'loading' && (
          <p className="mt-2 text-xs text-violet-300/80">Packs laden…</p>
        )}
        {packsStatus === 'ready' && packTypes.length === 0 && (
          <p className="mt-2 text-xs text-amber-300/80">
            Nog geen packs beschikbaar — is de database geseed? (zie database/migrations)
          </p>
        )}
        {actionError && <p className="mt-2 text-xs text-rose-300/90">{actionError}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {packTypes.map((pack, i) => {
          const locked = playerLevel < pack.unlockLevel
          const totalCards = pack.slotConfig.commons + pack.slotConfig.uncommons + pack.slotConfig.reverseHolo + pack.slotConfig.hits

          return (
            <motion.button
              key={pack.id}
              type="button"
              onClick={() => viewPackDetail(pack)}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i, 12) * 0.04 }}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.97 }}
              className="group relative overflow-hidden rounded-2xl p-5 text-left ring-1 ring-white/10 transition-colors hover:ring-white/20"
              style={{ background: `linear-gradient(165deg, ${pack.colorFrom}22, #0d0b17 70%)` }}
            >
              <div
                className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-25 blur-3xl transition-opacity duration-300 group-hover:opacity-45"
                style={{ background: pack.colorFrom }}
              />

              {locked && (
                <span className="absolute right-3 top-3 z-10 rounded-full bg-black/50 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white/70 ring-1 ring-white/10">
                  🔒 {pack.unlockLevel}
                </span>
              )}

              <div className="relative flex h-24 items-center justify-center">
                {pack.logoImage ? (
                  <img
                    src={pack.logoImage}
                    alt={pack.setName}
                    loading="lazy"
                    className="max-h-full max-w-[85%] object-contain drop-shadow-lg transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div
                    className="flex h-20 w-16 items-center justify-center rounded-lg text-3xl shadow-lg ring-1 ring-white/20"
                    style={{ background: `linear-gradient(160deg, ${pack.colorFrom}, ${pack.colorTo})` }}
                  >
                    🎴
                  </div>
                )}
              </div>

              <div className="relative mt-3">
                <h2 className="truncate text-sm font-bold text-white">{pack.name}</h2>
                <p className="mt-0.5 text-[11px] text-white/40">{totalCards} kaarten &middot; 1 hit gegarandeerd</p>
                <p className="mt-2 flex items-center gap-1 text-xs font-semibold text-amber-300">
                  🪙 {pack.price.toLocaleString('nl-NL')}
                </p>
              </div>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
