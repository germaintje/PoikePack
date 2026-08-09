-- PokePack initial schema. See docs/PROJECT_BRIEF.md §7 for the data model this implements.

CREATE TABLE users (
    id                    BIGSERIAL PRIMARY KEY,
    name                  VARCHAR(80)  NOT NULL,
    email                 VARCHAR(255) NOT NULL UNIQUE,
    coins                 BIGINT       NOT NULL DEFAULT 0 CHECK (coins >= 0),
    level                 INT          NOT NULL DEFAULT 1 CHECK (level >= 1),
    daily_streak          INT          NOT NULL DEFAULT 0,
    last_daily_bonus_date DATE,
    created_at            TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- Gesynchroniseerd vanuit de Pokémon TCG API door sync-job. Nooit handmatig muteren.
CREATE TABLE card_sets (
    id            VARCHAR(40)  PRIMARY KEY, -- API set id, bv. "base1"
    name          VARCHAR(120) NOT NULL,
    release_date  DATE,
    logo_url      TEXT,
    symbol_url    TEXT,
    synced_at     TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- Gesynchroniseerd vanuit de Pokémon TCG API door sync-job. Nooit handmatig muteren.
CREATE TABLE cards (
    id              VARCHAR(60)  PRIMARY KEY, -- API card id, bv. "base1-4"
    set_id          VARCHAR(40)  NOT NULL REFERENCES card_sets(id),
    name            VARCHAR(120) NOT NULL,
    number          VARCHAR(20)  NOT NULL,
    rarity          VARCHAR(60)  NOT NULL,
    primary_type    VARCHAR(30),
    image_small_url TEXT,
    image_large_url TEXT,
    synced_at       TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE INDEX idx_cards_set_rarity ON cards (set_id, rarity);

-- Slot-config als losse kolommen i.p.v. JSON: even flexibel voor de bekende slot-indeling
-- (commons/uncommons/reverse holo/hits per pack), maar type-veilig en query-baar.
CREATE TABLE pack_types (
    id                  BIGSERIAL PRIMARY KEY,
    set_id              VARCHAR(40)  NOT NULL REFERENCES card_sets(id),
    name                VARCHAR(120) NOT NULL,
    price               INT          NOT NULL CHECK (price >= 0),
    unlock_level        INT          NOT NULL DEFAULT 1 CHECK (unlock_level >= 1),
    slot_commons        INT          NOT NULL DEFAULT 0 CHECK (slot_commons >= 0),
    slot_uncommons      INT          NOT NULL DEFAULT 0 CHECK (slot_uncommons >= 0),
    slot_reverse_holo   INT          NOT NULL DEFAULT 0 CHECK (slot_reverse_holo >= 0),
    slot_hits           INT          NOT NULL DEFAULT 0 CHECK (slot_hits >= 0),
    active              BOOLEAN      NOT NULL DEFAULT true,
    created_at          TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- Binder / inventory.
CREATE TABLE user_cards (
    user_id     BIGINT      NOT NULL REFERENCES users(id),
    card_id     VARCHAR(60) NOT NULL REFERENCES cards(id),
    quantity    INT         NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    obtained_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, card_id)
);

CREATE TABLE transactions (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT      NOT NULL REFERENCES users(id),
    type        VARCHAR(30) NOT NULL, -- pack_open, sell, daily_bonus, quest_reward, achievement_reward
    amount      BIGINT      NOT NULL, -- negatief = uitgave, positief = inkomsten
    note        VARCHAR(255),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_transactions_user_created ON transactions (user_id, created_at DESC);

-- Audit-log van elke pack-opening, voor anti-cheat / support. pulled_card_ids staat als
-- comma-separated tekst i.p.v. een losse tabel omdat dit puur write-once audit-data is,
-- geen data waar joins/queries op de losse kaart nodig zijn (dat loopt via user_cards).
CREATE TABLE pack_openings (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT      NOT NULL REFERENCES users(id),
    pack_type_id    BIGINT      NOT NULL REFERENCES pack_types(id),
    pulled_card_ids TEXT        NOT NULL,
    coins_spent     INT         NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_pack_openings_user_created ON pack_openings (user_id, created_at DESC);

CREATE TABLE quests (
    id             BIGSERIAL PRIMARY KEY,
    code           VARCHAR(60)  NOT NULL UNIQUE,
    name           VARCHAR(120) NOT NULL,
    description    VARCHAR(255),
    period         VARCHAR(20)  NOT NULL, -- daily, weekly, monthly, once
    target_count   INT          NOT NULL CHECK (target_count > 0),
    reward_coins   INT          NOT NULL DEFAULT 0,
    active         BOOLEAN      NOT NULL DEFAULT true
);

-- period_key = bv. "2026-08-09" voor een daily quest, "2026-W32" voor weekly, "once" voor
-- eenmalige quests — zo reset voortgang vanzelf per periode zonder een cron-job die rijen wist.
CREATE TABLE user_quest_progress (
    user_id      BIGINT      NOT NULL REFERENCES users(id),
    quest_id     BIGINT      NOT NULL REFERENCES quests(id),
    period_key   VARCHAR(20) NOT NULL,
    progress     INT         NOT NULL DEFAULT 0,
    completed_at TIMESTAMPTZ,
    PRIMARY KEY (user_id, quest_id, period_key)
);

CREATE TABLE achievements (
    id           BIGSERIAL PRIMARY KEY,
    code         VARCHAR(60)  NOT NULL UNIQUE,
    name         VARCHAR(120) NOT NULL,
    description  VARCHAR(255),
    threshold    INT          NOT NULL DEFAULT 1,
    reward_coins INT          NOT NULL DEFAULT 0
);

CREATE TABLE user_achievements (
    user_id        BIGINT      NOT NULL REFERENCES users(id),
    achievement_id BIGINT      NOT NULL REFERENCES achievements(id),
    unlocked_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, achievement_id)
);

-- Leaderboards: geen losse tabel voor de MVP — berekend via query op users/user_cards
-- (zie UserRepository). Redis sorted sets komen erbij zodra dit qua load nodig is
-- (zie docs/PROJECT_BRIEF.md §4).
