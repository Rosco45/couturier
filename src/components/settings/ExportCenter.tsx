"use client";

import React, { useState } from "react";
import { FileSpreadsheet, Users, Scissors, CreditCard, Download } from "lucide-react";
import { dataStore } from "@/lib/data/store";
import {
  exportClientsToExcel,
  exportOrdersToExcel,
  exportPaymentsToExcel,
} from "@/lib/excel";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export function ExportCenter() {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const workshop = dataStore.getWorkshop();

  const handleExportClients = async () => {
    try {
      setIsExporting(true);
      const clients = dataStore.getClients(false).concat(dataStore.getClients(true));
      await exportClientsToExcel(clients, workshop.name);
      toast("Fichier Excel des clients téléchargé !");
    } catch {
      toast("Erreur lors de l'export des clients", "error");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportOrders = async () => {
    try {
      setIsExporting(true);
      const orders = dataStore.getOrders();
      await exportOrdersToExcel(orders, workshop.name);
      toast("Fichier Excel des commandes téléchargé !");
    } catch {
      toast("Erreur lors de l'export des commandes", "error");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPayments = async () => {
    try {
      setIsExporting(true);
      const payments = dataStore.getPayments();
      await exportPaymentsToExcel(payments, workshop.name);
      toast("Fichier Excel des encaissements téléchargé !");
    } catch {
      toast("Erreur lors de l'export des paiements", "error");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-base flex items-center space-x-2">
          <FileSpreadsheet className="h-4.5 w-4.5 text-emerald-600" />
          <span>Centre d&apos;Exports Excel</span>
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Téléchargez vos registres comptables et fiches de gestion au format .xlsx
        </p>
      </CardHeader>

      <CardContent className="p-4 pt-2">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <Button
            variant="outline"
            onClick={handleExportClients}
            disabled={isExporting}
            className="flex items-center justify-start space-x-2 min-h-[50px] p-3 text-left border-emerald-200 hover:bg-emerald-50/50"
          >
            <Users className="h-4 w-4 text-emerald-600 shrink-0" />
            <div>
              <div className="font-semibold text-xs text-foreground">Registre Clients</div>
              <div className="text-[10px] text-muted-foreground">Contacts & adresses</div>
            </div>
          </Button>

          <Button
            variant="outline"
            onClick={handleExportOrders}
            disabled={isExporting}
            className="flex items-center justify-start space-x-2 min-h-[50px] p-3 text-left border-emerald-200 hover:bg-emerald-50/50"
          >
            <Scissors className="h-4 w-4 text-emerald-600 shrink-0" />
            <div>
              <div className="font-semibold text-xs text-foreground">Registre Commandes</div>
              <div className="text-[10px] text-muted-foreground">Fabrication & soldes</div>
            </div>
          </Button>

          <Button
            variant="outline"
            onClick={handleExportPayments}
            disabled={isExporting}
            className="flex items-center justify-start space-x-2 min-h-[50px] p-3 text-left border-emerald-200 hover:bg-emerald-50/50"
          >
            <CreditCard className="h-4 w-4 text-emerald-600 shrink-0" />
            <div>
              <div className="font-semibold text-xs text-foreground">Journal Paiements</div>
              <div className="text-[10px] text-muted-foreground">MoMo, Moov, Espèces</div>
            </div>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
