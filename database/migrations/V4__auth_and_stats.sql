-- Echte auth (registratie/login) i.p.v. de placeholder-bootstrap, plus een profiel en een
-- losse stats-tabel zodat er per speler statistieken bijgehouden kunnen worden zonder de
-- kern-tabellen te belasten met tellers die niets met identiteit te maken hebben.

ALTER TABLE users
    ADD COLUMN password_hash  VARCHAR(255),
    ADD COLUMN avatar_emoji   VARCHAR(8) NOT NULL DEFAULT '🧑',
    ADD COLUMN bio            VARCHAR(280),
    ADD COLUMN last_login_at  TIMESTAMPTZ;

-- password_hash is bewust NULLABLE op DB-niveau (i.p.v. NOT NULL) zodat deze migratie niet kan
-- stuklopen op bestaande rijen uit de oude bootstrap-flow; de applicatielaag (AuthService)
-- garandeert dat elke nieuwe registratie er een krijgt, en login wijst een lege hash af.

CREATE TABLE user_stats (
    user_id                BIGINT PRIMARY KEY REFERENCES users(id),
    packs_opened_total     INT    NOT NULL DEFAULT 0,
    coins_earned_total     BIGINT NOT NULL DEFAULT 0,
    coins_spent_total      BIGINT NOT NULL DEFAULT 0,
    cards_collected_total  INT    NOT NULL DEFAULT 0,
    updated_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);
