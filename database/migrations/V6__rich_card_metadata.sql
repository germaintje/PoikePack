-- Breidt card_sets/cards uit met alle bruikbare velden die de Pokémon TCG API teruggeeft, niet
-- alleen de handvol kolommen die de app tot nu toe nodig had. sync-job vult dit vanaf nu; de
-- backend blijft alleen de kolommen gebruiken die 'm al kende (extra kolommen die Hibernate niet
-- kent zijn geen probleem onder ddl-auto=validate — die valideert alleen de kolommen die de
-- entities zelf mappen).
--
-- Array-achtige/geneste API-velden (attacks, weaknesses, legalities, prijzen, ...) gaan als JSONB
-- i.p.v. eigen tabellen — dat is precies de vorm waarin de API ze levert, en een aparte tabel per
-- veld zou voor een MVP-referentie-dataset veel meer complexiteit toevoegen dan het oplevert.

ALTER TABLE card_sets
    ADD COLUMN series          VARCHAR(120),
    ADD COLUMN printed_total   INT,
    ADD COLUMN total           INT,
    ADD COLUMN ptcgo_code      VARCHAR(10),
    ADD COLUMN legalities      JSONB,
    ADD COLUMN source_updated_at VARCHAR(30); -- API's eigen "updatedAt"-string, ter info/debug

ALTER TABLE cards
    ADD COLUMN supertype               VARCHAR(30),  -- "Pokémon" / "Trainer" / "Energy"
    ADD COLUMN subtypes                JSONB,        -- bv. ["Basic"], ["Stage 1", "EX"]
    ADD COLUMN hp                      INT,
    ADD COLUMN types                   JSONB,        -- volledige types-array; primary_type blijft type[0] voor bestaande code
    ADD COLUMN evolves_from            VARCHAR(120),
    ADD COLUMN evolves_to              JSONB,
    ADD COLUMN rules                   JSONB,        -- speciale kaarttekst (bv. bij V/VMAX/ex)
    ADD COLUMN attacks                 JSONB,
    ADD COLUMN weaknesses              JSONB,
    ADD COLUMN resistances             JSONB,
    ADD COLUMN retreat_cost            JSONB,
    ADD COLUMN converted_retreat_cost  INT,
    ADD COLUMN artist                  VARCHAR(120),
    ADD COLUMN flavor_text             TEXT,
    ADD COLUMN national_pokedex_numbers JSONB,
    ADD COLUMN legalities              JSONB,
    ADD COLUMN regulation_mark         VARCHAR(10),
    ADD COLUMN tcgplayer_url           TEXT,
    ADD COLUMN tcgplayer_prices        JSONB,
    ADD COLUMN cardmarket_url          TEXT,
    ADD COLUMN cardmarket_prices       JSONB,
    ADD COLUMN source_updated_at       VARCHAR(30);

CREATE INDEX idx_cards_supertype ON cards (supertype);
CREATE INDEX idx_cards_national_pokedex_numbers ON cards USING GIN (national_pokedex_numbers);
