// Sync-job: haalt sets + kaarten op bij de Pokémon TCG API en zet ze in onze eigen Postgres
// (card_sets, cards) — hetzelfde schema dat de backend gebruikt. Dit is de enige plek die de
// externe API mag aanroepen; de live app (frontend + backend) raakt 'm nooit aan, zie
// docs/PROJECT_BRIEF.md §4.
//
// Welke sets? Standaard alle set_id's waar een pack_type naar verwijst (dus: alleen sets
// waar we ook echt packs van verkopen) — override met SYNC_SET_IDS="base1,sv3pt5" (comma-
// separated) om iets anders te syncen, bijvoorbeeld als voorbereiding op een nieuw pack.
//
// Idempotent: draait 'm twee keer op dezelfde set, dan krijg je gewoon een update
// (ON CONFLICT ... DO UPDATE), geen duplicaten of fouten.
//
// Draaien: npm install && npm run sync (env's optioneel via .env of gewoon export'en)

import 'dotenv/config'
import { createPool, fetchConfiguredSetIds, upsertCard, upsertSet } from './db.js'
import { PokemonTcgClient } from './pokemonTcgClient.js'

async function main() {
  const pool = createPool()
  const client = new PokemonTcgClient(process.env.POKEMON_TCG_API_KEY || undefined)

  try {
    const setIds = process.env.SYNC_SET_IDS
      ? process.env.SYNC_SET_IDS.split(',').map((s) => s.trim()).filter(Boolean)
      : await fetchConfiguredSetIds(pool)

    if (setIds.length === 0) {
      console.log('Geen sets om te syncen (geen pack_types in de database en geen SYNC_SET_IDS gezet).')
      return
    }

    console.log(`Sync-job: ${setIds.length} set(s) — ${setIds.join(', ')}`)

    for (const setId of setIds) {
      console.log(`\n[${setId}] set-info ophalen...`)
      const set = await client.fetchSet(setId)
      await upsertSet(pool, set)
      console.log(`[${setId}] "${set.name}" opgeslagen.`)

      console.log(`[${setId}] kaarten ophalen...`)
      const cards = await client.fetchCardsForSet(setId)
      for (const card of cards) {
        await upsertCard(pool, setId, card)
      }
      console.log(`[${setId}] ${cards.length} kaart(en) opgeslagen.`)
    }

    console.log('\nSync-job klaar.')
  } finally {
    await pool.end()
  }
}

main().catch((err) => {
  console.error('Sync-job mislukt:', err)
  process.exitCode = 1
})
