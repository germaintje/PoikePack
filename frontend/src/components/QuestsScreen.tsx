import { motion } from 'framer-motion'
import { usePackStore } from '../store/usePackStore'

const PERIOD_ICON: Record<string, string> = { daily: '📅', weekly: '🗓️', monthly: '🌕', once: '⭐' }

export function QuestsScreen() {
  const quests = usePackStore((s) => s.quests)
  const achievements = usePackStore((s) => s.achievements)
  const questsStatus = usePackStore((s) => s.questsStatus)

  return (
    <div className="mx-auto w-full max-w-3xl px-5 pb-16 sm:px-8">
      <div className="mb-8 mt-4 text-center">
        <h1 className="text-2xl font-bold text-white sm:text-3xl">Missies</h1>
        <p className="mt-1 text-sm text-white/50">Quests en achievements — coins voor elke mijlpaal.</p>
        {questsStatus === 'loading' && <p className="mt-2 text-xs text-violet-300/80">Laden…</p>}
      </div>

      <section className="mb-10">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-white/40">Quests</h2>
        <div className="flex flex-col gap-3">
          {quests.map((q, i) => {
            const pct = Math.min(100, Math.round((q.progress / q.targetCount) * 100))
            return (
              <motion.div
                key={q.code}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`rounded-xl p-4 ring-1 transition ${
                  q.completed ? 'bg-emerald-400/[0.06] ring-emerald-400/20' : 'bg-white/5 ring-white/10'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="text-xl">{PERIOD_ICON[q.period] ?? '🎯'}</span>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-white">{q.name}</p>
                      <p className="truncate text-xs text-white/50">{q.description}</p>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <span
                      className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wide ${
                        q.completed
                          ? 'bg-emerald-400/15 text-emerald-300'
                          : 'bg-white/10 text-white/50'
                      }`}
                    >
                      {q.completed ? 'Voltooid' : q.period}
                    </span>
                    <p className="mt-1 text-xs font-mono text-amber-300">+{q.rewardCoins} 🪙</p>
                    <p className="text-[11px] font-mono text-violet-300">+{q.rewardXp} XP</p>
                  </div>
                </div>
                <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    className={`h-full rounded-full ${q.completed ? 'bg-emerald-400' : 'bg-violet-400'}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <p className="mt-1 text-right text-[11px] text-white/40">
                  {q.progress} / {q.targetCount}
                </p>
              </motion.div>
            )
          })}
          {quests.length === 0 && questsStatus === 'ready' && (
            <p className="text-sm text-white/30">Geen actieve quests.</p>
          )}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-white/40">Achievements</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {achievements.map((a, i) => (
            <motion.div
              key={a.code}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className={`relative overflow-hidden rounded-xl p-4 ring-1 ${
                a.unlocked ? 'bg-amber-400/10 ring-amber-400/25 shadow-[0_0_25px_rgba(252,211,77,0.12)]' : 'bg-white/5 ring-white/10'
              }`}
            >
              <div className="flex items-start gap-3">
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-base ${
                    a.unlocked ? 'bg-amber-400/20' : 'bg-white/5 opacity-40'
                  }`}
                >
                  {a.unlocked ? '🏆' : '🔒'}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`truncate font-semibold ${a.unlocked ? 'text-amber-200' : 'text-white'}`}>{a.name}</p>
                    <span className="shrink-0 whitespace-nowrap text-right text-xs font-mono text-amber-300">
                      +{a.rewardCoins} 🪙
                      <span className="block text-[11px] text-violet-300">+{a.rewardXp} XP</span>
                    </span>
                  </div>
                  <p className="text-xs text-white/50">{a.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
          {achievements.length === 0 && questsStatus === 'ready' && (
            <p className="text-sm text-white/30">Geen achievements gevonden.</p>
          )}
        </div>
      </section>
    </div>
  )
}
