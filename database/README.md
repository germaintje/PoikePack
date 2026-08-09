# Database

Schema en migraties, nog te bouwen (Flyway of Liquibase — keuze bij backend-opzet). Zie
`../docs/PROJECT_BRIEF.md` §7 voor het voorlopige datamodel: `users`, `sets`, `cards`,
`pack_types`, `user_cards`, `transactions`, `pack_openings`, `quests`/`achievements`,
`leaderboard_scores`.

`sets` en `cards` worden gevuld door `../sync-job/`, niet handmatig gemuteerd.
