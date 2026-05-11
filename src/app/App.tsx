import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { PokemonCard } from "@/app/components/PokemonCard";
import { PokemonDetail } from "@/app/components/PokemonDetail";
import { SearchBar } from "@/app/components/SearchBar";
import { FilterSection } from "@/app/components/FilterSection";

interface Pokemon {
  id: number;
  name: string;
  types: string[];
  sprite: string;
}

interface PokemonDetailData extends Pokemon {
  stats: {
    hp: number;
    attack: number;
    defense: number;
    specialAttack: number;
    specialDefense: number;
    speed: number;
  };
  height: number;
  weight: number;
  abilities: string[];
}

const generationRanges = [
  { start: 1, end: 151 },
  { start: 152, end: 251 },
  { start: 252, end: 386 },
  { start: 387, end: 493 },
  { start: 494, end: 649 },
  { start: 650, end: 721 },
  { start: 722, end: 809 },
  { start: 810, end: 905 },
  { start: 906, end: 1025 },
];

export default function App() {
  const [pokemonList, setPokemonList] = useState<Pokemon[]>([]);
  const [filteredPokemon, setFilteredPokemon] = useState<Pokemon[]>([]);
  const [selectedPokemon, setSelectedPokemon] = useState<PokemonDetailData | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGeneration, setSelectedGeneration] = useState<number | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Fetch initial Pokemon list
  useEffect(() => {
    const fetchPokemon = async () => {
      try {
        setLoading(true);
        const promises = [];
        
        // Fetch first 151 Pokemon for better initial load time
        for (let i = 1; i <= 151; i++) {
          promises.push(
            fetch(`https://pokeapi.co/api/v2/pokemon/${i}`)
              .then((res) => res.json())
              .then((data) => ({
                id: data.id,
                name: data.name,
                types: data.types.map((t: any) => t.type.name),
                sprite: data.sprites.other["official-artwork"].front_default || data.sprites.front_default,
              }))
          );
        }

        const results = await Promise.all(promises);
        setPokemonList(results);
        setFilteredPokemon(results);
      } catch (error) {
        console.error("Error fetching Pokemon:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPokemon();
  }, []);

  // Load more Pokemon when generation changes
  useEffect(() => {
    if (selectedGeneration === null) return;
    
    const loadGenerationPokemon = async () => {
      const range = generationRanges[selectedGeneration - 1];
      const existingIds = new Set(pokemonList.map(p => p.id));
      const promises = [];

      for (let i = range.start; i <= range.end; i++) {
        if (!existingIds.has(i)) {
          promises.push(
            fetch(`https://pokeapi.co/api/v2/pokemon/${i}`)
              .then((res) => res.json())
              .then((data) => ({
                id: data.id,
                name: data.name,
                types: data.types.map((t: any) => t.type.name),
                sprite: data.sprites.other["official-artwork"].front_default || data.sprites.front_default,
              }))
              .catch(() => null)
          );
        }
      }

      if (promises.length > 0) {
        const newPokemon = (await Promise.all(promises)).filter(p => p !== null) as Pokemon[];
        setPokemonList(prev => [...prev, ...newPokemon].sort((a, b) => a.id - b.id));
      }
    };

    loadGenerationPokemon();
  }, [selectedGeneration]);

  // Filter Pokemon
  useEffect(() => {
    let filtered = pokemonList;

    if (searchTerm) {
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.id.toString().includes(searchTerm)
      );
    }

    if (selectedGeneration !== null) {
      const range = generationRanges[selectedGeneration - 1];
      filtered = filtered.filter((p) => p.id >= range.start && p.id <= range.end);
    }

    if (selectedType) {
      filtered = filtered.filter((p) => p.types.includes(selectedType));
    }

    setFilteredPokemon(filtered);
  }, [searchTerm, selectedGeneration, selectedType, pokemonList]);

  const fetchPokemonDetail = async (id: number) => {
    setLoadingDetail(true);
    try {
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
      const data = await response.json();
      
      const detailData: PokemonDetailData = {
        id: data.id,
        name: data.name,
        types: data.types.map((t: any) => t.type.name),
        sprite: data.sprites.other["official-artwork"].front_default || data.sprites.front_default,
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
        abilities: data.abilities.map((a: any) => a.ability.name),
      };

      setSelectedPokemon(detailData);
    } catch (error) {
      console.error("Error fetching Pokemon detail:", error);
    } finally {
      setLoadingDetail(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 pb-6">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-40">
        <div className="px-4 py-4 sm:py-6">
          <div className="flex items-center justify-center mb-3 sm:mb-4">
            <h1 className="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
              PokéDex
            </h1>
          </div>
          <div className="flex justify-center">
            <SearchBar value={searchTerm} onChange={setSearchTerm} />
          </div>
        </div>
      </header>

      <div className="px-3 sm:px-4 py-4 sm:py-8 max-w-7xl mx-auto">
        {/* Filters */}
        <div className="mb-4 sm:mb-8 bg-white rounded-2xl p-4 sm:p-6 shadow-md">
          <FilterSection
            selectedGeneration={selectedGeneration}
            selectedType={selectedType}
            onGenerationChange={setSelectedGeneration}
            onTypeChange={setSelectedType}
          />
        </div>

        {/* Pokemon Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
          </div>
        ) : (
          <>
            <div className="text-center mb-4 sm:mb-6">
              <p className="text-gray-600 font-medium text-sm sm:text-base">
                Showing {filteredPokemon.length} Pokémon
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-6">
              {filteredPokemon.map((pokemon) => (
                <PokemonCard
                  key={pokemon.id}
                  pokemon={pokemon}
                  onClick={() => fetchPokemonDetail(pokemon.id)}
                />
              ))}
            </div>
          </>
        )}

        {filteredPokemon.length === 0 && !loading && (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg sm:text-xl">No Pokémon found</p>
            <p className="text-gray-400 mt-2 text-sm sm:text-base">Try adjusting your filters</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedPokemon && !loadingDetail && (
        <PokemonDetail
          pokemon={selectedPokemon}
          onClose={() => setSelectedPokemon(null)}
        />
      )}

      {loadingDetail && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <Loader2 className="w-12 h-12 animate-spin text-white" />
        </div>
      )}
    </div>
  );
}