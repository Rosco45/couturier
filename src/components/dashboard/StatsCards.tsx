import React from "react";
import Link from "next/link";
import {
  Banknote,
  ClockAlert,
  Calendar,
  CheckCircle,
  Scissors,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

interface StatsCardsProps {
  stats: {
    todayAppointmentsCount: number;
    activeOrdersCount: number;
    readyOrdersCount: number;
    overdueOrdersCount: number;
    currentMonthRevenue: number;
    totalRemaining: number;
  };
}

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {/* CA du Mois */}
      <Card className="border-l-4 border-l-emerald-500 shadow-sm bg-card">
        <CardContent className="p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              CA du Mois
            </span>
            <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              <Banknote className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-lg md:text-xl font-bold tracking-tight text-foreground">
              {formatCurrency(stats.currentMonthRevenue)}
            </div>
            <div className="text-[11px] text-emerald-600 font-medium flex items-center mt-0.5">
              <TrendingUp className="h-3 w-3 mr-1 inline" /> Encaissé ce mois
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reste à Encaisser */}
      <Card className="border-l-4 border-l-amber-500 shadow-sm bg-card">
        <CardContent className="p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              Reste à Encaisser
            </span>
            <div className="p-1.5 rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-lg md:text-xl font-bold tracking-tight text-amber-600 dark:text-amber-400">
              {formatCurrency(stats.totalRemaining)}
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5">
              Sur commandes actives
            </div>
          </div>
        </CardContent>
      </Card>

      {/* RDV du Jour */}
      <Link href="/appointments" className="block active:scale-[0.98] transition-transform">
        <Card className="border-l-4 border-l-blue-500 shadow-sm bg-card hover:bg-muted/40 transition-colors">
          <CardContent className="p-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                RDV du Jour
              </span>
              <div className="p-1.5 rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                <Calendar className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold tracking-tight text-foreground">
                {stats.todayAppointmentsCount}
              </div>
              <div className="text-[11px] text-blue-600 font-medium mt-0.5">
                {stats.todayAppointmentsCount > 0 ? "Prévus aujourd'hui" : "Aucun RDV aujourd'hui"}
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>

      {/* Commandes En Retard (Règle 6) */}
      <Link href="/orders?filter=overdue" className="block active:scale-[0.98] transition-transform">
        <Card
          className={`border-l-4 ${
            stats.overdueOrdersCount > 0 ? "border-l-red-500 bg-red-50/20" : "border-l-primary"
          } shadow-sm bg-card hover:bg-muted/40 transition-colors`}
        >
          <CardContent className="p-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                En Retard
              </span>
              <div
                className={`p-1.5 rounded-lg ${
                  stats.overdueOrdersCount > 0
                    ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                <ClockAlert className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2">
              <div
                className={`text-2xl font-bold tracking-tight ${
                  stats.overdueOrdersCount > 0 ? "text-red-600" : "text-foreground"
                }`}
              >
                {stats.overdueOrdersCount}
              </div>
              <div
                className={`text-[11px] font-medium mt-0.5 ${
                  stats.overdueOrdersCount > 0 ? "text-red-600" : "text-muted-foreground"
                }`}
              >
                {stats.overdueOrdersCount > 0 ? "Action urgente requise" : "Aucun retard constaté"}
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}
