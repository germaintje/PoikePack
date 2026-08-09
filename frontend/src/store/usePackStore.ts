import { create } from 'zustand'
import type { CardPools, PackType, PullResult } from '../lib/types'
import { cardPools as fallbackCardPools, packTypes as fallbackPackTypes } from '../data/mockCards'
import { loadLivePackData } from '../data/livePackData'

type Stage = 'select' | 'opening' | 'reveal' | 'summary'
type LiveStatus = 'idle' | 'loading' | 'ready' | 'error'

interface PackState {
  coins: number
  stage: Stage
  selectedPack: PackType | null
  pulls: PullResult[]
  revealedCount: number
  owned: Record<string, number>
  packTypes: PackType[]
  cardPools: Record<string, CardPools>
  liveStatus: LiveStatus
  loadLiveData: () => Promise<void>
  selectPack: (pack: PackType) => void
  cancelSelection: () => void
  openPack: () => void
  beginReveal: () => void
  revealNext: () => void
  finishReveal: () => void
  reset: () => void
}

function drawRandom<T>(pool: readonly T[], count: number): T[] {
  const copy = [...pool]
  const result: T[] = []
  for (let i = 0; i < count && copy.length > 0; i++) {
    const idx = Math.floor(Math.random() * copy.length)
    result.push(copy.splice(idx, 1)[0])
  }
  return result
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export const usePackStore = create<PackState>((set, get) => ({
  coins: 850,
  stage: 'select',
  selectedPack: null,
  pulls: [],
  revealedCount: 0,
  owned: {},
  packTypes: fallbackPackTypes,
  cardPools: fallbackCardPools,
  liveStatus: 'idle',

  // Haalt echte sets + kaartfoto's op bij de Pokémon TCG API (zie data/livePackData.ts).
  // Faalt de fetch (netwerk, CORS, rate limit) dan blijft de placeholder-data uit
  // data/mockCards.ts gewoon actief — de UI merkt daar niets stukgaands van.
  loadLiveData: async () => {
    if (get().liveStatus === 'loading' || get().liveStatus === 'ready') return
    set({ liveStatus: 'loading' })
    try {
      const live = await loadLivePackData()
      set({ packTypes: live.packTypes, cardPools: live.cardPools, liveStatus: 'ready' })
    } catch (err) {
      console.warn('Kon geen live Pokémon TCG data laden, gebruik placeholder-data.', err)
      set({ liveStatus: 'error' })
    }
  },

  selectPack: (pack) => set({ selectedPack: pack }),
  cancelSelection: () => set({ selectedPack: null }),

  // Let op: dit is client-side RNG puur voor de UI-mockup. In de echte app bepaalt en
  // valideert de backend de volledige pack-inhoud server-side — zie docs/PROJECT_BRIEF.md §2.1.
  openPack: () => {
    const { selectedPack, coins, owned, cardPools } = get()
    if (!selectedPack || coins < selectedPack.price) return

    const pool = cardPools[selectedPack.id]
    if (!pool) return
    const { commons, uncommons, reverseHolo, hits } = selectedPack.slotConfig

    const commonCards = drawRandom(pool.commons, commons)
    const uncommonCards = drawRandom(pool.uncommons, uncommons)
    const reverseHoloCards = drawRandom(pool.reverseHolo, reverseHolo)
    const hitCards = drawRandom(pool.hits, hits)

    const ordered = [
      ...shuffle([...commonCards, ...uncommonCards]),
      ...reverseHoloCards,
      ...hitCards,
    ]

    const pulls: PullResult[] = ordered.map((card) => ({
      ...card,
      isDuplicate: (owned[card.id] ?? 0) > 0,
    }))

    const nextOwned = { ...owned }
    pulls.forEach((p) => {
      nextOwned[p.id] = (nextOwned[p.id] ?? 0) + 1
    })

    set({
      coins: coins - selectedPack.price,
      pulls,
      revealedCount: 0,
      owned: nextOwned,
      stage: 'opening',
    })
  },

  beginReveal: () => set({ stage: 'reveal' }),

  revealNext: () =>
    set((s) => ({ revealedCount: Math.min(s.revealedCount + 1, s.pulls.length) })),

  finishReveal: () => set({ stage: 'summary' }),

  reset: () => set({ stage: 'select', selectedPack: null, pulls: [], revealedCount: 0 }),
}))
