-- Testfase: elke gesyncte set wordt een koopbaar, ontgrendeld pack (unlock_level 1) zodat er in
-- de frontend meteen alles aan te klikken is, ipv alleen de 2 handmatig aangemaakte packs. Prijs/
-- unlock-level/rarity-balans is bewust een platte default hier — dat is een aparte
-- product-beslissing voor later (zie sync-job/README.md), dit is puur om alle gesyncte data
-- zichtbaar en test-baar te maken. Sets die al een pack_type hebben (base1, sv3pt5) blijven
-- ongemoeid.
--
-- Slotverdeling is gelijk aan de bestaande 2 packs (5 commons, 2 uncommons, 1 reverse holo,
-- 1 hit) — PackDrawer trekt gewoon minder als een set te weinig kaarten in een tier heeft
-- (bv. kleine promo-sets zonder "hit"-tier kaarten), dus dit is voor elke set veilig.
INSERT INTO pack_types (set_id, name, price, unlock_level, slot_commons, slot_uncommons, slot_reverse_holo, slot_hits)
SELECT id, name, 150, 1, 5, 2, 1, 1
FROM card_sets
WHERE id NOT IN (SELECT set_id FROM pack_types);

-- Ook de 2 bestaande packs tijdelijk ontgrendelen (de "151"-pack stond op unlock_level 5) — puur
-- voor deze test-fase. Zodra er weer een echte level-gate getest moet worden, unlock_level hier
-- gewoon terugzetten.
UPDATE pack_types SET unlock_level = 1;
