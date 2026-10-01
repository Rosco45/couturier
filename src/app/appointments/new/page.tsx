"use client";

import React, { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { dataStore } from "@/lib/data/store";
import { AppointmentForm } from "@/components/appointments/AppointmentForm";
import { Card, CardContent } from "@/components/ui/card";

function NewAppointmentContent() {
  const searchParams = useSearchParams();
  const initialClientId = searchParams.get("client_id") || undefined;

  const [clients, setClients] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    setClients(dataStore.getClients(false));
    setOrders(dataStore.getOrders());
  }, []);

  if (clients.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center space-x-2">
        <Link
          href="/appointments"
          className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors min-h-[44px] min-w-[44px]"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h2 className="text-xl font-bold">Nouveau Rendez-vous</h2>
          <p className="text-xs text-muted-foreground">
            Planifiez un essayage, une prise de mesures ou une livraison
          </p>
        </div>
      </div>

      <Card className="shadow-sm">
        <CardContent className="p-4 md:p-6">
          <AppointmentForm
            initialClientId={initialClientId}
            clients={clients}
            orders={orders}
          />
        </CardContent>
      </Card>
    </div>
  );
}

export default function NewAppointmentPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      }
    >
      <NewAppointmentContent />
    </Suspense>
  );
}
