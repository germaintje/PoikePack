# PokePack

PokePack is een webapp waarin je Pokémon-boosterpacks digitaal opent, kaarten verzamelt in een
binder en een collectie opbouwt. Packs koop je met in-app coins die je verdient door te spelen —
geen real-money gokmechanieken. Zie [`docs/PROJECT_BRIEF.md`](docs/PROJECT_BRIEF.md) voor de volledige
projectbriefing (concept, scope, datamodel, tech stack).

## Status

🚧 Frontend en backend werken en praten met elkaar: pack openen, coins, binder — allemaal
backend-authoritatief (server bepaalt de RNG, niet de client). De sync-job haalt echte sets +
kaarten op bij de Pokémon TCG API (`npm run sync` in `sync-job/`); tot je 'm draait staat er
een kleine handmatige seed (`database/migrations/V2__seed_demo_data.sql`). Er is nog geen auth
(zie `backend/README.md`).

## Monorepo-structuur

```
poikemon-game/
├── docs/          # Projectbriefing en architectuurnotities
├── frontend/       # React + Vite + TS + Tailwind + Framer Motion + React Three Fiber
├── backend/        # Spring Boot API — pack opening, coins-economie, binder
├── database/       # Flyway-migraties (schema + demo-seed)
└── sync-job/       # Sync tegen de Pokémon TCG API -> card_sets/cards
```

## Draaien

Backend en frontend draaien allebei, tegelijk:

```bash
# 1. Postgres met een database `pokepack` (schema + seed komen automatisch mee via Flyway)
createdb pokepack

# 2. Backend
cd backend
mvn spring-boot:run    # draait op :8080

# 3. Frontend (nieuwe terminal)
cd frontend
npm install
npm run dev             # draait op :5173, praat met de backend op :8080
```

Zie `backend/README.md` voor de API-endpoints en `frontend/.env.example` als de backend niet op
de standaard poort draait. Echte kaartdata ophalen i.p.v. de handmatige seed: zie
`sync-job/README.md`.

## Volgende stappen

Zie `docs/PROJECT_BRIEF.md` §2 en §7 voor de MVP-scope en het voorlopige datamodel. Nog te
bouwen: auth, quests/achievements-endpoints, leaderboards, en eigen R2-hosting van
kaartafbeeldingen (sync-job slaat nu nog de directe API-URL's op).
