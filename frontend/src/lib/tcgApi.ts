const API_BASE = 'https://api.pokemontcg.io/v2'

export interface ApiCardImages {
  small: string
  large: string
}

export interface ApiCard {
  id: string
  name: string
  number: string
  rarity?: string
  types?: string[]
  images: ApiCardImages
}

export interface ApiSetImages {
  symbol: string
  logo: string
}

export interface ApiSet {
  id: string
  name: string
  images: ApiSetImages
}

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`)
  if (!res.ok) {
    throw new Error(`Pokémon TCG API antwoordde met ${res.status} bij ${path}`)
  }
  const json = (await res.json()) as { data: T }
  return json.data
}

export function fetchSet(setId: string): Promise<ApiSet> {
  return getJson<ApiSet>(`/sets/${setId}`)
}

export function fetchCardsForSet(setId: string): Promise<ApiCard[]> {
  return getJson<ApiCard[]>(`/cards?q=set.id:${setId}&pageSize=80&orderBy=number`)
}
