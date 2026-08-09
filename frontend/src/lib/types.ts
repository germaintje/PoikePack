// Rarity is een vrije string: placeholder-data gebruikt een vaste set labels, maar echte
// kaarten uit de Pokémon TCG API kennen veel meer varianten (bijv. "Double Rare",
// "Illustration Rare"). Zie lib/rarity.ts voor hoe dit naar een visuele tier wordt gemapt.
export type Rarity = string

export interface CardData {
  id: string
  name: string
  setName: string
  number: string
  rarity: Rarity
  type?: string
  sellValue: number
  /** Echte kaartfoto (uit de Pokémon TCG API). Ontbreekt bij placeholder-kaarten. */
  image?: string
  /** Alleen gebruikt als er geen `image` is: gradient + glyph placeholder-weergave. */
  colorFrom?: string
  colorTo?: string
  glyph?: string
}

export interface SlotConfig {
  commons: number
  uncommons: number
  reverseHolo: number
  hits: number
}

export interface PackType {
  id: string
  setId: string
  name: string
  setName: string
  price: number
  unlockLevel: number
  tagline: string
  colorFrom: string
  colorTo: string
  slotConfig: SlotConfig
  /** Echt set-logo/symbool uit de Pokémon TCG API, indien geladen. */
  logoImage?: string
  symbolImage?: string
}

export interface CardPools {
  commons: CardData[]
  uncommons: CardData[]
  reverseHolo: CardData[]
  hits: CardData[]
}

export type PullResult = CardData & { isDuplicate: boolean }
