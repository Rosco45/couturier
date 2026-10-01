"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Scissors,
  User,
  Calendar,
  CreditCard,
  Ruler,
  Download,
  MessageSquare,
  Clock,
  History,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Image as ImageIcon,
  ChevronRight,
  FileText,
} from "lucide-react";
import { Order, OrderStatus, Payment, OrderStatusHistory, MeasurementProfile, MeasurementType } from "@/types";
import { dataStore } from "@/lib/data/store";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";
import { generateWhatsAppUrl, formatWestAfricanPhone } from "@/lib/whatsapp";
import { downloadPdfBlob, OrderFormPDF, InvoicePDF, ReceiptPDF } from "@/lib/pdf/documents";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { OrderStatusBadge, ORDER_STATUS_LABELS } from "./OrderStatusBadge";
import { PaymentModal } from "@/components/payments/PaymentModal";

interface OrderDetailProps {
  order: Order;
  profile?: MeasurementProfile;
  measurementTypes: MeasurementType[];
  payments: Payment[];
  history: OrderStatusHistory[];
  onRefresh: () => void;
}

export function OrderDetail({
  order,
  profile,
  measurementTypes,
  payments,
  history,
  onRefresh,
}: OrderDetailProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showMeasurements, setShowMeasurements] = useState(false);

  const workshop = dataStore.getWorkshop();
  const client = order.client;

  // Mise à jour de statut 1-tap
  const handleUpdateStatus = (newStatus: OrderStatus) => {
    try {
      dataStore.updateOrderStatus(order.id, newStatus);
      toast(`Statut mis à jour : ${ORDER_STATUS_LABELS[newStatus]}`);
      onRefresh();
    } catch (e: any) {
      toast(e.message || "Erreur de mise à jour", "error");
    }
  };

  // WhatsApp notification de commande prête (Template 'pret')
  const handleSendReadyWhatsApp = () => {
    if (!client) return;
    const url = generateWhatsAppUrl("pret", {
      phone: client.whatsapp || client.phone,
      prenom: client.first_name,
      numero: order.number,
    });
    window.open(url, "_blank");
  };

  // Téléchargement Bon de Commande PDF
  const handleDownloadOrderFormPDF = async () => {
    if (!client) return;
    try {
      setIsExporting(true);
      const doc = <OrderFormPDF workshop={workshop} order={order} client={client} />;
      await downloadPdfBlob(doc, `Bon_Commande_${order.number}_${client.last_name}.pdf`);
      toast("Bon de commande PDF généré !");
    } catch (e) {
      toast("Erreur génération PDF", "error");
    } finally {
      setIsExporting(false);
    }
  };

  // Téléchargement Facture Client PDF
  const handleDownloadInvoicePDF = async () => {
    if (!client) return;
    try {
      setIsExporting(true);
      const doc = <InvoicePDF workshop={workshop} order={order} client={client} />;
      await downloadPdfBlob(doc, `Facture_${order.number}_${client.last_name}.pdf`);
      toast("Facture PDF générée !");
    } catch (e) {
      toast("Erreur génération PDF", "error");
    } finally {
      setIsExporting(false);
    }
  };

  // Téléchargement Reçu de Paiement PDF
  const handleDownloadReceiptPDF = async (p: Payment) => {
    if (!client) return;
    try {
      setIsExporting(true);
      const doc = <ReceiptPDF workshop={workshop} payment={p} order={order} client={client} />;
      await downloadPdfBlob(doc, `Recu_${p.reference || p.id}_${client.last_name}.pdf`);
      toast("Reçu de paiement PDF généré !");
    } catch (e) {
      toast("Erreur génération reçu", "error");
    } finally {
      setIsExporting(false);
    }
  };

  // Workflow des statuts logiques suivants
  const getNextPossibleStatuses = (current: OrderStatus): OrderStatus[] => {
    switch (current) {
      case "nouvelle":
        return ["tissu_recu", "en_confection"];
      case "en_attente":
        return ["tissu_recu", "en_confection"];
      case "tissu_recu":
        return ["en_confection"];
      case "en_confection":
        return ["essayage", "terminee"];
      case "essayage":
        return ["retouche", "terminee"];
      case "retouche":
        return ["essayage", "terminee"];
      case "terminee":
        return ["prete_a_livrer"];
      case "prete_a_livrer":
        return ["livree"];
      default:
        return [];
    }
  };

  const nextStatuses = getNextPossibleStatuses(order.status);

  return (
    <div className="space-y-4">
      {/* 1. Carte En-tête de Commande */}
      <div className="p-4 rounded-2xl border bg-card shadow-sm space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-black text-foreground">
                Commande #{order.number}
              </span>
              <OrderStatusBadge status={order.status} />
              {order.is_overdue && (
                <Badge variant="destructive" className="animate-pulse text-xs">
                  En retard
                </Badge>
              )}
            </div>

            {client && (
              <Link
                href={`/clients/${client.id}`}
                className="text-sm font-semibold text-primary hover:underline flex items-center mt-1"
              >
                <User className="h-4 w-4 mr-1" />
                <span>{client.first_name} {client.last_name}</span>
                <ChevronRight className="h-3 w-3 ml-0.5" />
              </Link>
            )}
          </div>

          <div className="text-right">
            <div className="text-xl font-bold text-foreground">
              {formatCurrency(order.price)}
            </div>
            <div className="text-xs text-muted-foreground">
              Livraison : {formatDate(order.due_date)}
            </div>
          </div>
        </div>

        {/* Boutons d'avancement rapide du statut (1-tap) */}
        <div className="pt-2 border-t flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-1.5 flex-wrap gap-1">
            <span className="text-xs text-muted-foreground font-medium">
              Action statut :
            </span>
            {nextStatuses.map((st) => (
              <Button
                key={st}
                size="sm"
                variant="outline"
                onClick={() => handleUpdateStatus(st)}
                className="text-xs min-h-[38px] font-semibold border-primary/30 hover:bg-primary/10"
              >
                Passer à &quot;{ORDER_STATUS_LABELS[st]}&quot;
              </Button>
            ))}
          </div>

          {/* Sélecteur libre de statut */}
          <select
            value={order.status}
            onChange={(e) => handleUpdateStatus(e.target.value as OrderStatus)}
            className="text-xs rounded-lg border border-input bg-background px-2.5 py-1.5 min-h-[38px]"
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

      {/* 2. Situation Financière (Règle 7) */}
      <Card className="border-l-4 border-l-primary shadow-sm">
        <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center space-x-2">
            <CreditCard className="h-4.5 w-4.5 text-primary" />
            <span>Règlement de la Commande</span>
          </CardTitle>
          <Button
            size="sm"
            onClick={() => setIsPaymentModalOpen(true)}
            className="min-h-[40px] text-xs font-bold"
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            <span>Nouveau Paiement</span>
          </Button>
        </CardHeader>

        <CardContent className="p-4 pt-2 space-y-3">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2.5 rounded-xl bg-muted/40">
              <span className="text-[11px] text-muted-foreground block">Prix Total</span>
              <span className="font-bold text-sm text-foreground">
                {formatCurrency(order.price)}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40">
              <span className="text-[11px] text-emerald-700 dark:text-emerald-300 block">
                Total Réglé
              </span>
              <span className="font-bold text-sm text-emerald-600">
                {formatCurrency(order.total_paid)}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40">
              <span className="text-[11px] text-amber-700 dark:text-amber-300 block">
                Reste à Payer
              </span>
              <span className="font-bold text-sm text-amber-600">
                {formatCurrency(order.remaining)}
              </span>
            </div>
          </div>

          {/* Barre de progression % payé */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Progression du règlement</span>
              <span className="font-bold text-foreground">{order.percent_paid}%</span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all duration-300"
                style={{ width: `${order.percent_paid}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. Actions Rapides WhatsApp & Documents PDF */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <Button
          variant="whatsapp"
          onClick={handleSendReadyWhatsApp}
          className="min-h-[44px] text-xs flex items-center justify-center space-x-1"
        >
          <MessageSquare className="h-4 w-4" />
          <span>Avis &quot;Prêt&quot; WhatsApp</span>
        </Button>

        <Button
          variant="outline"
          onClick={handleDownloadOrderFormPDF}
          disabled={isExporting}
          className="min-h-[44px] text-xs flex items-center justify-center space-x-1"
        >
          <Download className="h-4 w-4" />
          <span>Bon de Commande PDF</span>
        </Button>

        <Button
          variant="outline"
          onClick={handleDownloadInvoicePDF}
          disabled={isExporting}
          className="min-h-[44px] text-xs flex items-center justify-center space-x-1 col-span-2 sm:col-span-1"
        >
          <FileText className="h-4 w-4" />
          <span>Facture PDF</span>
        </Button>
      </div>

      {/* 4. Détails Techniques & Mensurations Utilisées */}
      <Card>
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-base">Spécifications du Vêtement</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-1 space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <span className="text-muted-foreground block">Type de Vêtement :</span>
              <span className="font-semibold text-foreground text-sm">
                {order.garment_type?.name}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block">Modèle :</span>
              <span className="font-semibold text-foreground text-sm">
                {order.model || "-"}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block">Tissu :</span>
              <span className="font-semibold text-foreground text-sm">
                {order.fabric || "-"}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block">Couleur & Motifs :</span>
              <span className="font-semibold text-foreground text-sm">
                {order.color || "-"}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block">Quantité :</span>
              <span className="font-semibold text-foreground text-sm">
                {order.quantity}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block">Échéance de Livraison :</span>
              <span className="font-semibold text-foreground text-sm">
                {formatDate(order.due_date)}
              </span>
            </div>
          </div>

          {order.description && (
            <div className="p-2.5 rounded-lg bg-muted text-xs">
              <span className="font-semibold block text-primary mb-0.5">Finitions :</span>
              <p>{order.description}</p>
            </div>
          )}

          {/* Profil de mensurations lié (Règle 2 & 3) */}
          <div className="pt-2 border-t">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Ruler className="h-4 w-4 text-primary" />
                <span className="text-xs font-bold">
                  Mensurations : Version {profile?.version || 1} ({profile?.kind.toUpperCase()})
                </span>
                <Badge variant="secondary" className="text-[10px]">
                  Immuable
                </Badge>
              </div>

              <button
                type="button"
                onClick={() => setShowMeasurements(!showMeasurements)}
                className="text-xs text-primary font-medium hover:underline min-h-[36px]"
              >
                {showMeasurements ? "Masquer les mesures" : "Voir les mesures"}
              </button>
            </div>

            {showMeasurements && profile && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 p-3 rounded-xl bg-muted/40 text-xs">
                {measurementTypes.map((mt) => {
                  const val = profile.measurements?.[mt.id];
                  if (val === undefined) return null;
                  return (
                    <div key={mt.id} className="p-1.5 rounded bg-background border">
                      <span className="text-muted-foreground truncate block">{mt.name}</span>
                      <span className="font-bold text-foreground">{val} cm</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 5. Historique des Paiements de cette commande */}
      <Card>
        <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-base">
            Paiements Reçus ({payments.length})
          </CardTitle>
          <span className="text-xs font-semibold text-emerald-600">
            Total : {formatCurrency(payments.reduce((s, p) => s + p.amount, 0))}
          </span>
        </CardHeader>
        <CardContent className="p-4 pt-1">
          {payments.length === 0 ? (
            <div className="text-center py-4 text-xs text-muted-foreground">
              Aucun paiement enregistré pour cette commande.
            </div>
          ) : (
            <div className="divide-y text-xs">
              {payments.map((p) => (
                <div key={p.id} className="py-2.5 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-sm text-foreground block">
                      {formatCurrency(p.amount)}
                    </span>
                    <span className="text-muted-foreground">
                      {formatDate(p.paid_at)} • Mode :{" "}
                      <strong className="uppercase">{p.method}</strong>
                      {p.reference ? ` (${p.reference})` : ""}
                    </span>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownloadReceiptPDF(p)}
                    className="min-h-[36px] text-xs"
                  >
                    <Download className="h-3 w-3 mr-1" />
                    <span>Reçu</span>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 6. Historique des Statuts de la commande (Order Status History) */}
      <Card>
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-base flex items-center space-x-2">
            <History className="h-4.5 w-4.5 text-muted-foreground" />
            <span>Historique des Statuts</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-1">
          <div className="space-y-3 relative pl-4 border-l-2 border-primary/20 ml-2 text-xs">
            {history.map((h) => (
              <div key={h.id} className="relative">
                <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-primary" />
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-foreground">
                    {h.from_status
                      ? `${ORDER_STATUS_LABELS[h.from_status]} ➔ ${ORDER_STATUS_LABELS[h.to_status]}`
                      : `Création : ${ORDER_STATUS_LABELS[h.to_status]}`}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {formatDateTime(h.changed_at)}
                  </span>
                </div>
                <div className="text-[11px] text-muted-foreground">
                  Par {h.changed_by_name || "Tailleur"}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Modale d'enregistrement de paiement */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        order={order}
        onPaymentSuccess={onRefresh}
      />
    </div>
  );
}
