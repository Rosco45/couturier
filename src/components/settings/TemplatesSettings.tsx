"use client";

import React, { useState } from "react";
import { MessageSquare, Save, Sparkles } from "lucide-react";
import { dataStore } from "@/lib/data/store";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { Badge } from "@/components/ui/badge";

export function TemplatesSettings() {
  const { toast } = useToast();

  const tmplRdv = dataStore.getMessageTemplateByKey("rdv");
  const tmplPret = dataStore.getMessageTemplateByKey("pret");
  const tmplPaiement = dataStore.getMessageTemplateByKey("paiement");

  const [rdvBody, setRdvBody] = useState(tmplRdv?.body || "");
  const [pretBody, setPretBody] = useState(tmplPret?.body || "");
  const [paiementBody, setPaiementBody] = useState(tmplPaiement?.body || "");

  const handleSave = (key: "rdv" | "pret" | "paiement", body: string) => {
    try {
      dataStore.updateMessageTemplate(key, body);
      toast(`Modèle de message "${key.toUpperCase()}" enregistré !`);
    } catch (e: any) {
      toast("Erreur lors de l'enregistrement", "error");
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-base flex items-center space-x-2">
          <MessageSquare className="h-4.5 w-4.5 text-[#25D366]" />
          <span>Modèles de Messages WhatsApp</span>
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Personnalisez les messages automatiques préremplis envoyés à vos clients via wa.me
        </p>
      </CardHeader>

      <CardContent className="p-4 pt-2 space-y-4">
        {/* Variables disponibles */}
        <div className="p-2.5 rounded-xl bg-muted/60 text-xs space-y-1">
          <span className="font-semibold text-foreground flex items-center space-x-1">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            <span>Variables dynamiques disponibles à insérer :</span>
          </span>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {["{prenom}", "{date}", "{numero}", "{reste}", "{atelier}"].map((tag) => (
              <Badge key={tag} variant="secondary" className="font-mono text-[11px]">
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        {/* 1. Modèle RDV */}
        <div className="space-y-1.5 border-t pt-3">
          <div className="flex items-center justify-between">
            <Label className="font-bold text-xs uppercase tracking-wider text-primary">
              1. Rappel de Rendez-vous (RDV)
            </Label>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleSave("rdv", rdvBody)}
              className="min-h-[36px] text-xs"
            >
              <Save className="h-3.5 w-3.5 mr-1" />
              <span>Sauvegarder</span>
            </Button>
          </div>
          <Textarea
            rows={2}
            value={rdvBody}
            onChange={(e) => setRdvBody(e.target.value)}
          />
        </div>

        {/* 2. Modèle Prêt */}
        <div className="space-y-1.5 border-t pt-3">
          <div className="flex items-center justify-between">
            <Label className="font-bold text-xs uppercase tracking-wider text-primary">
              2. Avis de Commande Prête
            </Label>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleSave("pret", pretBody)}
              className="min-h-[36px] text-xs"
            >
              <Save className="h-3.5 w-3.5 mr-1" />
              <span>Sauvegarder</span>
            </Button>
          </div>
          <Textarea
            rows={2}
            value={pretBody}
            onChange={(e) => setPretBody(e.target.value)}
          />
        </div>

        {/* 3. Modèle Paiement */}
        <div className="space-y-1.5 border-t pt-3">
          <div className="flex items-center justify-between">
            <Label className="font-bold text-xs uppercase tracking-wider text-primary">
              3. Confirmation de Paiement
            </Label>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleSave("paiement", paiementBody)}
              className="min-h-[36px] text-xs"
            >
              <Save className="h-3.5 w-3.5 mr-1" />
              <span>Sauvegarder</span>
            </Button>
          </div>
          <Textarea
            rows={2}
            value={paiementBody}
            onChange={(e) => setPaiementBody(e.target.value)}
          />
        </div>
      </CardContent>
    </Card>
  );
}
