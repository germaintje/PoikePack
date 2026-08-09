import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { usePackStore } from '../store/usePackStore'

const AVATAR_OPTIONS = ['🧑', '🔥', '💧', '🌿', '⚡', '🌙', '⭐', '🎴', '🐉', '👑', '🦊', '🐢']

function StatCard({ label, value, glyph, delay }: { label: string; value: string; glyph: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="rounded-2xl bg-white/[0.04] p-5 ring-1 ring-white/10"
    >
      <div className="text-2xl">{glyph}</div>
      <div className="mt-2 font-mono text-2xl font-bold text-white">{value}</div>
      <div className="mt-1 text-xs text-white/45">{label}</div>
    </motion.div>
  )
}

export function ProfileScreen() {
  const profile = usePackStore((s) => s.profile)
  const profileStatus = usePackStore((s) => s.profileStatus)
  const profileSaving = usePackStore((s) => s.profileSaving)
  const updateProfile = usePackStore((s) => s.updateProfile)
  const logout = usePackStore((s) => s.logout)

  const [bio, setBio] = useState('')
  const [pickerOpen, setPickerOpen] = useState(false)
  const [dirty, setDirty] = useState(false)

  useEffect(() => {
    if (profile && !dirty) setBio(profile.bio ?? '')
  }, [profile, dirty])

  if (profileStatus === 'loading' || !profile) {
    return (
      <div className="mx-auto w-full max-w-3xl px-5 pb-16 sm:px-8">
        <div className="mt-16 flex flex-col items-center gap-3 text-white/40">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-red-400" />
          <p className="text-sm">Profiel laden…</p>
        </div>
      </div>
    )
  }

  const createdAt = new Date(profile.createdAt).toLocaleDateString('nl-NL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="mx-auto w-full max-w-3xl px-5 pb-16 sm:px-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative mt-4 overflow-hidden rounded-3xl bg-gradient-to-br from-red-500/15 via-white/[0.03] to-violet-500/10 p-7 ring-1 ring-white/10"
      >
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
          <div className="relative">
            <button
              type="button"
              onClick={() => setPickerOpen((v) => !v)}
              className="flex h-20 w-20 items-center justify-center rounded-full bg-white/10 text-4xl ring-2 ring-white/20 transition hover:ring-red-400/50"
              title="Kies een avatar"
            >
              {profile.avatarEmoji}
            </button>
            {pickerOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="absolute left-1/2 top-full z-10 mt-2 grid w-48 -translate-x-1/2 grid-cols-4 gap-1.5 rounded-2xl bg-[#151022] p-3 shadow-2xl ring-1 ring-white/15"
              >
                {AVATAR_OPTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => {
                      updateProfile({ avatarEmoji: emoji })
                      setPickerOpen(false)
                    }}
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-xl transition hover:bg-white/10"
                  >
                    {emoji}
                  </button>
                ))}
              </motion.div>
            )}
          </div>

          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white">{profile.name}</h1>
            <p className="text-sm text-white/40">{profile.email}</p>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold text-white/70 ring-1 ring-white/10">
                Level {profile.level}
              </span>
              <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold text-white/50 ring-1 ring-white/10">
                Trainer sinds {createdAt}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={logout}
            className="rounded-xl bg-white/5 px-4 py-2 text-xs font-semibold text-white/60 ring-1 ring-white/10 transition hover:bg-rose-500/15 hover:text-rose-300 hover:ring-rose-400/30"
          >
            Uitloggen
          </button>
        </div>
      </motion.div>

      <div className="mt-6">
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-white/40">Bio</label>
        <textarea
          value={bio}
          maxLength={280}
          rows={3}
          onChange={(e) => {
            setBio(e.target.value)
            setDirty(true)
          }}
          onBlur={() => {
            if (dirty) {
              updateProfile({ bio })
              setDirty(false)
            }
          }}
          placeholder="Vertel iets over jezelf als trainer…"
          className="w-full resize-none rounded-2xl bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-white/25 ring-1 ring-white/10 outline-none transition focus:ring-2 focus:ring-red-400/40"
        />
        <div className="mt-1 flex items-center justify-between text-[11px] text-white/30">
          <span>{profileSaving ? 'Opslaan…' : dirty ? 'Wordt opgeslagen zodra je wegklikt' : ' '}</span>
          <span>{bio.length}/280</span>
        </div>
      </div>

      <h2 className="mb-3 mt-8 text-sm font-semibold uppercase tracking-wide text-white/40">Statistieken</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard glyph="🎴" label="Packs geopend" value={profile.stats.packsOpenedTotal.toLocaleString('nl-NL')} delay={0} />
        <StatCard glyph="🃏" label="Kaarten verzameld" value={profile.stats.cardsCollectedTotal.toLocaleString('nl-NL')} delay={0.05} />
        <StatCard glyph="🪙" label="Coins verdiend" value={profile.stats.coinsEarnedTotal.toLocaleString('nl-NL')} delay={0.1} />
        <StatCard glyph="💸" label="Coins uitgegeven" value={profile.stats.coinsSpentTotal.toLocaleString('nl-NL')} delay={0.15} />
      </div>
    </div>
  )
}
