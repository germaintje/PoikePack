import { create } from 'zustand'
import type { CardData, PackType, PullResult } from '../lib/types'
import * as api from '../lib/api'
import type {
  BackendAchievementStatus,
  BackendQuestStatus,
  BackendLeaderboardEntry,
  BackendProfile,
  LeaderboardType,
} from '../lib/api'
import { mapCard, mapPackType, mapPulledCard } from '../lib/mapBackend'

type Stage = 'select' | 'opening' | 'reveal' | 'summary'
export type View = 'packs' | 'binder' | 'quests' | 'leaderboard' | 'profile'
type LoadStatus = 'idle' | 'loading' | 'ready' | 'error'
type DailyBonusStatus = 'idle' | 'claiming' | 'claimed' | 'already-claimed' | 'error'
type AuthStatus = 'checking' | 'signed-out' | 'signed-in' | 'offline'
type AuthFormMode = 'login' | 'register'

interface LastOpenExtras {
  setCompletionBonusCoins: number | null
  unlockedAchievementNames: string[]
}

interface PackState {
  authStatus: AuthStatus
  authFormMode: AuthFormMode
  authError: string | null
  authSubmitting: boolean

  userId: number | null
  name: string
  email: string
  coins: number
  playerLevel: number
  avatarEmoji: string
  bio: string | null

  profile: BackendProfile | null
  profileStatus: LoadStatus
  profileSaving: boolean

  view: View
  stage: Stage
  selectedPack: PackType | null
  pulls: PullResult[]
  revealedCount: number
  lastOpenExtras: LastOpenExtras

  packTypes: PackType[]
  packsStatus: LoadStatus
  actionError: string | null

  setCards: Record<string, CardData[]> // per setId — alle kaarten van de set, voor binder-voortgang
  owned: Record<string, number> // cardId -> aantal exemplaren
  binderStatus: LoadStatus

  dailyBonusStatus: DailyBonusStatus
  dailyBonusStreak: number | null
  dailyBonusCoinsAwarded: number | null

  quests: BackendQuestStatus[]
  achievements: BackendAchievementStatus[]
  questsStatus: LoadStatus

  leaderboardType: LeaderboardType
  leaderboardEntries: BackendLeaderboardEntry[]
  leaderboardStatus: LoadStatus

  init: () => Promise<void>
  setAuthFormMode: (mode: AuthFormMode) => void
  register: (name: string, email: string, password: string) => Promise<void>
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  loadProfile: () => Promise<void>
  updateProfile: (update: { bio?: string; avatarEmoji?: string }) => Promise<void>

  setView: (view: View) => void
  selectPack: (pack: PackType) => void
  openPack: () => Promise<void>
  beginReveal: () => void
  revealNext: () => void
  finishReveal: () => void
  sellDuplicates: () => Promise<void>
  claimDailyBonus: () => Promise<void>
  loadQuestsAndAchievements: () => Promise<void>
  loadLeaderboard: (type: LeaderboardType) => Promise<void>
  reset: () => void
}

async function refreshBinder(): Promise<Record<string, number>> {
  const entries = await api.fetchBinder()
  const owned: Record<string, number> = {}
  entries.forEach((e) => {
    owned[e.cardId] = e.quantity
  })
  return owned
}

function applyUser(user: { id: number; name: string; email: string; coins: number; level: number; avatarEmoji: string; bio: string | null }) {
  return {
    userId: user.id,
    name: user.name,
    email: user.email,
    coins: user.coins,
    playerLevel: user.level,
    avatarEmoji: user.avatarEmoji,
    bio: user.bio,
  }
}

