import type { Pokemon, PokemonDetail } from '@/types/pokemon';

const POKEAPI_BASE = 'https://pokeapi.co/api/v2';

interface PokeAPIType {
  type: {
    name: string;
  };
}

interface PokeAPIStat {
  base_stat: number;
}

interface PokeAPIAbility {
  ability: {
    name: string;
  };
}

interface PokeAPIResponse {
  id: number;
  name: string;
  types: PokeAPIType[];
  sprites: {
    front_default: string;
    other: {
      'official-artwork': {
        front_default: string;
      };
    };
  };
  stats: PokeAPIStat[];
  height: number;
  weight: number;
  abilities: PokeAPIAbility[];
}

export async function fetchPokemon(id: number): Promise<Pokemon> {
  const response = await fetch(`${POKEAPI_BASE}/pokemon/${id}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch Pokemon ${id}`);
  }
  
  const data: PokeAPIResponse = await response.json();
  
  return {
    id: data.id,
    name: data.name,
    types: data.types.map((t) => t.type.name),
    sprite: data.sprites.other['official-artwork'].front_default || data.sprites.front_default,
  };
}

export async function fetchPokemonDetail(id: number): Promise<PokemonDetail> {
  const response = await fetch(`${POKEAPI_BASE}/pokemon/${id}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch Pokemon detail ${id}`);
  }
  
  const data: PokeAPIResponse = await response.json();
  
  return {
    id: data.id,
    name: data.name,
    types: data.types.map((t) => t.type.name),
    sprite: data.sprites.other['official-artwork'].front_default || data.sprites.front_default,
    stats: {
      hp: data.stats[0].base_stat,
      attack: data.stats[1].base_stat,
      defense: data.stats[2].base_stat,
      specialAttack: data.stats[3].base_stat,
      specialDefense: data.stats[4].base_stat,
      speed: data.stats[5].base_stat,
    },
    height: data.height,
    weight: data.weight,
    abilities: data.abilities.map((a) => a.ability.name),
  };
}

export async function fetchPokemonRange(start: number, end: number): Promise<Pokemon[]> {
  const promises: Promise<Pokemon | null>[] = [];
  
  for (let i = start; i <= end; i++) {
    promises.push(
      fetchPokemon(i).catch(() => null)
    );
  }
  
  const results = await Promise.all(promises);
  return results.filter((p): p is Pokemon => p !== null);
}
