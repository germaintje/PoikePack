# Architectuurnotities

Nog uit te werken zodra de backend gebouwd wordt. Uitgangspunten alvast vastgelegd zodat latere
fases (trading, pack battles, TCG-simulator) niet worden dichtgetimmerd door vroege keuzes:

- Alle economie-mutaties (coins, pack-inhoud) lopen via de backend en worden gelogd in
  `transactions` / `pack_openings` — nooit client-side berekend.
- `user_cards` is een aparte tabel (niet ingebed in `users`) zodat een latere trade-flow simpelweg
  `user_id` op een rij hoeft te wijzigen.
- `pack_types.slot_config` is data (JSON), geen hardcoded logica — nieuwe packs/sets toevoegen
  vereist geen backend-deploy.
- Leaderboards: read-model apart houden (Redis sorted sets) van de bron-tabellen, zodat de
  leaderboard-service later los geschaald of uitgebreid kan worden (seizoensleaderboards, etc.)
  zonder de kernschema's te raken.

Zie `PROJECT_BRIEF.md` §3 voor de expliciete lijst van latere fases waar de architectuur nu al
rekening mee houdt.
