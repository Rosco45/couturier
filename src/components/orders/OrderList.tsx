"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Search,
  Scissors,
  Plus,
  ClockAlert,
  FileSpreadsheet,
  Calendar,
  ChevronRight,
  Filter,
} from "lucide-react";
import { Order, OrderStatus } from "@/types";
import { dataStore } from "@/lib/data/store";
import { exportOrdersToExcel } from "@/lib/excel";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { OrderStatusBadge, ORDER_STATUS_LABELS } from "./OrderStatusBadge";

interface OrderListProps {
  initialOrders: Order[];
  initialFilter?: string;
}

export function OrderList({ initialOrders, initialFilter = "all" }: OrderListProps) {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>(initialFilter);
  const [isExporting, setIsExporting] = useState(false);

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    try {
      const updated = dataStore.updateOrderStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? updated : o))
      );
      toast(`Statut de la commande #${updated.number} mis à jour : ${ORDER_STATUS_LABELS[newStatus]}`);
    } catch (e: any) {
      toast(e.message || "Erreur de mise à jour", "error");
    }
  };

  const handleExportExcel = async () => {
    try {
      setIsExporting(true);
      const workshop = dataStore.getWorkshop();
      await exportOrdersToExcel(filteredOrders, workshop.name);
      toast("Export Excel des commandes téléchargé !");
    } catch (e) {
      toast("Erreur lors de l'export Excel", "error");
    } finally {
      setIsExporting(false);
    }
  };

  const filteredOrders = orders.filter((o) => {
    // Filtre statut
    if (statusFilter === "in_progress") {
      if (o.status === "livree" || o.status === "annulee") return false;
    } else if (statusFilter === "overdue") {
      if (!o.is_overdue) return false;
    } else if (statusFilter === "ready") {
      if (o.status !== "prete_a_livrer") return false;
    } else if (statusFilter === "delivered") {
      if (o.status !== "livree") return false;
    }

    // Recherche textuelle
    const q = search.toLowerCase().trim();
    if (!q) return true;

    return (
      o.number.toString().includes(q) ||
      (o.client && `${o.client.first_name} ${o.client.last_name}`.toLowerCase().includes(q)) ||
      (o.garment_type && o.garment_type.name.toLowerCase().includes(q)) ||
      (o.model && o.model.toLowerCase().includes(q)) ||
      (o.fabric && o.fabric.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-4">
      {/* En-tête */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Commandes Atelier</h2>
          <p className="text-xs text-muted-foreground">
            {orders.length} commande(s) au total • Suivi de fabrication
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportExcel}
            disabled={isExporting || filteredOrders.length === 0}
            className="hidden sm:inline-flex min-h-[44px]"
            title="Exporter vers Excel"
          >
            <FileSpreadsheet className="h-4 w-4 mr-1 text-emerald-600" />
            <span>Excel</span>
          </Button>

          <Link href="/orders/new">
            <Button size="sm" className="space-x-1.5 min-h-[44px]">
              <Plus className="h-4 w-4" />
              <span>Nouvelle</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Barre de recherche */}
      <div className="relative">
        <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="N° commande (#1), nom client, tissu, modèle..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 h-11 text-base bg-card"
        />
      </div>

      {/* Filtres de Statut Horizontaux Défilables */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
        <button
          onClick={() => setStatusFilter("all")}
          className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors min-h-[38px] ${
            statusFilter === "all"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-muted text-muted-foreground hover:text-foreground"
          }`}
        >
          Toutes ({orders.length})
        </button>

        <button
          onClick={() => setStatusFilter("in_progress")}
          className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors min-h-[38px] ${
            statusFilter === "in_progress"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-muted text-muted-foreground hover:text-foreground"
          }`}
        >
          En cours ({orders.filter((o) => o.status !== "livree" && o.status !== "annulee").length})
        </button>

        <button
          onClick={() => setStatusFilter("overdue")}
          className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors min-h-[38px] flex items-center space-x-1 ${
            statusFilter === "overdue"
              ? "bg-red-600 text-white shadow-sm"
              : "bg-red-50 text-red-700 hover:bg-red-100"
          }`}
        >
          <ClockAlert className="h-3.5 w-3.5 mr-1" />
          <span>En Retard ({orders.filter((o) => o.is_overdue).length})</span>
        </button>

        <button
          onClick={() => setStatusFilter("ready")}
          className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors min-h-[38px] ${
            statusFilter === "ready"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-muted text-muted-foreground hover:text-foreground"
          }`}
        >
          Prêtes ({orders.filter((o) => o.status === "prete_a_livrer").length})
        </button>

        <button
          onClick={() => setStatusFilter("delivered")}
          className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors min-h-[38px] ${
            statusFilter === "delivered"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-muted text-muted-foreground hover:text-foreground"
          }`}
        >
          Livrées ({orders.filter((o) => o.status === "livree").length})
        </button>
      </div>

      {/* Liste des Cartes Commandes */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-12 border rounded-xl bg-card p-6">
          <Scissors className="h-10 w-10 mx-auto text-muted-foreground/50 mb-2" />
          <p className="font-semibold text-base">Aucune commande trouvée</p>
          <p className="text-xs text-muted-foreground mt-1">
            {search
              ? "Essayez avec d'autres termes de recherche."
              : "Créez votre première commande pour cet atelier."}
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {filteredOrders.map((order) => {
            return (
              <div
                key={order.id}
                className={`p-4 rounded-xl border bg-card hover:bg-muted/30 transition-all shadow-sm ${
                  order.is_overdue ? "border-red-300 dark:border-red-900" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <Link
                    href={`/orders/${order.id}`}
                    className="flex items-start space-x-3 flex-1 min-w-0"
                  >
                    <div className="w-11 h-11 rounded-xl bg-terracotta-50 text-terracotta-700 font-bold flex items-center justify-center text-sm shrink-0 border border-terracotta-200">
                      #{order.number}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-sm text-foreground truncate">
                          {order.client?.first_name} {order.client?.last_name}
                        </span>
                        {order.is_overdue && (
                          <Badge variant="destructive" className="text-[10px] py-0 px-1 shrink-0 animate-pulse">
                            En retard
                          </Badge>
                        )}
                      </div>

                      <div className="text-xs font-medium text-foreground/80 mt-0.5 truncate">
                        {order.garment_type?.name} {order.model ? `• ${order.model}` : ""}
                      </div>

                      <div className="text-[11px] text-muted-foreground mt-1 flex items-center space-x-2">
                        <span className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1 inline" />
                          Livraison : {formatDate(order.due_date)}
                        </span>
                        {order.fabric && (
                          <>
                            <span>•</span>
                            <span className="truncate">{order.fabric}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </Link>

                  <div className="text-right shrink-0">
                    <div className="font-bold text-sm text-foreground">
                      {formatCurrency(order.price)}
                    </div>
                    {order.remaining ? (
                      <div className="text-[11px] text-amber-600 font-medium">
                        Reste : {formatCurrency(order.remaining)}
                      </div>
                    ) : (
                      <div className="text-[11px] text-emerald-600 font-medium">
                        Soldé à 100%
                      </div>
                    )}
                  </div>
                </div>

                {/* Barre de statut avec changement direct en 1 tap (Règle 6) */}
                <div className="mt-3 pt-3 border-t flex items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] text-muted-foreground font-medium">
                      Statut :
                    </span>
                    <OrderStatusBadge status={order.status} size="sm" />
                  </div>

                  {/* Sélecteur de statut rapide 1-tap */}
                  <select
                    value={order.status}
                    onChange={(e) =>
                      handleStatusChange(order.id, e.target.value as OrderStatus)
                    }
                    className="text-xs rounded-lg border border-input bg-background px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary min-h-[36px]"
                  >
                    <option value="nouvelle">Nouvelle</option>
                    <option value="en_attente">En attente</option>
                    <option value="tissu_recu">Tissu reçu</option>
                    <option value="en_confection">En confection</option>
                    <option value="essayage">Essayage</option>
                    <option value="retouche">Retouche</option>
                    <option value="terminee">Terminée</option>
                    <option value="prete_a_livrer">Prête à livrer</option>
                    <option value="livree">Livrée</option>
                    <option value="annulee">Annulée</option>
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
