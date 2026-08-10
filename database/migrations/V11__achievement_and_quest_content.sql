-- Rijke content-pass: van 4 achievements + 2 quests naar een echte trophy-wall + een bruikbare
-- rotating quest-lijst. Achievements zijn eenmalig en levensduur-gericht (kunnen dus met
-- honderden zijn, het is een browse-baar wandje, geen to-do-lijst) — quests zijn bewust beperkt
-- gehouden (~25-30) omdat die actief per periode getoond worden en een lijst van honderden daar
-- geen zin in zou geven.
--
-- Elke achievement heeft nu een `metric` (en voor set-specifieke achievements een `set_id`) i.p.v.
-- puur een code-string — zie AchievementService.checkAndAward voor de data-driven check.

ALTER TABLE achievements
    ADD COLUMN metric VARCHAR(30),
    ADD COLUMN set_id VARCHAR(40) REFERENCES card_sets(id);

-- Bestaande 4 achievements krijgen hun metric (functioneel ongewijzigd t.o.v. hoe ze al werkten).
UPDATE achievements SET metric = 'first_holo' WHERE code = 'first_holo';
UPDATE achievements SET metric = 'complete_sets', threshold = 1 WHERE code = 'first_complete_set';
UPDATE achievements SET metric = 'packs_opened', threshold = 10 WHERE code = 'packs_opened_10';
UPDATE achievements SET metric = 'packs_opened', threshold = 100 WHERE code = 'packs_opened_100';

ALTER TABLE achievements ALTER COLUMN metric SET NOT NULL;

-- ============================================================================================
-- Algemene mijlpaal-achievements — 7 metrics, elk met oplopende tiers. reward_coins/reward_xp
-- schalen mee met hoe moeilijk de drempel is.
-- ============================================================================================

