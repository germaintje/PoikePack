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

export async function upsertSet(pool: pg.Pool, set: ApiSet): Promise<void> {
  await pool.query(
    `insert into card_sets (id, name, release_date, logo_url, symbol_url, synced_at)
     values ($1, $2, $3, $4, $5, now())
     on conflict (id) do update set
       name = excluded.name,
       release_date = excluded.release_date,
       logo_url = excluded.logo_url,
       symbol_url = excluded.symbol_url,
       synced_at = now()`,
    [set.id, set.name, toSqlDate(set.releaseDate), set.images?.logo ?? null, set.images?.symbol ?? null],
  )
}

export async function upsertCard(pool: pg.Pool, setId: string, card: ApiCard): Promise<void> {
  await pool.query(
    `insert into cards (id, set_id, name, number, rarity, primary_type, image_small_url, image_large_url, synced_at)
     values ($1, $2, $3, $4, $5, $6, $7, $8, now())
     on conflict (id) do update set
       name = excluded.name,
       number = excluded.number,
       rarity = excluded.rarity,
       primary_type = excluded.primary_type,
       image_small_url = excluded.image_small_url,
       image_large_url = excluded.image_large_url,
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
    ],
  )
}

export async function fetchConfiguredSetIds(pool: pg.Pool): Promise<string[]> {
  const result = await pool.query<{ set_id: string }>('select distinct set_id from pack_types')
  return result.rows.map((r) => r.set_id)
}
