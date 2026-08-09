import { motion, AnimatePresence } from 'framer-motion'
import { usePackStore } from '../store/usePackStore'
import { PokeballIcon } from './PokeballIcon'
import type { View } from '../store/usePackStore'

const NAV_ITEMS: { key: View; label: string; icon: string }[] = [
  { key: 'packs', label: 'Packs', icon: '🎴' },
  { key: 'binder', label: 'Binder', icon: '📖' },
  { key: 'quests', label: 'Missies', icon: '🎯' },
  { key: 'leaderboard', label: 'Ranglijst', icon: '🏆' },
  { key: 'profile', label: 'Profiel', icon: '👤' },
]

function SidebarContents({ onNavigate }: { onNavigate?: () => void }) {
  const view = usePackStore((s) => s.view)
  const setView = usePackStore((s) => s.setView)
  const reset = usePackStore((s) => s.reset)
  const name = usePackStore((s) => s.name)
  const avatarEmoji = usePackStore((s) => s.avatarEmoji)
  const playerLevel = usePackStore((s) => s.playerLevel)
  const logout = usePackStore((s) => s.logout)

  const go = (key: View) => {
    if (key === 'packs') reset()
    setView(key)
    onNavigate?.()
  }

  return (
    <div className="flex h-full flex-col gap-6 p-5">
      <button type="button" onClick={() => go('packs')} className="flex items-center gap-2.5 px-1 text-left">
        <PokeballIcon className="h-8 w-8 drop-shadow" />
        <span className="text-lg font-bold tracking-tight text-white">
          Poke<span className="text-red-400">Pack</span>
        </span>
      </button>

      <nav className="flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const active = view === item.key
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => go(item.key)}
              className={`group relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition ${
                active ? 'bg-white text-black' : 'text-white/55 hover:bg-white/[0.06] hover:text-white'
              }`}
            >
              {active && (
                <motion.span
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-xl bg-white"
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  style={{ zIndex: -1 }}
                />
              )}
              <span className="text-base">{item.icon}</span>
              {item.label}
            </button>
          )
        })}
      </nav>

      <button
        type="button"
        onClick={() => go('profile')}
        className="flex items-center gap-3 rounded-xl bg-white/[0.04] px-3 py-2.5 text-left ring-1 ring-white/10 transition hover:bg-white/[0.08]"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-lg">
          {avatarEmoji}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-white">{name || 'Trainer'}</span>
          <span className="block text-xs text-white/40">Level {playerLevel}</span>
        </span>
      </button>

      <button
        type="button"
        onClick={logout}
        className="rounded-xl px-3.5 py-2 text-left text-xs font-semibold text-white/35 transition hover:text-rose-300"
      >
        Uitloggen
      </button>
    </div>
  )
}

export function Sidebar({ mobileOpen, onCloseMobile }: { mobileOpen: boolean; onCloseMobile: () => void }) {
  return (
    <>
      <aside className="hidden w-64 shrink-0 border-r border-white/10 bg-white/[0.02] lg:block">
        <div className="sticky top-0 h-screen">
          <SidebarContents />
        </div>
      </aside>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onCloseMobile}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 34 }}
              className="fixed inset-y-0 left-0 z-50 w-72 bg-[#120e1e] shadow-2xl lg:hidden"
            >
              <SidebarContents onNavigate={onCloseMobile} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
