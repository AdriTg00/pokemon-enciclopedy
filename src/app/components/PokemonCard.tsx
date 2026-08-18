import { useState } from "react";
import { motion } from "motion/react";
import { useTranslation } from "react-i18next";
import type { Pokemon } from "@/types/pokemon";
import { TYPE_COLORS as typeColors } from "@/types/pokemon";
import { ImageOff, Loader2 } from "lucide-react";

interface PokemonCardProps {
  pokemon: Pokemon;
  onClick: () => void;
  statValue?: number | null;
  statLabel?: string;
}

type ImageState = "loading" | "loaded" | "error";

const loadedSprites = new Set<string>();

export function PokemonCard({ pokemon, onClick, statValue, statLabel }: PokemonCardProps) {
  const { t } = useTranslation();
  const primaryType = pokemon.types[0];
  const bgColor = typeColors[primaryType] || "#A8A878";

  const [imageState, setImageState] = useState<ImageState>(() =>
    pokemon.sprite
      ? loadedSprites.has(pokemon.sprite)
        ? "loaded"
        : "loading"
      : "error"
  );

  const handleLoad = () => {
    loadedSprites.add(pokemon.sprite);
    setImageState("loaded");
  };

  const handleError = () => {
    loadedSprites.delete(pokemon.sprite);
    setImageState("error");
  };

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

          {statLabel && (
            <span
              title={
                statValue == null
                  ? `${statLabel}: …`
                  : `${statLabel}: ${statValue}`
              }
              className="inline-flex items-center gap-1.5 rounded-full border border-poke-red/25 bg-poke-red/10 px-2 py-0.5 text-[11px] font-bold text-poke-red"
            >
              {statValue == null ? (
                <span className="h-2 w-2 animate-pulse rounded-full bg-poke-red/60" />
              ) : (
                <>
                  <span className="hidden sm:inline text-[9px] font-semibold uppercase tracking-wide opacity-70">
                    {statLabel}
                  </span>
                  <span className="tabular-nums">{statValue}</span>
                </>
              )}
            </span>
          )}
        </div>

        <div className="relative mb-3 flex h-20 items-center justify-center sm:h-28">
          {imageState === "loading" && (
            <Loader2
              className="h-6 w-6 animate-spin text-poke-red/70"
              aria-label={t("app.loading")}
            />
          )}

          {imageState === "error" ? (
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-border bg-muted/50 sm:h-20 sm:w-20">
              <ImageOff className="h-6 w-6 text-muted-foreground/50" />
            </div>
          ) : (
            <motion.img
              src={pokemon.sprite}
              alt={pokemon.name}
              loading="lazy"
              decoding="async"
              onLoad={handleLoad}
              onError={handleError}
              initial={{ opacity: 0 }}
              animate={{ opacity: imageState === "loaded" ? 1 : 0 }}
              transition={{ duration: 0.25 }}
              className="absolute inset-0 m-auto h-20 w-20 sm:h-24 sm:w-24 object-contain drop-shadow-[0_8px_14px_rgba(0,0,0,0.14)] transition-transform duration-300 group-hover:scale-110"
            />
          )}
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