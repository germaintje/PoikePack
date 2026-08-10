-- Echte marktwaarde i.p.v. alleen een rarity-tier-gok. sync-job vult market_value_usd per kaart
-- (afgeleid uit de al opgeslagen tcgplayer/cardmarket-prijzen — zie sync-job/src/db.ts) en
-- avg_market_value_usd per set (gewogen naar de duurste kaarten van die set, niet een plat
-- gemiddelde over alle bulk-commons — dat weerspiegelt beter waarom iemand een pack zou kopen).
-- Backend gebruikt dit voor packprijzen (pack_types) en kaartverkoopwaarde (CardValuation),
-- altijd met de bestaande rarity-tier-waarden als fallback voor kaarten zonder marktdata.

ALTER TABLE cards
    ADD COLUMN market_value_usd NUMERIC(10, 2);

ALTER TABLE card_sets
    ADD COLUMN avg_market_value_usd NUMERIC(10, 2);
