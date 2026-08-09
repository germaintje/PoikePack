import { AnimatePresence, motion } from 'framer-motion'
import { usePackStore } from '../store/usePackStore'
import { useTheme } from '../lib/useTheme'
import type { View } from '../store/usePackStore'

const PAGE_TITLES: Record<View, string> = {
  packs: 'Packs openen',
  binder: 'Binder',
  quests: 'Missies',
  leaderboard: 'Ranglijst',
  profile: 'Profiel',
}

export function TopBar({ onOpenMobileNav }: { onOpenMobileNav: () => void }) {
  const coins = usePackStore((s) => s.coins)
  const stage = usePackStore((s) => s.stage)
  const view = usePackStore((s) => s.view)
  const avatarEmoji = usePackStore((s) => s.avatarEmoji)
  const setView = usePackStore((s) => s.setView)
  const dailyBonusStatus = usePackStore((s) => s.dailyBonusStatus)
  const dailyBonusStreak = usePackStore((s) => s.dailyBonusStreak)
  const dailyBonusCoinsAwarded = usePackStore((s) => s.dailyBonusCoinsAwarded)
  const claimDailyBonus = usePackStore((s) => s.claimDailyBonus)
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-white/10 bg-[#0a0812]/80 px-5 py-3.5 backdrop-blur-lg sm:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileNav}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white/60 ring-1 ring-white/10 transition hover:bg-white/5 hover:text-white lg:hidden"
          aria-label="Menu openen"
        >
          <svg viewBox="0 0 20 20" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M3 6h14M3 10h14M3 14h14" strokeLinecap="round" />
          </svg>
        </button>
        <div className="min-w-0">
          <h1 className="truncate text-base font-bold text-white sm:text-lg">{PAGE_TITLES[view]}</h1>
          {view === 'packs' && stage !== 'select' && (
            <p className="truncate text-[11px] uppercase tracking-wide text-white/35">
              {stage === 'opening' && 'Pack openen…'}
              {stage === 'reveal' && 'Kaarten onthullen'}
              {stage === 'summary' && 'Resultaat'}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <AnimatePresence mode="wait" initial={false}>
          {dailyBonusStatus === 'claimed' ? (
            <motion.span
              key="claimed"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="hidden rounded-full bg-emerald-400/15 px-3 py-1.5 text-xs font-semibold text-emerald-300 ring-1 ring-emerald-400/20 sm:inline-block"
            >
              +{dailyBonusCoinsAwarded} 🪙 (streak {dailyBonusStreak})
            </motion.span>
          ) : dailyBonusStatus === 'already-claimed' ? (
            <span className="hidden rounded-full bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/40 ring-1 ring-white/10 sm:inline-block">
              Bonus al geclaimd
            </span>
          ) : (
            <motion.button
              key="claim"
              type="button"
              onClick={() => claimDailyBonus()}
              disabled={dailyBonusStatus === 'claiming'}
              whileTap={{ scale: 0.95 }}
              className="hidden items-center gap-1.5 rounded-full bg-red-500/15 px-3 py-1.5 text-xs font-semibold text-red-300 ring-1 ring-red-400/30 transition hover:bg-red-500/25 disabled:opacity-50 sm:inline-flex"
            >
              🎁 Dagelijkse bonus
            </motion.button>
          )}
        </AnimatePresence>

        <button
          type="button"
          onClick={toggleTheme}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/5 text-base ring-1 ring-white/10 transition hover:bg-white/10"
          aria-label={theme === 'light' ? 'Donker thema' : 'Licht thema'}
          title={theme === 'light' ? 'Donker thema' : 'Licht thema'}
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>

        <div className="flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1.5 ring-1 ring-white/10">
          <span className="text-base">🪙</span>
          <motion.span
            key={coins}
            initial={{ scale: 1.25, color: '#fbbf24' }}
            animate={{ scale: 1, color: '#fcd34d' }}
            transition={{ duration: 0.35 }}
            className="font-mono text-sm font-semibold"
          >
            {coins.toLocaleString('nl-NL')}
          </motion.span>
        </div>

        <button
          type="button"
          onClick={() => setView('profile')}
          className={`flex h-9 w-9 items-center justify-center rounded-full text-lg ring-1 transition ${
            view === 'profile'
              ? 'bg-white/15 ring-white/30'
              : 'bg-white/5 ring-white/10 hover:bg-white/10'
          }`}
          aria-label="Profiel"
        >
          {avatarEmoji}
        </button>
      </div>
    </header>
  )
}
