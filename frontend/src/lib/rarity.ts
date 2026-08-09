type RarityTier = 'common' | 'uncommon' | 'holo' | 'ultra' | 'secret'

const TIER_STYLE: Record<RarityTier, { ring: string; glow: string; badge: string }> = {
  common: {
    ring: 'ring-slate-400/40',
    glow: '',
    badge: 'bg-slate-500/20 text-slate-300',
  },
  uncommon: {
    ring: 'ring-emerald-400/50',
    glow: '',
    badge: 'bg-emerald-500/20 text-emerald-300',
  },
  holo: {
    ring: 'ring-violet-300/70',
    glow: 'shadow-[0_0_35px_rgba(196,181,253,0.5)]',
    badge: 'bg-violet-500/20 text-violet-300',
  },
  ultra: {
    ring: 'ring-fuchsia-300/80',
    glow: 'shadow-[0_0_45px_rgba(240,171,252,0.6)]',
    badge: 'bg-fuchsia-500/20 text-fuchsia-300',
  },
  secret: {
    ring: 'ring-amber-300/90',
    glow: 'shadow-[0_0_55px_rgba(252,211,77,0.7)]',
    badge: 'bg-amber-500/20 text-amber-300',
  },
}

// Bucketing op trefwoorden omdat de Pokémon TCG API tientallen rarity-labels kent
// ("Rare Holo", "Double Rare", "Illustration Rare", "Special Illustration Rare", "ACE SPEC
// Rare", ...) die per set/serie verschillen. Placeholder-data gebruikt een klein vast setje
// labels dat hier ook op mapt.
function tierOf(rarity: string): RarityTier {
  const r = rarity.toLowerCase()
  if (r === 'common') return 'common'
  if (r === 'uncommon') return 'uncommon'
  if (
    r.includes('secret') ||
    r.includes('hyper') ||
    r.includes('rainbow') ||
    r.includes('special illustration') ||
    r.includes('gold')
  ) {
    return 'secret'
  }
  if (
    r.includes('ultra') ||
    r.includes('double rare') ||
    r.includes('illustration') ||
    r.includes('ace spec') ||
    r.includes('vmax') ||
    r.includes('vstar') ||
    r.includes(' ex') ||
    r.endsWith('ex')
  ) {
    return 'ultra'
  }
  return 'holo'
}

export function getRarityStyle(rarity: string) {
  return TIER_STYLE[tierOf(rarity)]
}

export function isHolo(rarity: string) {
  const tier = tierOf(rarity)
  return tier !== 'common' && tier !== 'uncommon'
}

const TIER_RANK: Record<RarityTier, number> = { common: 0, uncommon: 1, holo: 2, ultra: 3, secret: 4 }

/** Hoger = zeldzamer. Gebruikt om de "chase cards" van een set te bepalen (lib/types.ts CardData). */
export function rarityRank(rarity: string): number {
  return TIER_RANK[tierOf(rarity)]
}
