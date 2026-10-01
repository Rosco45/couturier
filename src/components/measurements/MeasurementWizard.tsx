"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Ruler,
  ChevronLeft,
  ChevronRight,
  Check,
  Plus,
  Minus,
  Sparkles,
  RotateCcw,
} from "lucide-react";
import { Client, MeasurementType, MeasurementProfile } from "@/types";
import { dataStore } from "@/lib/data/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";

interface MeasurementWizardProps {
  client: Client;
  previousProfile?: MeasurementProfile;
  types: MeasurementType[];
  kind?: "standard" | "custom";
  parentId?: string | null;
  onComplete?: (profile: MeasurementProfile) => void;
}

export function MeasurementWizard({
  client,
  previousProfile,
  types,
  kind = "standard",
  parentId,
  onComplete,
}: MeasurementWizardProps) {
  const router = useRouter();
  const { toast } = useToast();

  // Filtrer les types de mesures adaptés au genre du client
  const applicableTypes = types.filter(
    (t) => t.gender === client.gender || t.gender === "both"
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [values, setValues] = useState<Record<string, number>>(() => {
    // Pré-remplir avec les valeurs du profil précédent selon la règle 4
    if (previousProfile?.measurements) {
      return { ...previousProfile.measurements };
    }
    return {};
  });
  const [profileNotes, setProfileNotes] = useState("");
  const [isReviewStep, setIsReviewStep] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentType = applicableTypes[currentIndex];
  const previousValue = currentType ? previousProfile?.measurements?.[currentType.id] : undefined;
  const currentValue = currentType ? values[currentType.id] ?? previousValue ?? 0 : 0;

  const updateCurrentValue = (val: number) => {
    if (!currentType) return;
    setValues((prev) => ({
      ...prev,
      [currentType.id]: Math.max(0, val),
    }));
  };

  const handleNext = () => {
    if (currentIndex < applicableTypes.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsReviewStep(true);
    }
  };

  const handlePrev = () => {
    if (isReviewStep) {
      setIsReviewStep(false);
    } else if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleSave = () => {
    try {
      setIsSubmitting(true);
      const newProfile = dataStore.createMeasurementProfileVersion(
        client.id,
        values,
        profileNotes,
        kind,
        parentId || previousProfile?.id
      );

      toast(
        `Mensurations Version ${newProfile.version} enregistrées pour ${client.first_name} !`
      );

      if (onComplete) {
        onComplete(newProfile);
      } else {
        router.push(`/clients/${client.id}`);
      }
    } catch (e: any) {
      toast(e.message || "Erreur lors de l'enregistrement", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ÉCRAN DE RÉCAPITULATIF FINAL
  if (isReviewStep) {
    return (
      <div className="max-w-xl mx-auto space-y-4 animate-in fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Récapitulatif des Mesures</h2>
            <p className="text-xs text-muted-foreground">
              Client : {client.first_name} {client.last_name} ({kind.toUpperCase()})
            </p>
          </div>
          <Badge variant="outline" className="text-xs">
            {Object.keys(values).length} mesures
          </Badge>
        </div>

        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="grid grid-cols-2 gap-2 text-sm max-h-[50vh] overflow-y-auto pr-1">
              {applicableTypes.map((t) => {
                const val = values[t.id];
                return (
                  <div
                    key={t.id}
                    onClick={() => {
                      setCurrentIndex(applicableTypes.findIndex((at) => at.id === t.id));
                      setIsReviewStep(false);
                    }}
                    className="p-2.5 rounded-lg border bg-muted/30 hover:bg-muted cursor-pointer flex justify-between items-center transition-colors"
                  >
                    <span className="text-xs text-muted-foreground truncate">{t.name}</span>
                    <span className="font-bold text-foreground text-sm">
                      {val !== undefined ? `${val} cm` : "-"}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-semibold text-muted-foreground">
                Remarques & Instructions de coupe pour cette version :
              </label>
              <Textarea
                placeholder="Ex: Épaule gauche légèrement plus basse de 0.5cm, client souhaite une coupe cintrée..."
                value={profileNotes}
                onChange={(e) => setProfileNotes(e.target.value)}
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center space-x-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={handlePrev}
            className="flex-1 min-h-[50px] text-base"
          >
            <ChevronLeft className="h-5 w-5 mr-1" />
            <span>Modifier</span>
          </Button>

          <Button
            type="button"
            onClick={handleSave}
            disabled={isSubmitting}
            className="flex-2 w-full min-h-[50px] text-base font-bold bg-primary"
          >
            <Check className="h-5 w-5 mr-1.5" />
            <span>Enregistrer Version {previousProfile ? previousProfile.version + 1 : 1}</span>
          </Button>
        </div>
      </div>
    );
  }

  // ÉCRAN DU WIZARD : UNE MESURE PAR ÉCRAN (RÈGLE 4)
  const progressPercent = Math.round(((currentIndex + 1) / applicableTypes.length) * 100);

  return (
    <div className="max-w-md mx-auto space-y-4 animate-in fade-in">
      {/* Barre de progression tactile */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">
            Mesure {currentIndex + 1} sur {applicableTypes.length}
          </span>
          <span className="font-bold text-primary">{progressPercent}%</span>
        </div>
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Carte de saisie de la mesure courante */}
      <Card className="border-2 border-primary/20 shadow-md">
        <CardContent className="p-6 text-center space-y-4">
          {/* Badge Catégorie */}
          <div className="flex items-center justify-center space-x-2">
            <Badge variant="secondary" className="uppercase tracking-wider text-[11px]">
              {currentType.category}
            </Badge>
            {kind === "custom" && (
              <Badge variant="outline" className="text-[11px] text-amber-600 border-amber-300">
                Ajustement Personnalisé
              </Badge>
            )}
          </div>

          {/* Nom du point de mesure */}
          <div>
            <h2 className="text-2xl font-black tracking-tight text-foreground">
              {currentType.name}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Valeur standard en centimètres (cm)
            </p>
          </div>

          {/* Valeur précédente pré-remplie (Règle 4) */}
          {previousValue !== undefined && (
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 text-amber-800 dark:text-amber-200 text-xs">
              <Sparkles className="h-3.5 w-3.5 text-amber-600" />
              <span>Valeur précédente : <strong>{previousValue} cm</strong></span>
              {currentValue !== previousValue && (
                <button
                  type="button"
                  onClick={() => updateCurrentValue(previousValue)}
                  className="underline hover:text-amber-900 ml-1 flex items-center"
                >
                  <RotateCcw className="h-3 w-3 mr-0.5 inline" /> Restaurer
                </button>
              )}
            </div>
          )}

          {/* Grand Champ Numérique Tactile Géant */}
          <div className="flex items-center justify-center space-x-3 pt-2">
            <button
              type="button"
              onClick={() => updateCurrentValue(currentValue - 1)}
              className="flex items-center justify-center w-14 h-14 rounded-2xl border-2 bg-card text-foreground hover:bg-muted active:scale-95 transition-all text-xl font-bold shadow-sm"
              aria-label="Diminuer de 1 cm"
            >
              <Minus className="h-6 w-6" />
            </button>

            <div className="relative">
              <input
                type="number"
                step="0.5"
                min="0"
                value={currentValue || ""}
                onChange={(e) => updateCurrentValue(parseFloat(e.target.value) || 0)}
                className="w-36 h-20 text-center text-4xl font-extrabold rounded-2xl border-2 border-primary bg-background focus:outline-none focus:ring-4 focus:ring-primary/20 shadow-inner"
              />
              <span className="absolute right-3 bottom-2 text-xs font-bold text-muted-foreground">
                cm
              </span>
            </div>

            <button
              type="button"
              onClick={() => updateCurrentValue(currentValue + 1)}
              className="flex items-center justify-center w-14 h-14 rounded-2xl border-2 bg-card text-foreground hover:bg-muted active:scale-95 transition-all text-xl font-bold shadow-sm"
              aria-label="Augmenter de 1 cm"
            >
              <Plus className="h-6 w-6" />
            </button>
          </div>

          {/* Boutons d'ajustement rapide (+0.5, +2, +5) */}
          <div className="flex items-center justify-center space-x-2 pt-1">
            {[0.5, 1, 2, 5].map((delta) => (
              <button
                key={delta}
                type="button"
                onClick={() => updateCurrentValue(currentValue + delta)}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-muted hover:bg-muted/80 text-foreground transition-colors min-h-[36px]"
              >
                +{delta}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Boutons Précédent & Suivant (≥ 44px - Règle 8) */}
      <div className="flex items-center space-x-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="flex-1 min-h-[52px] text-base"
        >
          <ChevronLeft className="h-5 w-5 mr-1" />
          <span>Précédent</span>
        </Button>

        <Button
          type="button"
          onClick={handleNext}
          className="flex-1 min-h-[52px] text-base font-bold bg-primary"
        >
          <span>{currentIndex === applicableTypes.length - 1 ? "Récapitulatif" : "Suivant"}</span>
          <ChevronRight className="h-5 w-5 ml-1" />
        </Button>
      </div>

      {/* Sauter vers le récapitulatif */}
      <div className="text-center pt-2">
        <button
          type="button"
          onClick={() => setIsReviewStep(true)}
          className="text-xs text-muted-foreground hover:text-foreground underline min-h-[36px]"
        >
          Voir le tableau récapitulatif directement
        </button>
      </div>
    </div>
  );
}
