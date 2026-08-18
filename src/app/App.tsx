import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { ThemeToggle } from './components/ThemeToggle';
import { Loader2, SearchX } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LanguageToggle } from './components/LanguageToggle';
import { PokemonCard } from './components/PokemonCard';
import { PokemonDetail } from './components/PokemonDetail';
import { SearchBar } from './components/SearchBar';
import { FilterSection } from './components/FilterSection';
import { TierList } from './components/TierList';
import { PokeballLogo } from './components/PokeballLogo';
import type {
  Pokemon,
  PokemonDetail as PokemonDetailType,
  PokemonType,
  PokemonStats,
  PokemonSortStat,
} from '../types/pokemon';
import {
  GENERATION_RANGES,
  getPokemonStatValue,
} from '../types/pokemon';
import {
  fetchPokemonRange,
  fetchPokemonDetail,
  fetchPokemonStatsByIds,
} from '../services/pokemonApi';

const PAGE_SIZE = 20;
const TOTAL_POKEMON = 1025;

export default function App() {
  const [pokemonList, setPokemonList] = useState<Pokemon[]>([]);
  const [view, setView] = useState<'dex' | 'tierlist'>('dex');
  const [selectedPokemon, setSelectedPokemon] = useState<PokemonDetailType | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGeneration, setSelectedGeneration] = useState<number | null>(null);
  const [selectedType, setSelectedType] = useState<PokemonType | null>(null);
  const [selectedStat, setSelectedStat] = useState<PokemonSortStat | null>(null);
  const [sortAscending, setSortAscending] = useState(false);
  const [statsMap, setStatsMap] = useState<Record<number, PokemonStats>>({});
  const [loading, setLoading] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const statsMapRef = useRef<Record<number, PokemonStats>>({});
  const statsInFlightRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    statsMapRef.current = statsMap;
  }, [statsMap]);

  useEffect(() => {
    if (view !== 'dex' || selectedStat === null) return;

    const loadMissingStats = async () => {
      const missingIds = pokemonList
        .map((pokemon) => pokemon.id)
        .filter(
          (id) => !statsMapRef.current[id] && !statsInFlightRef.current.has(id)
        );

      if (missingIds.length === 0) return;

      missingIds.forEach((id) => statsInFlightRef.current.add(id));

      try {
        const statsList = await fetchPokemonStatsByIds(missingIds);

        setStatsMap((prev) => {
          const next = { ...prev };

          missingIds.forEach((id, index) => {
            if (index < statsList.length) {
              next[id] = statsList[index];
            }
          });

          return next;
        });
      } catch (error) {
        console.error('Error loading Pokémon stats:', error);
      } finally {
        missingIds.forEach((id) => statsInFlightRef.current.delete(id));
      }
    };

    loadMissingStats();
  }, [pokemonList, selectedStat, view]);

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

    if (selectedStat) {
      filtered = [...filtered].sort((a, b) => {
        const statsA = statsMap[a.id];
        const statsB = statsMap[b.id];

        const valueA = statsA ? getPokemonStatValue(statsA, selectedStat) : Infinity;
        const valueB = statsB ? getPokemonStatValue(statsB, selectedStat) : Infinity;

        return sortAscending ? valueA - valueB : valueB - valueA;
      });
    }

    return filtered;
  }, [searchTerm, selectedGeneration, selectedType, pokemonList, selectedStat, sortAscending, statsMap]);

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

  const statLabel = selectedStat
    ? selectedStat === 'total'
      ? t('pokemonDetail.totalStats')
      : t(`stats.${selectedStat}`, { defaultValue: selectedStat })
    : undefined;

  const statValueFor = (id: number): number | null | undefined => {
    if (!selectedStat) return undefined;

    const stats = statsMap[id];

    return stats ? getPokemonStatValue(stats, selectedStat) : null;
  };

  return (
    <div
      className="min-h-screen bg-background text-foreground pb-10 transition-colors"
    >      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70 transition-colors">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4 sm:py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <h1 className="flex items-center gap-3 select-none">
              <span className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-card border border-border shadow-sm transition-transform duration-300 hover:rotate-12">
                <PokeballLogo className="w-7 h-7 sm:w-8 sm:h-8 drop-shadow-sm" />
              </span>

              <span className="flex flex-col leading-none">
                <span className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
                  Poké<span className="text-poke-red">Maniaco</span>
                </span>
                <span className="text-[10px] sm:text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground mt-1.5">
                  {t('app.tagline')}
                </span>
              </span>
            </h1>

            <div className="flex items-center gap-2">
              <LanguageToggle />
              <ThemeToggle />

              <button
                onClick={() => setView(view === 'dex' ? 'tierlist' : 'dex')}
                className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs sm:text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow-md active:scale-[0.97] whitespace-nowrap"
              >
                {view === 'dex' ? t('app.viewTierList') : t('app.backToDex')}
              </button>
            </div>
          </div>

          {view === 'dex' && (
            <div className="mt-4 sm:mt-5 flex justify-center">
              <SearchBar value={searchTerm} onChange={setSearchTerm} />
            </div>
          )}
        </div>
      </header>

      <div className="px-4 sm:px-6 py-6 sm:py-10 max-w-7xl mx-auto">
        {view === 'dex' ? (
          <>
            <div className="mb-6 sm:mb-10">
              <FilterSection
                selectedGeneration={selectedGeneration}
                selectedType={selectedType}
                selectedStat={selectedStat}
                sortDirection={sortAscending ? 'asc' : 'desc'}
                onGenerationChange={setSelectedGeneration}
                onTypeChange={setSelectedType}
                onStatChange={setSelectedStat}
                onSortDirectionChange={(direction) =>
                  setSortAscending(direction === 'asc')
                }
              />
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="relative">
                  <Loader2 className="w-10 h-10 animate-spin text-poke-red" />
                </div>
              </div>
            ) : (
              <>
                <div className="text-center mb-5 sm:mb-7">
                  <p className="inline-flex items-center gap-2 text-muted-foreground font-medium text-sm sm:text-base">
                    <span className="w-1.5 h-1.5 rounded-full bg-poke-red/80" />
                    {t('app.showing', { count: filteredPokemon.length })}
                    {selectedStat &&
                      t('app.orderHint', {
                        stat: statLabel,
                        order: sortAscending
                          ? t('filters.ascending')
                          : t('filters.descending'),
                      })}
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-5">
                  {filteredPokemon.map((pokemon) => (
                    <PokemonCard
                      key={pokemon.id}
                      pokemon={pokemon}
                      statValue={statValueFor(pokemon.id)}
                      statLabel={statLabel}
                      onClick={() => handlePokemonClick(pokemon.id)}
                    />
                  ))}
                </div>

                {hasMore && (
                  <div ref={loadMoreRef} className="flex justify-center items-center py-8 min-h-20">
                    {loadingMore && (
                      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                        <Loader2 className="w-4 h-4 animate-spin text-poke-red/70" />
                        <span>{t('app.loading')}</span>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {filteredPokemon.length === 0 && !loading && (
              <div className="text-center py-20">
                <div className="mx-auto mb-5 flex items-center justify-center w-16 h-16 rounded-2xl bg-card border border-border shadow-sm">
                  <SearchX className="w-7 h-7 text-muted-foreground/70" />
                </div>
                <p className="text-foreground text-lg sm:text-xl font-semibold tracking-tight">
                  {t('app.noPokemonFound')}
                </p>
                <p className="text-muted-foreground/80 mt-2 text-sm sm:text-base">
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="rounded-2xl bg-card border border-border shadow-2xl px-8 py-6 flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-poke-red" />
            <span className="text-sm font-medium text-muted-foreground">
              {t('app.loading')}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
