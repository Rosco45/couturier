"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { dataStore } from "@/lib/data/store";
import { OrderDetail } from "@/components/orders/OrderDetail";

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.id as string;

  const [order, setOrder] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [measurementTypes, setMeasurementTypes] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);

  const loadData = React.useCallback(() => {
    if (!orderId) return;
    const ord = dataStore.getOrderById(orderId);
    if (!ord) {
      router.push("/orders");
      return;
    }
    setOrder(ord);
    setProfile(dataStore.getMeasurementProfileById(ord.measurement_profile_id));
    setMeasurementTypes(dataStore.getMeasurementTypes());
    setPayments(dataStore.getPaymentsByOrder(orderId));
    setHistory(dataStore.getOrderStatusHistory(orderId));
  }, [orderId, router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (!order) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Link
          href="/orders"
          className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors min-h-[44px] min-w-[44px]"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <span className="text-sm text-muted-foreground">Retour aux commandes</span>
      </div>

      <OrderDetail
        order={order}
        profile={profile}
        measurementTypes={measurementTypes}
        payments={payments}
        history={history}
        onRefresh={loadData}
      />
    </div>
  );
}
