import pg from 'pg'
import type { ApiCard, ApiSet } from './pokemonTcgClient.js'

const { Pool } = pg

export function createPool(): pg.Pool {
  const connectionString = process.env.DATABASE_URL ?? 'postgres://postgres:postgres@localhost:5432/pokepack'
  return new Pool({ connectionString })
}

// "YYYY/MM/DD" (Pokémon TCG API) -> "YYYY-MM-DD" (Postgres DATE)
function toSqlDate(releaseDate: string | undefined): string | null {
  if (!releaseDate) return null
  return releaseDate.replaceAll('/', '-')
}

// jsonb-kolommen willen een JSON-string of null, nooit `undefined` (pg stuurt undefined niet
// betrouwbaar door als SQL NULL) — vandaar deze helper voor elk optioneel array/object-veld.
function toJson(value: unknown): string | null {
  return value === undefined || value === null ? null : JSON.stringify(value)
}

// API geeft hp als string ("70"); niet elke kaart heeft er een (Trainers/Energy niet).
function toIntOrNull(value: string | number | undefined): number | null {
  if (value === undefined) return null
  const n = typeof value === 'number' ? value : parseInt(value, 10)
  return Number.isFinite(n) ? n : null
}

export async function upsertSet(pool: pg.Pool, set: ApiSet): Promise<void> {
  await pool.query(
    `insert into card_sets (
       id, name, release_date, logo_url, symbol_url,
       series, printed_total, total, ptcgo_code, legalities, source_updated_at, synced_at
     )
     values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, now())
     on conflict (id) do update set
       name = excluded.name,
       release_date = excluded.release_date,
       logo_url = excluded.logo_url,
       symbol_url = excluded.symbol_url,
       series = excluded.series,
       printed_total = excluded.printed_total,
       total = excluded.total,
       ptcgo_code = excluded.ptcgo_code,
       legalities = excluded.legalities,
       source_updated_at = excluded.source_updated_at,
       synced_at = now()`,
    [
      set.id,
      set.name,
      toSqlDate(set.releaseDate),
      set.images?.logo ?? null,
      set.images?.symbol ?? null,
      set.series ?? null,
      set.printedTotal ?? null,
      set.total ?? null,
      set.ptcgoCode ?? null,
      toJson(set.legalities),
      set.updatedAt ?? null,
    ],
  )
}

export async function upsertCard(pool: pg.Pool, setId: string, card: ApiCard): Promise<void> {
  await pool.query(
    `insert into cards (
       id, set_id, name, number, rarity, primary_type, image_small_url, image_large_url,
       supertype, subtypes, hp, types, evolves_from, evolves_to, rules, abilities, attacks,
       weaknesses, resistances, retreat_cost, converted_retreat_cost, artist, flavor_text,
       national_pokedex_numbers, legalities, regulation_mark,
       tcgplayer_url, tcgplayer_prices, cardmarket_url, cardmarket_prices,
       source_updated_at, synced_at
     )
     values (
       $1, $2, $3, $4, $5, $6, $7, $8,
       $9, $10, $11, $12, $13, $14, $15, $16, $17,
       $18, $19, $20, $21, $22,
       $23, $24, $25,
       $26, $27, $28, $29,
       $30, $31, now()
     )
     on conflict (id) do update set
       name = excluded.name,
       number = excluded.number,
       rarity = excluded.rarity,
       primary_type = excluded.primary_type,
       image_small_url = excluded.image_small_url,
       image_large_url = excluded.image_large_url,
       supertype = excluded.supertype,
       subtypes = excluded.subtypes,
       hp = excluded.hp,
       types = excluded.types,
       evolves_from = excluded.evolves_from,
       evolves_to = excluded.evolves_to,
       rules = excluded.rules,
       abilities = excluded.abilities,
       attacks = excluded.attacks,
       weaknesses = excluded.weaknesses,
       resistances = excluded.resistances,
       retreat_cost = excluded.retreat_cost,
       converted_retreat_cost = excluded.converted_retreat_cost,
       artist = excluded.artist,
       flavor_text = excluded.flavor_text,
       national_pokedex_numbers = excluded.national_pokedex_numbers,
       legalities = excluded.legalities,
       regulation_mark = excluded.regulation_mark,
       tcgplayer_url = excluded.tcgplayer_url,
       tcgplayer_prices = excluded.tcgplayer_prices,
       cardmarket_url = excluded.cardmarket_url,
       cardmarket_prices = excluded.cardmarket_prices,
       source_updated_at = excluded.source_updated_at,
       synced_at = now()`,
    [
      card.id,
      setId,
      card.name,
      card.number,
      card.rarity ?? 'Common',
      card.types?.[0] ?? null,
      card.images?.small ?? null,
      card.images?.large ?? null,
      card.supertype ?? null,
      toJson(card.subtypes),
      toIntOrNull(card.hp),
      toJson(card.types),
      card.evolvesFrom ?? null,
      toJson(card.evolvesTo),
      toJson(card.rules),
      toJson(card.abilities),
      toJson(card.attacks),
      toJson(card.weaknesses),
      toJson(card.resistances),
      toJson(card.retreatCost),
      card.convertedRetreatCost ?? null,
      card.artist ?? null,
      card.flavorText ?? null,
      toJson(card.nationalPokedexNumbers),
      toJson(card.legalities),
      card.regulationMark ?? null,
      card.tcgplayer?.url ?? null,
      toJson(card.tcgplayer?.prices),
      card.cardmarket?.url ?? null,
      toJson(card.cardmarket?.prices),
      card.updatedAt ?? null,
    ],
  )
}

export async function fetchConfiguredSetIds(pool: pg.Pool): Promise<string[]> {
  const result = await pool.query<{ set_id: string }>('select distinct set_id from pack_types')
  return result.rows.map((r) => r.set_id)
}
