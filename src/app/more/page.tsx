"use client";

import React, { useState } from "react";
import {
  Settings,
  CreditCard,
  FileSpreadsheet,
  Building2,
  Scissors,
  Ruler,
  MessageSquare,
  Users,
  Download,
  Wifi,
  WifiOff,
} from "lucide-react";
import { dataStore } from "@/lib/data/store";
import { formatCurrency, formatDate } from "@/lib/utils";
import { downloadPdfBlob, ReceiptPDF } from "@/lib/pdf/documents";
import { Payment } from "@/types";
import { WorkshopSettings } from "@/components/settings/WorkshopSettings";
import { TemplatesSettings } from "@/components/settings/TemplatesSettings";
import { GarmentTypesSettings } from "@/components/settings/GarmentTypesSettings";
import { MeasurementTypesSettings } from "@/components/settings/MeasurementTypesSettings";
import { TeamSettings } from "@/components/settings/TeamSettings";
import { ExportCenter } from "@/components/settings/ExportCenter";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/toast";

export default function MorePage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("paiements");
  const payments = dataStore.getPayments();
  const workshop = dataStore.getWorkshop();

  const handleDownloadReceipt = async (p: Payment) => {
    const order = dataStore.getOrderById(p.order_id);
    if (!order || !order.client) return;

    try {
      const doc = <ReceiptPDF workshop={workshop} payment={p} order={order} client={order.client} />;
      await downloadPdfBlob(doc, `Recu_${p.reference || p.id}_${order.client.last_name}.pdf`);
      toast("Reçu de paiement PDF généré !");
    } catch {
      toast("Erreur génération reçu", "error");
    }
  };

  return (
    <div className="space-y-4">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Gestion & Paramètres</h2>
          <p className="text-xs text-muted-foreground">
            Encaissements, configurations atelier et exports
          </p>
        </div>

        {/* Indicateur de statut PWA / Local */}
        <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
          <Wifi className="h-3.5 w-3.5" />
          <span>PWA Prête</span>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full justify-start p-1 h-12 overflow-x-auto bg-muted rounded-xl">
          <TabsTrigger value="paiements" className="flex items-center space-x-1 min-h-[40px]">
            <CreditCard className="h-3.5 w-3.5" />
            <span>Journal Paiements</span>
          </TabsTrigger>
          <TabsTrigger value="exports" className="flex items-center space-x-1 min-h-[40px]">
            <FileSpreadsheet className="h-3.5 w-3.5" />
            <span>Exports Excel</span>
          </TabsTrigger>
          <TabsTrigger value="atelier" className="flex items-center space-x-1 min-h-[40px]">
            <Building2 className="h-3.5 w-3.5" />
            <span>Atelier</span>
          </TabsTrigger>
          <TabsTrigger value="whatsapp" className="flex items-center space-x-1 min-h-[40px]">
            <MessageSquare className="h-3.5 w-3.5" />
            <span>Messages WA</span>
          </TabsTrigger>
          <TabsTrigger value="vetements" className="flex items-center space-x-1 min-h-[40px]">
            <Scissors className="h-3.5 w-3.5" />
            <span>Vêtements</span>
          </TabsTrigger>
          <TabsTrigger value="mesures" className="flex items-center space-x-1 min-h-[40px]">
            <Ruler className="h-3.5 w-3.5" />
            <span>Mesures</span>
          </TabsTrigger>
          <TabsTrigger value="equipe" className="flex items-center space-x-1 min-h-[40px]">
            <Users className="h-3.5 w-3.5" />
            <span>Équipe & Rôles</span>
          </TabsTrigger>
        </TabsList>

        {/* 1. JOURNAL COMPLET DES PAIEMENTS */}
        <TabsContent value="paiements" className="space-y-4">
          <Card>
            <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-base flex items-center space-x-2">
                <CreditCard className="h-4.5 w-4.5 text-primary" />
                <span>Journal des Règlements Encaissés ({payments.length})</span>
              </CardTitle>
              <div className="text-xs font-bold text-emerald-600">
                Total : {formatCurrency(payments.reduce((s, p) => s + p.amount, 0))}
              </div>
            </CardHeader>

            <CardContent className="p-4 pt-1">
              {payments.length === 0 ? (
                <div className="text-center py-8 text-xs text-muted-foreground">
                  Aucun paiement enregistré pour l&apos;instant.
                </div>
              ) : (
                <div className="divide-y text-xs">
                  {payments.map((p) => {
                    const order = dataStore.getOrderById(p.order_id);
                    return (
                      <div
                        key={p.id}
                        className="py-3 flex items-center justify-between gap-2"
                      >
                        <div>
                          <div className="font-bold text-sm text-foreground">
                            {formatCurrency(p.amount)}
                          </div>
                          <div className="text-muted-foreground mt-0.5">
                            {order?.client ? (
                              <span className="font-semibold text-foreground">
                                {order.client.first_name} {order.client.last_name}
                              </span>
                            ) : (
                              "Client"
                            )}{" "}
                            • Cmd #{order?.number || "-"} •{" "}
                            <span className="uppercase font-medium">{p.method}</span>
                            {p.reference ? ` (${p.reference})` : ""}
                          </div>
                          <div className="text-[11px] text-muted-foreground mt-0.5">
                            Reçu le {formatDate(p.paid_at)}
                            {p.comment ? ` • ${p.comment}` : ""}
                          </div>
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadReceipt(p)}
                          className="min-h-[40px] text-xs shrink-0"
                          title="Télécharger le reçu PDF officiel"
                        >
                          <Download className="h-3.5 w-3.5 mr-1" />
                          <span>Reçu PDF</span>
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 2. EXPORTS EXCEL */}
        <TabsContent value="exports">
          <ExportCenter />
        </TabsContent>

        {/* 3. ATELIER */}
        <TabsContent value="atelier">
          <WorkshopSettings />
        </TabsContent>

        {/* 4. MESSAGES WHATSAPP */}
        <TabsContent value="whatsapp">
          <TemplatesSettings />
        </TabsContent>

        {/* 5. VETEMENTS */}
        <TabsContent value="vetements">
          <GarmentTypesSettings />
        </TabsContent>

        {/* 6. MESURES */}
        <TabsContent value="mesures">
          <MeasurementTypesSettings />
        </TabsContent>

        {/* 7. EQUIPE */}
        <TabsContent value="equipe">
          <TeamSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
