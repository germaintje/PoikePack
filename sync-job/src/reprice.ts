// Herprijst alle pack_types op basis van de echte marktwaarde van de set (card_sets.
// avg_market_value_usd, gevuld door sync.ts) i.p.v. een vlakke placeholder-prijs. Oude,
// waardevolle sets (denk Base Set, met een Charizard van €700+) worden duurder; recente
// bulk-sets zonder noemenswaardige chase cards blijven goedkoop — los van hoe "oud" de set is.
//
// Unlock-level volgt price-rank, niet leeftijd: een handvol packs (de goedkoopste + de 2
// handmatig gebrande — Base Set/151) staat meteen open, de rest schaalt op over MAX_LEVEL
// levels. Zie backend LevelCurve voor de XP-curve die hierbij hoort.
//
// Draaien: npm run reprice (ná een volledige sync — heeft avg_market_value_usd nodig)

import 'dotenv/config'
import { createPool } from './db.js'

const COIN_PER_DOLLAR = 8
const MIN_PRICE = 80
const MAX_PRICE = 4000
const DEFAULT_PRICE_NO_MARKET_DATA = 150 // sets zonder enige geprijsde kaart (zeldzaam, oude promo's)

const STARTER_PACK_COUNT = 8 // incl. de 2 handmatig gebrande sets, altijd level 1
const MAX_LEVEL = 25
const ALWAYS_STARTER_SET_IDS = ['base1', 'sv3pt5']

interface PackRow {
  id: number
  set_id: string
  avg_market_value_usd: string | null // numeric komt als string terug uit pg
}

function priceForMarketValue(avgUsd: number | null): number {
  if (avgUsd === null) return DEFAULT_PRICE_NO_MARKET_DATA
  const raw = Math.round(avgUsd * COIN_PER_DOLLAR)
  return Math.min(MAX_PRICE, Math.max(MIN_PRICE, raw))
}

async function main() {
  const pool = createPool()
  try {
    const { rows } = await pool.query<PackRow>(
      `select pt.id, pt.set_id, cs.avg_market_value_usd
       from pack_types pt
       join card_sets cs on cs.id = pt.set_id`,
    )

    const priced = rows.map((r) => ({
      id: r.id,
      setId: r.set_id,
      price: priceForMarketValue(r.avg_market_value_usd === null ? null : Number(r.avg_market_value_usd)),
    }))

    // Sorteren op prijs (goedkoop -> duur) bepaalt de unlock-volgorde.
    priced.sort((a, b) => a.price - b.price)

    const alwaysStarter = new Set(ALWAYS_STARTER_SET_IDS)
    const remainingSlotsForStarters = Math.max(0, STARTER_PACK_COUNT - alwaysStarter.size)

    let cheapStartersAssigned = 0
    const nonStarters: typeof priced = []
    const unlockLevelById = new Map<number, number>()

    for (const pack of priced) {
      if (alwaysStarter.has(pack.setId)) {
        unlockLevelById.set(pack.id, 1)
        continue
      }
      if (cheapStartersAssigned < remainingSlotsForStarters) {
        unlockLevelById.set(pack.id, 1)
        cheapStartersAssigned += 1
        continue
      }
      nonStarters.push(pack)
    }

    // Resterende packs gelijkmatig verdelen over level 2..MAX_LEVEL, oplopend met prijs.
    const tierCount = MAX_LEVEL - 1
    const packsPerTier = Math.max(1, Math.ceil(nonStarters.length / tierCount))
    nonStarters.forEach((pack, index) => {
      const level = Math.min(MAX_LEVEL, 2 + Math.floor(index / packsPerTier))
      unlockLevelById.set(pack.id, level)
    })

    for (const pack of priced) {
      await pool.query('update pack_types set price = $1, unlock_level = $2 where id = $3', [
        pack.price,
        unlockLevelById.get(pack.id),
        pack.id,
      ])
    }

    const byLevel = new Map<number, number>()
    priced.forEach((p) => {
      const lvl = unlockLevelById.get(p.id)!
      byLevel.set(lvl, (byLevel.get(lvl) ?? 0) + 1)
    })
    console.log(`Herprijzing klaar voor ${priced.length} packs. Prijzen ${MIN_PRICE}-${MAX_PRICE} coins, levels 1-${MAX_LEVEL}.`)
    console.log(
      'Packs per level:',
      [...byLevel.entries()].sort((a, b) => a[0] - b[0]).map(([lvl, count]) => `L${lvl}:${count}`).join(' '),
    )
  } finally {
    await pool.end()
  }
}

main().catch((err) => {
  console.error('Herprijzing mislukt:', err)
  process.exitCode = 1
})
