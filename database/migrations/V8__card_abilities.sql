-- Gemist bij de eerste V6-uitbreiding: de API geeft ook `abilities` terug (bv. Charizard's
-- "Energy Burn" Pokémon Power) — los van attacks, met eigen naam/tekst/type ("Ability" of
-- "Pokémon Power"). Zelfde JSONB-aanpak als de rest van de rijke kaartdata.
ALTER TABLE cards
    ADD COLUMN abilities JSONB;
