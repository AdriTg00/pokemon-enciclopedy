export interface Pokemon {
  id: number;
  name: string;
  types: string[];
  sprite: string;
}

export interface PokemonStats {
  hp: number;
  attack: number;
  defense: number;
  specialAttack: number;
  specialDefense: number;
  speed: number;
}

export interface PokemonDetail extends Pokemon {
  stats: PokemonStats;
  height: number;
  weight: number;
  abilities: string[];
}

export interface GenerationRange {
  start: number;
  end: number;
}

export const GENERATION_RANGES: GenerationRange[] = [
  { start: 1, end: 151 },     // Gen 1
  { start: 152, end: 251 },   // Gen 2
  { start: 252, end: 386 },   // Gen 3
  { start: 387, end: 493 },   // Gen 4
  { start: 494, end: 649 },   // Gen 5
  { start: 650, end: 721 },   // Gen 6
  { start: 722, end: 809 },   // Gen 7
  { start: 810, end: 905 },   // Gen 8
  { start: 906, end: 1025 },  // Gen 9
];

export const POKEMON_TYPES = [
  'normal', 'fire', 'water', 'electric', 'grass', 'ice',
  'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
  'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
] as const;

export type PokemonType = typeof POKEMON_TYPES[number];
