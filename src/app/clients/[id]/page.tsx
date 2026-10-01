"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { dataStore } from "@/lib/data/store";
import { ClientDetailTabs } from "@/components/clients/ClientDetailTabs";

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params?.id as string;

  const [client, setClient] = useState<any>(null);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [measurementTypes, setMeasurementTypes] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);

  const loadData = React.useCallback(() => {
    if (!clientId) return;
    const c = dataStore.getClientById(clientId);
    if (!c) {
      router.push("/clients");
      return;
    }
    setClient(c);
    setProfiles(dataStore.getMeasurementProfilesByClient(clientId));
    setMeasurementTypes(dataStore.getMeasurementTypes());
    setOrders(dataStore.getOrdersByClient(clientId));
    setAppointments(dataStore.getAppointmentsByClient(clientId));
    setPayments(dataStore.getPaymentsByClient(clientId));
    setNotes(dataStore.getNotesByClient(clientId));
    setLogs(dataStore.getActivityLogs(clientId));
  }, [clientId, router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (!client) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Link
          href="/clients"
          className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors min-h-[44px] min-w-[44px]"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <span className="text-sm text-muted-foreground">Retour à la liste des clients</span>
      </div>

      <ClientDetailTabs
        client={client}
        profiles={profiles}
        measurementTypes={measurementTypes}
        orders={orders}
        appointments={appointments}
        payments={payments}
        notes={notes}
        logs={logs}
        onRefresh={loadData}
      />
    </div>
  );
}
