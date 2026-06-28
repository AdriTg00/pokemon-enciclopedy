import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { fetchPokemonRange, fetchPokemonByIds } from '@/services/pokemonApi';
import { useTranslation } from 'react-i18next';
import type { Pokemon } from '@/types/pokemon';
import { ImageWithFallback } from './ImageWithFallback';
import { SearchBar } from './SearchBar';
import { Download, Loader2, X } from 'lucide-react';
import { Button } from '@/app/components/ui/button';

interface TierListProps {
  initialPokemon: Pokemon[];
}

const TIER_CONFIG = [
  { id: 'S', color: 'bg-red-500' },
  { id: 'A', color: 'bg-orange-500' },
  { id: 'B', color: 'bg-yellow-500' },
  { id: 'C', color: 'bg-green-500' },
  { id: 'D', color: 'bg-blue-500' },
];

const DEFAULT_TIERS: Record<string, number[]> = {
  S: [],
  A: [],
  B: [],
  C: [],
  D: [],
};

const PAGE_SIZE = 20;
const TOTAL_POKEMON = 1025;

export function TierList({ initialPokemon }: TierListProps) {
  const { t } = useTranslation();

  const tierListRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const unrankedScrollRef = useRef<HTMLDivElement | null>(null);

  const [allPokemon, setAllPokemon] = useState<Pokemon[]>(initialPokemon);
  const [nextPokemonId, setNextPokemonId] = useState(initialPokemon.length + 1);
  const [hasMore, setHasMore] = useState(initialPokemon.length < TOTAL_POKEMON);
  const [loadingMore, setLoadingMore] = useState(false);

  const [isExporting, setIsExporting] = useState(false);
  const [unrankedSearchTerm, setUnrankedSearchTerm] = useState('');
  const isLoadingMoreRef = useRef(false);
  const lastInitialLength = useRef(initialPokemon.length);

  const [selectedItem, setSelectedItem] = useState<{
    id: number;
    sourceTier: string | null;
  } | null>(null);

  const [tiers, setTiers] = useState<Record<string, number[]>>(() => {
    const saved = localStorage.getItem('pokemon-tier-list');
    return saved ? JSON.parse(saved) : { S: [], A: [], B: [], C: [], D: [] };
  });

  useEffect(() => {
    if (initialPokemon.length <= lastInitialLength.current) return;

    const newItems = initialPokemon.slice(lastInitialLength.current);

    lastInitialLength.current = initialPokemon.length;

    setAllPokemon((prev) => {
      const existingIds = new Set(prev.map((pokemon) => pokemon.id));

      const mergedPokemon = [
        ...prev,
        ...newItems.filter((pokemon) => !existingIds.has(pokemon.id)),
      ];

      return mergedPokemon.sort((a, b) => a.id - b.id);
    });
  }, [initialPokemon]);

  useEffect(() => {
    localStorage.setItem('pokemon-tier-list', JSON.stringify(tiers));
  }, [tiers]);

  const assignedIds = useMemo(() => Object.values(tiers).flat(), [tiers]);

  useEffect(() => {
    const loadMissingAssignedPokemon = async () => {
      const loadedIds = new Set(allPokemon.map((pokemon) => pokemon.id));

      const missingAssignedIds = assignedIds.filter((id) => !loadedIds.has(id));

      if (missingAssignedIds.length === 0) return;

      try {
        const missingPokemon = await fetchPokemonByIds(missingAssignedIds);

        setAllPokemon((prev) => {
          const existingIds = new Set(prev.map((pokemon) => pokemon.id));

          const mergedPokemon = [
            ...prev,
            ...missingPokemon.filter((pokemon) => !existingIds.has(pokemon.id)),
          ];

          return mergedPokemon.sort((a, b) => a.id - b.id);
        });
      } catch (error) {
        console.error('Error loading assigned Pokémon:', error);
      }
    };

    loadMissingAssignedPokemon();
  }, [assignedIds, allPokemon]);

  const loadMorePokemon = useCallback(async () => {
    if (isLoadingMoreRef.current || loadingMore || !hasMore) return;

    isLoadingMoreRef.current = true;
    setLoadingMore(true);

    try {
      const start = nextPokemonId;
      const end = Math.min(start + PAGE_SIZE - 1, TOTAL_POKEMON);

      const newPokemon = await fetchPokemonRange(start, end);

      setAllPokemon((prev) => {
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
      console.error('Error loading more Pokémon in tier list:', error);
    } finally {
      isLoadingMoreRef.current = false;
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, nextPokemonId]);

  useEffect(() => {
    const target = loadMoreRef.current;
    const scrollContainer = unrankedScrollRef.current;

    if (!target || !scrollContainer || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];

        if (firstEntry.isIntersecting && !isLoadingMoreRef.current) {
          loadMorePokemon();
        }
      },
      {
        root: scrollContainer,
        rootMargin: '150px',
        threshold: 0.1,
      }
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [hasMore, loadingMore, nextPokemonId, loadMorePokemon]);

  const filteredUnrankedPokemon = useMemo(() => {
    return allPokemon
      .filter((pokemon) => !assignedIds.includes(pokemon.id))
      .filter(
        (pokemon) =>
          pokemon.name.toLowerCase().includes(unrankedSearchTerm.toLowerCase()) ||
          pokemon.id.toString().includes(unrankedSearchTerm)
      );
  }, [allPokemon, assignedIds, unrankedSearchTerm]);

  const handleExport = async () => {
    if (!tierListRef.current) return;

    setIsExporting(true);

    try {
      const html2canvas = (await import('html2canvas')).default;

      const canvas = await html2canvas(tierListRef.current, {
        useCORS: true,
        allowTaint: true,
        scale: 2,
        backgroundColor: '#ffffff',
        windowWidth: 1200,

        onclone: (clonedDoc) => {
          clonedDoc.documentElement.classList.remove('dark');

          const rootStyle = clonedDoc.createElement('style');

          rootStyle.textContent = `
          :root {
            --background: #ffffff !important;
            --foreground: #000000 !important;
            --card: #ffffff !important;
            --card-foreground: #000000 !important;
            --popover: #ffffff !important;
            --popover-foreground: #000000 !important;
            --primary: #111827 !important;
            --primary-foreground: #ffffff !important;
            --secondary: #f3f4f6 !important;
            --secondary-foreground: #111827 !important;
            --muted: #f3f4f6 !important;
            --muted-foreground: #4b5563 !important;
            --accent: #f3f4f6 !important;
            --accent-foreground: #111827 !important;
            --border: #d1d5db !important;
            --input: #ffffff !important;
            --ring: #9ca3af !important;
          }

          html,
          body {
            background: #ffffff !important;
            color: #000000 !important;
          }

          * {
            color: #000000 !important;
            border-color: #d1d5db !important;
            box-shadow: none !important;
            text-shadow: none !important;
            outline-color: #d1d5db !important;
          }

          img {
            background-color: transparent !important;
          }

          .bg-card,
          .bg-background,
          .bg-muted,
          .bg-muted\\/50,
          .bg-accent,
          .hover\\:bg-accent\\/50 {
            background-color: #ffffff !important;
          }

          .bg-red-500,
          .bg-red-600 {
            background-color: #ef4444 !important;
            color: #ffffff !important;
          }

          .bg-orange-500,
          .bg-orange-600 {
            background-color: #f97316 !important;
            color: #ffffff !important;
          }

          .bg-yellow-500,
          .bg-yellow-600 {
            background-color: #eab308 !important;
            color: #ffffff !important;
          }

          .bg-green-500,
          .bg-green-600 {
            background-color: #22c55e !important;
            color: #ffffff !important;
          }

          .bg-blue-500,
          .bg-blue-600 {
            background-color: #3b82f6 !important;
            color: #ffffff !important;
          }
        `;

          clonedDoc.head.appendChild(rootStyle);

          const clonedTierList = clonedDoc.querySelector(
            "[data-export-tier-list='true']"
          ) as HTMLElement | null;

          if (clonedTierList) {
            clonedTierList.style.width = '1100px';
            clonedTierList.style.maxWidth = '1100px';
            clonedTierList.style.backgroundColor = '#ffffff';
            clonedTierList.style.color = '#000000';
          }
        },
      });

      const image = canvas.toDataURL('image/png');

      const link = document.createElement('a');
      link.href = image;
      link.download = `pokemon-tier-list-${new Date().getTime()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error generating image:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const onDragStart = (event: React.DragEvent, pokemonId: number, sourceTier: string | null) => {
    event.dataTransfer.setData('pokemonId', pokemonId.toString());
    event.dataTransfer.setData('sourceTier', sourceTier || 'unranked');
  };

  const movePokemon = (pokemonId: number, sourceTier: string | null, targetTier: string | null) => {
    if (sourceTier === targetTier) return;

    setTiers((prev) => {
      const newTiers = { ...prev };

      if (sourceTier && sourceTier !== 'unranked') {
        newTiers[sourceTier] = newTiers[sourceTier].filter((id) => id !== pokemonId);
      }

      if (targetTier && targetTier !== 'unranked') {
        if (!newTiers[targetTier].includes(pokemonId)) {
          newTiers[targetTier] = [...newTiers[targetTier], pokemonId];
        }
      }

      return newTiers;
    });

    setSelectedItem(null);
  };

  const handleClearAll = () => {
    setTiers({ ...DEFAULT_TIERS });
    setSelectedItem(null);
  };

  const onDrop = (event: React.DragEvent, targetTier: string | null) => {
    event.preventDefault();

    const pokemonId = Number(event.dataTransfer.getData('pokemonId'));

    const sourceTier =
      event.dataTransfer.getData('sourceTier') === 'unranked'
        ? null
        : event.dataTransfer.getData('sourceTier');

    movePokemon(pokemonId, sourceTier, targetTier);
  };

  const handlePokemonClick = (event: React.MouseEvent, id: number, sourceTier: string | null) => {
    event.stopPropagation();

    if (selectedItem?.id === id) {
      setSelectedItem(null);
    } else {
      setSelectedItem({ id, sourceTier });
    }
  };

  const handleContainerClick = (targetTier: string | null) => {
    if (selectedItem) {
      movePokemon(selectedItem.id, selectedItem.sourceTier, targetTier);
    }
  };

  const onDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const hasAssignedPokemon = assignedIds.length > 0;

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row justify-end gap-2">
          <Button
            variant="secondary"
            onClick={handleClearAll}
            disabled={!hasAssignedPokemon}
            className="flex gap-2 items-center"
          >
            <X className="w-4 h-4" />
            {t('tiers.clearAll', { defaultValue: 'Eliminar todo' })}
          </Button>

          <Button onClick={handleExport} disabled={isExporting} className="flex gap-2 items-center">
            {isExporting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}

            {t('tiers.exportPNG')}
          </Button>
        </div>

        <div
          ref={tierListRef}
          data-export-tier-list="true"
          className="grid gap-2 bg-border border border-border rounded-xl overflow-hidden shadow-xl"
        >
          {TIER_CONFIG.map((tier) => (
            <div
              key={tier.id}
              onDragOver={onDragOver}
              onDrop={(event) => onDrop(event, tier.id)}
              onClick={() => handleContainerClick(tier.id)}
              className={`flex min-h-[100px] bg-card transition-all hover:bg-accent/50 ${
                selectedItem && selectedItem.sourceTier !== tier.id
                  ? 'ring-2 ring-primary/30 bg-primary/5'
                  : ''
              }`}
            >
              <div
                className={`${tier.color} w-20 sm:w-32 flex items-center justify-center text-white font-black text-2xl sm:text-4xl shadow-inner`}
              >
                {tier.id}
              </div>

              <div className="flex-1 p-2 flex flex-wrap gap-2 content-start">
                {tiers[tier.id].map((id) => {
                  const pokemon = allPokemon.find((item) => item.id === id);

                  if (!pokemon) {
                    return (
                      <div
                        key={id}
                        className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg bg-muted border border-border flex items-center justify-center"
                      >
                        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                      </div>
                    );
                  }

                  return (
                    <div
                      key={id}
                      draggable
                      onDragStart={(event) => onDragStart(event, id, tier.id)}
                      onClick={(event) => handlePokemonClick(event, id, tier.id)}
                      className={`group relative cursor-grab active:cursor-grabbing transform transition-all hover:scale-110 ${
                        selectedItem?.id === id
                          ? 'ring-4 ring-primary scale-110 z-10 rounded-lg shadow-lg'
                          : ''
                      }`}
                    >
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          movePokemon(id, tier.id, null);
                        }}
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 shadow-md opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity z-20 hover:bg-red-600 sm:p-1"
                        title="Remove"
                      >
                        <X className="w-3 h-3" />
                      </button>

                      <ImageWithFallback
                        src={pokemon.sprite}
                        alt={pokemon.name}
                        className="w-12 h-12 sm:w-16 sm:h-16 object-contain bg-muted rounded-lg border border-border"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="w-full lg:w-96 bg-card border border-border rounded-2xl p-4 sm:p-6 shadow-md flex-shrink-0 flex flex-col">
        <div className="mb-4">
          <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
            <span className="w-3 h-3 bg-primary rounded-full animate-pulse" />
            {t('tiers.unranked')}
          </h3>

          <SearchBar value={unrankedSearchTerm} onChange={setUnrankedSearchTerm} />
        </div>

        <div
          ref={unrankedScrollRef}
          onDragOver={onDragOver}
          onDrop={(event) => onDrop(event, null)}
          onClick={() => handleContainerClick(null)}
          className={`flex flex-wrap gap-2 min-h-[250px] p-4 bg-muted/50 rounded-xl border-2 border-dashed border-border transition-all hover:border-primary/50 flex-1 overflow-y-auto max-h-[calc(100vh-250px)] ${
            selectedItem && selectedItem.sourceTier !== null ? 'border-primary/50 bg-primary/5' : ''
          }`}
        >
          {filteredUnrankedPokemon.length === 0 && !hasMore ? (
            <p className="text-muted-foreground text-center w-full py-10 italic">
              {unrankedSearchTerm ? t('app.noPokemonFound') : t('tiers.allPokemonClassified')}
            </p>
          ) : (
            <>
              {filteredUnrankedPokemon.map((pokemon) => (
                <div
                  key={pokemon.id}
                  draggable
                  onDragStart={(event) => onDragStart(event, pokemon.id, null)}
                  onClick={(event) => handlePokemonClick(event, pokemon.id, null)}
                  className={`cursor-grab active:cursor-grabbing group relative transform transition-all hover:scale-110 ${
                    selectedItem?.id === pokemon.id
                      ? 'ring-4 ring-primary scale-110 z-10 rounded-lg shadow-lg'
                      : ''
                  }`}
                  title={pokemon.name}
                >
                  <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-[10px] font-bold px-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    #{pokemon.id}
                  </div>

                  <ImageWithFallback
                    src={pokemon.sprite}
                    alt={pokemon.name}
                    className="w-12 h-12 sm:w-16 sm:h-16 object-contain bg-background rounded-lg border border-border group-hover:border-primary transition-colors shadow-sm"
                  />
                </div>
              ))}

              {hasMore && (
                <div
                  ref={loadMoreRef}
                  className="w-full flex justify-center items-center py-6 min-h-16"
                >
                  {loadingMore && (
                    <div className="flex items-center gap-2 text-muted-foreground font-medium">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>{t('app.loading')}</span>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
