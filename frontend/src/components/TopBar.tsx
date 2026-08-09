import { usePackStore } from '../store/usePackStore'

export function TopBar() {
  const coins = usePackStore((s) => s.coins)
  const stage = usePackStore((s) => s.stage)
  const reset = usePackStore((s) => s.reset)

  return (
    <header className="flex items-center justify-between px-5 py-4 sm:px-8">
      <button
        type="button"
        onClick={reset}
        className="flex items-center gap-2 text-left"
      >
        <span className="text-2xl">🎴</span>
        <span className="text-lg font-bold tracking-tight text-white">
          Poke<span className="text-violet-400">Pack</span>
        </span>
      </button>

      <div className="flex items-center gap-3">
        {stage !== 'select' && (
          <span className="hidden text-xs uppercase tracking-wide text-white/40 sm:inline">
            {stage === 'opening' && 'Pack openen'}
            {stage === 'reveal' && 'Kaarten onthullen'}
            {stage === 'summary' && 'Resultaat'}
          </span>
        )}
        <div className="flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1.5 ring-1 ring-white/10">
          <span className="text-base">🪙</span>
          <span className="font-mono text-sm font-semibold text-amber-300">
            {coins.toLocaleString('nl-NL')}
          </span>
        </div>
      </div>
    </header>
  )
}
