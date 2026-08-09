# Sync job

Los script dat de Pokémon TCG API (`https://api.pokemontcg.io/v2/`) leegtrekt en de sets +
kaarten in onze eigen Postgres zet (`card_sets`, `cards` — hetzelfde schema als de backend
gebruikt). Dit is de enige plek die de externe API mag aanroepen; de live app (frontend +
backend) raakt 'm nooit aan tijdens gebruik, zie `../docs/PROJECT_BRIEF.md` §4.

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

## Gedrag

- **Idempotent** — kaarten/sets worden ge-upsert (`ON CONFLICT ... DO UPDATE`). Twee keer
  draaien geeft geen duplicaten, wel bijgewerkte data (prijzen/afbeeldingen/rarity kunnen in
  theorie wijzigen bij de bron).
- **Pagineert** door de volledige kaartenlijst van een set (API-max 250/pagina) i.p.v. bij de
  eerste pagina te stoppen — anders mis je precies de hoogst genummerde kaarten (illustration/
  secret rares), zie de commit die deze bug in de frontend fixte.
- Respecteert de rate limit met een kleine vertraging tussen requests (zonder API-key: 1000/dag,
  30/min — ruim genoeg voor een periodieke sync van een handvol sets).
- Slaat de **directe** `images.pokemontcg.io`-URL's op, geen eigen hosting. Zelf hosten via
  Cloudflare R2 (zoals de brief voorstelt) is een vervolgstap — dan wordt hier ook de download +
  upload naar R2 toegevoegd, en gaan `image_small_url`/`image_large_url` naar de eigen CDN-URL's
  wijzen i.p.v. de externe.

## Nog niet gebouwd

- Cloudflare R2-upload (nu: directe API-URL's, werkt prima maar is geen eigen hosting)
- Scheduling (nu: handmatig `npm run sync`; brief noemt wekelijks — een cron-job of
  scheduled task is de voor de hand liggende volgende stap, dit script zelf hoeft er niet
  voor te veranderen)