INSERT INTO achievements (code, name, description, metric, threshold, reward_coins, reward_xp) VALUES
    -- packs_opened (5/10/100 bewust overgeslagen waar al gedekt door bestaande 2 rijen hierboven)
    ('packs_opened_5', 'Eerste stapjes', 'Open 5 packs', 'packs_opened', 5, 15, 10),
    ('packs_opened_25', 'Vaste klant', 'Open 25 packs', 'packs_opened', 25, 40, 20),
    ('packs_opened_50', 'Pack-fanaat', 'Open 50 packs', 'packs_opened', 50, 80, 35),
    ('packs_opened_200', 'Boostermagneet', 'Open 200 packs', 'packs_opened', 200, 250, 90),
    ('packs_opened_350', 'Scheurmachine', 'Open 350 packs', 'packs_opened', 350, 450, 150),
    ('packs_opened_500', 'Pack-verslaafde', 'Open 500 packs', 'packs_opened', 500, 700, 220),
    ('packs_opened_750', 'Onverzadigbaar', 'Open 750 packs', 'packs_opened', 750, 1000, 300),
    ('packs_opened_1000', 'Duizend-en-een pack', 'Open 1.000 packs', 'packs_opened', 1000, 1500, 450),
    ('packs_opened_1500', 'Pack-veteraan XL', 'Open 1.500 packs', 'packs_opened', 1500, 2200, 650),
    ('packs_opened_2000', 'Boosteroorlog', 'Open 2.000 packs', 'packs_opened', 2000, 3000, 900),
    ('packs_opened_3000', 'Kartonnen berg', 'Open 3.000 packs', 'packs_opened', 3000, 4500, 1300),
    ('packs_opened_5000', 'Pack-legende', 'Open 5.000 packs', 'packs_opened', 5000, 7000, 2000),
    ('packs_opened_7500', 'Onstuitbaar', 'Open 7.500 packs', 'packs_opened', 7500, 10000, 2800),
    ('packs_opened_10000', 'De ultieme opener', 'Open 10.000 packs', 'packs_opened', 10000, 15000, 4000),

    -- cards_collected (unieke kaarten in bezit)
    ('cards_collected_10', 'Prille verzamelaar', 'Verzamel 10 unieke kaarten', 'cards_collected', 10, 15, 10),
    ('cards_collected_25', 'Groeiende binder', 'Verzamel 25 unieke kaarten', 'cards_collected', 25, 35, 18),
    ('cards_collected_50', 'Halve plank vol', 'Verzamel 50 unieke kaarten', 'cards_collected', 50, 70, 30),
    ('cards_collected_100', 'Honderd unieke kaarten', 'Verzamel 100 unieke kaarten', 'cards_collected', 100, 150, 60),
    ('cards_collected_200', 'Twee cijfers voorbij', 'Verzamel 200 unieke kaarten', 'cards_collected', 200, 280, 100),
    ('cards_collected_350', 'Serieuze verzamelaar', 'Verzamel 350 unieke kaarten', 'cards_collected', 350, 450, 160),
    ('cards_collected_500', 'Binder loopt vol', 'Verzamel 500 unieke kaarten', 'cards_collected', 500, 650, 230),
    ('cards_collected_750', 'Bijna encyclopedisch', 'Verzamel 750 unieke kaarten', 'cards_collected', 750, 950, 320),
    ('cards_collected_1000', 'Duizend unieke kaarten', 'Verzamel 1.000 unieke kaarten', 'cards_collected', 1000, 1400, 450),
    ('cards_collected_1500', 'Kaartenkathedraal', 'Verzamel 1.500 unieke kaarten', 'cards_collected', 1500, 2000, 650),
    ('cards_collected_2000', 'Pokedex op papier', 'Verzamel 2.000 unieke kaarten', 'cards_collected', 2000, 2800, 900),
    ('cards_collected_3000', 'Museumwaardig', 'Verzamel 3.000 unieke kaarten', 'cards_collected', 3000, 4000, 1300),
    ('cards_collected_5000', 'Levende catalogus', 'Verzamel 5.000 unieke kaarten', 'cards_collected', 5000, 6500, 2000),
    ('cards_collected_7500', 'Bijna alles', 'Verzamel 7.500 unieke kaarten', 'cards_collected', 7500, 9500, 2800),
    ('cards_collected_10000', 'Compleetheid nabij', 'Verzamel 10.000 unieke kaarten', 'cards_collected', 10000, 13000, 3800),
    ('cards_collected_15000', 'De collectie zelf', 'Verzamel 15.000 unieke kaarten', 'cards_collected', 15000, 18000, 5000),

    -- coins_earned (lifetime verdiend)
    ('coins_earned_500', 'Eerste centen', 'Verdien in totaal 500 coins', 'coins_earned', 500, 10, 8),
    ('coins_earned_1000', 'Muntjes sparen', 'Verdien in totaal 1.000 coins', 'coins_earned', 1000, 20, 12),
    ('coins_earned_2500', 'Aardig spaarpotje', 'Verdien in totaal 2.500 coins', 'coins_earned', 2500, 50, 25),
    ('coins_earned_5000', 'Rammelende buidel', 'Verdien in totaal 5.000 coins', 'coins_earned', 5000, 90, 40),
    ('coins_earned_10000', 'Goudkoorts', 'Verdien in totaal 10.000 coins', 'coins_earned', 10000, 170, 70),
    ('coins_earned_20000', 'Muntenmagnaat', 'Verdien in totaal 20.000 coins', 'coins_earned', 20000, 300, 120),
    ('coins_earned_35000', 'Schathouder', 'Verdien in totaal 35.000 coins', 'coins_earned', 35000, 500, 190),
    ('coins_earned_50000', 'Rijkdom in coins', 'Verdien in totaal 50.000 coins', 'coins_earned', 50000, 700, 260),
    ('coins_earned_75000', 'Bank van Kanto', 'Verdien in totaal 75.000 coins', 'coins_earned', 75000, 1000, 350),
    ('coins_earned_100000', 'Coinbaron', 'Verdien in totaal 100.000 coins', 'coins_earned', 100000, 1400, 470),
    ('coins_earned_150000', 'Muntenmeester', 'Verdien in totaal 150.000 coins', 'coins_earned', 150000, 2000, 650),
    ('coins_earned_250000', 'Schatkamer', 'Verdien in totaal 250.000 coins', 'coins_earned', 250000, 3200, 1000),
    ('coins_earned_500000', 'Draconische schat', 'Verdien in totaal 500.000 coins', 'coins_earned', 500000, 6000, 1800),
    ('coins_earned_750000', 'Bijna een miljoen', 'Verdien in totaal 750.000 coins', 'coins_earned', 750000, 8500, 2500),
    ('coins_earned_1000000', 'Miljonair in munten', 'Verdien in totaal 1.000.000 coins', 'coins_earned', 1000000, 12000, 3500),

    -- coins_spent (lifetime uitgegeven)
    ('coins_spent_500', 'Eerste aankoop', 'Geef in totaal 500 coins uit', 'coins_spent', 500, 10, 8),
    ('coins_spent_1000', 'Actieve besteder', 'Geef in totaal 1.000 coins uit', 'coins_spent', 1000, 20, 12),
    ('coins_spent_2500', 'Impulsief maar leuk', 'Geef in totaal 2.500 coins uit', 'coins_spent', 2500, 45, 22),
    ('coins_spent_5000', 'Grote uitgaven', 'Geef in totaal 5.000 coins uit', 'coins_spent', 5000, 80, 35),
    ('coins_spent_10000', 'Pack-shopper', 'Geef in totaal 10.000 coins uit', 'coins_spent', 10000, 150, 65),
    ('coins_spent_20000', 'Vrijgevige portemonnee', 'Geef in totaal 20.000 coins uit', 'coins_spent', 20000, 280, 110),
    ('coins_spent_35000', 'Grootverbruiker', 'Geef in totaal 35.000 coins uit', 'coins_spent', 35000, 450, 180),
    ('coins_spent_50000', 'Uitgavenkoning', 'Geef in totaal 50.000 coins uit', 'coins_spent', 50000, 650, 240),
    ('coins_spent_75000', 'Bodemloze put', 'Geef in totaal 75.000 coins uit', 'coins_spent', 75000, 900, 320),
    ('coins_spent_100000', 'Serieus geinvesteerd', 'Geef in totaal 100.000 coins uit', 'coins_spent', 100000, 1300, 430),
    ('coins_spent_150000', 'Zware belegger', 'Geef in totaal 150.000 coins uit', 'coins_spent', 150000, 1800, 600),
    ('coins_spent_250000', 'Investeerder XL', 'Geef in totaal 250.000 coins uit', 'coins_spent', 250000, 2800, 900),
    ('coins_spent_500000', 'Alles erin gegooid', 'Geef in totaal 500.000 coins uit', 'coins_spent', 500000, 5000, 1600),
    ('coins_spent_750000', 'Financiele toewijding', 'Geef in totaal 750.000 coins uit', 'coins_spent', 750000, 7000, 2200),
    ('coins_spent_1000000', 'Miljoen munten uitgegeven', 'Geef in totaal 1.000.000 coins uit', 'coins_spent', 1000000, 10000, 3000),

    -- complete_sets (1 al gedekt door de bijgewerkte first_complete_set)
    ('complete_sets_2', 'Twee complete sets', 'Maak 2 sets compleet', 'complete_sets', 2, 150, 60),
    ('complete_sets_3', 'Drie op een rij', 'Maak 3 sets compleet', 'complete_sets', 3, 250, 90),
    ('complete_sets_5', 'Vijf complete sets', 'Maak 5 sets compleet', 'complete_sets', 5, 450, 150),
    ('complete_sets_10', 'Tien complete sets', 'Maak 10 sets compleet', 'complete_sets', 10, 900, 300),
    ('complete_sets_15', 'Vijftien compleet', 'Maak 15 sets compleet', 'complete_sets', 15, 1400, 450),
    ('complete_sets_20', 'Twintig compleet', 'Maak 20 sets compleet', 'complete_sets', 20, 1900, 600),
    ('complete_sets_30', 'Dertig complete sets', 'Maak 30 sets compleet', 'complete_sets', 30, 2800, 900),
    ('complete_sets_50', 'Vijftig complete sets', 'Maak 50 sets compleet', 'complete_sets', 50, 4500, 1500),
    ('complete_sets_75', 'Vijfenzeventig compleet', 'Maak 75 sets compleet', 'complete_sets', 75, 6500, 2200),
    ('complete_sets_100', 'Honderd complete sets', 'Maak 100 sets compleet', 'complete_sets', 100, 8500, 3000),
    ('complete_sets_125', '125 complete sets', 'Maak 125 sets compleet', 'complete_sets', 125, 10500, 3800),
    ('complete_sets_150', '150 complete sets', 'Maak 150 sets compleet', 'complete_sets', 150, 12500, 4500),
    ('complete_sets_174', 'Alle sets compleet', 'Maak alle 174 sets compleet', 'complete_sets', 174, 20000, 8000),

    -- level_reached
    ('level_reached_3', 'Niveau 3 bereikt', 'Bereik level 3', 'level_reached', 3, 30, 15),
    ('level_reached_5', 'Niveau 5 bereikt', 'Bereik level 5', 'level_reached', 5, 60, 25),
    ('level_reached_7', 'Niveau 7 bereikt', 'Bereik level 7', 'level_reached', 7, 100, 40),
    ('level_reached_10', 'Niveau 10 bereikt', 'Bereik level 10', 'level_reached', 10, 200, 80),
    ('level_reached_12', 'Niveau 12 bereikt', 'Bereik level 12', 'level_reached', 12, 300, 120),
    ('level_reached_15', 'Niveau 15 bereikt', 'Bereik level 15', 'level_reached', 15, 450, 180),
    ('level_reached_18', 'Niveau 18 bereikt', 'Bereik level 18', 'level_reached', 18, 650, 260),
    ('level_reached_20', 'Niveau 20 bereikt', 'Bereik level 20', 'level_reached', 20, 850, 350),
    ('level_reached_22', 'Niveau 22 bereikt', 'Bereik level 22', 'level_reached', 22, 1100, 450),
    ('level_reached_25', 'Niveau 25 — max level', 'Bereik het hoogste level, 25', 'level_reached', 25, 1500, 600),

    -- daily_streak
    ('daily_streak_2', 'Twee dagen op rij', 'Claim de dagelijkse bonus 2 dagen achter elkaar', 'daily_streak', 2, 15, 8),
    ('daily_streak_3', 'Drie dagen streak', 'Claim de dagelijkse bonus 3 dagen achter elkaar', 'daily_streak', 3, 25, 12),
    ('daily_streak_5', 'Vijf dagen vol', 'Claim de dagelijkse bonus 5 dagen achter elkaar', 'daily_streak', 5, 45, 20),
    ('daily_streak_7', 'Volle week', 'Claim de dagelijkse bonus 7 dagen achter elkaar', 'daily_streak', 7, 70, 30),
    ('daily_streak_10', 'Tien dagen streak', 'Claim de dagelijkse bonus 10 dagen achter elkaar', 'daily_streak', 10, 110, 45),
    ('daily_streak_14', 'Twee weken vol', 'Claim de dagelijkse bonus 14 dagen achter elkaar', 'daily_streak', 14, 160, 65),
    ('daily_streak_21', 'Drie weken streak', 'Claim de dagelijkse bonus 21 dagen achter elkaar', 'daily_streak', 21, 230, 95),
    ('daily_streak_30', 'Volle maand', 'Claim de dagelijkse bonus 30 dagen achter elkaar', 'daily_streak', 30, 350, 150),
    ('daily_streak_60', 'Twee maanden streak', 'Claim de dagelijkse bonus 60 dagen achter elkaar', 'daily_streak', 60, 600, 260),
    ('daily_streak_100', 'Honderd dagen streak', 'Claim de dagelijkse bonus 100 dagen achter elkaar', 'daily_streak', 100, 1000, 450),
    ('daily_streak_180', 'Half jaar streak', 'Claim de dagelijkse bonus 180 dagen achter elkaar', 'daily_streak', 180, 1800, 800),
    ('daily_streak_365', 'Een heel jaar', 'Claim de dagelijkse bonus 365 dagen achter elkaar', 'daily_streak', 365, 4000, 1800);

