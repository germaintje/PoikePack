-- Demo-seed: een handmatige, kleine selectie echte kaarten voor 2 sets, zodat de backend
-- direct bruikbaar is zonder dat sync-job al draait. Namen/nummers/rarities zijn met de hand
-- ingevoerd (redelijk maar niet gegarandeerd 100% accuraat) — sync-job vervangt dit later met
-- een volledige, autoritatieve sync vanuit de Pokémon TCG API. Image-URL's volgen het bekende,
-- stabiele CDN-patroon van die API (images.pokemontcg.io/{setId}/{number}(_hires).png).

INSERT INTO card_sets (id, name, release_date, logo_url, symbol_url) VALUES
    ('base1', 'Base Set', '1999-01-09',
     'https://images.pokemontcg.io/base1/logo.png', 'https://images.pokemontcg.io/base1/symbol.png'),
    ('sv3pt5', '151', '2023-09-22',
     'https://images.pokemontcg.io/sv3pt5/logo.png', 'https://images.pokemontcg.io/sv3pt5/symbol.png');

-- Base Set
INSERT INTO cards (id, set_id, name, number, rarity, primary_type, image_small_url, image_large_url) VALUES
    ('base1-44', 'base1', 'Bulbasaur',   '44', 'Common', 'Grass',    'https://images.pokemontcg.io/base1/44.png',   'https://images.pokemontcg.io/base1/44_hires.png'),
    ('base1-45', 'base1', 'Caterpie',    '45', 'Common', 'Grass',    'https://images.pokemontcg.io/base1/45.png',   'https://images.pokemontcg.io/base1/45_hires.png'),
    ('base1-46', 'base1', 'Charmander',  '46', 'Common', 'Fire',     'https://images.pokemontcg.io/base1/46.png',   'https://images.pokemontcg.io/base1/46_hires.png'),
    ('base1-53', 'base1', 'Magikarp',    '53', 'Common', 'Water',    'https://images.pokemontcg.io/base1/53.png',   'https://images.pokemontcg.io/base1/53_hires.png'),
    ('base1-54', 'base1', 'Metapod',     '54', 'Common', 'Grass',    'https://images.pokemontcg.io/base1/54.png',   'https://images.pokemontcg.io/base1/54_hires.png'),
    ('base1-57', 'base1', 'Pidgey',      '57', 'Common', 'Colorless','https://images.pokemontcg.io/base1/57.png',   'https://images.pokemontcg.io/base1/57_hires.png'),
    ('base1-61', 'base1', 'Rattata',     '61', 'Common', 'Colorless','https://images.pokemontcg.io/base1/61.png',   'https://images.pokemontcg.io/base1/61_hires.png'),
    ('base1-63', 'base1', 'Squirtle',    '63', 'Common', 'Water',    'https://images.pokemontcg.io/base1/63.png',   'https://images.pokemontcg.io/base1/63_hires.png'),
    ('base1-24', 'base1', 'Charmeleon',  '24', 'Uncommon', 'Fire',   'https://images.pokemontcg.io/base1/24.png',   'https://images.pokemontcg.io/base1/24_hires.png'),
    ('base1-29', 'base1', 'Dratini',     '29', 'Uncommon', 'Colorless','https://images.pokemontcg.io/base1/29.png', 'https://images.pokemontcg.io/base1/29_hires.png'),
    ('base1-33', 'base1', 'Kakuna',      '33', 'Uncommon', 'Grass',  'https://images.pokemontcg.io/base1/33.png',   'https://images.pokemontcg.io/base1/33_hires.png'),
    ('base1-34', 'base1', 'Machoke',     '34', 'Uncommon', 'Fighting','https://images.pokemontcg.io/base1/34.png',  'https://images.pokemontcg.io/base1/34_hires.png'),
    ('base1-39', 'base1', 'Poliwhirl',   '39', 'Uncommon', 'Water',  'https://images.pokemontcg.io/base1/39.png',   'https://images.pokemontcg.io/base1/39_hires.png'),
    ('base1-42', 'base1', 'Wartortle',   '42', 'Uncommon', 'Water',  'https://images.pokemontcg.io/base1/42.png',   'https://images.pokemontcg.io/base1/42_hires.png'),
    ('base1-4',  'base1', 'Charizard',   '4',  'Rare Holo', 'Fire',    'https://images.pokemontcg.io/base1/4.png',  'https://images.pokemontcg.io/base1/4_hires.png'),
    ('base1-2',  'base1', 'Blastoise',   '2',  'Rare Holo', 'Water',   'https://images.pokemontcg.io/base1/2.png',  'https://images.pokemontcg.io/base1/2_hires.png'),
    ('base1-15', 'base1', 'Venusaur',    '15', 'Rare Holo', 'Grass',   'https://images.pokemontcg.io/base1/15.png', 'https://images.pokemontcg.io/base1/15_hires.png'),
    ('base1-6',  'base1', 'Gyarados',    '6',  'Rare Holo', 'Water',   'https://images.pokemontcg.io/base1/6.png',  'https://images.pokemontcg.io/base1/6_hires.png');

