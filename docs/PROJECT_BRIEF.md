# PokePack — Project Briefing

## 1. Concept

Een webapp waarin je echte Pokémon-boosterpacks nabootst in digitale vorm — je opent packs zoals
in real life, verzamelt kaarten in een binder, en bouwt een collectie op. Geen focus op
real-money gokken; de packs koop je met in-app coins, die je verdient door te spelen (dagelijkse
login, missies, kaarten verkopen). Het doel is een game waar je graag op terugkomt, geen pure
"unboxing simulator".

Bestaande pack-opening sites doen vaak te veel losse dingen tegelijk (marketplace, prijzen,
trading, etc.) zonder focus. Dit project kiest bewust een kleine, gepolijste kern en bouwt
daaromheen uit.

### Niet-doelen (nu)

- Geen echte-geld gokmechanieken als hoofdfocus (evt. later overwegen, niet nu)
- Geen live TCG-simulator (het daadwerkelijke kaartspel spelen) — fase 2/3
- Geen pack battles (PvP) — fase 2/3
- Geen trading tussen users — fase 2/3, hou architectuur er wel op voorbereid

## 2. MVP scope — dit moet werken

De MVP bestaat uit drie kernonderdelen. Alles daarbuiten is later.

### 2.1 Pack opening

- Speler kiest een pack-type uit een lijst (zie 2.1.1) en koopt 'm met coins.
- Pack wordt visueel geopend: mooie, vlotte animatie, kaart voor kaart onthuld.
- Kaartvolgorde volgt het echte TCG-patroon: commons/uncommons eerst (willekeurige volgorde), dan
  een reverse-holo slot, dan de "hit"-kaart (rare/holo/ex/etc.) als laatste — dit is de
  climax-kaart en verdient de meest uitgesproken reveal-animatie (net iets trager, net iets meer
  glow), ongeacht welke rarity erin zit. Spanning zit in het moment, niet alleen in de content.
- RNG en drop-rates zijn altijd server-side bepaald en gevalideerd — nooit client-side, om
  cheaten te voorkomen. De client vraagt "open pack X" aan, de server bepaalt de inhoud en stuurt
  het resultaat.

#### 2.1.1 Pack tiers (unlockable progressie)

- Basic packs: altijd beschikbaar, lage prijs, oudere/goedkopere sets, standaard odds.
- Premium/featured packs: unlocken via player level / streak / hogere prijs, nieuwere sets,
  betere odds.
- Techniek: een `pack_type`-tabel met `set_id`, `price`, `unlock_requirement`, `slot_config`
  (hoeveel commons/uncommons/rares/hits per pack). Nieuwe packs toevoegen = nieuwe data, geen
  nieuwe code.

### 2.2 Coins-economie

- Dagelijkse login-bonus: coins voor inloggen, evt. oplopend bij streaks.
- Missies/quests: korte taken (bijv. "open 3 packs vandaag") die coins opleveren. Optioneel met
  een lichte storyline-laag later.
- Kaarten verkopen: elke kaart heeft een verkoopwaarde gekoppeld aan rarity. Richtlijn voor
  balans: verkoopwaarde zo afstemmen dat het verkopen van een volledige pack aan
  commons/uncommons ruwweg 20–30% van de pack-prijs teruggeeft — genoeg als vangnet, niet genoeg
  om de economie kapot te maken.
  - Richtwaarden (aan te passen): Common = 5, Uncommon = 15, Rare = 50, Holo/EX/V+ = 150+.
- Duplicate bonus: kleine extra coins bovenop verkoopwaarde als je een kaart pulled die je al in
  bezit had.
