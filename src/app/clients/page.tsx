"use client";

import React, { useState, useEffect } from "react";
import { dataStore } from "@/lib/data/store";
import { ClientList } from "@/components/clients/ClientList";

export default function ClientsPage() {
  const [clients, setClients] = useState<any[]>([]);

  useEffect(() => {
    setClients(dataStore.getClients(false).concat(dataStore.getClients(true)));
  }, []);

  return <ClientList initialClients={clients} />;
}
