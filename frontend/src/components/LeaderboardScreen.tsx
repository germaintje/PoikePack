import { motion } from 'framer-motion'
import { usePackStore } from '../store/usePackStore'
import type { LeaderboardType } from '../lib/api'

const TABS: { key: LeaderboardType; label: string; unit: string }[] = [
  { key: 'coins', label: 'Meeste coins', unit: '🪙' },
  { key: 'collection', label: 'Grootste collectie', unit: 'kaarten' },
  { key: 'complete-sets', label: 'Meeste complete sets', unit: 'sets' },
]

export function LeaderboardScreen() {
  const leaderboardType = usePackStore((s) => s.leaderboardType)
  const leaderboardEntries = usePackStore((s) => s.leaderboardEntries)
  const leaderboardStatus = usePackStore((s) => s.leaderboardStatus)
  const userId = usePackStore((s) => s.userId)
  const loadLeaderboard = usePackStore((s) => s.loadLeaderboard)

  const activeTab = TABS.find((t) => t.key === leaderboardType) ?? TABS[0]

  return (
    <div className="mx-auto w-full max-w-2xl px-5 pb-16 sm:px-8">
      <div className="mb-6 mt-4 text-center">
        <h1 className="text-2xl font-bold text-white sm:text-3xl">Ranglijst</h1>
        <p className="mt-1 text-sm text-white/50">Hoe je het doet t.o.v. andere spelers.</p>
      </div>

      <div className="mb-6 flex flex-wrap justify-center gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => loadLeaderboard(tab.key)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              leaderboardType === tab.key ? 'bg-white text-black' : 'bg-white/5 text-white/60 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {leaderboardStatus === 'loading' && <p className="text-center text-xs text-violet-300/80">Laden…</p>}

      <div className="flex flex-col gap-1.5">
        {leaderboardEntries.map((entry, i) => {
          const isMe = entry.userId === userId
          return (
            <motion.div
              key={entry.userId}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className={`flex items-center gap-3 rounded-xl px-4 py-2.5 ring-1 ${
                isMe ? 'bg-violet-500/15 ring-violet-400/30' : 'bg-white/5 ring-white/10'
              }`}
            >
              <span className="w-6 text-center font-mono text-sm text-white/40">{i + 1}</span>
              <span className="flex-1 truncate text-sm font-semibold text-white">
                {entry.name}
                {isMe && <span className="ml-1.5 text-xs text-violet-300">(jij)</span>}
              </span>
              <span className="font-mono text-sm text-amber-300">
                {entry.score.toLocaleString('nl-NL')} {activeTab.unit}
              </span>
            </motion.div>
          )
        })}
        {leaderboardEntries.length === 0 && leaderboardStatus === 'ready' && (
          <p className="text-center text-sm text-white/30">Nog geen spelers op deze ranglijst.</p>
        )}
      </div>
    </div>
  )
}
