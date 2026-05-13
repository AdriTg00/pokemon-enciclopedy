import { useState, useEffect, useMemo } from "react";
import { ThemeToggle } from "./components/ThemeToggle";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { LanguageToggle } from "./components/LanguageToggle";
import { PokemonCard } from "@/app/components/PokemonCard";
import { PokemonDetail } from "@/app/components/PokemonDetail";
import { SearchBar } from "@/app/components/SearchBar";
import { FilterSection } from "@/app/components/FilterSection";
import type { Pokemon, PokemonDetail as PokemonDetailType } from "@/types/pokemon";
import { GENERATION_RANGES } from "@/types/pokemon";
import { fetchPokemonRange, fetchPokemonDetail } from "@/services/pokemonApi";

export default function App() {
  const [pokemonList, setPokemonList] = useState<Pokemon[]>([]);
  const [selectedPokemon, setSelectedPokemon] = useState<PokemonDetailType | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGeneration, setSelectedGeneration] = useState<number | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const { t, i18n } = useTranslation();




  useEffect(() => {
    const loadInitialPokemon = async () => {
      try {
        setLoading(true);
        const results = await fetchPokemonRange(1, 151);
        setPokemonList(results);
      } catch (error) {
        console.error("Error fetching Pokemon:", error);
      } finally {
        setLoading(false);
      }
    };
    loadInitialPokemon();
  }, []);

  useEffect(() => {
    if (selectedGeneration === null) return;
    const loadGenerationPokemon = async () => {
      const range = GENERATION_RANGES[selectedGeneration - 1];
      const existingIds = new Set(pokemonList.map(p => p.id));
      const needsLoading = [];
      for (let i = range.start; i <= range.end; i++) {
        if (!existingIds.has(i)) {
          needsLoading.push(i);
        }
      }
      if (needsLoading.length > 0) {
        const newPokemon = await fetchPokemonRange(needsLoading[0], needsLoading[needsLoading.length - 1]);
        setPokemonList(prev => [...prev, ...newPokemon].sort((a, b) => a.id - b.id));
      }
    };
    loadGenerationPokemon();
  }, [selectedGeneration, pokemonList]);

  const filteredPokemon = useMemo(() => {
    let filtered = pokemonList;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(term) ||
        p.id.toString().includes(searchTerm)
      );
    }
    if (selectedGeneration !== null) {
      const range = GENERATION_RANGES[selectedGeneration - 1];
      filtered = filtered.filter((p) => p.id >= range.start && p.id <= range.end);
    }
    if (selectedType) {
      filtered = filtered.filter((p) => p.types.includes(selectedType));
    }
    return filtered;
  }, [searchTerm, selectedGeneration, selectedType, pokemonList]);

  const handlePokemonClick = async (id: number) => {
    setLoadingDetail(true);
    try {
      const detail = await fetchPokemonDetail(id, i18n.language);
      setSelectedPokemon(detail);
    } catch (error) {
      console.error("Error fetching Pokemon detail:", error);
    } finally {
      setLoadingDetail(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-6 transition-colors">
      {/* Header */}
      <header className="bg-card text-card-foreground border-b border-border shadow-md sticky top-0 z-40 transition-colors">
        <div className="px-4 py-4 sm:py-6">
          <div className="relative flex items-center justify-center mb-3 sm:mb-4">
            <h1 className="
  text-4xl sm:text-6xl font-black tracking-wide
  text-red-600
  drop-shadow-[3px_3px_0px_#facc15]
  [-webkit-text-stroke:2px_#1e3a8a]
">
              PokéDex
            </h1>

            <div className="absolute right-0">
              <LanguageToggle />
              <ThemeToggle />
            </div>
          </div>

          <div className="flex justify-center">
            <SearchBar value={searchTerm} onChange={setSearchTerm} />
          </div>
        </div>
      </header>

      <div className="px-3 sm:px-4 py-4 sm:py-8 max-w-7xl mx-auto">
        {/* Filters */}
        <div className="mb-4 sm:mb-8 bg-card text-card-foreground border border-border rounded-2xl p-4 sm:p-6 shadow-md transition-colors">
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
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="text-center mb-4 sm:mb-6">
              <p className="text-muted-foreground font-medium text-sm sm:text-base">
                {t("app.showing", { count: filteredPokemon.length })}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-6">
              {filteredPokemon.map((pokemon) => (
                <PokemonCard
                  key={pokemon.id}
                  pokemon={pokemon}
                  onClick={() => handlePokemonClick(pokemon.id)}
                />
              ))}
            </div>
          </>
        )}

        {filteredPokemon.length === 0 && !loading && (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg sm:text-xl">
              {t("app.noPokemonFound")}
            </p>
            <p className="text-muted-foreground/70 mt-2 text-sm sm:text-base">
              {t("app.tryAdjustingFilters")}
            </p>
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