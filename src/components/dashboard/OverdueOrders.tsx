import React from "react";
import Link from "next/link";
import { AlertTriangle, Clock, ArrowRight } from "lucide-react";
import { Order } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";

interface OverdueOrdersProps {
  orders: Order[];
}

export function OverdueOrders({ orders }: OverdueOrdersProps) {
  if (orders.length === 0) return null;

  return (
    <Card className="border-red-200 bg-red-50/10 shadow-sm">
      <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-base text-red-700 dark:text-red-400 flex items-center space-x-2">
          <AlertTriangle className="h-4.5 w-4.5 text-red-600" />
          <span>Commandes en retard ({orders.length})</span>
        </CardTitle>
        <Link
          href="/orders?filter=overdue"
          className="text-xs text-red-600 hover:underline font-medium flex items-center"
        >
          Tout voir <ArrowRight className="h-3 w-3 ml-0.5" />
        </Link>
      </CardHeader>

      <CardContent className="p-4 pt-2">
        <div className="divide-y divide-red-100 dark:divide-red-950">
          {orders.map((o) => (
            <div
              key={o.id}
              className="py-3 flex items-center justify-between gap-2"
            >
              <div>
                <div className="flex items-center space-x-2">
                  <Link
                    href={`/orders/${o.id}`}
                    className="font-bold text-sm hover:underline"
                  >
                    Commande #{o.number}
                  </Link>
                  <OrderStatusBadge status={o.status} size="sm" />
                </div>

                <div className="text-xs text-foreground/80 mt-0.5">
                  {o.client?.first_name} {o.client?.last_name} • {o.garment_type?.name}
                </div>

                <div className="flex items-center space-x-2 text-[11px] text-red-600 font-medium mt-1">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Échue le {formatDate(o.due_date)}</span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="text-xs font-bold text-foreground">
                  {formatCurrency(o.price)}
                </div>
                {o.remaining ? (
                  <div className="text-[11px] text-amber-600">
                    Reste : {formatCurrency(o.remaining)}
                  </div>
                ) : (
                  <div className="text-[11px] text-emerald-600">Soldé</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
