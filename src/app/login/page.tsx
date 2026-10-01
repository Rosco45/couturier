"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Scissors, Lock, Mail, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { dataStore } from "@/lib/data/store";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulation de connexion avec notification
    setTimeout(() => {
      setIsLoading(false);
      toast("Connexion réussie ! Bienvenue sur Couturier.");
      router.push("/");
    }, 600);
  };

  const handleDemoLogin = (role: "admin" | "tailor" | "assistant") => {
    dataStore.updateCurrentProfile({ role });
    toast(`Connecté en mode démonstration (${role.toUpperCase()})`);
    router.push("/");
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center max-w-sm mx-auto space-y-4 py-8">
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-primary text-primary-foreground mx-auto flex items-center justify-center shadow-lg shadow-primary/30">
          <Scissors className="h-8 w-8 rotate-[-45deg]" />
        </div>
        <h1 className="text-2xl font-black tracking-tight text-foreground">
          Couturier PWA
        </h1>
        <p className="text-xs text-muted-foreground">
          L&apos;application des ateliers de confection et maîtres tailleurs
        </p>
      </div>

      <Card className="shadow-md">
        <CardContent className="p-5">
          <form onSubmit={handleLogin} className="space-y-3.5">
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

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Mot de passe</Label>
                <Link
                  href="/reset-password"
                  className="text-xs text-primary hover:underline"
                >
                  Mot de passe oublié ?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full min-h-[48px] font-bold text-base bg-primary"
            >
              {isLoading ? "Connexion en cours..." : "Se Connecter"}
            </Button>
          </form>

          {/* Accès Démo Rapide */}
          <div className="mt-5 pt-4 border-t space-y-2">
            <div className="text-[11px] text-muted-foreground text-center flex items-center justify-center space-x-1 font-semibold uppercase tracking-wider">
              <Sparkles className="h-3 w-3 text-amber-500" />
              <span>Accès Démo 1-Clic</span>
            </div>

            <div className="grid grid-cols-3 gap-1.5 pt-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleDemoLogin("admin")}
                className="text-xs min-h-[38px] px-1"
              >
                Admin
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleDemoLogin("tailor")}
                className="text-xs min-h-[38px] px-1"
              >
                Tailleur
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleDemoLogin("assistant")}
                className="text-xs min-h-[38px] px-1"
              >
                Assistant
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
