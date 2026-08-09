// Sync-job: haalt sets + kaarten op bij de Pokémon TCG API en zet ze in onze eigen Postgres
// (card_sets, cards) — hetzelfde schema dat de backend gebruikt. Dit is de enige plek die de
// externe API mag aanroepen; de live app (frontend + backend) raakt 'm nooit aan, zie
// docs/PROJECT_BRIEF.md §4.
//
// Twee modi:
// - Standaard: alleen de sets waar een pack_type naar verwijst (dus: alleen sets waar we ook
//   echt packs van verkopen) — override met SYNC_SET_IDS="base1,sv3pt5" (comma-separated).
// - SYNC_ALL_SETS=true (of `npm run sync:all`): de volledige Pokémon TCG-catalogus — alle sets,
//   alle kaarten, ook sets waar (nog) geen pack_type voor bestaat. Puur als rijke
//   referentie-dataset; maakt geen nieuwe koopbare packs aan.
//
// Idempotent: draait 'm twee keer op dezelfde set, dan krijg je gewoon een update
// (ON CONFLICT ... DO UPDATE), geen duplicaten of fouten.
//
// Draaien: npm install && npm run sync (of npm run sync:all)

import 'dotenv/config'
import { createPool, fetchConfiguredSetIds, upsertCard, upsertSet } from './db.js'
import { PokemonTcgClient } from './pokemonTcgClient.js'

async function main() {
  const pool = createPool()
  const apiKey = process.env.POKEMON_TCG_API_KEY || undefined
  const client = new PokemonTcgClient(apiKey)
  const syncAll = process.env.SYNC_ALL_SETS === 'true'

  if (!apiKey) {
    console.log('Geen POKEMON_TCG_API_KEY gezet — draait met het anonieme rate limit (traag, maar werkt).')
  }

  try {
    let setIds: string[]

    if (syncAll) {
      console.log('SYNC_ALL_SETS=true — volledige catalogus ophalen (lijst van alle sets)...')
      const allSets = await client.fetchAllSets()
      console.log(`${allSets.length} sets gevonden in de Pokémon TCG-catalogus.`)
      for (const set of allSets) {
        await upsertSet(pool, set)
      }
      setIds = allSets.map((s) => s.id)
    } else {
      setIds = process.env.SYNC_SET_IDS
        ? process.env.SYNC_SET_IDS.split(',').map((s) => s.trim()).filter(Boolean)
        : await fetchConfiguredSetIds(pool)
    }

    if (setIds.length === 0) {
      console.log('Geen sets om te syncen (geen pack_types in de database en geen SYNC_SET_IDS gezet).')
      return
    }

    console.log(`Sync-job: ${setIds.length} set(s)${syncAll ? '' : ` — ${setIds.join(', ')}`}`)

    let totalCards = 0
    let setsDone = 0
    const failedSets: string[] = []

    for (const setId of setIds) {
      setsDone += 1
      const prefix = `[${setsDone}/${setIds.length} ${setId}]`
      try {
        if (!syncAll) {
          // In syncAll-modus is de set al opgehaald+opgeslagen via fetchAllSets() hierboven.
          console.log(`${prefix} set-info ophalen...`)
          const set = await client.fetchSet(setId)
          await upsertSet(pool, set)
          console.log(`${prefix} "${set.name}" opgeslagen.`)
        }

        console.log(`${prefix} kaarten ophalen...`)
        const cards = await client.fetchCardsForSet(setId)
        for (const card of cards) {
          await upsertCard(pool, setId, card)
        }
        totalCards += cards.length
        console.log(`${prefix} ${cards.length} kaart(en) opgeslagen. (totaal tot nu toe: ${totalCards})`)
      } catch (err) {
        console.error(`${prefix} MISLUKT:`, err instanceof Error ? err.message : err)
        failedSets.push(setId)
      }
    }

    console.log(`\nSync-job klaar. ${setsDone - failedSets.length}/${setIds.length} sets gelukt, ${totalCards} kaarten totaal.`)
    if (failedSets.length > 0) {
      console.log(`Mislukte sets (overslagen, rest is wel gesynct): ${failedSets.join(', ')}`)
      process.exitCode = 1
    }
  } finally {
    await pool.end()
  }
}

main().catch((err) => {
  console.error('Sync-job mislukt:', err)
  process.exitCode = 1
})
