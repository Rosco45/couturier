"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";

export default function ResetPasswordPage() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [isSent, setIsSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSent(true);
      toast("Email de réinitialisation envoyé !");
    }, 600);
  };

  return (
    <div className="min-h-[75vh] flex flex-col justify-center max-w-sm mx-auto space-y-4 py-8">
      <div className="flex items-center space-x-2">
        <Link
          href="/login"
          className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors min-h-[44px] min-w-[44px]"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <span className="text-sm text-muted-foreground">Retour à la connexion</span>
      </div>

      <Card className="shadow-md">
        <CardContent className="p-5">
          {isSent ? (
            <div className="text-center py-6 space-y-3">
              <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto" />
              <h2 className="text-lg font-bold text-foreground">
                Lien de réinitialisation envoyé
              </h2>
              <p className="text-xs text-muted-foreground">
                Vérifiez votre boîte de réception à l&apos;adresse <strong>{email}</strong> pour redéfinir votre mot de passe.
              </p>
              <Link href="/login" className="inline-block pt-2">
                <Button variant="outline" className="min-h-[44px]">
                  Retour à la page de connexion
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <h2 className="text-lg font-bold">Mot de passe oublié</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Indiquez votre adresse email pour recevoir les instructions
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email">Adresse Email</Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="tailleur@atelier.bj"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full min-h-[48px] font-bold bg-primary"
              >
                {isLoading ? "Envoi en cours..." : "Envoyer le lien"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
