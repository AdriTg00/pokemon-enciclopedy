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
      whileHover={{ y: -6 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="group relative cursor-pointer rounded-2xl border border-border/80 bg-card shadow-sm transition-all hover:border-border hover:shadow-lg hover:shadow-black/5 dark:shadow-black/20 dark:hover:shadow-black/40"
    >
      <div
        className="pointer-events-none absolute -top-12 -right-12 h-36 w-36 rounded-full opacity-20 blur-2xl transition-all duration-300 group-hover:opacity-40 dark:opacity-25"
        style={{ backgroundColor: bgColor }}
      />

      <div className="relative p-3 sm:p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="font-semibold uppercase tracking-wider text-[10px] sm:text-[11px] text-muted-foreground/80">
            #{pokemon.id.toString().padStart(3, "0")}
          </span>
        </div>

        <div className="mb-3 flex items-center justify-center h-20 sm:h-28">
          <img
            src={pokemon.sprite}
            alt={pokemon.name}
            loading="lazy"
            className="h-20 w-20 sm:h-24 sm:w-24 object-contain drop-shadow-[0_8px_14px_rgba(0,0,0,0.14)] transition-transform duration-300 group-hover:scale-110"
          />
        </div>

        <h3 className="truncate px-1 text-center font-bold text-sm sm:text-base capitalize tracking-tight text-foreground">
          {pokemon.name}
        </h3>

        <div className="mt-2 flex flex-wrap items-center justify-center gap-1.5">
          {pokemon.types.map((type) => (
            <span
              key={type}
              className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold capitalize transition-colors group-hover:border-current"
              style={{
                color: typeColors[type],
                backgroundColor: `${typeColors[type]}14`,
                borderColor: `${typeColors[type]}40`,
              }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: typeColors[type] }}
              />
              {t(`types.${type.toLowerCase()}`, { defaultValue: type })}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}