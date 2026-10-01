"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { orderSchema, OrderFormValues } from "@/lib/validations/order";
import { Client, GarmentType, MeasurementProfile, OrderStatus } from "@/types";
import { dataStore } from "@/lib/data/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { formatDate } from "@/lib/utils";
import { Ruler, Sparkles, PlusCircle } from "lucide-react";

interface OrderFormProps {
  initialClientId?: string;
  clients: Client[];
  garmentTypes: GarmentType[];
}

export function OrderForm({ initialClientId, clients, garmentTypes }: OrderFormProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [selectedClientId, setSelectedClientId] = useState<string>(initialClientId || clients[0]?.id || "");
  const [profiles, setProfiles] = useState<MeasurementProfile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Charger les profils du client sélectionné
  useEffect(() => {
    if (selectedClientId) {
      const p = dataStore.getMeasurementProfilesByClient(selectedClientId);
      setProfiles(p);
    } else {
      setProfiles([]);
    }
  }, [selectedClientId]);

  // Date par défaut : dans 7 jours
  const defaultDueDate = new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0];

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema) as any,
    defaultValues: {
      client_id: selectedClientId,
      garment_type_id: garmentTypes[0]?.id || "",
      model: "",
      description: "",
      color: "",
      fabric: "",
      quantity: 1,
      price: 25000,
      due_date: defaultDueDate,
      status: "nouvelle",
      measurement_choice: "latest",
      measurement_profile_id: "",
      notes: "",
    },
  });

  const measurementChoice = watch("measurement_choice");
  const latestProfile = profiles[0];

  const handleClientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedClientId(val);
    setValue("client_id", val);
  };

  const onSubmit = async (values: OrderFormValues) => {
    try {
      setIsSubmitting(true);

      let targetProfileId: string;

      // CHOIX (a) : Dernière version
      if (values.measurement_choice === "latest") {
        if (!latestProfile) {
          toast(
            "Ce client n'a pas encore de profil de mesures. Choisissez 'Nouvelle prise' !",
            "error"
          );
          setIsSubmitting(false);
          return;
        }
        targetProfileId = latestProfile.id;
      }
      // CHOIX (b) : Nouvelle prise de mesures
      else if (values.measurement_choice === "new") {
        // Redirige vers le wizard avec retour vers la commande
        router.push(`/measurements/wizard?client_id=${values.client_id}`);
        return;
      }
      // CHOIX (c) : Personnalisation pour cette commande (kind='custom')
      else {
        if (!latestProfile) {
          toast("Aucun profil existant à personnaliser pour ce client.", "error");
          setIsSubmitting(false);
          return;
        }
        // Créer une copie personnalisée liée à parent_id avec kind='custom'
        const customProfile = dataStore.createMeasurementProfileVersion(
          values.client_id,
          { ...latestProfile.measurements },
          `Ajustement pour commande ${values.model || ""}`,
          "custom",
          latestProfile.id
        );
        targetProfileId = customProfile.id;
      }

      // Création de la commande
      const newOrder = dataStore.createOrder({
        client_id: values.client_id,
        garment_type_id: values.garment_type_id,
        model: values.model || null,
        description: values.description || null,
        color: values.color || null,
        fabric: values.fabric || null,
        quantity: values.quantity,
        price: values.price,
        due_date: values.due_date,
        status: values.status,
        measurement_profile_id: targetProfileId,
        notes: values.notes || null,
      });

      toast(`Commande #${newOrder.number} créée avec succès !`);
      router.push(`/orders/${newOrder.id}`);
    } catch (e: any) {
      toast(e.message || "Erreur lors de la création de commande", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* 1. Sélection Client */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="client_id">Client *</Label>
          <button
            type="button"
            onClick={() => router.push("/clients/new")}
            className="text-xs text-primary font-medium hover:underline flex items-center"
          >
            <PlusCircle className="h-3.5 w-3.5 mr-1" /> Nouveau client
          </button>
        </div>
        <select
          id="client_id"
          value={selectedClientId}
          onChange={handleClientChange}
          className="flex min-h-[44px] h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.first_name} {c.last_name} ({c.phone || "Sans tél"})
            </option>
          ))}
        </select>
        {errors.client_id && (
          <p className="text-xs text-destructive">{errors.client_id.message}</p>
        )}
      </div>

      {/* 2. CHOIX DES MENSURATIONS (RÈGLE FONDAMENTALE 3) */}
      <Card className="border-2 border-primary/20 bg-card">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center space-x-2">
            <Ruler className="h-4.5 w-4.5 text-primary" />
            <h3 className="font-bold text-sm">
              Mensurations à associer (Règle Immuable) *
            </h3>
          </div>

          <div className="grid gap-2">
            {/* Choix (a) : Dernière version */}
            <label className="flex items-start space-x-3 p-3 rounded-xl border bg-background cursor-pointer hover:bg-muted/40 has-[:checked]:border-primary has-[:checked]:bg-primary/5 transition-all min-h-[50px]">
              <input
                type="radio"
                value="latest"
                {...register("measurement_choice")}
                className="mt-1"
              />
              <div className="text-xs">
                <span className="font-bold block text-foreground">
                  (a) Utiliser la dernière version standard
                </span>
                {latestProfile ? (
                  <span className="text-muted-foreground">
                    Version {latestProfile.version} prise le {formatDate(latestProfile.taken_at)}
                  </span>
                ) : (
                  <span className="text-amber-600 font-medium">
                    Aucune mesure enregistrée pour ce client
                  </span>
                )}
              </div>
            </label>

            {/* Choix (b) : Nouvelle prise de mesures */}
            <label className="flex items-start space-x-3 p-3 rounded-xl border bg-background cursor-pointer hover:bg-muted/40 has-[:checked]:border-primary has-[:checked]:bg-primary/5 transition-all min-h-[50px]">
              <input
                type="radio"
                value="new"
                {...register("measurement_choice")}
                className="mt-1"
              />
              <div className="text-xs">
                <span className="font-bold block text-foreground">
                  (b) Nouvelle prise de mesures (Version {latestProfile ? latestProfile.version + 1 : 1})
                </span>
                <span className="text-muted-foreground">
                  Lance le Wizard tactile avant d&apos;enregistrer la commande
                </span>
              </div>
            </label>

            {/* Choix (c) : Personnalisation rapide */}
            <label className="flex items-start space-x-3 p-3 rounded-xl border bg-background cursor-pointer hover:bg-muted/40 has-[:checked]:border-primary has-[:checked]:bg-primary/5 transition-all min-h-[50px]">
              <input
                type="radio"
                value="custom"
                {...register("measurement_choice")}
                className="mt-1"
              />
              <div className="text-xs">
                <span className="font-bold block text-foreground flex items-center space-x-1">
                  <span>(c) Personnalisation pour cette commande</span>
                  <Sparkles className="h-3 w-3 text-amber-500" />
                </span>
                <span className="text-muted-foreground">
                  Copie isolée (kind=&apos;custom&apos;) sans modifier les mesures habituelles du client
                </span>
              </div>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* 3. Vêtement & Modèle */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="garment_type_id">Type de Vêtement *</Label>
          <select
            id="garment_type_id"
            {...register("garment_type_id")}
            className="flex min-h-[44px] h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {garmentTypes.map((gt) => (
              <option key={gt.id} value={gt.id}>
                {gt.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="model">Nom du modèle</Label>
          <Input
            id="model"
            placeholder="Ex: Grand Boubou Brodé, Veste Col Châle..."
            {...register("model")}
          />
        </div>
      </div>

      {/* 4. Tissu & Couleur */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="fabric">Tissu apporté / fourni</Label>
          <Input
            id="fabric"
            placeholder="Ex: Bazin Riche Getzner, Wax Vlisco 6 yards, Lin..."
            {...register("fabric")}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="color">Couleur & Motifs</Label>
          <Input
            id="color"
            placeholder="Ex: Bleu nuit broderie or, Jaune moutarde..."
            {...register("color")}
          />
        </div>
      </div>

      {/* 5. Prix en FCFA (Règle 7) & Quantité */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="price">Prix Convenu (Entier en FCFA) *</Label>
          <div className="relative">
            <Input
              id="price"
              type="number"
              step="500"
              min="0"
              className="pr-16 text-base font-bold text-foreground"
              {...register("price", { valueAsNumber: true })}
            />
            <span className="absolute right-3 top-3 text-xs font-bold text-primary">
              FCFA
            </span>
          </div>
          {errors.price && (
            <p className="text-xs text-destructive">{errors.price.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="quantity">Quantité</Label>
          <Input
            id="quantity"
            type="number"
            min="1"
            {...register("quantity", { valueAsNumber: true })}
          />
        </div>
      </div>

      {/* 6. Date de livraison & Statut initial */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="due_date">Date de livraison promise *</Label>
          <Input id="due_date" type="date" {...register("due_date")} />
          {errors.due_date && (
            <p className="text-xs text-destructive">{errors.due_date.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="status">Statut initial</Label>
          <select
            id="status"
            {...register("status")}
            className="flex min-h-[44px] h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="nouvelle">Nouvelle</option>
            <option value="en_attente">En attente (tissu non encore reçu)</option>
            <option value="tissu_recu">Tissu reçu</option>
            <option value="en_confection">En confection</option>
          </select>
        </div>
      </div>

      {/* 7. Description des finitions & Notes */}
      <div className="space-y-1.5">
        <Label htmlFor="description">Finitions & Détails de coupe</Label>
        <Textarea
          id="description"
          rows={2}
          placeholder="Ex: Doublure en satin, boutons recouverts en tissu, fente latérale de 20cm..."
          {...register("description")}
        />
      </div>

      <div className="pt-2">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full text-base font-bold min-h-[52px]"
        >
          {isSubmitting
            ? "Création en cours..."
            : measurementChoice === "new"
            ? "Passer à la prise de mesures tactile (Wizard)"
            : "Créer la Commande"}
        </Button>
      </div>
    </form>
  );
}
