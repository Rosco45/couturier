"use client";

import React, { useState } from "react";
import { Ruler, Plus } from "lucide-react";
import { dataStore } from "@/lib/data/store";
import { MeasurementType } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";

export function MeasurementTypesSettings() {
  const { toast } = useToast();
  const [types, setTypes] = useState<MeasurementType[]>(dataStore.getMeasurementTypes());
  const [genderFilter, setGenderFilter] = useState<"all" | "m" | "f">("all");

  const [name, setName] = useState("");
  const [gender, setGender] = useState<"m" | "f" | "both">("both");
  const [category, setCategory] = useState<"haut" | "bas" | "robe" | "boubou" | "autre">("haut");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    dataStore.createMeasurementType({
      name: name.trim(),
      gender,
      category,
      unit: "cm",
      display_order: types.length + 1,
      is_active: true,
    });

    setTypes(dataStore.getMeasurementTypes());
    setName("");
    toast(`Point de mesure "${name}" ajouté avec succès !`);
  };

  const filteredTypes = types.filter((t) => {
    if (genderFilter === "all") return true;
    return t.gender === genderFilter || t.gender === "both";
  });

  return (
    <Card className="shadow-sm">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-base flex items-center space-x-2">
          <Ruler className="h-4.5 w-4.5 text-primary" />
          <span>Types de Mesures Corporelles</span>
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Points de mesure personnalisables par l&apos;atelier
        </p>
      </CardHeader>

      <CardContent className="p-4 pt-2 space-y-3.5">
        {/* Filtre Genre */}
        <div className="flex items-center space-x-2 text-xs">
          <button
            onClick={() => setGenderFilter("all")}
            className={`px-3 py-1.5 rounded-lg font-medium min-h-[36px] ${
              genderFilter === "all" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}
          >
            Tous ({types.length})
          </button>
          <button
            onClick={() => setGenderFilter("m")}
            className={`px-3 py-1.5 rounded-lg font-medium min-h-[36px] ${
              genderFilter === "m" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}
          >
            Homme ({types.filter((t) => t.gender === "m" || t.gender === "both").length})
          </button>
          <button
            onClick={() => setGenderFilter("f")}
            className={`px-3 py-1.5 rounded-lg font-medium min-h-[36px] ${
              genderFilter === "f" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}
          >
            Femme ({types.filter((t) => t.gender === "f" || t.gender === "both").length})
          </button>
        </div>

        {/* Liste des points de mesures */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-64 overflow-y-auto pr-1">
          {filteredTypes.map((mt) => (
            <div
              key={mt.id}
              className="p-2.5 rounded-xl border bg-muted/30 flex items-center justify-between text-xs"
            >
              <div>
                <span className="font-semibold text-foreground block truncate">{mt.name}</span>
                <span className="text-[10px] text-muted-foreground capitalize">
                  {mt.category} • {mt.gender === "both" ? "Mixte" : mt.gender === "m" ? "Homme" : "Femme"}
                </span>
              </div>
              <Badge variant="outline" className="text-[10px] font-mono">
                {mt.unit}
              </Badge>
            </div>
          ))}
        </div>

        {/* Formulaire d'ajout rapide */}
        <form onSubmit={handleAdd} className="border-t pt-3 space-y-2">
          <Label className="text-xs font-semibold">Ajouter un nouveau point de mesure</Label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <Input
              placeholder="Ex: Hauteur genou-sol..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-10 text-xs"
              required
            />
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value as any)}
              className="h-10 rounded-lg border border-input bg-background px-2 text-xs"
            >
              <option value="both">Mixte (Homme & Femme)</option>
              <option value="m">Homme uniquement</option>
              <option value="f">Femme uniquement</option>
            </select>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="h-10 rounded-lg border border-input bg-background px-2 text-xs"
            >
              <option value="haut">Haut</option>
              <option value="bas">Bas</option>
              <option value="robe">Robe</option>
              <option value="boubou">Boubou</option>
              <option value="autre">Autre</option>
            </select>
          </div>
          <Button type="submit" size="sm" className="min-h-[40px]">
            <Plus className="h-4 w-4 mr-1" /> Ajouter ce point de mesure
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
