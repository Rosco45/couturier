"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Scissors,
  Users,
  Ruler,
  Calendar,
  ArrowRight,
  PlusCircle,
  FileSpreadsheet,
} from "lucide-react";
import { dataStore } from "@/lib/data/store";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { TodayAppointments } from "@/components/dashboard/TodayAppointments";
import { OverdueOrders } from "@/components/dashboard/OverdueOrders";
import { DashboardCharts } from "@/components/dashboard/DashboardCharts";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  useEffect(() => {
    // Charger les métriques réactives
    const dashboardStats = dataStore.getDashboardStats();
    setStats(dashboardStats);
    setRecentOrders(dataStore.getOrders().slice(0, 5));
  }, []);

  if (!stats) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Salutation et Raccourci Atelier */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight">
            Tableau de Bord
          </h2>
          <p className="text-xs md:text-sm text-muted-foreground">
            Aperçu en temps réel de votre atelier de confection
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Link href="/orders/new">
            <Button size="sm" className="space-x-1.5 min-h-[44px]">
              <Scissors className="h-4 w-4" />
              <span>Nouvelle Commande</span>
            </Button>
          </Link>
          <Link href="/clients/new">
            <Button variant="outline" size="sm" className="min-h-[44px]">
              <Users className="h-4 w-4 mr-1" />
              <span>Client</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Cartes Métriques Clés */}
      <StatsCards stats={stats} />

      {/* Alerte Commandes en Retard (si existantes) */}
      <OverdueOrders orders={stats.overdueOrders} />

      {/* Section Rendez-vous du Jour */}
      <TodayAppointments appointments={stats.todayAppointments} />

      {/* 3 Graphiques d'Activité (CA, Vêtements, Statuts) */}
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">
          Analyses de l&apos;Atelier
        </h3>
        <DashboardCharts
          revenueData={stats.revenueChartData}
          garmentData={stats.garmentChartData}
          statusData={stats.statusChartData}
        />
      </div>

      {/* Dernières Commandes en cours */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold flex items-center space-x-2">
            <Scissors className="h-4.5 w-4.5 text-primary" />
            <span>Dernières Commandes</span>
          </h3>
          <Link
            href="/orders"
            className="text-xs text-primary font-medium hover:underline flex items-center"
          >
            Toutes les commandes <ArrowRight className="h-3 w-3 ml-0.5" />
          </Link>
        </div>

        <div className="grid gap-2.5">
          {recentOrders.map((order) => (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              className="flex items-center justify-between p-3.5 rounded-xl border bg-card hover:bg-muted/40 transition-colors active:scale-[0.99] min-h-[56px]"
            >
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-terracotta-50 text-terracotta-700 font-bold text-sm">
                  #{order.number}
                </div>
                <div>
                  <div className="font-semibold text-sm">
                    {order.client?.first_name} {order.client?.last_name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {order.garment_type?.name} {order.model ? `• ${order.model}` : ""}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="font-bold text-sm text-foreground">
                  {formatCurrency(order.price)}
                </div>
                <div className="mt-0.5">
                  <OrderStatusBadge status={order.status} size="sm" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
