import type { CardData, PackType } from '../lib/types'

// Placeholder card pool — geen echte Pokémon-data. Bedoeld om de pack-opening flow en
// visuele stijl te tonen. Wordt later vervangen door data uit de sync-job / Postgres.

const commonsPool: CardData[] = [
  { id: 'c-01', name: 'Sprigwit', setName: 'Verdant Origins', number: '004/182', rarity: 'Common', type: 'Grass', colorFrom: '#3fae5c', colorTo: '#1f6b39', glyph: '🌱', sellValue: 5 },
  { id: 'c-02', name: 'Cindle', setName: 'Verdant Origins', number: '011/182', rarity: 'Common', type: 'Fire', colorFrom: '#ff7a45', colorTo: '#c53f1f', glyph: '🔥', sellValue: 5 },
  { id: 'c-03', name: 'Dripple', setName: 'Verdant Origins', number: '028/182', rarity: 'Common', type: 'Water', colorFrom: '#4aa8ff', colorTo: '#1b5fb0', glyph: '💧', sellValue: 5 },
  { id: 'c-04', name: 'Voltick', setName: 'Verdant Origins', number: '045/182', rarity: 'Common', type: 'Electric', colorFrom: '#ffd84a', colorTo: '#d19a00', glyph: '⚡', sellValue: 5 },
  { id: 'c-05', name: 'Pebblit', setName: 'Verdant Origins', number: '059/182', rarity: 'Common', type: 'Rock', colorFrom: '#b09572', colorTo: '#6f5a3f', glyph: '🪨', sellValue: 5 },
  { id: 'c-06', name: 'Fluffon', setName: 'Verdant Origins', number: '066/182', rarity: 'Common', type: 'Normal', colorFrom: '#cbc7c1', colorTo: '#8b877f', glyph: '🐾', sellValue: 5 },
  { id: 'c-07', name: 'Gloomkit', setName: 'Verdant Origins', number: '077/182', rarity: 'Common', type: 'Poison', colorFrom: '#b370d6', colorTo: '#6f3a92', glyph: '☠️', sellValue: 5 },
  { id: 'c-08', name: 'Breezel', setName: 'Verdant Origins', number: '083/182', rarity: 'Common', type: 'Flying', colorFrom: '#a7d8ff', colorTo: '#5a9fd6', glyph: '🪶', sellValue: 5 },
]

const uncommonsPool: CardData[] = [
  { id: 'u-01', name: 'Sprigwit Sr.', setName: 'Verdant Origins', number: '005/182', rarity: 'Uncommon', type: 'Grass', colorFrom: '#3fae5c', colorTo: '#1f6b39', glyph: '🌿', sellValue: 15 },
  { id: 'u-02', name: 'Cindle Major', setName: 'Verdant Origins', number: '012/182', rarity: 'Uncommon', type: 'Fire', colorFrom: '#ff7a45', colorTo: '#c53f1f', glyph: '🔥', sellValue: 15 },
  { id: 'u-03', name: 'Dripple Tide', setName: 'Verdant Origins', number: '029/182', rarity: 'Uncommon', type: 'Water', colorFrom: '#4aa8ff', colorTo: '#1b5fb0', glyph: '🌊', sellValue: 15 },
  { id: 'u-04', name: 'Voltick Surge', setName: 'Verdant Origins', number: '046/182', rarity: 'Uncommon', type: 'Electric', colorFrom: '#ffd84a', colorTo: '#d19a00', glyph: '⚡', sellValue: 15 },
  { id: 'u-05', name: 'Mindra', setName: 'Verdant Origins', number: '091/182', rarity: 'Uncommon', type: 'Psychic', colorFrom: '#ff7ad1', colorTo: '#a8388f', glyph: '🔮', sellValue: 15 },
]

const reverseHoloPool: CardData[] = uncommonsPool.map((c) => ({
  ...c,
  id: `rh-${c.id}`,
  rarity: 'Reverse Holo',
  sellValue: 25,
}))

