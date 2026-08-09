import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { usePackStore } from './store/usePackStore'
import { Sidebar } from './components/Sidebar'
import { TopBar } from './components/TopBar'
import { PackSelectScreen } from './components/PackSelectScreen'
import { PackDetailScreen } from './components/PackDetailScreen'
import { PackOpeningScreen } from './components/PackOpeningScreen'
import { CardRevealScreen } from './components/CardRevealScreen'
import { SummaryScreen } from './components/SummaryScreen'
import { BinderScreen } from './components/BinderScreen'
import { QuestsScreen } from './components/QuestsScreen'
import { LeaderboardScreen } from './components/LeaderboardScreen'
import { ProfileScreen } from './components/ProfileScreen'
import { AuthScreen } from './components/AuthScreen'
import { PokeballIcon } from './components/PokeballIcon'

function BackgroundGlow() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      <div
        className="absolute inset-0 opacity-60"
        style={{
          background: 'radial-gradient(60% 50% at 50% 0%, rgba(124,58,237,0.2), transparent 70%)',
        }}
      />
      <div
        className="absolute -right-1/4 top-1/3 h-[60vh] w-[60vh] opacity-40"
        style={{ background: 'radial-gradient(circle, rgba(239,68,68,0.16), transparent 70%)' }}
      />
      <div
        className="absolute -left-1/4 bottom-0 h-[50vh] w-[50vh] opacity-30"
        style={{ background: 'radial-gradient(circle, rgba(56,189,248,0.12), transparent 70%)' }}
      />
      <div
        className="dot-grid absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            'radial-gradient(circle, rgba(255,255,255,0.9) 1px, transparent 1px)',
          backgroundSize: '26px 26px',
        }}
      />
    </div>
  )
}

function AppShell() {
  const view = usePackStore((s) => s.view)
  const stage = usePackStore((s) => s.stage)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  return (
    <div className="flex min-h-screen">
      <Sidebar mobileOpen={mobileNavOpen} onCloseMobile={() => setMobileNavOpen(false)} />
      <div className="min-w-0 flex-1">
        <TopBar onOpenMobileNav={() => setMobileNavOpen(true)} />
        <AnimatePresence mode="wait">
          <motion.main
            key={view === 'packs' ? stage : view}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="pt-6"
          >
            {view === 'binder' && <BinderScreen />}
            {view === 'quests' && <QuestsScreen />}
            {view === 'leaderboard' && <LeaderboardScreen />}
            {view === 'profile' && <ProfileScreen />}
            {view === 'packs' && stage === 'select' && <PackSelectScreen />}
            {view === 'packs' && stage === 'detail' && <PackDetailScreen />}
            {view === 'packs' && stage === 'opening' && <PackOpeningScreen />}
            {view === 'packs' && stage === 'reveal' && <CardRevealScreen />}
            {view === 'packs' && stage === 'summary' && <SummaryScreen />}
          </motion.main>
        </AnimatePresence>
      </div>
    </div>
  )
}

function App() {
  const authStatus = usePackStore((s) => s.authStatus)
  const init = usePackStore((s) => s.init)

  useEffect(() => {
    init()
  }, [init])

  return (
    <div className="min-h-screen bg-[#0a0812] text-white">
      <BackgroundGlow />
      <div className="relative">
        {authStatus === 'checking' && (
          <div className="flex min-h-screen flex-col items-center justify-center gap-3 text-white/40">
            <PokeballIcon className="h-10 w-10" spin />
            <p className="text-sm">PokePack laden…</p>
          </div>
        )}
        {authStatus === 'offline' && (
          <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-5 text-center">
            <PokeballIcon className="h-10 w-10 opacity-50" />
            <p className="text-lg font-semibold text-white">Kan de backend niet bereiken</p>
            <p className="max-w-sm text-sm text-white/50">
              Draait <code className="rounded bg-white/10 px-1.5 py-0.5">mvn spring-boot:run</code> in{' '}
              <code className="rounded bg-white/10 px-1.5 py-0.5">backend/</code>?
            </p>
            <button
              type="button"
              onClick={() => init()}
              className="mt-2 rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white ring-1 ring-white/15 transition hover:bg-white/20"
            >
              Opnieuw proberen
            </button>
          </div>
        )}
        {authStatus === 'signed-out' && <AuthScreen />}
        {authStatus === 'signed-in' && <AppShell />}
      </div>
    </div>
  )
}

export default App
