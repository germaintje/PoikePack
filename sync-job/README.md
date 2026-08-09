# Sync job

Los script dat de Pokémon TCG API (`https://api.pokemontcg.io/v2/`) leegtrekt en de sets +
kaarten in onze eigen Postgres zet (`card_sets`, `cards` — hetzelfde schema als de backend
gebruikt). Dit is de enige plek die de externe API mag aanroepen; de live app (frontend +
backend) raakt 'm nooit aan tijdens gebruik, zie `../docs/PROJECT_BRIEF.md` §4.

Slaat zoveel mogelijk op wat de API teruggeeft: naast naam/rarity/afbeeldingen ook HP, types,
attacks, weaknesses/resistances, retreat cost, evolutielijn, artist, flavor text, national
pokédex numbers, legalities, en tcgplayer/cardmarket-prijzen (zie `V6__rich_card_metadata.sql`).

## Draaien

```bash
cd sync-job
npm install
npm run sync
```

Verbindt standaard met dezelfde database als de backend (`postgres://postgres:postgres@localhost:5432/pokepack`).
Kopieer `.env.example` naar `.env` om dat of de API-key aan te passen.

## Welke sets?

Standaard: alle sets waar een `pack_type` naar verwijst (`select distinct set_id from
pack_types`) — dus alleen sets waar we ook echt packs van verkopen, niet de volledige
Pokémon TCG-geschiedenis. Override met:

```bash
SYNC_SET_IDS="base1,sv3pt5" npm run sync
```

bijvoorbeeld om alvast een set te syncen vóórdat er een `pack_type` voor bestaat.

### De hele catalogus

```bash
npm run sync:all
```

Haalt **alle** sets en kaarten uit de hele Pokémon TCG API op — niet alleen de sets waar we
packs van verkopen. Nuttig als brede referentie-dataset; maakt vanzelf géén nieuwe `pack_types`
aan (spelers kunnen dus niet ineens packs van al die extra sets kopen — dat blijft een losse,
bewuste stap). Zonder API-key duurt dit door de rate limit (~30 req/min) een kwartier tot half
uur voor de volledige catalogus (150+ sets, 18.000+ kaarten); mét key (gratis aan te vragen op
https://dev.pokemontcg.io/) is de limiet veel hoger en gaat het aanzienlijk sneller.

## Gedrag

- **Idempotent** — kaarten/sets worden ge-upsert (`ON CONFLICT ... DO UPDATE`). Twee keer
  draaien geeft geen duplicaten, wel bijgewerkte data (prijzen/afbeeldingen/rarity kunnen in
  theorie wijzigen bij de bron).
- **Pagineert** door de volledige kaartenlijst van een set (API-max 250/pagina) i.p.v. bij de
  eerste pagina te stoppen — anders mis je precies de hoogst genummerde kaarten (illustration/
  secret rares), zie de commit die deze bug in de frontend fixte.
- Respecteert de rate limit met een vertraging tussen requests (2.1s zonder API-key, 150ms mét)
  en retryt automatisch met backoff bij 429/5xx-responses.
- Eén mislukte set (bv. tijdelijke API-hik) stopt niet de hele run — die set wordt overgeslagen
  en gerapporteerd aan het eind, de rest gaat gewoon door.
- Slaat de **directe** `images.pokemontcg.io`-URL's op, geen eigen hosting. Zelf hosten via
  Cloudflare R2 (zoals de brief voorstelt) is een vervolgstap — dan wordt hier ook de download +
  upload naar R2 toegevoegd, en gaan `image_small_url`/`image_large_url` naar de eigen CDN-URL's
  wijzen i.p.v. de externe.

## Nog niet gebouwd

- Cloudflare R2-upload (nu: directe API-URL's, werkt prima maar is geen eigen hosting)
- Scheduling (nu: handmatig `npm run sync`; brief noemt wekelijks — een cron-job of
  scheduled task is de voor de hand liggende volgende stap, dit script zelf hoeft er niet
  voor te veranderen)
- Nieuwe `pack_types` voor sets die via `sync:all` binnenkomen maar nog niet verkocht worden —
  bewust losse, handmatige stap (prijs/unlock-level is een balans-beslissing).