- Weekly/monthly challenges: bonus coins/pack voor langere-termijn doelen (bijv. "open 10 packs
  deze week").
- Set completion bonus: coins of gegarandeerde pack zodra een hele set compleet is in de binder —
  belangrijkste retentie-hook naast pack opening zelf.
- Achievements/milestones: eenmalige bonussen (eerste holo, eerste complete set, 100 packs
  geopend, etc.) — simpele counters + thresholds.
- Bulk sell: knop om alle duplicates in 1x te verkopen met duidelijke preview, i.p.v. 1-voor-1.

### 2.3 Binder (collectie-overzicht)

- Overzicht van alle verzamelde kaarten, gegroepeerd per set.
- Toont per kaart: bezit ja/nee, aantal duplicates, rarity, set-voortgang (X van Y compleet).
- Filter/sorteer op set, rarity, type, bezit/niet-bezit.
- Visuele indicatie van setvoortgang (bijv. progress bar per set).

### 2.4 Leaderboards (lichte MVP-versie)

- Simpel: bijv. "meeste coins", "grootste collectie", "meeste complete sets". Niet de
  hoofdfocus van de MVP, maar wel meenemen als basis-tabel/query zodat het makkelijk uit te
  breiden is.

## 3. Latere fases (niet nu bouwen, wel architectuur er niet expliciet tegen laten werken)

- Pack battles (PvP, vergelijk pulls)
- Trading tussen users
- Daadwerkelijke TCG-simulator (kaartspel spelen met eigen kaarten)
- Seizoensgebonden/featured sets met wisselende odds
- Vault-mechanic: kaarten "vastzetten" voor sets, niet verkoopbaar zolang vastgezet

## 4. Tech stack

### Frontend

- React + TypeScript + Vite
- Tailwind CSS voor layout/UI
- Framer Motion voor algemene UI-animaties
- React Three Fiber (Three.js) voor de pack-opening zelf — 3D pack die open "scheurt", kaarten
  die omdraaien met holo/foil-shader-effect. Dit is de belangrijkste visuele investering van de
  hele app.
- Zustand voor client state (coins, inventory-cache, UI state)
- TanStack Query voor data-sync met backend

### Backend

- Spring Boot (Java/Kotlin — developer heeft hier al ervaring mee)
- Postgres als database
- Redis voor leaderboards (sorted sets) en evt. rate limiting / cooldowns
- Alle pack-RNG, coin-mutaties en validaties gebeuren server-side

### Data-sync (los onderdeel, geen live dependency)

- Los script/module (`sync-job`) dat periodiek (bijv. wekelijks) tegen de externe Pokémon TCG API
  aanloopt, alle sets + kaarten ophaalt en wegschrijft naar de eigen Postgres-database.
- Kaartafbeeldingen worden gedownload en zelf gehost (bijv. Cloudflare R2), niet live vanaf de
  externe API geserveerd.
- De live app raakt de externe API nooit aan tijdens gebruik — alles draait tegen eigen data.

### Infra

- Bestaande VPS als startpunt
- Cloudflare R2 (of vergelijkbaar) + CDN voor kaartafbeeldingen

## 5. Externe API — Pokémon TCG API (pokemontcg.io)

- Basis-URL: `https://api.pokemontcg.io/v2/`
- Endpoints: `/cards`, `/sets`, `/types`, `/subtypes`, `/supertypes`, `/rarities`
- Auth via `X-Api-Key` header (key aanvragen via dev.pokemontcg.io)
- Rate limits: met API key standaard 20.000 requests/dag (hoger op aanvraag); zonder key
  1.000/dag, max 30/minuut
- Card-object bevat o.a.: naam, set-info, kaartnummer, artiest, rarity (bijv. "Common", "Rare
  Holo", "Rare Rainbow"), afbeeldingen (small/large), types, subtypes, legaliteiten
- Rarity-lijst (vast, bruikbaar voor slot-config/drop-rates): Common, Uncommon, Rare, Rare Holo,
  Rare Holo EX/GX/V/VMAX, Rare Ultra, Rare Secret, Rare Rainbow, Rare Shiny, Amazing Rare, etc.
- Query-syntax ondersteunt filtering (Lucene-achtig) via `q`-parameter, plus paginering (`page`,
  `pageSize`) en sortering (`orderBy`)
- Dit is een fanmade/community API, geen officiële Pokémon Company-data — prima voor een for-fun,
  niet-commercieel project; bij eventuele latere monetization dit punt heroverwegen.

## 6. Repo-structuur (monorepo)

```
poikemon-game/
├── docs/
│   └── PROJECT_BRIEF.md
├── frontend/          # React + Vite + TS + Tailwind + R3F
├── backend/           # Spring Boot
├── database/          # schema/migrations (Flyway of Liquibase)
└── sync-job/          # los script/module voor de externe API-sync
```

## 7. Voorlopig datamodel (richting, niet finaal)

- `users` — id, naam, email, coins, level, created_at
- `sets` — gesynchroniseerd vanuit externe API (id, naam, releasedatum, afbeeldingen)
- `cards` — gesynchroniseerd vanuit externe API (id, set_id, naam, rarity, afbeeldingen, nummer,
  types)
- `pack_types` — id, set_id, naam, prijs, unlock_requirement, slot_config (JSON: hoeveel
  commons/uncommons/rares/hits)
- `user_cards` — user_id, card_id, quantity (binder/inventory)
- `transactions` — user_id, type (pack_open, sell, daily_bonus, quest_reward, etc.), amount,
  created_at
- `pack_openings` — log van geopende packs met resultaat, voor audit/anti-cheat
- `quests` / `achievements` — definities + user-voortgang
- `leaderboard_scores` — of berekend via query, of bijgehouden in Redis sorted sets

## 8. Visuele richting

- Modern, clean UI voor binder/overzichtsschermen (kaart-grid, filters, progress bars).
- Pack opening is het visuele hoogtepunt: 3D, tactiel gevoel (pack "scheuren"), holo/foil
  shader-effecten op rare kaarten, geluid/haptic-achtige feedback via animatie-timing.
- Denk aan een donker/licht thema-toggle, en een stijl die dichter bij "premium mobile game" zit
  dan bij een saaie admin-tool.
