import { motion } from 'framer-motion'
import { usePackStore } from '../store/usePackStore'

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
          {quests.map((q) => {
            const pct = Math.min(100, Math.round((q.progress / q.targetCount) * 100))
            return (
              <div key={q.code} className="rounded-xl bg-white/5 p-4 ring-1 ring-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-white">{q.name}</p>
                    <p className="text-xs text-white/50">{q.description}</p>
                  </div>
                  <div className="text-right">
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
              </div>
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
          {achievements.map((a) => (
            <div
              key={a.code}
              className={`rounded-xl p-4 ring-1 ${
                a.unlocked ? 'bg-amber-400/10 ring-amber-400/25' : 'bg-white/5 ring-white/10'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className={`font-semibold ${a.unlocked ? 'text-amber-200' : 'text-white'}`}>
                    {a.unlocked ? '🏆 ' : ''}
                    {a.name}
                  </p>
                  <p className="text-xs text-white/50">{a.description}</p>
                </div>
                <span className="whitespace-nowrap text-xs font-mono text-amber-300">+{a.rewardCoins} 🪙</span>
              </div>
            </div>
          ))}
          {achievements.length === 0 && questsStatus === 'ready' && (
            <p className="text-sm text-white/30">Geen achievements gevonden.</p>
          )}
        </div>
      </section>
    </div>
  )
}
