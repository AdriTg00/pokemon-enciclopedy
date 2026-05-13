import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import type { Pokemon } from "@/types/pokemon";
import { ImageWithFallback } from "./ImageWithFallback";

interface TierListProps {
  allPokemon: Pokemon[];
}

const TIER_CONFIG = [
  { id: "S", color: "bg-red-500" },
  { id: "A", color: "bg-orange-500" },
  { id: "B", color: "bg-yellow-500" },
  { id: "C", color: "bg-green-500" },
  { id: "D", color: "bg-blue-500" },
];

export function TierList({ allPokemon }: TierListProps) {
  const { t } = useTranslation();
  const [tiers, setTiers] = useState<Record<string, number[]>>(() => {
    const saved = localStorage.getItem("pokemon-tier-list");
    return saved ? JSON.parse(saved) : { S: [], A: [], B: [], C: [], D: [] };
  });

  useEffect(() => {
    localStorage.setItem("pokemon-tier-list", JSON.stringify(tiers));
  }, [tiers]);

  const assignedIds = Object.values(tiers).flat();
  const unrankedPokemon = allPokemon.filter((p) => !assignedIds.includes(p.id));

  const onDragStart = (e: React.DragEvent, pokemonId: number, sourceTier: string | null) => {
    e.dataTransfer.setData("pokemonId", pokemonId.toString());
    e.dataTransfer.setData("sourceTier", sourceTier || "unranked");
  };

  const onDrop = (e: React.DragEvent, targetTier: string | null) => {
    e.preventDefault();
    const pokemonId = parseInt(e.dataTransfer.getData("pokemonId"));
    const sourceTier = e.dataTransfer.getData("sourceTier");

    if (sourceTier === targetTier) return;

    const newTiers = { ...tiers };

    // Eliminar de la fuente si estaba en un tier
    if (sourceTier !== "unranked") {
      newTiers[sourceTier] = newTiers[sourceTier].filter((id) => id !== pokemonId);
    }

    // Añadir al destino si es un tier
    if (targetTier) {
      newTiers[targetTier] = [...newTiers[targetTier], pokemonId];
    }

    setTiers(newTiers);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className="space-y-8">
      {/* Tiers Rows */}
      <div className="grid gap-2 bg-border border border-border rounded-xl overflow-hidden shadow-xl">
        {TIER_CONFIG.map((tier) => (
          <div
            key={tier.id}
            onDragOver={onDragOver}
            onDrop={(e) => onDrop(e, tier.id)}
            className="flex min-h-[100px] bg-card transition-colors hover:bg-accent/50"
          >
            <div className={`${tier.color} w-20 sm:w-32 flex items-center justify-center text-white font-black text-2xl sm:text-4xl shadow-inner`}>
              {tier.id}
            </div>
            <div className="flex-1 p-2 flex flex-wrap gap-2 content-start">
              {tiers[tier.id].map((id) => {
                const pokemon = allPokemon.find((p) => p.id === id);
                if (!pokemon) return null;
                return (
                  <div
                    key={id}
                    draggable
                    onDragStart={(e) => onDragStart(e, id, tier.id)}
                    className="cursor-grab active:cursor-grabbing transform transition-transform hover:scale-110"
                  >
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

      {/* Unranked Pool */}
      <div className="bg-card border border-border rounded-2xl p-4 sm:p-6 shadow-md">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          <span className="w-3 h-3 bg-primary rounded-full animate-pulse"></span>
          {t("tiers.unranked")}
        </h3>
        <div
          onDragOver={onDragOver}
          onDrop={(e) => onDrop(e, null)}
          className="flex flex-wrap gap-2 min-h-[150px] p-4 bg-muted/50 rounded-xl border-2 border-dashed border-border transition-colors hover:border-primary/50"
        >
          {unrankedPokemon.length === 0 ? (
            <p className="text-muted-foreground text-center w-full py-10 italic">
              {t("tiers.allPokemonClassified")}
            </p>
          ) : (
            unrankedPokemon.map((pokemon) => (
              <div
                key={pokemon.id}
                draggable
                onDragStart={(e) => onDragStart(e, pokemon.id, null)}
                className="cursor-grab active:cursor-grabbing group relative"
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
            ))
          )}
        </div>
      </div>
    </div>
  );
}