import { motion } from "motion/react";

interface Pokemon {
  id: number;
  name: string;
  types: string[];
  sprite: string;
}

interface PokemonCardProps {
  pokemon: Pokemon;
  onClick: () => void;
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

export function PokemonCard({ pokemon, onClick }: PokemonCardProps) {
  const primaryType = pokemon.types[0];
  const bgColor = typeColors[primaryType] || "#A8A878";

  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -5 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="cursor-pointer rounded-xl sm:rounded-2xl overflow-hidden shadow-lg transition-shadow hover:shadow-2xl active:shadow-xl"
      style={{
        background: `linear-gradient(135deg, ${bgColor}dd, ${bgColor}99)`,
      }}
    >
      <div className="p-3 sm:p-4 relative">
        <div className="absolute top-1 right-1 sm:top-2 sm:right-2 text-white/30 font-bold text-lg sm:text-2xl">
          #{pokemon.id.toString().padStart(3, "0")}
        </div>
        
        <div className="flex justify-center items-center h-24 sm:h-32 mb-2">
          <img
            src={pokemon.sprite}
            alt={pokemon.name}
            className="w-20 h-20 sm:w-28 sm:h-28 object-contain drop-shadow-lg"
          />
        </div>
        
        <h3 className="text-white font-bold text-base sm:text-xl capitalize text-center mb-2 truncate px-1">
          {pokemon.name}
        </h3>
        
        <div className="flex gap-1 sm:gap-2 justify-center flex-wrap">
          {pokemon.types.map((type) => (
            <span
              key={type}
              className="px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs font-semibold text-white capitalize shadow-md"
              style={{ backgroundColor: typeColors[type] }}
            >
              {type}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}