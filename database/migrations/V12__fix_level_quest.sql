-- V11's monthly_reach_level quest was fundamentally broken: level_reached als quest-metric
-- geeft het aantal levels dat je won tijdens déze ene pack-opening. Vroege levels kosten zo
-- weinig XP (level 1->2 is al binnen één pack) dat "stijg deze maand 1 level" bij zo goed als
-- elke speler al bij hun allereerste pack afgaat — en dan meteen de veel te grote beloning
-- (700 coins/400xp, bedoeld voor een "hele maand"-doel) uitkeert. level_reached blijft prima
-- werken als achievement-metric (die toetst een absolute drempel, geen delta) — alleen als
-- quest-delta klopt het niet. Simpelweg verwijderen i.p.v. repareren: er is geen zinnige
-- "hoeveel levels per periode"-drempel die niet hetzelfde vroeg/laat-probleem heeft.
DELETE FROM quests WHERE code = 'monthly_reach_level';

-- V11 per ongeluk ook 2 near-duplicates van de al bestaande V3-quests aangemaakt
-- (daily_open_3_packs_v2 / weekly_open_10_packs_v2 hadden exact dezelfde metric+period+target
-- als de originelen) — de originelen blijven, de "_v2"-versies zijn overbodig.
DELETE FROM quests WHERE code IN ('daily_open_3_packs_v2', 'weekly_open_10_packs_v2');
