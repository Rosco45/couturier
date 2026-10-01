"use client";

import React, { useState } from "react";
import { CreditCard, Banknote, Smartphone, Check, Download } from "lucide-react";
import { Order, PaymentMethod, Payment } from "@/types";
import { dataStore } from "@/lib/data/store";
import { formatCurrency } from "@/lib/utils";
import { downloadPdfBlob, ReceiptPDF } from "@/lib/pdf/documents";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
  onPaymentSuccess?: () => void;
}

export function PaymentModal({
  isOpen,
  onClose,
  order,
  onPaymentSuccess,
}: PaymentModalProps) {
  const { toast } = useToast();
  const workshop = dataStore.getWorkshop();

  const remaining = order.remaining || 0;
  const [amount, setAmount] = useState<number>(remaining);
  const [method, setMethod] = useState<PaymentMethod>("mtn_momo");
  const [reference, setReference] = useState("");
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdPayment, setCreatedPayment] = useState<Payment | null>(null);

  const newRemaining = Math.max(0, remaining - amount);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      toast("Veuillez saisir un montant valide supérieur à 0", "error");
      return;
    }

    try {
      setIsSubmitting(true);
      const payment = dataStore.createPayment({
        order_id: order.id,
        amount: Math.round(amount),
        paid_at: new Date().toISOString(),
        method,
        reference: reference.trim() || null,
        comment: comment.trim() || null,
      });

      setCreatedPayment(payment);
      toast(`Paiement de ${formatCurrency(amount)} enregistré avec succès !`);
      if (onPaymentSuccess) onPaymentSuccess();
    } catch (e: any) {
      toast(e.message || "Erreur lors de l'enregistrement", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadReceipt = async () => {
    if (!createdPayment || !order.client) return;
    try {
      const doc = (
        <ReceiptPDF
          workshop={workshop}
          payment={createdPayment}
          order={order}
          client={order.client}
        />
      );
      await downloadPdfBlob(
        doc,
        `Recu_${createdPayment.reference || createdPayment.id}_${order.client.last_name}.pdf`
      );
      toast("Reçu PDF téléchargé !");
    } catch (e) {
      toast("Erreur génération reçu", "error");
    }
  };

  const handleClose = () => {
    setCreatedPayment(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md p-5">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-base">
            <CreditCard className="h-5 w-5 text-primary" />
            <span>Paiement - Commande #{order.number}</span>
          </DialogTitle>
        </DialogHeader>

        {createdPayment ? (
          <div className="text-center py-4 space-y-4 animate-in fade-in">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
              <Check className="h-6 w-6 stroke-[3]" />
            </div>

            <div>
              <h3 className="font-bold text-lg text-foreground">
                Paiement de {formatCurrency(createdPayment.amount)} validé !
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Nouveau solde restant sur cette commande :{" "}
                <strong>{formatCurrency(newRemaining)}</strong>
              </p>
            </div>

            <div className="pt-2 flex flex-col space-y-2">
              <Button
                type="button"
                onClick={handleDownloadReceipt}
                className="w-full min-h-[48px] bg-primary text-base font-bold"
              >
                <Download className="h-4 w-4 mr-2" />
                <span>Télécharger le Reçu PDF</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="w-full min-h-[44px]"
              >
                Fermer
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mt-1">
            {/* Aperçu financier dynamique */}
            <div className="grid grid-cols-2 gap-2 text-center text-xs p-3 rounded-xl bg-muted/50 border">
              <div>
                <span className="text-muted-foreground block">Reste à payer</span>
                <span className="font-bold text-sm text-foreground">
                  {formatCurrency(remaining)}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block">Après ce paiement</span>
                <span className="font-bold text-sm text-emerald-600">
                  {formatCurrency(newRemaining)}
                </span>
              </div>
            </div>

            {/* Montant (FCFA) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="amount">Montant à encaisser *</Label>
                <button
                  type="button"
                  onClick={() => setAmount(remaining)}
                  className="text-xs text-primary font-semibold hover:underline"
                >
                  Solder tout ({formatCurrency(remaining)})
                </button>
              </div>
              <div className="relative">
                <Input
                  id="amount"
                  type="number"
                  step="500"
                  min="500"
                  value={amount || ""}
                  onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
                  className="pr-16 text-lg font-bold"
                  required
                />
                <span className="absolute right-3 top-2.5 text-xs font-bold text-primary">
                  FCFA
                </span>
              </div>
            </div>

            {/* Mode de règlement adapté Afrique de l'Ouest */}
            <div className="space-y-1.5">
              <Label>Mode de paiement *</Label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "mtn_momo", label: "MTN MoMo", icon: Smartphone },
                  { id: "moov_money", label: "Moov Money", icon: Smartphone },
                  { id: "especes", label: "Espèces", icon: Banknote },
                  { id: "virement", label: "Virement", icon: CreditCard },
                  { id: "carte", label: "Carte", icon: CreditCard },
                  { id: "autre", label: "Autre", icon: CreditCard },
                ].map((item) => {
                  const isSelected = method === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setMethod(item.id as PaymentMethod)}
                      className={`p-2 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center min-h-[52px] transition-all ${
                        isSelected
                          ? "bg-primary text-primary-foreground border-primary shadow-sm"
                          : "bg-background text-foreground hover:bg-muted"
                      }`}
                    >
                      <item.icon className="h-4 w-4 mb-1" />
                      <span className="text-[11px] truncate max-w-full">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Référence de transaction */}
            <div className="space-y-1.5">
              <Label htmlFor="reference">Référence Transaction / N° Reçu</Label>
              <Input
                id="reference"
                placeholder="Ex: Ref MoMo, numéro reçu papier..."
                value={reference}
                onChange={(e) => setReference(e.target.value)}
              />
            </div>

            {/* Commentaire optionnel */}
            <div className="space-y-1.5">
              <Label htmlFor="comment">Commentaire</Label>
              <Input
                id="comment"
                placeholder="Ex: Acompte initial, solde à la livraison..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                disabled={isSubmitting || amount <= 0}
                className="w-full min-h-[48px] text-base font-bold bg-primary"
              >
                {isSubmitting ? "Enregistrement..." : `Encaisser ${formatCurrency(amount)}`}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