-- 151
INSERT INTO cards (id, set_id, name, number, rarity, primary_type, image_small_url, image_large_url) VALUES
    ('sv3pt5-1',  'sv3pt5', 'Bulbasaur',  '1',  'Common', 'Grass',     'https://images.pokemontcg.io/sv3pt5/1.png',  'https://images.pokemontcg.io/sv3pt5/1_hires.png'),
    ('sv3pt5-4',  'sv3pt5', 'Charmander', '4',  'Common', 'Fire',      'https://images.pokemontcg.io/sv3pt5/4.png',  'https://images.pokemontcg.io/sv3pt5/4_hires.png'),
    ('sv3pt5-7',  'sv3pt5', 'Squirtle',   '7',  'Common', 'Water',     'https://images.pokemontcg.io/sv3pt5/7.png',  'https://images.pokemontcg.io/sv3pt5/7_hires.png'),
    ('sv3pt5-10', 'sv3pt5', 'Caterpie',   '10', 'Common', 'Grass',     'https://images.pokemontcg.io/sv3pt5/10.png', 'https://images.pokemontcg.io/sv3pt5/10_hires.png'),
    ('sv3pt5-13', 'sv3pt5', 'Weedle',     '13', 'Common', 'Grass',     'https://images.pokemontcg.io/sv3pt5/13.png', 'https://images.pokemontcg.io/sv3pt5/13_hires.png'),
    ('sv3pt5-16', 'sv3pt5', 'Pidgey',     '16', 'Common', 'Colorless', 'https://images.pokemontcg.io/sv3pt5/16.png', 'https://images.pokemontcg.io/sv3pt5/16_hires.png'),
    ('sv3pt5-19', 'sv3pt5', 'Rattata',    '19', 'Common', 'Colorless', 'https://images.pokemontcg.io/sv3pt5/19.png', 'https://images.pokemontcg.io/sv3pt5/19_hires.png'),
    ('sv3pt5-25', 'sv3pt5', 'Pikachu',    '25', 'Common', 'Electric',  'https://images.pokemontcg.io/sv3pt5/25.png', 'https://images.pokemontcg.io/sv3pt5/25_hires.png'),
    ('sv3pt5-2',  'sv3pt5', 'Ivysaur',    '2',  'Uncommon', 'Grass',    'https://images.pokemontcg.io/sv3pt5/2.png', 'https://images.pokemontcg.io/sv3pt5/2_hires.png'),
    ('sv3pt5-5',  'sv3pt5', 'Charmeleon', '5',  'Uncommon', 'Fire',     'https://images.pokemontcg.io/sv3pt5/5.png', 'https://images.pokemontcg.io/sv3pt5/5_hires.png'),
    ('sv3pt5-8',  'sv3pt5', 'Wartortle',  '8',  'Uncommon', 'Water',    'https://images.pokemontcg.io/sv3pt5/8.png', 'https://images.pokemontcg.io/sv3pt5/8_hires.png'),
    ('sv3pt5-12', 'sv3pt5', 'Butterfree', '12', 'Uncommon', 'Grass',    'https://images.pokemontcg.io/sv3pt5/12.png','https://images.pokemontcg.io/sv3pt5/12_hires.png'),
    ('sv3pt5-17', 'sv3pt5', 'Pidgeotto',  '17', 'Uncommon', 'Colorless','https://images.pokemontcg.io/sv3pt5/17.png','https://images.pokemontcg.io/sv3pt5/17_hires.png'),
    ('sv3pt5-20', 'sv3pt5', 'Raticate',   '20', 'Uncommon', 'Colorless','https://images.pokemontcg.io/sv3pt5/20.png','https://images.pokemontcg.io/sv3pt5/20_hires.png'),
    ('sv3pt5-6',   'sv3pt5', 'Charizard', '6',   'Double Rare', 'Fire',   'https://images.pokemontcg.io/sv3pt5/6.png',   'https://images.pokemontcg.io/sv3pt5/6_hires.png'),
    ('sv3pt5-3',   'sv3pt5', 'Venusaur',  '3',   'Rare Holo', 'Grass',    'https://images.pokemontcg.io/sv3pt5/3.png',   'https://images.pokemontcg.io/sv3pt5/3_hires.png'),
    ('sv3pt5-9',   'sv3pt5', 'Blastoise', '9',   'Rare Holo', 'Water',    'https://images.pokemontcg.io/sv3pt5/9.png',   'https://images.pokemontcg.io/sv3pt5/9_hires.png'),
    ('sv3pt5-150', 'sv3pt5', 'Mewtwo',    '150', 'Illustration Rare', 'Psychic', 'https://images.pokemontcg.io/sv3pt5/150.png', 'https://images.pokemontcg.io/sv3pt5/150_hires.png');

INSERT INTO pack_types (set_id, name, price, unlock_level, slot_commons, slot_uncommons, slot_reverse_holo, slot_hits) VALUES
    ('base1',  'Base Set', 120, 1, 5, 2, 1, 1),
    ('sv3pt5', '151',      260, 5, 5, 2, 1, 1);
