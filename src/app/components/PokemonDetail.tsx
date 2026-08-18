import { X } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { useTranslation } from "react-i18next";
import type { PokemonDetail } from "@/types/pokemon";
import { TYPE_COLORS } from "@/types/pokemon";

interface PokemonDetailProps {
  pokemon: PokemonDetail;
  onClose: () => void;
}

const typeColors = TYPE_COLORS;

function normalizeAbilityKey(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function PokemonDetail({ pokemon, onClose }: PokemonDetailProps) {
  const { t } = useTranslation();
  const primaryType = pokemon.types[0];
  const bgColor = typeColors[primaryType] || "#A8A878";

  const statData = [
    { name: "hp", value: pokemon.stats.hp, max: 255 },
    { name: "attack", value: pokemon.stats.attack, max: 200 },
    { name: "defense", value: pokemon.stats.defense, max: 200 },
    { name: "specialAttack", value: pokemon.stats.specialAttack, max: 200 },
    { name: "specialDefense", value: pokemon.stats.specialDefense, max: 200 },
    { name: "speed", value: pokemon.stats.speed, max: 200 },
  ];

  const totalStats = statData.reduce((sum, stat) => sum + stat.value, 0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-end sm:items-center justify-center z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ type: "spring", damping: 26, stiffness: 320 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-card text-card-foreground border border-border/70 rounded-t-3xl sm:rounded-3xl w-full sm:max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl transition-colors"
      >
        <div className="p-6 sm:p-8 rounded-t-3xl relative overflow-hidden">
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(160deg, ${bgColor} 0%, ${bgColor}cc 55%, ${bgColor}66 100%)`,
            }}
          />
          <div
            className="absolute -bottom-16 -right-16 h-48 w-48 rounded-full opacity-40 blur-3xl"
            style={{ backgroundColor: "#ffffff" }}
          />

          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="absolute top-0 right-0 text-white hover:bg-black/10 rounded-full"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </Button>

            <div className="text-center">
              <div className="inline-flex items-center gap-2 text-white/70 font-bold text-base sm:text-lg tracking-[0.2em] mb-2">
                <span className="h-px w-6 bg-white/40" />
                #{pokemon.id.toString().padStart(3, "0")}
                <span className="h-px w-6 bg-white/40" />
              </div>

              <h2 className="text-white font-extrabold text-3xl sm:text-4xl capitalize mb-4 tracking-tight drop-shadow-sm">
                {pokemon.name}
              </h2>

              <div className="flex gap-2 justify-center mb-5 sm:mb-6">
                {pokemon.types.map((type) => (
                  <span
                    key={type}
                    className="inline-flex items-center gap-1.5 px-3 py-1 sm:px-3.5 sm:py-1 rounded-full text-xs sm:text-sm font-semibold text-white capitalize bg-black/15 border border-white/25 shadow-lg backdrop-blur-sm"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-white/80" />
                    {t(`types.${type.toLowerCase()}`, { defaultValue: type })}
                  </span>
                ))}
              </div>

              <img
                src={pokemon.sprite}
                alt={pokemon.name}
                className="w-36 h-36 sm:w-44 sm:h-44 object-contain mx-auto drop-shadow-[0_16px_24px_rgba(0,0,0,0.25)]"
              />
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-7 sm:mb-8">
            <div className="bg-muted/70 border border-border/60 rounded-2xl p-3 sm:p-4 text-center transition-colors">
              <div className="text-muted-foreground text-[11px] sm:text-xs font-medium uppercase tracking-wider mb-1.5">
                {t("pokemonDetail.height")}
              </div>
              <div className="font-bold text-lg sm:text-xl tracking-tight">
                {(pokemon.height / 10).toLocaleString()} m
              </div>
            </div>

            <div className="bg-muted/70 border border-border/60 rounded-2xl p-3 sm:p-4 text-center transition-colors">
              <div className="text-muted-foreground text-[11px] sm:text-xs font-medium uppercase tracking-wider mb-1.5">
                {t("pokemonDetail.weight")}
              </div>
              <div className="font-bold text-lg sm:text-xl tracking-tight">
                {(pokemon.weight / 10).toLocaleString()} kg
              </div>
            </div>
          </div>

          <div className="mb-7 sm:mb-8">
            <h3 className="font-bold text-base sm:text-lg tracking-tight mb-3 sm:mb-4 text-foreground">
              {t("pokemonDetail.abilities")}
            </h3>

            <div className="space-y-2.5">
              {pokemon.abilities.map((ability) => {
                const abilityKey = normalizeAbilityKey(ability.name);
                const abilityLabel = t(`abilities.${abilityKey}`, {
                  defaultValue: ability.name,
                });
                const abilityDescription = t(
                  `abilityDescriptions.${abilityKey}`,
                  {
                    defaultValue: ability.description,
                  }
                );

                return (
                  <div
                    key={ability.name}
                    className="p-3.5 sm:p-4 bg-muted/70 border border-border/60 rounded-2xl transition-colors"
                  >
                    <div className="font-bold capitalize text-sm sm:text-base mb-1">
                      {abilityLabel}
                    </div>
                    {abilityDescription && (
                      <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                        {abilityDescription}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 className="font-bold text-base sm:text-lg tracking-tight text-foreground">
                {t("pokemonDetail.baseStats")}
              </h3>

              <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs sm:text-sm font-bold"
                style={{
                  color: bgColor,
                  backgroundColor: `${bgColor}14`,
                }}
              >
                {t("pokemonDetail.totalStats")}
                <span>{totalStats}</span>
              </span>
            </div>

            <div className="space-y-3">
              {statData.map((stat) => (
                <div key={stat.name}>
                  <div className="flex justify-between mb-1">
                    <span className="font-medium text-foreground text-sm sm:text-base">
                      {t(`stats.${stat.name.toLowerCase()}`, { defaultValue: stat.name })}
                    </span>

                    <span
                      className="font-bold text-sm sm:text-base tabular-nums"
                      style={{ color: bgColor }}
                    >
                      {stat.value}
                    </span>
                  </div>

                  <Progress
                    value={(stat.value / stat.max) * 100}
                    className="h-1.5"
                    indicatorClassName="rounded-full"
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