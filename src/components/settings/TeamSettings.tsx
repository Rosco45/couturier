"use client";

import React, { useState } from "react";
import { ShieldCheck, UserCheck, Users } from "lucide-react";
import { dataStore } from "@/lib/data/store";
import { Profile, UserRole } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export function TeamSettings() {
  const { toast } = useToast();
  const currentProfile = dataStore.getCurrentProfile();
  const [activeRole, setActiveRole] = useState<UserRole>(currentProfile.role);

  const handleRoleSwitch = (newRole: UserRole) => {
    setActiveRole(newRole);
    dataStore.updateCurrentProfile({ role: newRole });
    toast(`Rôle actif changé en : ${newRole.toUpperCase()}`);
  };

  const teamMembers = [
    {
      name: "Maître Koffi Mensah",
      role: "admin",
      desc: "Accès total : gestion atelier, tarifs, exports, équipe et finances",
    },
    {
      name: "Amina Dossou",
      role: "tailor",
      desc: "Tailleur : clients, prises de mesures, commandes, RDV, encaissements",
    },
    {
      name: "Chérif Mama",
      role: "assistant",
      desc: "Assistant : saisie des clients, essayages selon permissions",
    },
  ];

  return (
    <Card className="shadow-sm">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-base flex items-center space-x-2">
          <Users className="h-4.5 w-4.5 text-primary" />
          <span>Équipe & Rôles de l&apos;Atelier</span>
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Permissions et profils d&apos;utilisateurs (Admin, Tailleur, Assistant)
        </p>
      </CardHeader>

      <CardContent className="p-4 pt-2 space-y-3">
        <div className="grid gap-2">
          {teamMembers.map((member) => {
            const isCurrent = activeRole === member.role;
            return (
              <div
                key={member.name}
                className={`p-3 rounded-xl border flex items-center justify-between min-h-[56px] transition-all ${
                  isCurrent ? "bg-primary/5 border-primary" : "bg-card hover:bg-muted/40"
                }`}
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-sm text-foreground">
                      {member.name}
                    </span>
                    <Badge
                      variant={
                        member.role === "admin"
                          ? "default"
                          : member.role === "tailor"
                          ? "warning"
                          : "secondary"
                      }
                      className="capitalize text-[10px]"
                    >
                      {member.role}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{member.desc}</p>
                </div>

                <Button
                  size="sm"
                  variant={isCurrent ? "default" : "outline"}
                  onClick={() => handleRoleSwitch(member.role as UserRole)}
                  className="min-h-[38px] text-xs font-semibold ml-2 shrink-0"
                >
                  {isCurrent ? "Rôle Actif" : "Basculer"}
                </Button>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
