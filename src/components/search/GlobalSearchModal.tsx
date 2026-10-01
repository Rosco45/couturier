"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, User, Scissors, Calendar, ArrowRight, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { dataStore } from "@/lib/data/store";
import { formatCurrency, formatDate } from "@/lib/utils";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GlobalSearchModal({ isOpen, onClose }: GlobalSearchModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{
    clients: any[];
    orders: any[];
    appointments: any[];
  }>({ clients: [], orders: [], appointments: [] });

  useEffect(() => {
    if (query.trim().length > 0) {
      const searchRes = dataStore.globalSearch(query);
      setResults(searchRes);
    } else {
      setResults({ clients: [], orders: [], appointments: [] });
    }
  }, [query]);

  const handleSelect = (url: string) => {
    onClose();
    router.push(url);
  };

  const hasResults =
    results.clients.length > 0 ||
    results.orders.length > 0 ||
    results.appointments.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md p-4">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-base">
            <Search className="h-5 w-5 text-primary" />
            <span>Recherche globale rapide</span>
          </DialogTitle>
        </DialogHeader>

        <div className="relative mt-2">
          <Input
            autoFocus
            type="search"
            placeholder="Nom, tél, n° commande (#1), RDV..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 pr-4 text-base"
          />
          <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="mt-3 max-h-[60vh] overflow-y-auto space-y-4">
          {query.trim().length > 0 && !hasResults && (
            <div className="text-center py-8 text-sm text-muted-foreground">
              Aucun résultat trouvé pour &quot;{query}&quot;
            </div>
          )}

          {/* Section Clients */}
          {results.clients.length > 0 && (
            <div>
              <div className="text-xs font-semibold uppercase text-muted-foreground tracking-wider mb-2 flex items-center space-x-1">
                <User className="h-3.5 w-3.5" />
                <span>Clients ({results.clients.length})</span>
              </div>
              <div className="space-y-1.5">
                {results.clients.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => handleSelect(`/clients/${c.id}`)}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg border bg-card hover:bg-accent/50 text-left min-h-[44px] transition-colors"
                  >
                    <div>
                      <div className="font-medium text-sm">
                        {c.first_name} {c.last_name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {c.phone || "Pas de téléphone"} {c.address ? `• ${c.address}` : ""}
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Section Commandes */}
          {results.orders.length > 0 && (
            <div>
              <div className="text-xs font-semibold uppercase text-muted-foreground tracking-wider mb-2 flex items-center space-x-1">
                <Scissors className="h-3.5 w-3.5" />
                <span>Commandes ({results.orders.length})</span>
              </div>
              <div className="space-y-1.5">
                {results.orders.map((o) => (
                  <button
                    key={o.id}
                    onClick={() => handleSelect(`/orders/${o.id}`)}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg border bg-card hover:bg-accent/50 text-left min-h-[44px] transition-colors"
                  >
                    <div>
                      <div className="font-medium text-sm flex items-center space-x-2">
                        <span>Commande #{o.number}</span>
                        <OrderStatusBadge status={o.status} size="sm" />
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {o.client?.first_name} {o.client?.last_name} • {o.garment_type?.name}
                      </div>
                      <div className="text-xs font-semibold text-primary mt-0.5">
                        {formatCurrency(o.price)}
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Section Rendez-vous */}
          {results.appointments.length > 0 && (
            <div>
              <div className="text-xs font-semibold uppercase text-muted-foreground tracking-wider mb-2 flex items-center space-x-1">
                <Calendar className="h-3.5 w-3.5" />
                <span>Rendez-vous ({results.appointments.length})</span>
              </div>
              <div className="space-y-1.5">
                {results.appointments.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => handleSelect(`/appointments`)}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg border bg-card hover:bg-accent/50 text-left min-h-[44px] transition-colors"
                  >
                    <div>
                      <div className="font-medium text-sm">
                        RDV {a.type} • {a.client?.first_name} {a.client?.last_name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatDate(a.starts_at)} à {new Date(a.starts_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
