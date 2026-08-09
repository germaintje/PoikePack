-- Levelsysteem. Tot nu toe had users.level geen enkele bron om te stijgen (bleef altijd 1),
-- waardoor level-gated packs zoals "151" (unlock_level 5, zie V2) nooit bereikbaar waren.
-- XP komt uit pack-openingen, nieuwe kaarten, quests en achievements; het level wordt in de
-- applicatielaag afgeleid uit de cumulatieve XP (zie backend com.pokepack.user.LevelCurve),
-- niet los bijgehouden — xp is de enige bron van waarheid, level is een cache daarvan.

ALTER TABLE users
    ADD COLUMN xp BIGINT NOT NULL DEFAULT 0 CHECK (xp >= 0);

ALTER TABLE quests
    ADD COLUMN reward_xp INT NOT NULL DEFAULT 0;

ALTER TABLE achievements
    ADD COLUMN reward_xp INT NOT NULL DEFAULT 0;

UPDATE quests SET reward_xp = CASE period
    WHEN 'daily'  THEN 30
    WHEN 'weekly' THEN 100
    ELSE 50
END;

UPDATE achievements SET reward_xp = CASE code
    WHEN 'first_holo'         THEN 40
    WHEN 'first_complete_set' THEN 150
    WHEN 'packs_opened_10'    THEN 40
    WHEN 'packs_opened_100'   THEN 250
    ELSE 30
END;
