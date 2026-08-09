# Backend (Spring Boot)

Java 21, Spring Boot 3.3, Postgres. Implementeert het server-authoritatieve deel van
docs/PROJECT_BRIEF.md: RNG, coin-mutaties en alle spelvoortgang (quests, achievements,
leaderboards, statistieken) gebeuren hier, nooit client-side.

## Draaien

Vereist: Java 21, Maven, een lokale Postgres met een database `pokepack`.

```bash
# eenmalig, als de database nog niet bestaat
createdb pokepack   # of: psql -c "CREATE DATABASE pokepack;"

cd backend
mvn spring-boot:run
```

Schema-migraties (Flyway) staan in `../database/migrations/` en worden automatisch toegepast
bij het opstarten — zie `src/main/resources/application.yml` (`spring.flyway.locations`).
Databasecredentials staan daar ook (default `postgres`/`postgres` op `localhost:5432`).

```bash
mvn test   # unit- + integratietests (draaien echt tegen de lokale Postgres)
```

## Auth

Stateless JWT-auth (`io.jsonwebtoken`, HMAC-SHA256). Registreren/inloggen geeft een token
terug; alle andere calls sturen die mee als `Authorization: Bearer <token>`. Wachtwoorden
worden met BCrypt gehasht, nooit in platte tekst opgeslagen. Zie
`src/main/java/com/pokepack/auth/`.

Publiek bereikbaar zonder token: `/api/auth/**` en de GET-only browse-endpoints
(`/api/packs`, `/api/cards`, `/api/leaderboard/**`). Alles daarbuiten vereist een geldige
token — ontbrekend/ongeldig token geeft `401 Unauthorized` (zie `SecurityConfig`).

De token-`secret` en levensduur staan in `application.yml` onder `pokepack.jwt.*`
(override via env var `POKEPACK_JWT_SECRET` in productie — de default is alleen voor lokale
ontwikkeling).

## API

| Endpoint | Methode | Auth | Omschrijving |
|---|---|---|---|
| `/api/auth/register` | POST | publiek | `{name, email, password}` → token + user (met startcoins) |
| `/api/auth/login` | POST | publiek | `{email, password}` → token + user |
| `/api/profile` | GET | token | Profiel + statistieken (packs geopend, coins verdiend/uitgegeven, kaarten verzameld) |
| `/api/profile` | PATCH | token | `{bio?, avatarEmoji?}` bijwerken |
| `/api/packs` | GET | publiek | Actieve pack-types |
| `/api/packs/{id}/open` | POST | token | Open een pack (server bepaalt + valideert de inhoud) |
| `/api/cards?setId=` | GET | publiek | Alle kaarten van een set (voor binder-voortgang/"?"-placeholders) |
| `/api/binder` | GET | token | Collectie van de speler |
| `/api/economy/daily-bonus` | POST | token | Claim dagelijkse bonus (met streak) |
| `/api/economy/sell-duplicates` | POST | token | Verkoop alle duplicates in bulk |
| `/api/quests` | GET | token | Actieve quests + voortgang van de speler |
| `/api/achievements` | GET | token | Alle achievements + unlock-status van de speler |
| `/api/leaderboard/coins` | GET | publiek | Top spelers op coins |
| `/api/leaderboard/collection` | GET | publiek | Top spelers op aantal unieke kaarten |
| `/api/leaderboard/complete-sets` | GET | publiek | Top spelers op aantal complete sets |

De frontend (`../frontend`) praat al met al deze endpoints — zie `frontend/src/lib/api.ts`
(wordt momenteel omgebouwd van de oude `X-User-Id`-aanpak naar Bearer-token auth).

## Module-indeling

```
backend/src/main/java/com/pokepack/
├── auth/        # JwtService, SecurityConfig, AuthService/Controller (register/login)
├── profile/     # ProfileController — profiel + statistieken opvragen/bijwerken
├── user/        # User entity, UserStats (per-speler telwerk) + UserStatsService
├── card/        # CardSet, Card — read-only, gevuld door sync-job
├── pack/        # PackType, PackDrawer (server-side RNG), PackOpeningService/Controller
├── binder/      # UserCard (inventory), BinderController
├── economy/     # Transaction, EconomyService (daily bonus, sell duplicates)
├── quest/       # Quest, QuestService/Controller (daily/weekly/monthly)
├── achievement/ # Achievement, AchievementService/Controller
├── leaderboard/ # LeaderboardRepository (raw SQL, geen JPA-fit) + Controller
└── common/      # AuthUtil (Authentication → userId), gedeelde exception handling
```

`PackDrawer` is bewust een pure Java-klasse zonder Spring/DB-afhankelijkheden — dat is de
daadwerkelijke RNG-logica, en die is zo los en snel te unit-testen (zie `PackDrawerTest`).

`UserStats` is een losse tabel (niet kolommen op `users`) zodat er later meer tellers bij
kunnen zonder de kern-identiteitstabel te raken. Wordt bijgewerkt vanuit alle plekken waar
coins/kaarten muteren (`PackOpeningService`, `EconomyService`, `QuestService`,
`AchievementService`) via `UserStatsService`.

## Nog niet gebouwd

- `sync-job` moet nog echt draaien om `card_sets`/`cards` te vullen — tot die tijd bevat
  `V2__seed_demo_data.sql` een kleine handmatige demo-set (Base Set + 151)
- Leaderboards draaien nu op live SQL-aggregaties, geen Redis sorted sets (prima voor de
  huidige schaal; zie docs/PROJECT_BRIEF.md §4 voor het toekomstplan als dat ooit nodig is)
