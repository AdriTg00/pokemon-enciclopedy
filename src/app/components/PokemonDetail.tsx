import { X } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/app/components/ui/button";
import { Progress } from "@/app/components/ui/progress";

interface PokemonStats {
  hp: number;
  attack: number;
  defense: number;
  specialAttack: number;
  specialDefense: number;
  speed: number;
}

interface PokemonDetailData {
  id: number;
  name: string;
  types: string[];
  sprite: string;
  stats: PokemonStats;
  height: number;
  weight: number;
  abilities: string[];
}

interface PokemonDetailProps {
  pokemon: PokemonDetailData;
  onClose: () => void;
}

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

export function PokemonDetail({ pokemon, onClose }: PokemonDetailProps) {
  const primaryType = pokemon.types[0];
  const bgColor = typeColors[primaryType] || "#A8A878";

  const statData = [
    { name: "HP", value: pokemon.stats.hp, max: 255 },
    { name: "Attack", value: pokemon.stats.attack, max: 200 },
    { name: "Defense", value: pokemon.stats.defense, max: 200 },
    { name: "Sp. Atk", value: pokemon.stats.specialAttack, max: 200 },
    { name: "Sp. Def", value: pokemon.stats.specialDefense, max: 200 },
    { name: "Speed", value: pokemon.stats.speed, max: 200 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl"
      >
        <div
          className="p-6 sm:p-8 rounded-t-3xl relative"
          style={{
            background: `linear-gradient(135deg, ${bgColor}dd, ${bgColor}99)`,
          }}
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute top-2 right-2 sm:top-4 sm:right-4 text-white hover:bg-white/20 rounded-full"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </Button>

          <div className="text-center">
            <div className="text-white/60 font-bold text-2xl sm:text-3xl mb-2">
              #{pokemon.id.toString().padStart(3, "0")}
            </div>
            <h2 className="text-white font-bold text-3xl sm:text-4xl capitalize mb-4">
              {pokemon.name}
            </h2>
            <div className="flex gap-2 justify-center mb-4 sm:mb-6">
              {pokemon.types.map((type) => (
                <span
                  key={type}
                  className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-sm sm:text-base font-semibold text-white capitalize shadow-lg"
                  style={{ backgroundColor: typeColors[type] }}
                >
                  {type}
                </span>
              ))}
            </div>
            <img
              src={pokemon.sprite}
              alt={pokemon.name}
              className="w-36 h-36 sm:w-48 sm:h-48 object-contain mx-auto drop-shadow-2xl"
            />
          </div>
        </div>

        <div className="p-6 sm:p-8">
          <div className="grid grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="bg-gray-50 rounded-xl p-3 sm:p-4 text-center">
              <div className="text-gray-500 text-xs sm:text-sm mb-1">Height</div>
              <div className="font-bold text-lg sm:text-xl">{pokemon.height / 10} m</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 sm:p-4 text-center">
              <div className="text-gray-500 text-xs sm:text-sm mb-1">Weight</div>
              <div className="font-bold text-lg sm:text-xl">{pokemon.weight / 10} kg</div>
            </div>
          </div>

          <div className="mb-6 sm:mb-8">
            <h3 className="font-bold text-lg sm:text-xl mb-3 sm:mb-4">Abilities</h3>
            <div className="flex gap-2 flex-wrap">
              {pokemon.abilities.map((ability) => (
                <span
                  key={ability}
                  className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-100 rounded-lg capitalize font-medium text-sm sm:text-base"
                >
                  {ability}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-bold text-lg sm:text-xl mb-3 sm:mb-4">Base Stats</h3>
            <div className="space-y-3">
              {statData.map((stat) => (
                <div key={stat.name}>
                  <div className="flex justify-between mb-1">
                    <span className="font-medium text-gray-700 text-sm sm:text-base">
                      {stat.name}
                    </span>
                    <span className="font-bold text-sm sm:text-base" style={{ color: bgColor }}>
                      {stat.value}
                    </span>
                  </div>
                  <Progress
                    value={(stat.value / stat.max) * 100}
                    className="h-2"
                    style={
                      {
                        "--progress-background": bgColor,
                      } as React.CSSProperties
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}