"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Scissors,
  UserPlus,
  Ruler,
  CalendarPlus,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function QuickActionButton() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    {
      title: "Nouvelle Commande",
      subtitle: "Créer une commande avec choix de mensurations",
      href: "/orders/new",
      icon: Scissors,
      color: "bg-terracotta-500 text-white",
    },
    {
      title: "Nouveau Client",
      subtitle: "Enregistrer un client avec téléphone et WhatsApp",
      href: "/clients/new",
      icon: UserPlus,
      color: "bg-emerald-600 text-white",
    },
    {
      title: "Prise de Mesures (Wizard)",
      subtitle: "Wizard grand écran tactile une mesure à la fois",
      href: "/measurements/wizard",
      icon: Ruler,
      color: "bg-amber-600 text-white",
    },
    {
      title: "Nouveau Rendez-vous",
      subtitle: "Essayage, mesures ou livraison",
      href: "/appointments/new",
      icon: CalendarPlus,
      color: "bg-blue-600 text-white",
    },
  ];

  const handleNavigate = (href: string) => {
    setIsOpen(false);
    router.push(href);
  };

  return (
    <>
      {/* Floating Action Button (FAB) positioned right above the bottom nav bar */}
      <div className="fixed bottom-20 right-4 z-40 md:bottom-8 md:right-8">
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center justify-center w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 hover:bg-primary/90 active:scale-95 transition-all focus:outline-none focus:ring-4 focus:ring-primary/20"
          aria-label="Action rapide"
        >
          <Plus className="h-7 w-7 stroke-[2.5]" />
        </button>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md p-5">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Action Rapide</DialogTitle>
          </DialogHeader>

          <div className="grid gap-2.5 mt-2">
            {actions.map((act) => {
              const Icon = act.icon;
              return (
                <button
                  key={act.title}
                  onClick={() => handleNavigate(act.href)}
                  className="flex items-center space-x-3.5 p-3.5 rounded-xl border bg-card hover:bg-accent/40 active:scale-[0.98] transition-all text-left min-h-[56px]"
                >
                  <div
                    className={`flex items-center justify-center w-11 h-11 rounded-lg shrink-0 ${act.color} shadow-sm`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-foreground">
                      {act.title}
                    </div>
                    <div className="text-xs text-muted-foreground leading-tight">
                      {act.subtitle}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
