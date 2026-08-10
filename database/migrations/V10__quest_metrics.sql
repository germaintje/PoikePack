-- Tot nu toe telden alle quests "packs geopend" — geen aparte metric-kolom nodig voor 2 quests.
-- Nu er een veel breder quest-aanbod komt (packs/kaarten/coins), moet elke quest weten wélke
-- UserStats-teller 'm voortgang geeft. Bestaande 2 quests krijgen expliciet packs_opened, zodat
-- ze precies blijven werken zoals voorheen.
ALTER TABLE quests
    ADD COLUMN metric VARCHAR(30) NOT NULL DEFAULT 'packs_opened';

ALTER TABLE quests ALTER COLUMN metric DROP DEFAULT;
