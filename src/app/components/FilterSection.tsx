import { Button } from "./ui/button";
import { useTranslation } from "react-i18next";
import { POKEMON_TYPES, TYPE_COLORS, PokemonType } from "../../types/pokemon";

interface FilterSectionProps {
  selectedGeneration: number | null;
  selectedType: PokemonType | null;
  onGenerationChange: (gen: number | null) => void;
  onTypeChange: (type: PokemonType | null) => void;
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

export function FilterSection({
  selectedGeneration,
  selectedType,
  onGenerationChange,
  onTypeChange,
}: FilterSectionProps) {
  const { t } = useTranslation();
  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h3 className="font-bold text-base sm:text-lg mb-2 sm:mb-3">{t("filters.generation")}</h3>
        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 pb-2 sm:pb-0">
          <div className="flex sm:flex-wrap gap-2 min-w-max sm:min-w-0">
            <Button
              variant={selectedGeneration === null ? "default" : "outline"}
              onClick={() => onGenerationChange(null)}
              className="rounded-full text-sm whitespace-nowrap flex-shrink-0"
              size="sm"
            >
              {t("filters.all")}
            </Button>
            {generations.map((gen) => (
              <Button
                key={gen.num}
                variant={selectedGeneration === gen.num ? "default" : "outline"}
                onClick={() => onGenerationChange(gen.num)}
                className="rounded-full text-sm whitespace-nowrap flex-shrink-0"
                size="sm"
              >
                {gen.name}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-bold text-base sm:text-lg mb-2 sm:mb-3">{t("filters.type")}</h3>
        <div className="overflow-x-auto -mx-4 px-6 sm:mx-0 sm:px-2 py-3">
          <div className="flex sm:flex-wrap gap-3 min-w-max sm:min-w-0">
            <Button
              variant={selectedType === null ? "default" : "outline"}
              onClick={() => onTypeChange(null)}
              className="rounded-full text-sm whitespace-nowrap flex-shrink-0"
              size="sm"
            >
              {t("filters.all")}
            </Button>
            {types.map((type) => (
              <button
                key={type}
                onClick={() => onTypeChange(type)}
                className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-full capitalize font-semibold text-white transition-all text-xs sm:text-sm whitespace-nowrap flex-shrink-0 ${
                  selectedType === type
                    ? "shadow-[0_0_0_3px_rgba(100,116,139,0.5)] scale-105"
                    : "shadow-md opacity-80 hover:opacity-100 active:scale-95"
                }`}
                style={{ backgroundColor: typeColors[type] }}
              >
                {t(`types.${type}`)}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}