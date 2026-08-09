import { useState, type FormEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePackStore } from '../store/usePackStore'
import { PokeballIcon } from './PokeballIcon'

export function AuthScreen() {
  const mode = usePackStore((s) => s.authFormMode)
  const setMode = usePackStore((s) => s.setAuthFormMode)
  const submitting = usePackStore((s) => s.authSubmitting)
  const error = usePackStore((s) => s.authError)
  const doRegister = usePackStore((s) => s.register)
  const doLogin = usePackStore((s) => s.login)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const isRegister = mode === 'register'

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (isRegister) doRegister(name.trim(), email.trim(), password)
    else doLogin(email.trim(), password)
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-12">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(55% 45% at 50% 0%, rgba(239,68,68,0.16), transparent 65%), radial-gradient(50% 40% at 100% 100%, rgba(124,58,237,0.18), transparent 60%)',
        }}
      />
      <div className="pointer-events-none absolute -bottom-24 -left-24 opacity-[0.06]">
        <PokeballIcon className="h-96 w-96" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative w-full max-w-sm rounded-3xl bg-white/[0.04] p-8 shadow-2xl ring-1 ring-white/10 backdrop-blur-xl"
      >
        <div className="mb-7 flex flex-col items-center text-center">
          <PokeballIcon className="h-12 w-12 drop-shadow-lg" spin={submitting} />
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-white">
            Poke<span className="text-red-400">Pack</span>
          </h1>
          <p className="mt-1 text-sm text-white/50">
            {isRegister ? 'Maak een account en begin je collectie.' : 'Welkom terug, trainer.'}
          </p>
        </div>

        <div className="mb-6 flex rounded-full bg-white/5 p-1 ring-1 ring-white/10">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`flex-1 rounded-full py-2 text-sm font-semibold transition ${
              !isRegister ? 'bg-white text-black' : 'text-white/50 hover:text-white'
            }`}
          >
            Inloggen
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`flex-1 rounded-full py-2 text-sm font-semibold transition ${
              isRegister ? 'bg-white text-black' : 'text-white/50 hover:text-white'
            }`}
          >
            Account maken
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <AnimatePresence mode="popLayout" initial={false}>
            {isRegister && (
              <motion.div
                key="name"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-white/40">
                  Naam
                </label>
                <input
                  type="text"
                  required
                  minLength={1}
                  maxLength={80}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ash Ketchum"
                  className="w-full rounded-xl bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/30 ring-1 ring-white/10 outline-none transition focus:ring-2 focus:ring-red-400/50"
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-white/40">
              E-mail
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="trainer@pokepack.local"
              className="w-full rounded-xl bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/30 ring-1 ring-white/10 outline-none transition focus:ring-2 focus:ring-red-400/50"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-white/40">
              Wachtwoord
            </label>
            <input
              type="password"
              required
              minLength={8}
              maxLength={72}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimaal 8 tekens"
              className="w-full rounded-xl bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/30 ring-1 ring-white/10 outline-none transition focus:ring-2 focus:ring-red-400/50"
            />
          </div>

          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="rounded-lg bg-rose-500/10 px-3 py-2 text-xs text-rose-300 ring-1 ring-rose-400/20"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-red-500 to-red-600 py-2.5 text-sm font-bold text-white shadow-lg shadow-red-500/20 transition hover:from-red-400 hover:to-red-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? 'Bezig…' : isRegister ? 'Account aanmaken' : 'Inloggen'}
          </button>
        </form>

        <p className="mt-5 text-center text-xs text-white/30">
          {isRegister ? 'Al een account?' : 'Nog geen account?'}{' '}
          <button
            type="button"
            onClick={() => setMode(isRegister ? 'login' : 'register')}
            className="font-semibold text-white/60 underline-offset-2 hover:text-white hover:underline"
          >
            {isRegister ? 'Log in' : 'Maak er een'}
          </button>
        </p>
      </motion.div>
    </div>
  )
}
