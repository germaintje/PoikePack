# Sync job

Los script/module dat periodiek tegen de externe Pokémon TCG API (`https://api.pokemontcg.io/v2/`)
aanloopt, alle sets + kaarten ophaalt en wegschrijft naar de eigen Postgres-database.
Kaartafbeeldingen worden gedownload en zelf gehost (bijv. Cloudflare R2) — de live app raakt de
externe API nooit aan tijdens gebruik. Zie `../docs/PROJECT_BRIEF.md` §5.

Nog te bouwen. Auth via `X-Api-Key` header (key via dev.pokemontcg.io).
