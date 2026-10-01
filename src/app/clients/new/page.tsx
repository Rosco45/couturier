"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, UserPlus } from "lucide-react";
import { ClientForm } from "@/components/clients/ClientForm";
import { ClientFormValues } from "@/lib/validations/client";
import { dataStore } from "@/lib/data/store";
import { useToast } from "@/components/ui/toast";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function NewClientPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (values: ClientFormValues) => {
    try {
      setIsLoading(true);
      const created = dataStore.createClient(values);
      toast(`Client ${created.first_name} ${created.last_name} créé avec succès !`);
      router.push(`/clients/${created.id}`);
    } catch (e: any) {
      toast(e.message || "Erreur lors de la création", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center space-x-2">
        <Link
          href="/clients"
          className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors min-h-[44px] min-w-[44px]"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h2 className="text-xl font-bold">Nouveau Client</h2>
          <p className="text-xs text-muted-foreground">
            Enregistrez un nouveau client pour l&apos;atelier
          </p>
        </div>
      </div>

      <Card className="shadow-sm">
        <CardContent className="p-4 md:p-6">
          <ClientForm onSubmit={handleSubmit} isLoading={isLoading} />
        </CardContent>
      </Card>
    </div>
  );
}
