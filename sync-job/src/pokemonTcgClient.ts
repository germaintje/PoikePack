const API_BASE = 'https://api.pokemontcg.io/v2'
const PAGE_SIZE = 250 // API-max per pagina

// Zonder API-key ligt de limiet rond 30 req/min — 2100ms tussen requests blijft daar ruim onder.
// Mét key ligt de limiet veel hoger, dus dan mag het een stuk sneller.
const REQUEST_DELAY_MS_NO_KEY = 2100
const REQUEST_DELAY_MS_WITH_KEY = 150
const MAX_RETRIES = 5

export interface ApiSetLegalities {
  unlimited?: string
  standard?: string
  expanded?: string
}

export interface ApiSet {
  id: string
  name: string
  series?: string
  printedTotal?: number
  total?: number
  ptcgoCode?: string
  releaseDate?: string // "YYYY/MM/DD"
  updatedAt?: string
  legalities?: ApiSetLegalities
  images: { symbol: string; logo: string }
}

export interface ApiAttack {
  name: string
  cost?: string[]
  convertedEnergyCost?: number
  damage?: string
  text?: string
}

export interface ApiWeaknessOrResistance {
  type: string
  value: string
}

export interface ApiCardPrices {
  [priceVariant: string]: unknown
}

export interface ApiAbility {
  name: string
  text?: string
  type?: string // "Ability" of "Pokémon Power" (oudere kaarten)
}

export interface ApiCard {
  id: string
  name: string
  supertype?: string
  subtypes?: string[]
  number: string
  rarity?: string
  types?: string[]
  hp?: string
  evolvesFrom?: string
  evolvesTo?: string[]
  rules?: string[]
  abilities?: ApiAbility[]
  attacks?: ApiAttack[]
  weaknesses?: ApiWeaknessOrResistance[]
  resistances?: ApiWeaknessOrResistance[]
  retreatCost?: string[]
  convertedRetreatCost?: number
  artist?: string
  flavorText?: string
  nationalPokedexNumbers?: number[]
  legalities?: ApiSetLegalities
  regulationMark?: string
  updatedAt?: string
  images: { small: string; large: string }
  tcgplayer?: { url?: string; updatedAt?: string; prices?: ApiCardPrices }
  cardmarket?: { url?: string; updatedAt?: string; prices?: ApiCardPrices }
}

interface ApiListResponse<T> {
  data: T
  totalCount: number
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export class PokemonTcgClient {
  private readonly requestDelayMs: number

  constructor(private readonly apiKey?: string) {
    this.requestDelayMs = apiKey ? REQUEST_DELAY_MS_WITH_KEY : REQUEST_DELAY_MS_NO_KEY
  }

  private async getJson<T>(path: string): Promise<ApiListResponse<T>> {
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      const res = await fetch(`${API_BASE}${path}`, {
        headers: this.apiKey ? { 'X-Api-Key': this.apiKey } : undefined,
      })

      if (res.ok) {
        return (await res.json()) as ApiListResponse<T>
      }

      // 429 (rate limit) / 5xx zijn de moeite van retrying waard; andere fouten (4xx) niet.
      const retryable = res.status === 429 || res.status >= 500
      if (!retryable || attempt === MAX_RETRIES) {
        throw new Error(`Pokémon TCG API antwoordde met ${res.status} bij ${path}`)
      }

      const backoffMs = this.requestDelayMs * attempt * 2
      console.warn(`  (${res.status} bij ${path}, retry ${attempt}/${MAX_RETRIES} over ${backoffMs}ms)`)
      await sleep(backoffMs)
    }
    throw new Error(`Onbereikbaar: ${path}`) // TypeScript-exhaustiveness; loop hierboven throwt altijd eerder
  }

  async fetchSet(setId: string): Promise<ApiSet> {
    const { data } = await this.getJson<ApiSet>(`/sets/${setId}`)
    await sleep(this.requestDelayMs)
    return data
  }

  // Alle sets uit de hele Pokémon TCG-catalogus (niet gefilterd op wat wij verkopen) —
  // gebruikt door `npm run sync:all`. Zelfde paginatie-aanpak als fetchCardsForSet.
  async fetchAllSets(): Promise<ApiSet[]> {
    const all: ApiSet[] = []
    let page = 1

    while (page <= 20) {
      const { data, totalCount } = await this.getJson<ApiSet[]>(
        `/sets?pageSize=${PAGE_SIZE}&page=${page}&orderBy=releaseDate`,
      )
      all.push(...data)
      await sleep(this.requestDelayMs)
      if (data.length < PAGE_SIZE || all.length >= totalCount) break
      page += 1
    }

    return all
  }

  // Zelfde paginatie-aanpak als frontend/src/lib/tcgApi.ts en backend — data.length < PAGE_SIZE
  // is de primaire stopconditie zodat een verkeerde/missende totalCount niet tot een oneindige
  // loop kan leiden.
  async fetchCardsForSet(setId: string): Promise<ApiCard[]> {
    const all: ApiCard[] = []
    let page = 1

    while (page <= 20) {
      const { data, totalCount } = await this.getJson<ApiCard[]>(
        `/cards?q=set.id:${setId}&pageSize=${PAGE_SIZE}&page=${page}&orderBy=number`,
      )
      all.push(...data)
      await sleep(this.requestDelayMs)
      if (data.length < PAGE_SIZE || all.length >= totalCount) break
      page += 1
    }

    return all
  }
}
