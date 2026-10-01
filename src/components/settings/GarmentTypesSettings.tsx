"use client";

import React, { useState } from "react";
import { Scissors, Plus, Trash2 } from "lucide-react";
import { dataStore } from "@/lib/data/store";
import { GarmentType } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";

export function GarmentTypesSettings() {
  const { toast } = useToast();
  const [types, setTypes] = useState<GarmentType[]>(dataStore.getGarmentTypes());
  const [newTypeName, setNewTypeName] = useState("");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTypeName.trim()) return;
    const created = dataStore.createGarmentType(newTypeName.trim());
    setTypes(dataStore.getGarmentTypes());
    setNewTypeName("");
    toast(`Type de vêtement "${created.name}" ajouté !`);
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-base flex items-center space-x-2">
          <Scissors className="h-4.5 w-4.5 text-primary" />
          <span>Types de Vêtements Confectionnés</span>
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Personnalisez le catalogue des vêtements confectionnés dans votre atelier
        </p>
      </CardHeader>

      <CardContent className="p-4 pt-2 space-y-3">
        <form onSubmit={handleAdd} className="flex gap-2">
          <Input
            placeholder="Ex: Djellaba, Combinaison, Gilet..."
            value={newTypeName}
            onChange={(e) => setNewTypeName(e.target.value)}
            className="h-11"
          />
          <Button type="submit" className="min-h-[44px] shrink-0 font-semibold">
            <Plus className="h-4 w-4 mr-1" /> Ajouter
          </Button>
        </form>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto pt-1">
          {types.map((gt) => (
            <div
              key={gt.id}
              className="p-2.5 rounded-lg border bg-muted/40 flex items-center justify-between text-xs"
            >
              <span className="font-semibold text-foreground">{gt.name}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
