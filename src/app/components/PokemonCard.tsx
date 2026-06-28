import { motion } from "motion/react";
import { useTranslation } from "react-i18next";
import type { Pokemon } from "@/types/pokemon";
import { TYPE_COLORS as typeColors } from "@/types/pokemon";

interface PokemonCardProps {
  pokemon: Pokemon;
  onClick: () => void;
}

export function PokemonCard({ pokemon, onClick }: PokemonCardProps) {
  const { t } = useTranslation();
  const primaryType = pokemon.types[0];
  const bgColor = typeColors[primaryType] || "#A8A878";

  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -5 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="cursor-pointer rounded-xl sm:rounded-2xl overflow-hidden border border-border shadow-lg transition-all hover:shadow-2xl active:shadow-xl dark:shadow-black/40"
      style={{
        background: `linear-gradient(135deg, ${bgColor}dd, ${bgColor}99)`,
      }}
    >
      <div className="p-3 sm:p-4 relative">
        <div className="absolute top-1 right-1 sm:top-2 sm:right-2 text-white/40 font-bold text-lg sm:text-2xl">
          #{pokemon.id.toString().padStart(3, "0")}
        </div>

        <div className="flex justify-center items-center h-24 sm:h-32 mb-2">
          <img
            src={pokemon.sprite}
            alt={pokemon.name}
            className="w-20 h-20 sm:w-28 sm:h-28 object-contain drop-shadow-lg"
          />
        </div>

        <h3 className="text-white font-bold text-base sm:text-xl capitalize text-center mb-2 truncate px-1 drop-shadow-sm">
          {pokemon.name}
        </h3>

        <div className="flex gap-1 sm:gap-2 justify-center flex-wrap">
          {pokemon.types.map((type) => (
            <span
              key={type}
              className="px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs font-semibold text-white capitalize shadow-md border border-white/20"
              style={{ backgroundColor: typeColors[type] }}
            >
              {t(`types.${type.toLowerCase()}`, { defaultValue: type })}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}