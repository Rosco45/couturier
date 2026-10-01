"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  MessageSquare,
  Plus,
  Phone,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Appointment, AppointmentStatus, AppointmentType } from "@/types";
import { dataStore } from "@/lib/data/store";
import { formatCurrency, formatDate } from "@/lib/utils";
import { generateWhatsAppUrl, formatWestAfricanPhone } from "@/lib/whatsapp";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";

interface AppointmentListProps {
  initialAppointments: Appointment[];
  onRefresh?: () => void;
}

export function AppointmentList({ initialAppointments, onRefresh }: AppointmentListProps) {
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [filterType, setFilterType] = useState<string>("all");

  const handleUpdateStatus = (id: string, status: AppointmentStatus) => {
    try {
      dataStore.updateAppointment(id, { status });
      toast(`Rendez-vous marqué comme : ${status}`);
      if (onRefresh) onRefresh();
    } catch (e: any) {
      toast(e.message || "Erreur", "error");
    }
  };

  const filtered = appointments.filter((a) => {
    if (filterType !== "all" && a.type !== filterType) return false;
    return true;
  });

  return (
    <div className="space-y-3">
      {/* Filtres de Type de RDV */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
        {["all", "essayage", "mesures", "livraison", "retouche"].map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors min-h-[38px] ${
              filterType === type
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {type === "all" ? "Tous les RDV" : type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 border rounded-xl bg-card p-6">
          <Calendar className="h-10 w-10 mx-auto text-muted-foreground/50 mb-2" />
          <p className="font-semibold text-base">Aucun rendez-vous trouvé</p>
        </div>
      ) : (
        <div className="grid gap-2.5">
          {filtered.map((apt) => {
            const dateObj = new Date(apt.starts_at);
            const timeStr = dateObj.toLocaleTimeString("fr-FR", {
              hour: "2-digit",
              minute: "2-digit",
            });

            const waUrl = apt.client
              ? generateWhatsAppUrl("rdv", {
                  phone: apt.client.whatsapp || apt.client.phone,
                  prenom: apt.client.first_name,
                  date: apt.starts_at,
                })
              : null;

            return (
              <div
                key={apt.id}
                className="p-3.5 rounded-xl border bg-card hover:bg-muted/30 transition-all shadow-sm flex items-start justify-between gap-3 min-h-[64px]"
              >
                <div className="flex items-start space-x-3 flex-1 min-w-0">
                  <div className="flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary font-bold shrink-0">
                    <span className="text-xs uppercase leading-none">
                      {dateObj.toLocaleDateString("fr-FR", { month: "short" })}
                    </span>
                    <span className="text-base leading-none mt-1">
                      {dateObj.getDate()}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-sm text-foreground truncate">
                        {apt.client?.first_name} {apt.client?.last_name}
                      </span>
                      <Badge variant="outline" className="capitalize text-[10px] py-0 px-1.5 shrink-0">
                        {apt.type}
                      </Badge>
                    </div>

                    <div className="text-xs text-muted-foreground mt-0.5 flex items-center space-x-2">
                      <Clock className="h-3 w-3 inline mr-0.5" />
                      <span>{timeStr} ({apt.duration_min} min)</span>
                      {apt.order && <span>• Cmd #{apt.order.number}</span>}
                    </div>

                    {apt.notes && (
                      <p className="text-[11px] text-muted-foreground italic mt-1 line-clamp-1">
                        {apt.notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions : WhatsApp, Appel & Validation */}
                <div className="flex items-center space-x-1 shrink-0">
                  {waUrl && (
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center w-10 h-10 rounded-full bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 transition-colors min-h-[44px] min-w-[44px]"
                      title="Envoyer rappel WhatsApp"
                    >
                      <MessageSquare className="h-4.5 w-4.5" />
                    </a>
                  )}

                  {apt.status === "programme" && (
                    <button
                      onClick={() => handleUpdateStatus(apt.id, "honore")}
                      className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-emerald-50 text-emerald-600 transition-colors min-h-[44px] min-w-[44px]"
                      title="Marquer comme honoré"
                    >
                      <CheckCircle2 className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
