"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Search,
  UserPlus,
  MessageSquare,
  Phone,
  FileSpreadsheet,
  ChevronRight,
  User,
  Archive,
} from "lucide-react";
import { Client } from "@/types";
import { dataStore } from "@/lib/data/store";
import { exportClientsToExcel } from "@/lib/excel";
import { formatWestAfricanPhone } from "@/lib/whatsapp";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { formatDate } from "@/lib/utils";

interface ClientListProps {
  initialClients: Client[];
}

export function ClientList({ initialClients }: ClientListProps) {
  const { toast } = useToast();
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [search, setSearch] = useState("");
  const [filterArchived, setFilterArchived] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const filteredClients = clients
    .filter((c) => (filterArchived ? !!c.archived_at : !c.archived_at))
    .filter((c) => {
      const q = search.toLowerCase().trim();
      if (!q) return true;
      return (
        `${c.first_name} ${c.last_name}`.toLowerCase().includes(q) ||
        (c.phone && c.phone.includes(q)) ||
        (c.whatsapp && c.whatsapp.includes(q)) ||
        (c.address && c.address.toLowerCase().includes(q))
      );
    });

  const handleExportExcel = async () => {
    try {
      setIsExporting(true);
      const workshop = dataStore.getWorkshop();
      await exportClientsToExcel(filteredClients, workshop.name);
      toast("Export Excel des clients téléchargé avec succès !");
    } catch (e) {
      toast("Erreur lors de l'export Excel", "error");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* En-tête avec titre et bouton Créer */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Répertoire Clients</h2>
          <p className="text-xs text-muted-foreground">
            {clients.length} client(s) enregistrés dans l&apos;atelier
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportExcel}
            disabled={isExporting || filteredClients.length === 0}
            className="hidden sm:inline-flex min-h-[44px]"
            title="Exporter vers Excel"
          >
            <FileSpreadsheet className="h-4 w-4 mr-1 text-emerald-600" />
            <span>Excel</span>
          </Button>

          <Link href="/clients/new">
            <Button size="sm" className="space-x-1.5 min-h-[44px]">
              <UserPlus className="h-4 w-4" />
              <span>Nouveau</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Barre de Recherche Instantanée & Filtres */}
      <div className="space-y-2.5">
        <div className="relative">
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Rechercher par nom, téléphone, quartier..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-11 text-base bg-card"
          />
        </div>

        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setFilterArchived(false)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors min-h-[36px] ${
                !filterArchived
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              Actifs ({clients.filter((c) => !c.archived_at).length})
            </button>
            <button
              onClick={() => setFilterArchived(true)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors min-h-[36px] flex items-center space-x-1 ${
                filterArchived
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              <Archive className="h-3.5 w-3.5 mr-1" />
              <span>Archivés ({clients.filter((c) => !!c.archived_at).length})</span>
            </button>
          </div>

          <button
            onClick={handleExportExcel}
            className="sm:hidden text-primary font-medium flex items-center min-h-[36px]"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 mr-1 text-emerald-600" />
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      {/* Liste des Cartes Clients */}
      {filteredClients.length === 0 ? (
        <div className="text-center py-12 border rounded-xl bg-card p-6">
          <User className="h-10 w-10 mx-auto text-muted-foreground/50 mb-2" />
          <p className="font-semibold text-base">Aucun client trouvé</p>
          <p className="text-xs text-muted-foreground mt-1">
            {search
              ? "Modifiez votre recherche ou ajoutez un nouveau client."
              : "Commencez par ajouter votre premier client."}
          </p>
          {!search && (
            <Link href="/clients/new" className="inline-block mt-4">
              <Button size="sm">
                <UserPlus className="h-4 w-4 mr-1.5" /> Ajouter un client
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-2.5">
          {filteredClients.map((client) => {
            const cleanPhone = formatWestAfricanPhone(client.whatsapp || client.phone);
            const waUrl = cleanPhone
              ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                  `Bonjour ${client.first_name}, atelier de couture à votre écoute !`
                )}`
              : null;

            return (
              <div
                key={client.id}
                className="flex items-center justify-between p-3.5 rounded-xl border bg-card hover:bg-muted/40 transition-colors shadow-sm min-h-[64px]"
              >
                <Link
                  href={`/clients/${client.id}`}
                  className="flex items-center space-x-3.5 flex-1 min-w-0"
                >
                  <div
                    className={`flex items-center justify-center w-11 h-11 rounded-full text-sm font-bold shrink-0 ${
                      client.gender === "f"
                        ? "bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300"
                        : "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                    }`}
                  >
                    {client.first_name.charAt(0)}
                    {client.last_name.charAt(0)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-sm truncate text-foreground">
                        {client.first_name} {client.last_name}
                      </span>
                      <Badge variant="outline" className="text-[10px] py-0 px-1 shrink-0">
                        {client.gender === "m" ? "H" : "F"}
                      </Badge>
                      {client.archived_at && (
                        <Badge variant="secondary" className="text-[10px] py-0 px-1 shrink-0">
                          Archivé
                        </Badge>
                      )}
                    </div>

                    <div className="text-xs text-muted-foreground flex items-center space-x-2 mt-0.5">
                      <span className="truncate">{client.phone || "Sans tél"}</span>
                      {client.address && (
                        <>
                          <span>•</span>
                          <span className="truncate">{client.address}</span>
                        </>
                      )}
                    </div>
                  </div>
                </Link>

                {/* Boutons d'Action Rapide Téléphone / WhatsApp */}
                <div className="flex items-center space-x-1 shrink-0 ml-2">
                  {client.phone && (
                    <a
                      href={`tel:${client.phone}`}
                      className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors min-h-[44px] min-w-[44px]"
                      title="Appeler"
                    >
                      <Phone className="h-4.5 w-4.5" />
                    </a>
                  )}

                  {waUrl && (
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center w-10 h-10 rounded-full bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 transition-colors min-h-[44px] min-w-[44px]"
                      title="WhatsApp direct"
                    >
                      <MessageSquare className="h-4.5 w-4.5" />
                    </a>
                  )}

                  <Link
                    href={`/clients/${client.id}`}
                    className="flex items-center justify-center w-8 h-8 text-muted-foreground hover:text-foreground"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
