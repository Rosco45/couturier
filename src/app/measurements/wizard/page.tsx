"use client";

import React, { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, UserPlus, Search } from "lucide-react";
import { dataStore } from "@/lib/data/store";
import { Client, MeasurementType, MeasurementProfile } from "@/types";
import { MeasurementWizard } from "@/components/measurements/MeasurementWizard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function MeasurementWizardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const clientId = searchParams.get("client_id");
  const kind = (searchParams.get("kind") as "standard" | "custom") || "standard";
  const parentId = searchParams.get("parent_id");

  const [client, setClient] = useState<Client | null>(null);
  const [types, setTypes] = useState<MeasurementType[]>([]);
  const [previousProfile, setPreviousProfile] = useState<MeasurementProfile | undefined>(undefined);
  const [clientSearch, setClientSearch] = useState("");
  const [allClients, setAllClients] = useState<Client[]>([]);

  useEffect(() => {
    setTypes(dataStore.getMeasurementTypes());
    setAllClients(dataStore.getClients(false));

    if (clientId) {
      const c = dataStore.getClientById(clientId);
      if (c) {
        setClient(c);
        const existingProfiles = dataStore.getMeasurementProfilesByClient(clientId);
        if (existingProfiles.length > 0) {
          setPreviousProfile(existingProfiles[0]); // Dernière version pour pré-remplir
        }
      }
    }
  }, [clientId]);

  // Si aucun client n'est sélectionné, inviter à en choisir un ou en créer un
  if (!client) {
    const filtered = allClients.filter((c) => {
      const q = clientSearch.toLowerCase().trim();
      if (!q) return true;
      return (
        `${c.first_name} ${c.last_name}`.toLowerCase().includes(q) ||
        (c.phone && c.phone.includes(q))
      );
    });

    return (
      <div className="max-w-md mx-auto space-y-4 animate-in fade-in">
        <div className="flex items-center space-x-2">
          <Link
            href="/clients"
            className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors min-h-[44px] min-w-[44px]"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h2 className="text-xl font-bold">Sélectionner un Client</h2>
            <p className="text-xs text-muted-foreground">
              Pour qui souhaitez-vous prendre les mesures ?
            </p>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Rechercher par nom ou téléphone..."
            value={clientSearch}
            onChange={(e) => setClientSearch(e.target.value)}
            className="pl-10 h-11 text-base bg-card"
          />
        </div>

        <div className="grid gap-2">
          {filtered.map((c) => (
            <button
              key={c.id}
              onClick={() => router.push(`/measurements/wizard?client_id=${c.id}`)}
              className="p-3.5 rounded-xl border bg-card hover:bg-muted/50 text-left flex items-center justify-between min-h-[56px] transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-sm">
                  {c.first_name.charAt(0)}
                  {c.last_name.charAt(0)}
                </div>
                <div>
                  <div className="font-semibold text-sm">
                    {c.first_name} {c.last_name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {c.gender === "m" ? "Homme" : "Femme"} • {c.phone || "Pas de tél"}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="pt-2 text-center">
          <Link href="/clients/new">
            <Button variant="outline" className="w-full min-h-[48px]">
              <UserPlus className="h-4 w-4 mr-2" />
              <span>Créer un nouveau client d&apos;abord</span>
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Link
          href={`/clients/${client.id}`}
          className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors min-h-[44px] min-w-[44px]"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h2 className="text-lg font-bold">
            Prise de Mesures : {client.first_name} {client.last_name}
          </h2>
          <p className="text-xs text-muted-foreground">
            {previousProfile
              ? `Nouvelle version (v${previousProfile.version + 1}) avec valeurs précédentes préremplies`
              : "Première prise de mesures (Version 1)"}
          </p>
        </div>
      </div>

      <MeasurementWizard
        client={client}
        previousProfile={previousProfile}
        types={types}
        kind={kind}
        parentId={parentId}
      />
    </div>
  );
}

export default function MeasurementWizardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      }
    >
      <MeasurementWizardContent />
    </Suspense>
  );
}
