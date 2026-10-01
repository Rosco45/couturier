import React from "react";
import Link from "next/link";
import { Calendar, Clock, MessageSquare, ArrowRight, CheckCircle2 } from "lucide-react";
import { Appointment } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { generateWhatsAppUrl } from "@/lib/whatsapp";

interface TodayAppointmentsProps {
  appointments: Appointment[];
}

export function TodayAppointments({ appointments }: TodayAppointmentsProps) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-base flex items-center space-x-2">
          <Calendar className="h-4.5 w-4.5 text-primary" />
          <span>Rendez-vous du jour ({appointments.length})</span>
        </CardTitle>
        <Link
          href="/appointments"
          className="text-xs text-primary hover:underline font-medium flex items-center"
        >
          Voir calendrier <ArrowRight className="h-3 w-3 ml-0.5" />
        </Link>
      </CardHeader>

      <CardContent className="p-4 pt-2">
        {appointments.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground text-sm">
            <CheckCircle2 className="h-8 w-8 mx-auto text-emerald-500/70 mb-1.5" />
            Aucun rendez-vous planifié pour aujourd&apos;hui.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {appointments.map((apt) => {
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
                  className="py-3 flex items-center justify-between gap-2"
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary shrink-0">
                      <Clock className="h-4 w-4 mb-0.5" />
                      <span className="text-xs font-bold leading-none">{timeStr}</span>
                    </div>

                    <div>
                      <div className="font-semibold text-sm">
                        {apt.client ? (
                          <Link
                            href={`/clients/${apt.client.id}`}
                            className="hover:text-primary transition-colors"
                          >
                            {apt.client.first_name} {apt.client.last_name}
                          </Link>
                        ) : (
                          "Client non assigné"
                        )}
                      </div>
                      <div className="flex items-center space-x-2 mt-0.5 text-xs text-muted-foreground">
                        <Badge variant="outline" className="capitalize text-[10px] py-0 px-1.5">
                          {apt.type}
                        </Badge>
                        <span>• {apt.duration_min} min</span>
                        {apt.order && (
                          <span>• Commande #{apt.order.number}</span>
                        )}
                      </div>
                      {apt.notes && (
                        <p className="text-[11px] text-muted-foreground italic mt-0.5 line-clamp-1">
                          {apt.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  {waUrl && (
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 transition-colors shrink-0"
                      title="Envoyer rappel WhatsApp"
                    >
                      <MessageSquare className="h-4.5 w-4.5" />
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
