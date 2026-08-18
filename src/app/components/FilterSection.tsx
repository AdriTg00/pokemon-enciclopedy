import type { ReactNode } from "react";
import { ArrowDownNarrowWide, ArrowUpNarrowWide } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  POKEMON_TYPES,
  TYPE_COLORS,
  POKEMON_SORT_STATS,
  PokemonType,
  PokemonSortStat,
} from "@/types/pokemon";

interface FilterSectionProps {
  selectedGeneration: number | null;
  selectedType: PokemonType | null;
  selectedStat: PokemonSortStat | null;
  sortDirection: 'asc' | 'desc';
  onGenerationChange: (gen: number | null) => void;
  onTypeChange: (type: PokemonType | null) => void;
  onStatChange: (stat: PokemonSortStat | null) => void;
  onSortDirectionChange: (direction: 'asc' | 'desc') => void;
}

const generations = [
  { num: 1, name: "Gen I", range: "1-151" },
  { num: 2, name: "Gen II", range: "152-251" },
  { num: 3, name: "Gen III", range: "252-386" },
  { num: 4, name: "Gen IV", range: "387-493" },
  { num: 5, name: "Gen V", range: "494-649" },
  { num: 6, name: "Gen VI", range: "650-721" },
  { num: 7, name: "Gen VII", range: "722-809" },
  { num: 8, name: "Gen VIII", range: "810-905" },
  { num: 9, name: "Gen IX", range: "906-1025" },
];

const types: readonly PokemonType[] = POKEMON_TYPES;

const typeColors = TYPE_COLORS;

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <h3 className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
      {children}
    </h3>
  );
}

export function FilterSection({
  selectedGeneration,
  selectedType,
  selectedStat,
  sortDirection,
  onGenerationChange,
  onTypeChange,
  onStatChange,
  onSortDirectionChange,
}: FilterSectionProps) {
  const { t } = useTranslation();

  const generationButton = (active: boolean) =>
    `rounded-full px-3.5 sm:px-4 py-1.5 text-xs sm:text-sm font-semibold whitespace-nowrap transition-all active:scale-95 ${
      active
        ? "bg-foreground text-background shadow-sm"
        : "text-muted-foreground hover:text-foreground"
    }`;

  return (
    <div className="space-y-7">
      <div>
        <SectionLabel>{t("filters.generation")}</SectionLabel>
        <div className="overflow-x-auto -mx-1 px-1 pb-2">
          <div className="inline-flex min-w-max items-center gap-1 rounded-full border border-border bg-card p-1 shadow-sm">
            <button
              type="button"
              onClick={() => onGenerationChange(null)}
              className={generationButton(selectedGeneration === null)}
            >
              {t("filters.all")}
            </button>
            {generations.map((gen) => (
              <button
                key={gen.num}
                type="button"
                onClick={() => onGenerationChange(gen.num)}
                title={gen.range}
                className={generationButton(selectedGeneration === gen.num)}
              >
                {gen.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <SectionLabel>{t("filters.type")}</SectionLabel>
        <div className="overflow-x-auto -mx-1 px-1 pb-2">
          <div className="flex gap-2 min-w-max sm:flex-wrap sm:min-w-0">
            <button
              type="button"
              onClick={() => onTypeChange(null)}
              className={`rounded-full px-3.5 sm:px-4 py-1.5 text-xs sm:text-sm font-semibold whitespace-nowrap transition-all active:scale-95 ${
                selectedType === null
                  ? "bg-foreground text-background shadow-sm"
                  : "border border-border bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              {t("filters.all")}
            </button>

            {types.map((type) => {
              const color = typeColors[type];
              const active = selectedType === type;

              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => onTypeChange(type)}
                  className="inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs sm:text-sm font-semibold capitalize whitespace-nowrap transition-all active:scale-95"
                  style={
                    active
                      ? {
                          backgroundColor: color,
                          borderColor: color,
                          color: "#ffffff",
                          boxShadow: `0 4px 14px -4px ${color}99`,
                        }
                      : {
                          backgroundColor: `${color}14`,
                          borderColor: `${color}40`,
                          color,
                        }
                  }
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: active ? "#ffffff" : color }}
                  />
                  {t(`types.${type}`)}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div>
        <SectionLabel>{t("filters.stat")}</SectionLabel>
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex min-w-max items-center gap-0.5 rounded-full border border-border bg-card p-1 shadow-sm">
            <button
              type="button"
              onClick={() => onStatChange(null)}
              className={generationButton(selectedStat === null)}
            >
              {t("filters.all")}
            </button>
            {POKEMON_SORT_STATS.map((stat) => {
              const statName =
                stat === "total"
                  ? t("pokemonDetail.totalStats")
                  : t(`stats.${stat}`, { defaultValue: stat });

              return (
                <button
                  key={stat}
                  type="button"
                  onClick={() => onStatChange(stat)}
                  className={generationButton(selectedStat === stat)}
                >
                  {statName}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() =>
              onSortDirectionChange(sortDirection === "asc" ? "desc" : "asc")
            }
            disabled={selectedStat === null}
            title={
              sortDirection === "asc"
                ? t("filters.descending")
                : t("filters.ascending")
            }
            className="inline-flex h-8 items-center gap-1.5 rounded-full border border-border bg-card px-3 text-xs font-semibold text-muted-foreground shadow-sm transition-all hover:text-foreground active:scale-95 disabled:pointer-events-none disabled:opacity-40"
          >
            {sortDirection === "asc" ? (
              <ArrowUpNarrowWide className="h-3.5 w-3.5" />
            ) : (
              <ArrowDownNarrowWide className="h-3.5 w-3.5" />
            )}
            {sortDirection === "asc"
              ? t("filters.ascending")
              : t("filters.descending")}
          </button>
        </div>
      </div>
    </div>
  );
}