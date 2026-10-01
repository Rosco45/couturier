"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { clientSchema, ClientFormValues } from "@/lib/validations/client";
import { Client } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Copy } from "lucide-react";

interface ClientFormProps {
  initialData?: Client;
  onSubmit: (values: ClientFormValues) => void;
  isLoading?: boolean;
}

export function ClientForm({ initialData, onSubmit, isLoading = false }: ClientFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema) as any,
    defaultValues: {
      first_name: initialData?.first_name || "",
      last_name: initialData?.last_name || "",
      gender: initialData?.gender || "m",
      birth_date: initialData?.birth_date || "",
      phone: initialData?.phone || "+229 ",
      whatsapp: initialData?.whatsapp || "",
      email: initialData?.email || "",
      address: initialData?.address || "",
      profession: initialData?.profession || "",
      notes: initialData?.notes || "",
    },
  });

  const phoneValue = watch("phone");

  const copyPhoneToWhatsApp = () => {
    setValue("whatsapp", phoneValue);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Genre */}
      <div className="space-y-1.5">
        <Label>Genre *</Label>
        <div className="grid grid-cols-2 gap-3">
          <label className="flex items-center justify-center p-3 rounded-xl border bg-card cursor-pointer min-h-[44px] has-[:checked]:border-primary has-[:checked]:bg-primary/5 has-[:checked]:text-primary transition-all">
            <input
              type="radio"
              value="m"
              {...register("gender")}
              className="sr-only"
            />
            <span className="font-semibold text-sm">Homme</span>
          </label>
          <label className="flex items-center justify-center p-3 rounded-xl border bg-card cursor-pointer min-h-[44px] has-[:checked]:border-primary has-[:checked]:bg-primary/5 has-[:checked]:text-primary transition-all">
            <input
              type="radio"
              value="f"
              {...register("gender")}
              className="sr-only"
            />
            <span className="font-semibold text-sm">Femme</span>
          </label>
        </div>
        {errors.gender && (
          <p className="text-xs text-destructive">{errors.gender.message}</p>
        )}
      </div>

      {/* Prénom & Nom */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="first_name">Prénom *</Label>
          <Input
            id="first_name"
            placeholder="Ex: Koffi, Fifamè..."
            {...register("first_name")}
          />
          {errors.first_name && (
            <p className="text-xs text-destructive">{errors.first_name.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="last_name">Nom de famille *</Label>
          <Input
            id="last_name"
            placeholder="Ex: Agbessi, Houessou..."
            {...register("last_name")}
          />
          {errors.last_name && (
            <p className="text-xs text-destructive">{errors.last_name.message}</p>
          )}
        </div>
      </div>

      {/* Téléphone & WhatsApp */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="phone">Téléphone d&apos;appel *</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="+229 97 00 00 00"
            {...register("phone")}
          />
          {errors.phone && (
            <p className="text-xs text-destructive">{errors.phone.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="whatsapp">WhatsApp</Label>
            <button
              type="button"
              onClick={copyPhoneToWhatsApp}
              className="text-xs text-primary hover:underline flex items-center min-h-[30px]"
            >
              <Copy className="h-3 w-3 mr-1" /> Même numéro
            </button>
          </div>
          <Input
            id="whatsapp"
            type="tel"
            placeholder="+229 97 00 00 00"
            {...register("whatsapp")}
          />
        </div>
      </div>

      {/* Adresse & Profession */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="address">Quartier / Adresse (Cotonou, etc.)</Label>
          <Input
            id="address"
            placeholder="Ex: Haie Vive, Cadjèhoun, Calavi..."
            {...register("address")}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="profession">Profession</Label>
          <Input
            id="profession"
            placeholder="Ex: Commerçant, Magistrat, Enseignant..."
            {...register("profession")}
          />
        </div>
      </div>

      {/* Email & Date de naissance */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="client@domaine.com"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="birth_date">Date de naissance</Label>
          <Input id="birth_date" type="date" {...register("birth_date")} />
        </div>
      </div>

      {/* Notes particulières */}
      <div className="space-y-1.5">
        <Label htmlFor="notes">Notes & Préférences de coupe</Label>
        <Textarea
          id="notes"
          rows={3}
          placeholder="Ex: Habitudes vestimentaires, exigences de doublure, col préféré..."
          {...register("notes")}
        />
      </div>

      <div className="pt-2">
        <Button
          type="submit"
          className="w-full text-base font-semibold min-h-[48px]"
          disabled={isLoading}
        >
          {isLoading
            ? "Enregistrement..."
            : initialData
            ? "Mettre à jour le Client"
            : "Enregistrer le Nouveau Client"}
        </Button>
      </div>
    </form>
  );
}
