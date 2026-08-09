import type { BackendBinderEntry, BackendCard, BackendPackType, BackendPulledCard } from './api'
import type { CardData, PackType, PullResult } from './types'

// UI-only branding per set — de backend weet niets van kleuren, dat hoort bij de frontend.
// Onbekende sets (nieuwe pack_types die nog niet hier staan) krijgen een neutrale paarse tint.
const PACK_THEME: Record<string, { colorFrom: string; colorTo: string; tagline: string }> = {
  base1: {
    colorFrom: '#f2c94c',
    colorTo: '#8a5a1f',
    tagline: 'De originele set uit 1999. Altijd beschikbaar, standaard odds.',
  },
  sv3pt5: {
    colorFrom: '#6fb6ff',
    colorTo: '#1a4c8a',
    tagline: 'Featured set — alle originele Kanto Pokémon, betere odds op illustration rares.',
  },
}

// Voor de 172 sets die geen handmatig gekozen thema hebben: deterministisch (op set-id) een
// kleurpaar uit een vaste palette kiezen, zodat de pack-grid niet 172x identiek egaal paars is.
const FALLBACK_PALETTE: { colorFrom: string; colorTo: string }[] = [
  { colorFrom: '#9b5cff', colorTo: '#3a1470' },
  { colorFrom: '#ff6f6f', colorTo: '#7a1f1f' },
  { colorFrom: '#4fd1c5', colorTo: '#0f4c4a' },
  { colorFrom: '#f6ad55', colorTo: '#7a4a12' },
  { colorFrom: '#63b3ed', colorTo: '#1a3a6e' },
  { colorFrom: '#f687b3', colorTo: '#7a2352' },
  { colorFrom: '#68d391', colorTo: '#1e5631' },
  { colorFrom: '#fbd38d', colorTo: '#7a5a12' },
  { colorFrom: '#b794f4', colorTo: '#442a7a' },
  { colorFrom: '#fc8181', colorTo: '#7a2222' },
]

function hashString(value: string): number {
  let hash = 0
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0
  }
  return Math.abs(hash)
}

function fallbackThemeFor(setId: string) {
  return FALLBACK_PALETTE[hashString(setId) % FALLBACK_PALETTE.length]
}

export function mapPackType(dto: BackendPackType): PackType {
  const theme = PACK_THEME[dto.setId] ?? { ...fallbackThemeFor(dto.setId), tagline: '' }
  return {
    id: String(dto.id),
    setId: dto.setId,
    name: dto.name,
    setName: dto.setName,
    price: dto.price,
    unlockLevel: dto.unlockLevel,
    tagline: theme.tagline,
    colorFrom: theme.colorFrom,
    colorTo: theme.colorTo,
    slotConfig: {
      commons: dto.slotCommons,
      uncommons: dto.slotUncommons,
      reverseHolo: dto.slotReverseHolo,
      hits: dto.slotHits,
    },
    logoImage: dto.logoUrl ?? undefined,
  }
}

export function mapPulledCard(dto: BackendPulledCard): PullResult {
  return {
    id: dto.cardId,
    name: dto.name,
    setName: dto.setName,
    number: dto.number,
    // De backend geeft de "echte" rarity + een los reverseHolo-vlag; voor de UI-styling
    // (badge/glow) behandelen we reverse holo als eigen rarity-label, zoals de rest van de app.
    rarity: dto.reverseHolo ? 'Reverse Holo' : dto.rarity,
    sellValue: dto.sellValue,
    image: dto.imageLargeUrl ?? undefined,
    isDuplicate: dto.duplicate,
  }
}

export function mapBinderCard(dto: BackendBinderEntry): CardData {
  return {
    id: dto.cardId,
    name: dto.name,
    setName: dto.setName,
    number: dto.number,
    rarity: dto.rarity,
    sellValue: 0,
    image: dto.imageLargeUrl ?? undefined,
  }
}

export function mapCard(dto: BackendCard): CardData {
  return {
    id: dto.cardId,
    name: dto.name,
    setName: dto.setName,
    number: dto.number,
    rarity: dto.rarity,
    sellValue: 0,
    image: dto.imageLargeUrl ?? undefined,
  }
}
