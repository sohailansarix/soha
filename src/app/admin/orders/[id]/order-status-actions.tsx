"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import type { OrderStatus } from "@prisma/client";

const STATUSES: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "RETURNED",
  "REFUNDED",
];

export function OrderStatusActions({ id, currentStatus }: { id: string; currentStatus: OrderStatus }) {
  const router = useRouter();
  const { toast } = useToast();
  const [status, setStatus] = useState<OrderStatus>(currentStatus);
  const [loading, setLoading] = useState(false);

  async function update(next: OrderStatus) {
    setLoading(true);
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    setLoading(false);
    if (res.ok) {
      setStatus(next);
      toast({ title: "Order updated", description: `Status set to ${next}` });
      router.refresh();
    } else {
      toast({ title: "Update failed", variant: "destructive" });
    }
  }

  return (
    <div className="flex items-center gap-3">
      <Select value={status} onValueChange={(v) => update(v as OrderStatus)} disabled={loading}>
        <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
        <SelectContent>
          {STATUSES.map((s) => (
            <SelectItem key={s} value={s}>{s}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button variant="outline" onClick={() => update(status)} disabled={loading}>Update</Button>
    </div>
  );
}
