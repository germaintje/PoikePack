const API_BASE = 'https://api.pokemontcg.io/v2'
const PAGE_SIZE = 250 // API-max per pagina
const REQUEST_DELAY_MS = 350 // ruim onder de 30/min-limiet zonder API-key

export interface ApiSet {
  id: string
  name: string
  releaseDate?: string // "YYYY/MM/DD"
  images: { symbol: string; logo: string }
}

export interface ApiCard {
  id: string
  name: string
  number: string
  rarity?: string
  types?: string[]
  images: { small: string; large: string }
}

interface ApiListResponse<T> {
  data: T
  totalCount: number
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export class PokemonTcgClient {
  constructor(private readonly apiKey?: string) {}

  private async getJson<T>(path: string): Promise<ApiListResponse<T>> {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: this.apiKey ? { 'X-Api-Key': this.apiKey } : undefined,
    })
    if (!res.ok) {
      throw new Error(`Pokémon TCG API antwoordde met ${res.status} bij ${path}`)
    }
    return (await res.json()) as ApiListResponse<T>
  }

  async fetchSet(setId: string): Promise<ApiSet> {
    const { data } = await this.getJson<ApiSet>(`/sets/${setId}`)
    return data
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
      if (data.length < PAGE_SIZE || all.length >= totalCount) break
      page += 1
      await sleep(REQUEST_DELAY_MS)
    }

    return all
  }
}
