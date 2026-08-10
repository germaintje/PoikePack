// Client voor de eigen PokePack-backend. De frontend praat vanaf nu alleen nog met deze API —
// geen client-side RNG en geen rechtstreekse calls naar de Pokémon TCG API meer (zie
// docs/PROJECT_BRIEF.md §2.1/§4: dat is precies wat de architectuur wil voorkomen).

const API_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? 'http://localhost:8080'

const TOKEN_STORAGE_KEY = 'pokepack_token'

let token: string | null = localStorage.getItem(TOKEN_STORAGE_KEY)

export function getToken(): string | null {
  return token
}

export function setToken(next: string | null) {
  token = next
  if (next) localStorage.setItem(TOKEN_STORAGE_KEY, next)
  else localStorage.removeItem(TOKEN_STORAGE_KEY)
}

function authHeaders(): HeadersInit {
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let message = `Backend antwoordde met ${res.status}`
    try {
      const body = (await res.json()) as { message?: string }
      if (body?.message) message = body.message
    } catch {
      // geen JSON-body — val terug op de generieke message hierboven
    }
    throw new ApiError(res.status, message)
  }
  return res.json() as Promise<T>
}

export interface BackendUser {
  id: number
  name: string
  email: string
  coins: number
  level: number
  xp: number
  xpForCurrentLevel: number
  xpForNextLevel: number
  avatarEmoji: string
  bio: string | null
}

export interface BackendAuthResponse {
  token: string
  user: BackendUser
}

export interface BackendUserStats {
  packsOpenedTotal: number
  coinsEarnedTotal: number
  coinsSpentTotal: number
  cardsCollectedTotal: number
}

export interface BackendProfile extends BackendUser {
  createdAt: string
  lastLoginAt: string | null
  stats: BackendUserStats
}

export interface BackendPackType {
  id: number
  name: string
  setId: string
  setName: string
  logoUrl: string | null
  price: number
  unlockLevel: number
  slotCommons: number
  slotUncommons: number
  slotReverseHolo: number
  slotHits: number
}

export interface BackendPulledCard {
  cardId: string
  name: string
  setName: string
  number: string
  rarity: string
  imageLargeUrl: string | null
  reverseHolo: boolean
  duplicate: boolean
  sellValue: number
}

export interface BackendPackOpenResponse {
  packOpeningId: number
  coinsSpent: number
  coinsBalance: number
  cards: BackendPulledCard[]
  setCompletionBonusCoins: number | null
  unlockedAchievementNames: string[]
  completedQuestNames: string[]
  playerLevel: number
  xp: number
  xpGained: number
  xpForNextLevel: number
}

export interface BackendBinderEntry {
  cardId: string
  name: string
  setId: string
  setName: string
  number: string
  rarity: string
  imageLargeUrl: string | null
  quantity: number
}

export interface BackendCard {
  cardId: string
  name: string
  setId: string
  setName: string
  number: string
  rarity: string
  imageLargeUrl: string | null
}

export interface BackendSellDuplicatesResponse {
  coinsEarned: number
  coinsBalance: number
}

export interface BackendDailyBonusResponse {
  coinsAwarded: number
  streak: number
  coinsBalance: number
}

export interface BackendQuestStatus {
  code: string
  name: string
  description: string
  period: string
  targetCount: number
  rewardCoins: number
  rewardXp: number
  progress: number
  completed: boolean
}

export interface BackendAchievementStatus {
  code: string
  name: string
  description: string
  rewardCoins: number
  rewardXp: number
  unlocked: boolean
  unlockedAt: string | null
}

export interface BackendLeaderboardEntry {
  userId: number
  name: string
  score: number
}

export type LeaderboardType = 'coins' | 'collection' | 'complete-sets'

export function register(name: string, email: string, password: string): Promise<BackendAuthResponse> {
  return fetch(`${API_BASE}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  }).then(handle<BackendAuthResponse>)
}

export function login(email: string, password: string): Promise<BackendAuthResponse> {
  return fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  }).then(handle<BackendAuthResponse>)
}

export function fetchProfile(): Promise<BackendProfile> {
  return fetch(`${API_BASE}/api/profile`, { headers: authHeaders() }).then(handle<BackendProfile>)
}

export function updateProfile(update: { bio?: string; avatarEmoji?: string }): Promise<BackendProfile> {
  return fetch(`${API_BASE}/api/profile`, {
    method: 'PATCH',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify(update),
  }).then(handle<BackendProfile>)
}

export function fetchPackTypes(): Promise<BackendPackType[]> {
  return fetch(`${API_BASE}/api/packs`).then(handle<BackendPackType[]>)
}

export function openPack(packTypeId: number): Promise<BackendPackOpenResponse> {
  return fetch(`${API_BASE}/api/packs/${packTypeId}/open`, {
    method: 'POST',
    headers: authHeaders(),
  }).then(handle<BackendPackOpenResponse>)
}

export function fetchBinder(): Promise<BackendBinderEntry[]> {
  return fetch(`${API_BASE}/api/binder`, { headers: authHeaders() }).then(handle<BackendBinderEntry[]>)
}

export function fetchCardsForSet(setId: string): Promise<BackendCard[]> {
  return fetch(`${API_BASE}/api/cards?setId=${encodeURIComponent(setId)}`).then(handle<BackendCard[]>)
}

export function sellDuplicates(): Promise<BackendSellDuplicatesResponse> {
  return fetch(`${API_BASE}/api/economy/sell-duplicates`, {
    method: 'POST',
    headers: authHeaders(),
  }).then(handle<BackendSellDuplicatesResponse>)
}

export function claimDailyBonus(): Promise<BackendDailyBonusResponse> {
  return fetch(`${API_BASE}/api/economy/daily-bonus`, {
    method: 'POST',
    headers: authHeaders(),
  }).then(handle<BackendDailyBonusResponse>)
}

export function fetchQuests(): Promise<BackendQuestStatus[]> {
  return fetch(`${API_BASE}/api/quests`, { headers: authHeaders() }).then(handle<BackendQuestStatus[]>)
}

export function fetchAchievements(): Promise<BackendAchievementStatus[]> {
  return fetch(`${API_BASE}/api/achievements`, { headers: authHeaders() }).then(handle<BackendAchievementStatus[]>)
}

export function fetchLeaderboard(type: LeaderboardType): Promise<BackendLeaderboardEntry[]> {
  return fetch(`${API_BASE}/api/leaderboard/${type}`).then(handle<BackendLeaderboardEntry[]>)
}
