"use client";

import React, { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import { Appointment } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { generateWhatsAppUrl } from "@/lib/whatsapp";
import { MessageSquare, Clock, User, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface AppointmentCalendarProps {
  appointments: Appointment[];
  onSelectDate?: (dateStr: string) => void;
  onAppointmentClick?: (apt: Appointment) => void;
}

export function AppointmentCalendar({
  appointments,
  onSelectDate,
  onAppointmentClick,
}: AppointmentCalendarProps) {
  const [selectedApt, setSelectedApt] = useState<Appointment | null>(null);

  const events = appointments.map((a) => {
    let color = "#c85a32"; // default terracotta
    if (a.type === "essayage") color = "#8b5cf6"; // purple
    if (a.type === "livraison") color = "#0d9488"; // teal
    if (a.type === "mesures") color = "#eab308"; // amber
    if (a.type === "retouche") color = "#f97316"; // orange

    const endDate = new Date(new Date(a.starts_at).getTime() + a.duration_min * 60000);

    return {
      id: a.id,
      title: `${a.type.toUpperCase()} - ${a.client?.first_name || ""} ${a.client?.last_name || ""}`,
      start: a.starts_at,
      end: endDate.toISOString(),
      backgroundColor: color,
      borderColor: color,
      extendedProps: { appointment: a },
    };
  });

  const handleEventClick = (info: any) => {
    const apt = info.event.extendedProps.appointment as Appointment;
    setSelectedApt(apt);
    if (onAppointmentClick) onAppointmentClick(apt);
  };

  const handleDateClick = (info: any) => {
    if (onSelectDate) onSelectDate(info.dateStr);
  };

  const waUrl = selectedApt?.client
    ? generateWhatsAppUrl("rdv", {
        phone: selectedApt.client.whatsapp || selectedApt.client.phone,
        prenom: selectedApt.client.first_name,
        date: selectedApt.starts_at,
      })
    : null;

  return (
    <div className="space-y-4">
      <Card className="shadow-sm overflow-hidden p-2 sm:p-4 bg-card">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin] as any}
          initialView="dayGridMonth"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,listWeek",
          }}
          locale="fr"
          buttonText={{
            today: "Aujourd'hui",
            month: "Mois",
            week: "Semaine",
            day: "Jour",
            list: "Liste",
          }}
          events={events}
          eventClick={handleEventClick}
          dateClick={handleDateClick}
          height="auto"
          aspectRatio={1.3}
          editable={false}
          selectable={true}
        />
      </Card>

      {/* Détail du RDV sélectionné */}
      {selectedApt && (
        <Card className="border-l-4 border-l-primary shadow-md p-4 animate-in fade-in">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="capitalize text-xs font-bold">
                  {selectedApt.type}
                </Badge>
                <Badge variant="secondary" className="capitalize text-xs">
                  {selectedApt.status}
                </Badge>
              </div>

              <h4 className="text-base font-bold text-foreground">
                {selectedApt.client?.first_name} {selectedApt.client?.last_name}
              </h4>

              <div className="text-xs text-muted-foreground flex items-center space-x-2">
                <Clock className="h-3.5 w-3.5" />
                <span>
                  {formatDate(selectedApt.starts_at)} à{" "}
                  {new Date(selectedApt.starts_at).toLocaleTimeString("fr-FR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}{" "}
                  ({selectedApt.duration_min} min)
                </span>
              </div>

              {selectedApt.notes && (
                <p className="text-xs italic text-muted-foreground mt-1">
                  Note : {selectedApt.notes}
                </p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              {waUrl && (
                <a href={waUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="whatsapp" size="sm" className="min-h-[40px]">
                    <MessageSquare className="h-4 w-4 mr-1" />
                    <span>WhatsApp</span>
                  </Button>
                </a>
              )}
              <button
                onClick={() => setSelectedApt(null)}
                className="p-1.5 rounded-full hover:bg-muted text-muted-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
