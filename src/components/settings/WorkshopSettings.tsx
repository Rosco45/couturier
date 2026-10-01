"use client";

import React, { useState } from "react";
import { dataStore } from "@/lib/data/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { Building2 } from "lucide-react";

export function WorkshopSettings() {
  const { toast } = useToast();
  const currentWorkshop = dataStore.getWorkshop();

  const [name, setName] = useState(currentWorkshop.name);
  const [address, setAddress] = useState(currentWorkshop.address || "");
  const [phone, setPhone] = useState(currentWorkshop.phone || "");
  const [whatsapp, setWhatsapp] = useState(currentWorkshop.whatsapp || "");
  const [email, setEmail] = useState(currentWorkshop.email || "");
  const [currency] = useState(currentWorkshop.currency || "FCFA");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dataStore.updateWorkshop({
      name,
      address,
      phone,
      whatsapp,
      email,
    });
    toast("Informations de l'atelier enregistrées !");
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-base flex items-center space-x-2">
          <Building2 className="h-4.5 w-4.5 text-primary" />
          <span>Informations de l&apos;Atelier</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="space-y-1.5">
            <Label htmlFor="ws-name">Nom de l&apos;Atelier *</Label>
            <Input
              id="ws-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="ws-phone">Téléphone Atelier</Label>
              <Input
                id="ws-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ws-whatsapp">Numéro WhatsApp</Label>
              <Input
                id="ws-whatsapp"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="ws-email">Email</Label>
              <Input
                id="ws-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ws-currency">Devise Principale</Label>
              <Input
                id="ws-currency"
                value={currency}
                disabled
                className="bg-muted font-bold text-primary"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ws-address">Adresse physique / Ville</Label>
            <Input
              id="ws-address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Ex: Cotonou, Haie Vive..."
            />
          </div>

          <Button type="submit" size="sm" className="min-h-[44px]">
            Enregistrer les modifications
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