const hitsPool: CardData[] = [
  { id: 'h-01', name: 'Blazeking', setName: 'Verdant Origins', number: '150/182', rarity: 'Rare Holo', type: 'Fire', colorFrom: '#ff9142', colorTo: '#b3280f', glyph: '🔥', sellValue: 150 },
  { id: 'h-02', name: 'Tidessa', setName: 'Verdant Origins', number: '154/182', rarity: 'Rare Holo', type: 'Water', colorFrom: '#4ac3ff', colorTo: '#0b4f9c', glyph: '🌊', sellValue: 150 },
  { id: 'h-03', name: 'Thornarch', setName: 'Verdant Origins', number: '158/182', rarity: 'Rare Ultra', type: 'Grass', colorFrom: '#6be08a', colorTo: '#0f7a3d', glyph: '🍃', sellValue: 320 },
  { id: 'h-04', name: 'Voltessian', setName: 'Verdant Origins', number: '172/182', rarity: 'Rare Secret', type: 'Electric', colorFrom: '#fff28a', colorTo: '#e8a800', glyph: '⚡', sellValue: 600 },
  { id: 'h-05', name: 'Nebulynx', setName: 'Stellar Eclipse', number: '133/165', rarity: 'Rare Holo', type: 'Psychic', colorFrom: '#c98bff', colorTo: '#5a1f9c', glyph: '🔮', sellValue: 150 },
  { id: 'h-06', name: 'Umbraquil', setName: 'Stellar Eclipse', number: '141/165', rarity: 'Rare Ultra', type: 'Dark', colorFrom: '#8f7bd6', colorTo: '#2b1f57', glyph: '🌙', sellValue: 320 },
  { id: 'h-07', name: 'Solarion EX', setName: 'Stellar Eclipse', number: '160/165', rarity: 'Rare Secret', type: 'Fire', colorFrom: '#ffd166', colorTo: '#e0570f', glyph: '☀️', sellValue: 600 },
]

const stellarCommons: CardData[] = commonsPool.map((c) => ({
  ...c,
  id: `se-${c.id}`,
  setName: 'Stellar Eclipse',
}))

const stellarUncommons: CardData[] = uncommonsPool.map((c) => ({
  ...c,
  id: `se-${c.id}`,
  setName: 'Stellar Eclipse',
}))

const stellarReverseHolo: CardData[] = stellarUncommons.map((c) => ({
  ...c,
  id: `rh-${c.id}`,
  rarity: 'Reverse Holo',
  sellValue: 25,
}))

export const cardPools = {
  'verdant-origins': {
    commons: commonsPool,
    uncommons: uncommonsPool,
    reverseHolo: reverseHoloPool,
    hits: hitsPool.filter((c) => c.setName === 'Verdant Origins'),
  },
  'stellar-eclipse': {
    commons: stellarCommons,
    uncommons: stellarUncommons,
    reverseHolo: stellarReverseHolo,
    hits: hitsPool.filter((c) => c.setName === 'Stellar Eclipse'),
  },
} as const

export type PackPoolKey = keyof typeof cardPools

export const packTypes: PackType[] = [
  {
    id: 'verdant-origins',
    name: 'Verdant Origins',
    setName: 'Verdant Origins',
    price: 120,
    unlockLevel: 1,
    tagline: 'De klassieke basisset. Altijd beschikbaar, standaard odds.',
    colorFrom: '#2fae5c',
    colorTo: '#0f5c2e',
    slotConfig: { commons: 5, uncommons: 2, reverseHolo: 1, hits: 1 },
  },
  {
    id: 'stellar-eclipse',
    name: 'Stellar Eclipse',
    setName: 'Stellar Eclipse',
    price: 260,
    unlockLevel: 5,
    tagline: 'Featured set — betere odds op Ultra/Secret rares.',
    colorFrom: '#9b5cff',
    colorTo: '#3a1470',
    slotConfig: { commons: 5, uncommons: 2, reverseHolo: 1, hits: 1 },
  },
]
