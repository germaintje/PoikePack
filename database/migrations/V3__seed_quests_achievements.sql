-- Quest- en achievement-definities voor de MVP (docs/PROJECT_BRIEF.md §2.2). Alle quests hier
-- tellen "packs geopend" (zie QuestService) — een metric-kolom toevoegen is de voor de hand
-- liggende uitbreiding zodra er quests met een ander soort doel bijkomen.

INSERT INTO quests (code, name, description, period, target_count, reward_coins) VALUES
    ('daily_open_3_packs', 'Dagelijkse opener', 'Open 3 packs vandaag', 'daily', 3, 30),
    ('weekly_open_10_packs', 'Weekmissie', 'Open 10 packs deze week', 'weekly', 10, 150);

INSERT INTO achievements (code, name, description, threshold, reward_coins) VALUES
    ('first_holo', 'Eerste holo', 'Pull je eerste holo-(of betere) kaart', 1, 50),
    ('first_complete_set', 'Setverzamelaar', 'Maak je eerste set compleet', 1, 200),
    ('packs_opened_10', 'Regelmatige opener', 'Open in totaal 10 packs', 10, 50),
    ('packs_opened_100', 'Pack-veteraan', 'Open in totaal 100 packs', 100, 300);
