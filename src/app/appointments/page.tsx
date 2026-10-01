"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Calendar as CalendarIcon, List } from "lucide-react";
import { dataStore } from "@/lib/data/store";
import { AppointmentCalendar } from "@/components/appointments/AppointmentCalendar";
import { AppointmentList } from "@/components/appointments/AppointmentList";
import { Button } from "@/components/ui/button";

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<"calendar" | "list">("list");

  const loadData = () => {
    setAppointments(dataStore.getAppointments());
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Rendez-vous</h2>
          <p className="text-xs text-muted-foreground">
            {appointments.length} rendez-vous planifiés dans l&apos;agenda
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* Toggle Vue Calendrier / Vue Liste */}
          <div className="flex items-center bg-muted p-1 rounded-xl">
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-lg text-xs font-semibold flex items-center space-x-1 min-h-[36px] transition-colors ${
                viewMode === "list"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Vue Liste"
            >
              <List className="h-4 w-4" />
              <span className="hidden sm:inline">Liste</span>
            </button>
            <button
              onClick={() => setViewMode("calendar")}
              className={`p-2 rounded-lg text-xs font-semibold flex items-center space-x-1 min-h-[36px] transition-colors ${
                viewMode === "calendar"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Vue Calendrier"
            >
              <CalendarIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Calendrier</span>
            </button>
          </div>

          <Link href="/appointments/new">
            <Button size="sm" className="space-x-1.5 min-h-[44px]">
              <Plus className="h-4 w-4" />
              <span>Nouveau</span>
            </Button>
          </Link>
        </div>
      </div>

      {viewMode === "calendar" ? (
        <AppointmentCalendar appointments={appointments} />
      ) : (
        <AppointmentList initialAppointments={appointments} onRefresh={loadData} />
      )}
    </div>
  );
}
