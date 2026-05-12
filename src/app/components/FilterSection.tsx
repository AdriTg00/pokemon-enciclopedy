import { Button } from "@/app/components/ui/button";

interface FilterSectionProps {
  selectedGeneration: number | null;
  selectedType: string | null;
  onGenerationChange: (gen: number | null) => void;
  onTypeChange: (type: string | null) => void;
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

const types = [
  "normal",
  "fire",
  "water",
  "electric",
  "grass",
  "ice",
  "fighting",
  "poison",
  "ground",
  "flying",
  "psychic",
  "bug",
  "rock",
  "ghost",
  "dragon",
  "dark",
  "steel",
  "fairy",
];

const typeColors: { [key: string]: string } = {
  normal: "#A8A878",
  fire: "#F08030",
  water: "#6890F0",
  electric: "#F8D030",
  grass: "#78C850",
  ice: "#98D8D8",
  fighting: "#C03028",
  poison: "#A040A0",
  ground: "#E0C068",
  flying: "#A890F0",
  psychic: "#F85888",
  bug: "#A8B820",
  rock: "#B8A038",
  ghost: "#705898",
  dragon: "#7038F8",
  dark: "#705848",
  steel: "#B8B8D0",
  fairy: "#EE99AC",
};

export function FilterSection({
  selectedGeneration,
  selectedType,
  onGenerationChange,
  onTypeChange,
}: FilterSectionProps) {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h3 className="font-bold text-base sm:text-lg mb-2 sm:mb-3">Generation</h3>
        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 pb-2 sm:pb-0">
          <div className="flex sm:flex-wrap gap-2 min-w-max sm:min-w-0">
            <Button
              variant={selectedGeneration === null ? "default" : "outline"}
              onClick={() => onGenerationChange(null)}
              className="rounded-full text-sm whitespace-nowrap flex-shrink-0"
              size="sm"
            >
              All
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
        <h3 className="font-bold text-base sm:text-lg mb-2 sm:mb-3">Type</h3>
        <div className="overflow-x-auto overflow-y-visible -mx-4 px-4 sm:mx-0 sm:px-0 py-2 sm:py-0">
          <div className="flex sm:flex-wrap gap-3 min-w-max sm:min-w-0">
            <Button
              variant={selectedType === null ? "default" : "outline"}
              onClick={() => onTypeChange(null)}
              className="rounded-full text-sm whitespace-nowrap flex-shrink-0"
              size="sm"
            >
              All
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
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}