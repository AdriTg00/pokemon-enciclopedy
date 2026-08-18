import type { Pokemon, PokemonDetail, PokemonStats } from "@/types/pokemon";

const POKEAPI_BASE = "https://pokeapi.co/api/v2";
const BATCH_SIZE = 20;
const MAX_RETRIES = 2;

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

interface AbilityFlavorTextEntry {
  flavor_text: string;
  language: {
    name: string;
  };
}

interface AbilityAPIResponse {
  flavor_text_entries: AbilityFlavorTextEntry[];
}

const pokemonCache = new Map<number, Pokemon>();
const pokemonDetailCache = new Map<string, PokemonDetail>();
const pokemonStatsCache = new Map<number, PokemonStats>();
const abilityCache = new Map<string, { name: string; description: string }>();

function getPokemonSprite(data: PokeAPIResponse): string {
  return (
    data.sprites.other?.["official-artwork"]?.front_default ||
    data.sprites.front_default ||
    ""
  );
}

function cleanText(text: string): string {
  return text.replace(/[\n\f]/g, " ");
}

function getDetailCacheKey(id: number, lang: string): string {
  return `${id}-${lang}`;
}

async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(url: string, retries = MAX_RETRIES): Promise<Response> {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Request failed: ${response.status} ${response.statusText}`);
    }

    return response;
  } catch (error) {
    if (retries <= 0) {
      throw error;
    }

    await delay(300);
    return fetchWithRetry(url, retries - 1);
  }
}

async function runInBatches<T, R>(
  items: T[],
  batchSize: number,
  callback: (item: T) => Promise<R>
): Promise<R[]> {
  const results: R[] = [];

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);

    const batchResults = await Promise.all(
      batch.map((item) => callback(item))
    );

    results.push(...batchResults);
  }

  return results;
}

function mapPokemon(data: PokeAPIResponse): Pokemon {
  return {
    id: data.id,
    name: data.name,
    types: data.types.map((t) => t.type.name),
    sprite: getPokemonSprite(data),
  };
}

function mapStats(data: PokeAPIResponse): PokemonDetail["stats"] {
  const statsByName = Object.fromEntries(
    data.stats.map((stat) => [stat.stat.name, stat.base_stat])
  );

  return {
    hp: statsByName.hp ?? 0,
    attack: statsByName.attack ?? 0,
    defense: statsByName.defense ?? 0,
    specialAttack: statsByName["special-attack"] ?? 0,
    specialDefense: statsByName["special-defense"] ?? 0,
    speed: statsByName.speed ?? 0,
  };
}

async function fetchAbilityDescription(
  ability: PokeAPIAbility,
  lang: string
): Promise<{ name: string; description: string }> {
  const cacheKey = `${ability.ability.name}-${lang}`;

  if (abilityCache.has(cacheKey)) {
    return abilityCache.get(cacheKey)!;
  }

  try {
    const response = await fetchWithRetry(ability.ability.url);
    const abilityData: AbilityAPIResponse = await response.json();

    const entry =
      abilityData.flavor_text_entries.find(
        (item) => item.language.name === lang
      ) ||
      abilityData.flavor_text_entries.find(
        (item) => item.language.name === "en"
      );

    const result = {
      name: ability.ability.name,
      description: entry?.flavor_text ? cleanText(entry.flavor_text) : "",
    };

    abilityCache.set(cacheKey, result);
    return result;
  } catch (error) {
    console.error(`Error loading ability ${ability.ability.name}:`, error);

    return {
      name: ability.ability.name,
      description: "",
    };
  }
}

export async function fetchPokemon(id: number): Promise<Pokemon> {
  if (pokemonCache.has(id)) {
    return pokemonCache.get(id)!;
  }

  const response = await fetchWithRetry(`${POKEAPI_BASE}/pokemon/${id}`);
  const data: PokeAPIResponse = await response.json();

  const pokemon = mapPokemon(data);

  pokemonCache.set(id, pokemon);

  return pokemon;
}

export async function fetchPokemonDetail(
  id: number,
  lang: string = "en"
): Promise<PokemonDetail> {
  const cacheKey = getDetailCacheKey(id, lang);

  if (pokemonDetailCache.has(cacheKey)) {
    return pokemonDetailCache.get(cacheKey)!;
  }

  const response = await fetchWithRetry(`${POKEAPI_BASE}/pokemon/${id}`);
  const data: PokeAPIResponse = await response.json();

  const detailedAbilities = await runInBatches(
    data.abilities,
    3,
    (ability) => fetchAbilityDescription(ability, lang)
  );

  const pokemonDetail: PokemonDetail = {
    id: data.id,
    name: data.name,
    types: data.types.map((t) => t.type.name),
    sprite: getPokemonSprite(data),
    stats: mapStats(data),
    height: data.height,
    weight: data.weight,
    abilities: detailedAbilities,
  };

  pokemonDetailCache.set(cacheKey, pokemonDetail);

  return pokemonDetail;
}

export async function fetchPokemonRange(
  start: number,
  end: number
): Promise<Pokemon[]> {
  const ids = Array.from(
    { length: end - start + 1 },
    (_, index) => start + index
  );

  return fetchPokemonByIds(ids);
}

export async function fetchPokemonByIds(ids: number[]): Promise<Pokemon[]> {
  const uniqueIds = Array.from(new Set(ids));

  const results = await runInBatches(uniqueIds, BATCH_SIZE, async (id) => {
    try {
      return await fetchPokemon(id);
    } catch (error) {
      console.error(`Error loading Pokémon ${id}:`, error);
      return null;
    }
  });

  return results
    .filter((pokemon): pokemon is Pokemon => pokemon !== null)
    .sort((a, b) => a.id - b.id);
}

export async function fetchPokemonStats(id: number): Promise<PokemonStats> {
  if (pokemonStatsCache.has(id)) {
    return pokemonStatsCache.get(id)!;
  }

  const response = await fetchWithRetry(`${POKEAPI_BASE}/pokemon/${id}`);
  const data: PokeAPIResponse = await response.json();

  const stats = mapStats(data);

  pokemonStatsCache.set(id, stats);

  return stats;
}

export async function fetchPokemonStatsByIds(
  ids: number[]
): Promise<PokemonStats[]> {
  const uniqueIds = Array.from(new Set(ids));

  const results = await runInBatches(uniqueIds, 10, async (id) => {
    try {
      return await fetchPokemonStats(id);
    } catch (error) {
      console.error(`Error loading stats for Pokémon ${id}:`, error);
      return null;
    }
  });

  return results.filter((stats): stats is PokemonStats => stats !== null);
}

export function clearPokemonCache(): void {
  pokemonCache.clear();
  pokemonDetailCache.clear();
  pokemonStatsCache.clear();
  abilityCache.clear();
}