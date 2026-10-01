"use client";

import React, { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { dataStore } from "@/lib/data/store";
import { OrderList } from "@/components/orders/OrderList";

function OrdersContent() {
  const searchParams = useSearchParams();
  const filter = searchParams.get("filter") || "all";
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    setOrders(dataStore.getOrders());
  }, []);

  return <OrderList initialOrders={orders} initialFilter={filter} />;
}

export default function OrdersPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      }
    >
      <OrdersContent />
    </Suspense>
  );
}
