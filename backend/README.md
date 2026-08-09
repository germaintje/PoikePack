# Backend (Spring Boot)

Nog te bouwen. Geplande stack: Spring Boot (Java/Kotlin), Postgres, Redis. Zie
`../docs/PROJECT_BRIEF.md` §4 en §7 voor tech-stack en voorlopig datamodel.

Geplande module-indeling (indicatief):

```
backend/
├── src/main/java/com/pokepack/
│   ├── pack/          # pack-types, RNG/drop-rates, pack-opening endpoint
│   ├── economy/        # coins, transactions, daily bonus, quests
│   ├── binder/          # user_cards, set-voortgang
│   ├── leaderboard/     # Redis sorted sets
│   └── card/             # sets/cards (read-only, gevuld door sync-job)
├── src/main/resources/
│   └── application.yml
└── build.gradle(.kts) of pom.xml
```

Belangrijkste regel: alle RNG en coin-mutaties gebeuren server-side. De client vraagt "open pack
X" aan; de server bepaalt en valideert de inhoud.
