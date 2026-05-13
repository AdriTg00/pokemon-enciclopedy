import type { Pokemon, PokemonDetail } from "@/types/pokemon";

const POKEAPI_BASE = "https://pokeapi.co/api/v2";

interface PokeAPIType {
  type: {
    name: string;
  };
}

interface PokeAPIStat {
  base_stat: number;
  stat: {
    name: string;
  };
}

interface PokeAPIAbility {
  ability: {
    name: string;
    url: string;
  };
}

interface PokeAPIResponse {
  id: number;
  name: string;
  types: PokeAPIType[];
  sprites: {
    front_default: string | null;
    other?: {
      "official-artwork"?: {
        front_default: string | null;
      };
    };
  };
  stats: PokeAPIStat[];
  height: number;
  weight: number;
  abilities: PokeAPIAbility[];
}

function getPokemonSprite(data: PokeAPIResponse): string {
  return (
    data.sprites.other?.["official-artwork"]?.front_default ||
    data.sprites.front_default ||
    ""
  );
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
    sprite: getPokemonSprite(data),
  };
}

export async function fetchPokemonDetail(id: number, lang: string = "en"): Promise<PokemonDetail> {
  const response = await fetch(`${POKEAPI_BASE}/pokemon/${id}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch Pokemon detail ${id}`);
  }

  const data: PokeAPIResponse = await response.json();

  const statsByName = Object.fromEntries(
    data.stats.map((stat) => [stat.stat.name, stat.base_stat])
  );

  // Obtenemos los detalles de cada habilidad para extraer la descripción en el idioma correcto
  const detailedAbilities = await Promise.all(
    data.abilities.map(async (a) => {
      try {
        const res = await fetch(a.ability.url);
        const abilityData = await res.json();
        const entry = abilityData.flavor_text_entries.find(
          (e: any) => e.language.name === lang
        ) || abilityData.flavor_text_entries.find((e: any) => e.language.name === "en");
        
        return {
          name: a.ability.name,
          description: entry?.flavor_text.replace(/[\n\f]/g, " ") || "",
        };
      } catch {
        return { name: a.ability.name, description: "" };
      }
    })
  );

  return {
    id: data.id,
    name: data.name,
    types: data.types.map((t) => t.type.name),
    sprite: getPokemonSprite(data),
    stats: {
      hp: statsByName.hp ?? 0,
      attack: statsByName.attack ?? 0,
      defense: statsByName.defense ?? 0,
      specialAttack: statsByName["special-attack"] ?? 0,
      specialDefense: statsByName["special-defense"] ?? 0,
      speed: statsByName.speed ?? 0,
    },
    height: data.height,
    weight: data.weight,
    abilities: detailedAbilities,
  };
}

export async function fetchPokemonRange(
  start: number,
  end: number
): Promise<Pokemon[]> {
  const ids = Array.from({ length: end - start + 1 }, (_, index) => start + index);
  const batchSize = 20;
  const results: Pokemon[] = [];

  for (let i = 0; i < ids.length; i += batchSize) {
    const batch = ids.slice(i, i + batchSize);

    const batchResults = await Promise.all(
      batch.map((id) =>
        fetchPokemon(id).catch((error) => {
          console.error(`Error loading Pokémon ${id}:`, error);
          return null;
        })
      )
    );

    results.push(
      ...batchResults.filter((pokemon): pokemon is Pokemon => pokemon !== null)
    );
  }

  return results.sort((a, b) => a.id - b.id);
}