async function loadGameData(set: (partial: Partial<PackState>) => void) {
  set({ packsStatus: 'loading' })
  const packDtos = await api.fetchPackTypes()
  const packTypes = packDtos.map(mapPackType)
  set({ packTypes, packsStatus: 'ready' })

  const uniqueSetIds = [...new Set(packTypes.map((p) => p.setId))]
  set({ binderStatus: 'loading' })
  const [setCardsEntries, owned] = await Promise.all([
    Promise.all(uniqueSetIds.map(async (setId) => [setId, (await api.fetchCardsForSet(setId)).map(mapCard)] as const)),
    refreshBinder(),
  ])
  set({ setCards: Object.fromEntries(setCardsEntries), owned, binderStatus: 'ready' })
}

export const usePackStore = create<PackState>((set, get) => ({
  authStatus: 'checking',
  authFormMode: 'register',
  authError: null,
  authSubmitting: false,

  userId: null,
  name: '',
  email: '',
  coins: 0,
  playerLevel: 1,
  avatarEmoji: '🧑',
  bio: null,

  profile: null,
  profileStatus: 'idle',
  profileSaving: false,

  view: 'packs',
  stage: 'select',
  selectedPack: null,
  pulls: [],
  revealedCount: 0,
  lastOpenExtras: { setCompletionBonusCoins: null, unlockedAchievementNames: [] },

  packTypes: [],
  packsStatus: 'idle',
  actionError: null,

  setCards: {},
  owned: {},
  binderStatus: 'idle',

  dailyBonusStatus: 'idle',
  dailyBonusStreak: null,
  dailyBonusCoinsAwarded: null,

  quests: [],
  achievements: [],
  questsStatus: 'idle',

  leaderboardType: 'coins',
  leaderboardEntries: [],
  leaderboardStatus: 'idle',

  init: async () => {
    if (get().authStatus !== 'checking' && get().authStatus !== 'offline') return
    if (!api.getToken()) {
      set({ authStatus: 'signed-out' })
      return
    }
    set({ authStatus: 'checking' })
    try {
      const profile = await api.fetchProfile()
      set({ ...applyUser(profile), authStatus: 'signed-in' })
      await loadGameData(set)
    } catch (err) {
      if (err instanceof api.ApiError && err.status === 401) {
        // Token is echt ongeldig/verlopen — niet hetzelfde als de backend die niet bereikbaar is.
        api.setToken(null)
        set({ authStatus: 'signed-out' })
      } else {
        console.warn('Kon de backend niet bereiken.', err)
        set({ authStatus: 'offline' })
      }
    }
  },

  setAuthFormMode: (mode) => set({ authFormMode: mode, authError: null }),

  register: async (name, email, password) => {
    set({ authSubmitting: true, authError: null })
    try {
      const response = await api.register(name, email, password)
      api.setToken(response.token)
      set({ ...applyUser(response.user), authStatus: 'signed-in', authSubmitting: false })
      await loadGameData(set)
    } catch (err) {
      set({ authSubmitting: false, authError: err instanceof Error ? err.message : 'Registreren is mislukt.' })
    }
  },

  login: async (email, password) => {
    set({ authSubmitting: true, authError: null })
    try {
      const response = await api.login(email, password)
      api.setToken(response.token)
      set({ ...applyUser(response.user), authStatus: 'signed-in', authSubmitting: false })
      await loadGameData(set)
    } catch (err) {
      set({ authSubmitting: false, authError: err instanceof Error ? err.message : 'Inloggen is mislukt.' })
    }
  },

  logout: () => {
    api.setToken(null)
    set({
      authStatus: 'signed-out',
      authFormMode: 'login',
      userId: null,
      name: '',
      email: '',
      coins: 0,
      playerLevel: 1,
      avatarEmoji: '🧑',
      bio: null,
      profile: null,
      profileStatus: 'idle',
      view: 'packs',
      stage: 'select',
      packTypes: [],
      packsStatus: 'idle',
      setCards: {},
      owned: {},
      binderStatus: 'idle',
      quests: [],
      achievements: [],
      questsStatus: 'idle',
    })
  },

  loadProfile: async () => {
    set({ profileStatus: 'loading' })
    try {
      const profile = await api.fetchProfile()
      set({ profile, profileStatus: 'ready', ...applyUser(profile) })
    } catch (err) {
      console.warn('Kon profiel niet laden.', err)
      set({ profileStatus: 'error' })
    }
  },

  updateProfile: async (update) => {
    set({ profileSaving: true })
    try {
      const profile = await api.updateProfile(update)
      set({ profile, profileSaving: false, avatarEmoji: profile.avatarEmoji, bio: profile.bio })
    } catch (err) {
      console.warn('Bijwerken van profiel is mislukt.', err)
      set({ profileSaving: false })
    }
  },

  setView: (view) => {
    set({ view })
    if (view === 'quests') get().loadQuestsAndAchievements()
    if (view === 'leaderboard') get().loadLeaderboard(get().leaderboardType)
    if (view === 'profile') get().loadProfile()
  },

  selectPack: (pack) => set({ selectedPack: pack, actionError: null }),

  openPack: async () => {
    const { selectedPack, coins } = get()
    if (!selectedPack) return
    if (coins < selectedPack.price) {
      set({ actionError: 'Te weinig coins voor deze pack.' })
      return
    }

    try {
      const response = await api.openPack(Number(selectedPack.id))
      const pulls: PullResult[] = response.cards.map(mapPulledCard)
      set({
        pulls,
        revealedCount: 0,
        coins: response.coinsBalance,
        stage: 'opening',
        actionError: null,
        lastOpenExtras: {
          setCompletionBonusCoins: response.setCompletionBonusCoins,
          unlockedAchievementNames: response.unlockedAchievementNames,
        },
      })
      // Binder op de achtergrond verversen — hoeft de reveal-flow niet te blokkeren.
      refreshBinder()
        .then((owned) => set({ owned }))
        .catch((err) => console.warn('Kon binder niet verversen na pack-opening.', err))
    } catch (err) {
      set({ actionError: err instanceof Error ? err.message : 'Openen van de pack is mislukt.' })
    }
  },

  beginReveal: () => set({ stage: 'reveal' }),

  revealNext: () =>
    set((s) => ({ revealedCount: Math.min(s.revealedCount + 1, s.pulls.length) })),

  finishReveal: () => set({ stage: 'summary' }),

  sellDuplicates: async () => {
    try {
      const response = await api.sellDuplicates()
      const owned = await refreshBinder()
      set({ coins: response.coinsBalance, owned })
    } catch (err) {
      set({ actionError: err instanceof Error ? err.message : 'Verkopen is mislukt.' })
    }
  },

  claimDailyBonus: async () => {
    set({ dailyBonusStatus: 'claiming' })
    try {
      const response = await api.claimDailyBonus()
      set({
        coins: response.coinsBalance,
        dailyBonusStatus: 'claimed',
        dailyBonusStreak: response.streak,
        dailyBonusCoinsAwarded: response.coinsAwarded,
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : ''
      const alreadyClaimed = message.toLowerCase().includes('al geclaimd')
      set({ dailyBonusStatus: alreadyClaimed ? 'already-claimed' : 'error' })
    }
  },

  loadQuestsAndAchievements: async () => {
    set({ questsStatus: 'loading' })
    try {
      const [quests, achievements] = await Promise.all([
        api.fetchQuests(),
        api.fetchAchievements(),
      ])
      set({ quests, achievements, questsStatus: 'ready' })
    } catch (err) {
      console.warn('Kon quests/achievements niet laden.', err)
      set({ questsStatus: 'error' })
    }
  },

  loadLeaderboard: async (type) => {
    set({ leaderboardStatus: 'loading', leaderboardType: type })
    try {
      const entries = await api.fetchLeaderboard(type)
      set({ leaderboardEntries: entries, leaderboardStatus: 'ready' })
    } catch (err) {
      console.warn('Kon leaderboard niet laden.', err)
      set({ leaderboardStatus: 'error' })
    }
  },

  reset: () => set({ stage: 'select', selectedPack: null, pulls: [], revealedCount: 0, actionError: null }),
}))
