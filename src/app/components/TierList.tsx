import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import type { Pokemon } from "@/types/pokemon";
import { ImageWithFallback } from "./ImageWithFallback";
import { SearchBar } from "./SearchBar"; // Importamos el componente SearchBar
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/app/components/ui/button";

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
  const tierListRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [tiers, setTiers] = useState<Record<string, number[]>>(() => {
    const saved = localStorage.getItem("pokemon-tier-list");
    return saved ? JSON.parse(saved) : { S: [], A: [], B: [], C: [], D: [] };
  });

  const handleExport = async () => {
    if (!tierListRef.current) return;

    setIsExporting(true);

    try {
      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");

      const canvas = await html2canvas(tierListRef.current, {
        useCORS: true,
        allowTaint: true,
        scale: 2,
        backgroundColor: "#ffffff",

        onclone: (clonedDoc) => {
          const style = clonedDoc.createElement("style");

          style.textContent = `
          * {
            color: #000000 !important;
            background-color: #ffffff !important;
            border-color: #cccccc !important;
            box-shadow: none !important;
            text-shadow: none !important;
            outline-color: #cccccc !important;
          }

          img {
            background-color: transparent !important;
          }

          .bg-red-500,
          .bg-red-600 {
            background-color: #ef4444 !important;
          }

          .bg-orange-500,
          .bg-orange-600 {
            background-color: #f97316 !important;
          }

          .bg-yellow-500,
          .bg-yellow-600 {
            background-color: #eab308 !important;
          }

          .bg-green-500,
          .bg-green-600 {
            background-color: #22c55e !important;
          }

          .bg-blue-500,
          .bg-blue-600 {
            background-color: #3b82f6 !important;
          }

          .bg-purple-500,
          .bg-purple-600 {
            background-color: #a855f7 !important;
          }
        `;

          clonedDoc.head.appendChild(style);
        },
      });

      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("l", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`pokemon-tier-list-${new Date().getTime()}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setIsExporting(false);
    }
  };

  // Nuevo estado para el término de búsqueda de Pokémon sin clasificar
  const [unrankedSearchTerm, setUnrankedSearchTerm] = useState("");

  useEffect(() => {
    localStorage.setItem("pokemon-tier-list", JSON.stringify(tiers));
  }, [tiers]);

  const assignedIds = Object.values(tiers).flat(); // IDs de todos los Pokémon ya clasificados
  const filteredUnrankedPokemon = React.useMemo(() => {
    return allPokemon.filter((p) => !assignedIds.includes(p.id))
      .filter((p) => p.name.toLowerCase().includes(unrankedSearchTerm.toLowerCase()) || p.id.toString().includes(unrankedSearchTerm));
  }, [allPokemon, assignedIds, unrankedSearchTerm]);

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
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Columna Izquierda: Filas de Tiers */}
      <div className="flex-1 flex flex-col gap-4">
        <div className="flex justify-end">
          <Button
            onClick={handleExport}
            disabled={isExporting}
            className="flex gap-2 items-center"
          >
            {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {t("tiers.exportPDF")}
          </Button>
        </div>
        <div ref={tierListRef} className="grid gap-2 bg-border border border-border rounded-xl overflow-hidden shadow-xl">
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
                  if (!pokemon) return null; // Esto no debería ocurrir si allPokemon es completo
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
      </div>

      {/* Columna Derecha: Pool de Pokémon sin clasificar con buscador */}
      <div className="w-full lg:w-96 bg-card border border-border rounded-2xl p-4 sm:p-6 shadow-md flex-shrink-0 flex flex-col">
        <div className="mb-4">
          <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
            <span className="w-3 h-3 bg-primary rounded-full animate-pulse"></span>
            {t("tiers.unranked")}
          </h3>
          {/* Integración del SearchBar */}
          <SearchBar value={unrankedSearchTerm} onChange={setUnrankedSearchTerm} />
        </div>

        {/* Contenedor scrollable para los Pokémon sin clasificar */}
        <div
          onDragOver={onDragOver}
          onDrop={(e) => onDrop(e, null)}
          className="flex flex-wrap gap-2 min-h-[150px] p-4 bg-muted/50 rounded-xl border-2 border-dashed border-border transition-colors hover:border-primary/50 flex-1 overflow-y-auto max-h-[calc(100vh-250px)]" /* Altura máxima y scroll */
        >
          {filteredUnrankedPokemon.length === 0 ? (
            <p className="text-muted-foreground text-center w-full py-10 italic">
              {unrankedSearchTerm ? t("app.noPokemonFound") : t("tiers.allPokemonClassified")} {/* Mensaje condicional */}
            </p>
          ) : (
            filteredUnrankedPokemon.map((pokemon) => (
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