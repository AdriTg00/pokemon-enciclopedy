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

export interface PokemonAbility {
  name: string;
  description: string;
}

export interface PokemonDetail extends Pokemon {
  stats: PokemonStats;
  height: number;
  weight: number;
  abilities: PokemonAbility[];
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

export const TYPE_COLORS: Record<PokemonType, string> = {
  normal: '#A8A878',
  fire: '#F08030',
  water: '#6890F0',
  electric: '#F8D030',
  grass: '#78C850',
  ice: '#98D8D8',
  fighting: '#C03028',
  poison: '#A040A0',
  ground: '#E0C068',
  flying: '#A890F0',
  psychic: '#F85888',
  bug: '#A8B820',
  rock: '#B8A038',
  ghost: '#705898',
  dragon: '#7038F8',
  dark: '#705848',
  steel: '#B8B8D0',
  fairy: '#EE99AC',
};

export type PokemonSortStat =
  | 'hp'
  | 'attack'
  | 'defense'
  | 'specialAttack'
  | 'specialDefense'
  | 'speed'
  | 'total';

export const POKEMON_SORT_STATS: readonly PokemonSortStat[] = [
  'hp',
  'attack',
  'defense',
  'specialAttack',
  'specialDefense',
  'speed',
  'total',
];

export function getPokemonStatValue(
  stats: PokemonStats,
  stat: PokemonSortStat
): number {
  if (stat === 'total') {
    return (
      stats.hp +
      stats.attack +
      stats.defense +
      stats.specialAttack +
      stats.specialDefense +
      stats.speed
    );
  }

  return stats[stat];
}
