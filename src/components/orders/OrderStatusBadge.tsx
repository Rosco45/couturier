import React from "react";
import { OrderStatus } from "@/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  nouvelle: "Nouvelle",
  en_attente: "En attente",
  tissu_recu: "Tissu reçu",
  en_confection: "En confection",
  essayage: "Essayage",
  retouche: "Retouche",
  terminee: "Terminée",
  prete_a_livrer: "Prête à livrer",
  livree: "Livrée",
  annulee: "Annulée",
};

interface OrderStatusBadgeProps {
  status: OrderStatus;
  className?: string;
  size?: "default" | "sm";
}

export function OrderStatusBadge({
  status,
  className,
  size = "default",
}: OrderStatusBadgeProps) {
  let variant: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "info" | "purple" = "default";

  switch (status) {
    case "nouvelle":
      variant = "info";
      break;
    case "en_attente":
      variant = "secondary";
      break;
    case "tissu_recu":
      variant = "info";
      break;
    case "en_confection":
      variant = "warning";
      break;
    case "essayage":
      variant = "purple";
      break;
    case "retouche":
      variant = "warning";
      break;
    case "terminee":
    case "prete_a_livrer":
      variant = "success";
      break;
    case "livree":
      variant = "outline";
      break;
    case "annulee":
      variant = "destructive";
      break;
  }

  return (
    <Badge
      variant={variant}
      className={cn(
        "font-medium capitalize",
        size === "sm" ? "px-2 py-0 text-[11px]" : "px-2.5 py-0.5 text-xs",
        className
      )}
    >
      {ORDER_STATUS_LABELS[status] || status}
    </Badge>
  );
}
