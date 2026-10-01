"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Client, Order, AppointmentType } from "@/types";
import { dataStore } from "@/lib/data/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";

interface AppointmentFormProps {
  initialClientId?: string;
  clients: Client[];
  orders: Order[];
}

export function AppointmentForm({ initialClientId, clients, orders }: AppointmentFormProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [clientId, setClientId] = useState(initialClientId || clients[0]?.id || "");
  const [orderId, setOrderId] = useState("");
  const [type, setType] = useState<AppointmentType>("essayage");

  // Par défaut demain à 10:00
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDate = tomorrow.toISOString().split("T")[0];
  const [date, setDate] = useState(defaultDate);
  const [time, setTime] = useState("10:00");
  const [durationMin, setDurationMin] = useState(30);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Commandes du client sélectionné
  const clientOrders = orders.filter((o) => o.client_id === clientId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId) {
      toast("Veuillez sélectionner un client", "error");
      return;
    }

    try {
      setIsSubmitting(true);
      const startsAt = new Date(`${date}T${time}:00`).toISOString();

      dataStore.createAppointment({
        client_id: clientId,
        order_id: orderId || null,
        starts_at: startsAt,
        duration_min: durationMin,
        type,
        status: "programme",
        notes: notes.trim() || null,
      });

      toast("Rendez-vous planifié avec succès !");
      router.push("/appointments");
    } catch (e: any) {
      toast(e.message || "Erreur lors de la planification", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Client */}
      <div className="space-y-1.5">
        <Label htmlFor="client_id">Client *</Label>
        <select
          id="client_id"
          value={clientId}
          onChange={(e) => {
            setClientId(e.target.value);
            setOrderId("");
          }}
          className="flex min-h-[44px] h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.first_name} {c.last_name} ({c.phone || "Sans tél"})
            </option>
          ))}
        </select>
      </div>

      {/* Commande rattachée (optionnelle) */}
      {clientOrders.length > 0 && (
        <div className="space-y-1.5">
          <Label htmlFor="order_id">Commande concernée (optionnel)</Label>
          <select
            id="order_id"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            className="flex min-h-[44px] h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">-- Aucune commande spécifique --</option>
            {clientOrders.map((o) => (
              <option key={o.id} value={o.id}>
                Commande #{o.number} - {o.garment_type?.name} ({o.status})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Type de Rendez-vous */}
      <div className="space-y-1.5">
        <Label>Motif du Rendez-vous *</Label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { id: "essayage", label: "Essayage" },
            { id: "mesures", label: "Prise de Mesures" },
            { id: "livraison", label: "Livraison" },
            { id: "retouche", label: "Retouche" },
            { id: "consultation", label: "Choix Tissu / Conseil" },
            { id: "recuperation", label: "Dépôt Tissu" },
            { id: "autre", label: "Autre" },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setType(item.id as AppointmentType)}
              className={`p-2.5 rounded-xl border text-xs font-semibold text-center min-h-[44px] transition-all ${
                type === item.id
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-background text-foreground hover:bg-muted"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Date & Heure */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="date">Date *</Label>
          <Input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="time">Heure de début *</Label>
          <Input
            id="time"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="duration">Durée estimée (minutes)</Label>
          <select
            id="duration"
            value={durationMin}
            onChange={(e) => setDurationMin(parseInt(e.target.value))}
            className="flex min-h-[44px] h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value={15}>15 minutes</option>
            <option value={30}>30 minutes</option>
            <option value={45}>45 minutes</option>
            <option value={60}>1 heure</option>
          </select>
        </div>
      </div>

      {/* Notes / Remarques */}
      <div className="space-y-1.5">
        <Label htmlFor="notes">Remarques ou instructions</Label>
        <Textarea
          id="notes"
          rows={2}
          placeholder="Ex: Prévoir les épingles pour l'ourlet, deuxième essayage de la veste..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <div className="pt-2">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full text-base font-bold min-h-[50px] bg-primary"
        >
          {isSubmitting ? "Planification..." : "Confirmer le Rendez-vous"}
        </Button>
      </div>
    </form>
  );
}