-- ============================================================================================
-- Per-set achievements — automatisch gegenereerd uit card_sets, dus altijd in sync met wat er
-- gesynct is. Reward schaalt met de grootte (complete_set) resp. marktwaarde (holo_pulled) van
-- de set zelf, geclamped zodat kleine promo-setjes en megasets allebei redelijk aanvoelen.
-- ============================================================================================

INSERT INTO achievements (code, name, description, metric, set_id, threshold, reward_coins, reward_xp)
SELECT
    'set_complete_' || cs.id,
    'Compleet: ' || cs.name,
    'Maak de set "' || cs.name || '" volledig compleet',
    'set_complete',
    cs.id,
    1,
    GREATEST(50, LEAST(2000, ROUND(COALESCE(cs.total, 50) * 3))),
    GREATEST(30, LEAST(1000, ROUND(COALESCE(cs.total, 50) * 1.5)))
FROM card_sets cs;

INSERT INTO achievements (code, name, description, metric, set_id, threshold, reward_coins, reward_xp)
SELECT
    'set_holo_' || cs.id,
    'Chase card: ' || cs.name,
    'Pak een holo-(of betere) kaart uit "' || cs.name || '"',
    'set_holo_pulled',
    cs.id,
    1,
    GREATEST(20, LEAST(800, ROUND(COALESCE(cs.avg_market_value_usd, 5) * 4))),
    GREATEST(15, LEAST(400, ROUND(COALESCE(cs.avg_market_value_usd, 5) * 2)))
