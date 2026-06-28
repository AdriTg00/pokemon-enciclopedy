import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { ThemeToggle } from './components/ThemeToggle';
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LanguageToggle } from './components/LanguageToggle';
import { PokemonCard } from './components/PokemonCard';
import { PokemonDetail } from './components/PokemonDetail';
import { SearchBar } from './components/SearchBar';
import { FilterSection } from './components/FilterSection';
import { TierList } from './components/TierList';
import type { Pokemon, PokemonDetail as PokemonDetailType, PokemonType } from '../types/pokemon';
import { GENERATION_RANGES } from '../types/pokemon';
import { fetchPokemonRange, fetchPokemonDetail } from '../services/pokemonApi';

const PAGE_SIZE = 20;
const TOTAL_POKEMON = 1025;

export default function App() {
  const [pokemonList, setPokemonList] = useState<Pokemon[]>([]);
  const [view, setView] = useState<'dex' | 'tierlist'>('dex');
  const [selectedPokemon, setSelectedPokemon] = useState<PokemonDetailType | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGeneration, setSelectedGeneration] = useState<number | null>(null);
  const [selectedType, setSelectedType] = useState<PokemonType | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const [loadingMore, setLoadingMore] = useState(false);
  const [nextPokemonId, setNextPokemonId] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const { t, i18n } = useTranslation();
  const lastDetailLanguage = useRef(i18n.language);

  useEffect(() => {
    let cancelled = false;

    const loadPokemon = async () => {
      try {
        setLoading(true);

        const range =
          selectedGeneration !== null
            ? GENERATION_RANGES[selectedGeneration - 1]
            : { start: 1, end: TOTAL_POKEMON };

        const start = range.start;
        const end = Math.min(start + PAGE_SIZE - 1, range.end);

        const results = await fetchPokemonRange(start, end);

        if (cancelled) return;

        setPokemonList(results);
        setNextPokemonId(end + 1);
        setHasMore(end < range.end);
      } catch (error) {
        console.error('Error fetching Pokémon:', error);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    if (view !== 'dex') return;

    loadPokemon();

    return () => {
      cancelled = true;
    };
  }, [selectedGeneration, selectedType, view]);

  const loadMorePokemon = useCallback(async () => {
    if (loading || loadingMore || !hasMore || view !== 'dex') {
      return;
    }

    try {
      setLoadingMore(true);

      const range =
        selectedGeneration !== null
          ? GENERATION_RANGES[selectedGeneration - 1]
          : { start: 1, end: TOTAL_POKEMON };

      const start = nextPokemonId;
      const end = Math.min(start + PAGE_SIZE - 1, range.end);

      const newPokemon = await fetchPokemonRange(start, end);

      setPokemonList((prev) => {
        const existingIds = new Set(prev.map((pokemon) => pokemon.id));

        const mergedPokemon = [
          ...prev,
          ...newPokemon.filter((pokemon) => !existingIds.has(pokemon.id)),
        ];

        return mergedPokemon.sort((a, b) => a.id - b.id);
      });

      const nextId = end + 1;

      setNextPokemonId(nextId);

      if (nextId > TOTAL_POKEMON) {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error loading more Pokémon:', error);
    } finally {
      setLoadingMore(false);
    }
  }, [loading, loadingMore, hasMore, selectedGeneration, view, nextPokemonId]);

  useEffect(() => {
    const target = loadMoreRef.current;

    if (!target) return;
    if (view !== 'dex') return;
    if (!hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];

        if (firstEntry.isIntersecting) {
          loadMorePokemon();
        }
      },
      {
        root: null,
        rootMargin: '250px',
        threshold: 0.1,
      }
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [view, hasMore, loadMorePokemon]);

  const filteredPokemon = useMemo(() => {
    let filtered = pokemonList;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();

      filtered = filtered.filter(
        (pokemon) =>
          pokemon.name.toLowerCase().includes(term) || pokemon.id.toString().includes(searchTerm)
      );
    }

    if (selectedGeneration !== null) {
      const range = GENERATION_RANGES[selectedGeneration - 1];

      filtered = filtered.filter((pokemon) => pokemon.id >= range.start && pokemon.id <= range.end);
    }

    if (selectedType) {
      filtered = filtered.filter((pokemon) => pokemon.types.includes(selectedType));
    }

    return filtered;
  }, [searchTerm, selectedGeneration, selectedType, pokemonList]);

  const handlePokemonClick = async (id: number) => {
    setLoadingDetail(true);

    try {
      const detail = await fetchPokemonDetail(id, i18n.language);
      setSelectedPokemon(detail);
    } catch (error) {
      console.error('Error fetching Pokemon detail:', error);
    } finally {
      setLoadingDetail(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const refreshSelectedPokemon = async () => {
      if (!selectedPokemon) return;
      if (lastDetailLanguage.current === i18n.language) return;

      setLoadingDetail(true);

      try {
        const detail = await fetchPokemonDetail(selectedPokemon.id, i18n.language);

        if (!cancelled) {
          setSelectedPokemon(detail);
          lastDetailLanguage.current = i18n.language;
        }
      } catch (error) {
        console.error('Error refreshing Pokemon detail after language change:', error);
      } finally {
        if (!cancelled) {
          setLoadingDetail(false);
        }
      }
    };

    refreshSelectedPokemon();

    return () => {
      cancelled = true;
    };
    }, [i18n.language, selectedPokemon]);

  return (
    <div className="min-h-screen bg-background text-foreground pb-6 transition-colors">
      <header className="bg-card text-card-foreground border-b border-border shadow-md sticky top-0 z-40 transition-colors">
        <div className="px-4 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
            <h1
              className="
                text-4xl sm:text-6xl font-black tracking-wide
                text-red-600
                drop-shadow-[3px_3px_0px_#facc15]
                [-webkit-text-stroke:2px_#1e3a8a]
              "
            >
              PokéManiaco
            </h1>

            <div className="flex items-center gap-2">
              <LanguageToggle />
              <ThemeToggle />

              <button
                onClick={() => setView(view === 'dex' ? 'tierlist' : 'dex')}
                className="rounded-full bg-primary px-3 py-2 sm:px-4 text-xs sm:text-sm font-bold text-primary-foreground shadow-md transition-transform hover:scale-105 whitespace-nowrap"
              >
                {view === 'dex' ? t('app.viewTierList') : t('app.backToDex')}
              </button>
            </div>
          </div>

          {view === 'dex' && (
            <div className="flex justify-center">
              <SearchBar value={searchTerm} onChange={setSearchTerm} />
            </div>
          )}
        </div>
      </header>

      <div className="px-3 sm:px-4 py-4 sm:py-8 max-w-7xl mx-auto">
        {view === 'dex' ? (
          <>
            <div className="mb-4 sm:mb-8 bg-card text-card-foreground border border-border rounded-2xl p-4 sm:p-6 shadow-md transition-colors">
              <FilterSection
                selectedGeneration={selectedGeneration}
                selectedType={selectedType}
                onGenerationChange={setSelectedGeneration}
                onTypeChange={setSelectedType}
              />
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
              </div>
            ) : (
              <>
                <div className="text-center mb-4 sm:mb-6">
                  <p className="text-muted-foreground font-medium text-sm sm:text-base">
                    {t('app.showing', { count: filteredPokemon.length })}
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

                {hasMore && (
                  <div ref={loadMoreRef} className="flex justify-center items-center py-8 min-h-20">
                    {loadingMore && (
                      <div className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
                        <span>{t('app.loading')}</span>
                        <span className="animate-pulse">...</span>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {filteredPokemon.length === 0 && !loading && (
              <div className="text-center py-16">
                <p className="text-muted-foreground text-lg sm:text-xl">
                  {t('app.noPokemonFound')}
                </p>
                <p className="text-muted-foreground/70 mt-2 text-sm sm:text-base">
                  {t('app.tryAdjustingFilters')}
                </p>
              </div>
            )}
          </>
        ) : (
          <TierList initialPokemon={pokemonList} />
        )}
      </div>

      {selectedPokemon && !loadingDetail && (
        <PokemonDetail pokemon={selectedPokemon} onClose={() => setSelectedPokemon(null)} />
      )}

      {loadingDetail && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <Loader2 className="w-12 h-12 animate-spin text-white" />
        </div>
      )}
    </div>
  );
}
