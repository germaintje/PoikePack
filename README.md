# PokePack

PokePack is een webapp waarin je Pokémon-boosterpacks digitaal opent, kaarten verzamelt in een
binder en een collectie opbouwt. Packs koop je met in-app coins die je verdient door te spelen —
geen real-money gokmechanieken. Zie [`docs/PROJECT_BRIEF.md`](docs/PROJECT_BRIEF.md) voor de volledige
projectbriefing (concept, scope, datamodel, tech stack).

## Status

🚧 Vroege opzet — repo-structuur staat, en er is een eerste visuele mockup van het
pack-opening scherm in `frontend/` (placeholder-data, nog geen backend-koppeling).

## Monorepo-structuur

```
poikemon-game/
├── docs/          # Projectbriefing en architectuurnotities
├── frontend/       # React + Vite + TS + Tailwind + Framer Motion + React Three Fiber
├── backend/        # Spring Boot API (nog te bouwen)
├── database/       # Schema/migraties (Flyway/Liquibase, nog te bouwen)
└── sync-job/       # Periodieke sync tegen de Pokémon TCG API (nog te bouwen)
```

## Frontend mockup draaien

```bash
cd frontend
npm install
npm run dev
```

Open daarna de URL die Vite toont (standaard http://localhost:5173). De flow: kies een pack →
open 'm → kaarten worden één voor één onthuld, met de "hit"-kaart als climax-reveal.

## Volgende stappen

Zie `docs/PROJECT_BRIEF.md` §2 en §7 voor de MVP-scope en het voorlopige datamodel. Backend
(Spring Boot + Postgres + Redis), database-migraties en de sync-job tegen pokemontcg.io zijn de
volgende bouwstenen, zodra de visuele richting van de mockup is afgestemd.