FROM card_sets cs;

-- ============================================================================================
-- Quests — bewust een beperkte, gevarieerde rotating lijst (~25) i.p.v. honderden: dit is de
-- actieve to-do-lijst die een speler per dag/week/maand ziet, geen archief.
-- ============================================================================================

INSERT INTO quests (code, name, description, period, metric, target_count, reward_coins, reward_xp) VALUES
    -- daily (10)
    ('daily_open_1_pack', 'Dagelijkse start', 'Open 1 pack vandaag', 'daily', 'packs_opened', 1, 15, 15),
    ('daily_open_3_packs_v2', 'Dagelijkse opener', 'Open 3 packs vandaag', 'daily', 'packs_opened', 3, 30, 30),
    ('daily_open_5_packs', 'Stevige dag', 'Open 5 packs vandaag', 'daily', 'packs_opened', 5, 50, 45),
    ('daily_open_8_packs', 'Marathonzitting', 'Open 8 packs vandaag', 'daily', 'packs_opened', 8, 80, 70),
    ('daily_collect_3_cards', 'Nieuwe aanwinsten', 'Verzamel 3 nieuwe kaarten vandaag', 'daily', 'cards_collected', 3, 30, 25),
    ('daily_collect_6_cards', 'Vers uit de binder', 'Verzamel 6 nieuwe kaarten vandaag', 'daily', 'cards_collected', 6, 60, 50),
    ('daily_earn_100_coins', 'Kleingeld', 'Verdien 100 coins vandaag', 'daily', 'coins_earned', 100, 25, 20),
    ('daily_earn_300_coins', 'Goede dag', 'Verdien 300 coins vandaag', 'daily', 'coins_earned', 300, 60, 45),
    ('daily_spend_150_coins', 'Bestedingsdrang', 'Geef 150 coins uit vandaag', 'daily', 'coins_spent', 150, 25, 20),
    ('daily_spend_400_coins', 'Grote dag op de markt', 'Geef 400 coins uit vandaag', 'daily', 'coins_spent', 400, 65, 50),

    -- weekly (10)
    ('weekly_open_10_packs_v2', 'Weekmissie', 'Open 10 packs deze week', 'weekly', 'packs_opened', 10, 150, 100),
    ('weekly_open_25_packs', 'Weekend-warrior', 'Open 25 packs deze week', 'weekly', 'packs_opened', 25, 350, 220),
    ('weekly_open_50_packs', 'Volle week scheuren', 'Open 50 packs deze week', 'weekly', 'packs_opened', 50, 700, 420),
    ('weekly_collect_15_cards', 'Weekaanwinst', 'Verzamel 15 nieuwe kaarten deze week', 'weekly', 'cards_collected', 15, 200, 130),
    ('weekly_collect_30_cards', 'Uitbreidende collectie', 'Verzamel 30 nieuwe kaarten deze week', 'weekly', 'cards_collected', 30, 400, 250),
    ('weekly_earn_1000_coins', 'Wekelijkse winst', 'Verdien 1.000 coins deze week', 'weekly', 'coins_earned', 1000, 180, 110),
    ('weekly_earn_2500_coins', 'Solide week', 'Verdien 2.500 coins deze week', 'weekly', 'coins_earned', 2500, 400, 240),
    ('weekly_spend_1200_coins', 'Weekbudget op', 'Geef 1.200 coins uit deze week', 'weekly', 'coins_spent', 1200, 180, 110),
    ('weekly_spend_3000_coins', 'Alles erin deze week', 'Geef 3.000 coins uit deze week', 'weekly', 'coins_spent', 3000, 420, 250),
    ('weekly_complete_set', 'Wekelijkse afronding', 'Maak deze week een set compleet', 'weekly', 'complete_sets', 1, 500, 300),

    -- monthly (8)
    ('monthly_open_100_packs', 'Maandelijkse mijlpaal', 'Open 100 packs deze maand', 'monthly', 'packs_opened', 100, 1200, 700),
    ('monthly_open_200_packs', 'Maandmarathon', 'Open 200 packs deze maand', 'monthly', 'packs_opened', 200, 2400, 1400),
    ('monthly_collect_75_cards', 'Maandcollectie', 'Verzamel 75 nieuwe kaarten deze maand', 'monthly', 'cards_collected', 75, 900, 550),
    ('monthly_collect_150_cards', 'Grote maandoogst', 'Verzamel 150 nieuwe kaarten deze maand', 'monthly', 'cards_collected', 150, 1800, 1100),
    ('monthly_earn_8000_coins', 'Maandwinst', 'Verdien 8.000 coins deze maand', 'monthly', 'coins_earned', 8000, 900, 550),
    ('monthly_spend_10000_coins', 'Maandbudget', 'Geef 10.000 coins uit deze maand', 'monthly', 'coins_spent', 10000, 900, 550),
    ('monthly_complete_2_sets', 'Twee sets per maand', 'Maak deze maand 2 sets compleet', 'monthly', 'complete_sets', 2, 1500, 900),
    ('monthly_reach_level', 'Maandelijkse groei', 'Stijg deze maand minstens 1 level', 'monthly', 'level_reached', 1, 700, 400);
