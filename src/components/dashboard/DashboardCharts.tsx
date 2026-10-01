"use client";

import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { ORDER_STATUS_LABELS } from "@/components/orders/OrderStatusBadge";

interface DashboardChartsProps {
  revenueData: { month: string; ca: number }[];
  garmentData: { name: string; count: number }[];
  statusData: { status: string; count: number }[];
}

const COLORS = [
  "#c85a32", // Terracotta
  "#0d9488", // Teal
  "#eab308", // Amber
  "#6366f1", // Indigo
  "#ec4899", // Pink
  "#8b5cf6", // Purple
  "#10b981", // Emerald
];

export function DashboardCharts({
  revenueData,
  garmentData,
  statusData,
}: DashboardChartsProps) {
  // Formatage pour le graphique de statuts
  const formattedStatusData = statusData.map((s) => ({
    name: ORDER_STATUS_LABELS[s.status as keyof typeof ORDER_STATUS_LABELS] || s.status,
    count: s.count,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* 1. Évolution du CA par mois */}
      <Card className="lg:col-span-2 shadow-sm">
        <CardHeader className="p-4 pb-1">
          <CardTitle className="text-base font-semibold">
            Chiffre d&apos;Affaires Encaissé (FCFA)
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Historique des 6 derniers mois
          </p>
        </CardHeader>
        <CardContent className="p-3 pt-2">
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis
                  dataKey="month"
                  stroke="#888888"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `${val / 1000}k`}
                />
                <Tooltip
                  formatter={(val: any) => [formatCurrency(Number(val)), "Encaissé"]}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                    fontSize: "12px",
                  }}
                />
                <Bar
                  dataKey="ca"
                  fill="#c85a32"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* 2. Commandes par Type de Vêtement */}
      <Card className="shadow-sm">
        <CardHeader className="p-4 pb-1">
          <CardTitle className="text-base font-semibold">
            Modèles Confectionnés
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Répartition par type de vêtement
          </p>
        </CardHeader>
        <CardContent className="p-3 pt-2">
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={garmentData}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={3}
                >
                  {garmentData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any, name: any) => [
                    `${value} commande(s)`,
                    name,
                  ]}
                  contentStyle={{
                    borderRadius: "8px",
                    fontSize: "11px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap gap-1.5 justify-center mt-1">
            {garmentData.slice(0, 4).map((g, idx) => (
              <div
                key={g.name}
                className="flex items-center space-x-1 text-[10px] text-muted-foreground"
              >
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                />
                <span className="truncate max-w-[80px]">{g.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 3. Répartition des Commandes par Statut */}
      <Card className="lg:col-span-3 shadow-sm">
        <CardHeader className="p-4 pb-1">
          <CardTitle className="text-base font-semibold">
            Statut des Commandes en Atelier
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Suivi du pipeline de confection
          </p>
        </CardHeader>
        <CardContent className="p-3 pt-2">
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={formattedStatusData}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 40, bottom: 5 }}
              >
                <XAxis type="number" stroke="#888888" fontSize={10} tickLine={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  stroke="#888888"
                  fontSize={11}
                  tickLine={false}
                  width={90}
                />
                <Tooltip
                  formatter={(val: any) => [`${val} commande(s)`, "Volume"]}
                  contentStyle={{ borderRadius: "8px", fontSize: "11px" }}
                />
                <Bar
                  dataKey="count"
                  fill="#0d9488"
                  radius={[0, 4, 4, 0]}
                  maxBarSize={20}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
