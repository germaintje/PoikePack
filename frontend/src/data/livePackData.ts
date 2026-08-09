import type { CardData, CardPools, PackType, SlotConfig } from '../lib/types'
import { fetchCardsForSet, fetchSet, type ApiCard } from '../lib/tcgApi'

const SLOT_CONFIG: SlotConfig = { commons: 5, uncommons: 2, reverseHolo: 1, hits: 1 }

interface LivePackDefinition {
  id: string
  setId: string
  name: string
  price: number
  unlockLevel: number
  tagline: string
  colorFrom: string
  colorTo: string
}

// Twee echte sets als voorbeeld: een klassieke (altijd beschikbaar) en een moderne,
// featured set (unlockt op level, betere odds op spectaculaire rares).
const PACK_DEFS: LivePackDefinition[] = [
  {
    id: 'base-set',
    setId: 'base1',
    name: 'Base Set',
    price: 120,
    unlockLevel: 1,
    tagline: 'De originele set uit 1999. Altijd beschikbaar, standaard odds.',
    colorFrom: '#f2c94c',
    colorTo: '#8a5a1f',
  },
  {
    id: '151',
    setId: 'sv3pt5',
    name: '151',
    price: 260,
    unlockLevel: 5,
    tagline: 'Featured set — alle originele Kanto Pokémon, betere odds op illustration rares.',
    colorFrom: '#6fb6ff',
    colorTo: '#1a4c8a',
  },
]

function bucketRarity(rarity: string | undefined): 'commons' | 'uncommons' | 'hits' {
  if (!rarity) return 'commons'
  const r = rarity.toLowerCase()
  if (r === 'common') return 'commons'
  if (r === 'uncommon') return 'uncommons'
  return 'hits'
}

function sellValueFor(bucket: 'commons' | 'uncommons' | 'reverseHolo' | 'hits'): number {
  switch (bucket) {
    case 'commons':
      return 5
    case 'uncommons':
      return 15
    case 'reverseHolo':
      return 25
    case 'hits':
      return 150
  }
}

function toCardData(card: ApiCard, setName: string, bucket: 'commons' | 'uncommons' | 'hits'): CardData {
  return {
    id: card.id,
    name: card.name,
    setName,
    number: card.number,
    rarity: card.rarity ?? 'Common',
    type: card.types?.[0] ?? 'Colorless',
    image: card.images.large,
    sellValue: sellValueFor(bucket),
  }
}

interface BuiltPack {
  pool: CardPools
  setName: string
  logoImage: string
  symbolImage: string
}

async function buildPoolForSet(def: LivePackDefinition): Promise<BuiltPack> {
  const [set, cards] = await Promise.all([fetchSet(def.setId), fetchCardsForSet(def.setId)])

  const pool: CardPools = { commons: [], uncommons: [], reverseHolo: [], hits: [] }

  for (const card of cards) {
    if (!card.images?.large) continue
    const bucket = bucketRarity(card.rarity)
    pool[bucket].push(toCardData(card, set.name, bucket))
  }

  // De API modelleert reverse-holo niet als los kaartobject (het is een print-variant van
  // een bestaande common/uncommon). Voor de mockup hergebruiken we een paar uncommons en
  // taggen die als "Reverse Holo" zodat het reverse-holo slot toch een holo-shimmer krijgt.
  pool.reverseHolo = pool.uncommons.slice(0, 6).map((c) => ({
    ...c,
    id: `rh-${c.id}`,
    rarity: 'Reverse Holo',
    sellValue: sellValueFor('reverseHolo'),
  }))

  return { pool, setName: set.name, logoImage: set.images.logo, symbolImage: set.images.symbol }
}

export interface LivePackData {
  packTypes: PackType[]
  cardPools: Record<string, CardPools>
}

// Let op: dit haalt data live op bij api.pokemontcg.io, puur voor deze frontend-mockup zodat
// de pack-opening flow met echte kaartfoto's te bekijken is voordat de backend/sync-job
// bestaat. In de uiteindelijke architectuur (zie docs/PROJECT_BRIEF.md §4) raakt de live app
// de externe API nooit aan — dat is het exclusieve domein van sync-job, dat de data + zelf
// gehoste afbeeldingen in de eigen Postgres-database zet.
export async function loadLivePackData(): Promise<LivePackData> {
  const results = await Promise.all(PACK_DEFS.map(buildPoolForSet))

  const packTypes: PackType[] = PACK_DEFS.map((def, i) => ({
    id: def.id,
    name: def.name,
    setName: results[i].setName,
    price: def.price,
    unlockLevel: def.unlockLevel,
    tagline: def.tagline,
    colorFrom: def.colorFrom,
    colorTo: def.colorTo,
    logoImage: results[i].logoImage,
    symbolImage: results[i].symbolImage,
    slotConfig: SLOT_CONFIG,
  }))

  const cardPools: Record<string, CardPools> = {}
  PACK_DEFS.forEach((def, i) => {
    cardPools[def.id] = results[i].pool
  })

  return { packTypes, cardPools }
}
