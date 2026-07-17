"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

export function InventoryAdjust({ variantId, currentStock }: { variantId: string; currentStock: number }) {
  const router = useRouter();
  const { toast } = useToast();
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  async function adjust(change: number) {
    setLoading(true);
    const res = await fetch("/api/admin/inventory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ variantId, change, reason: change >= 0 ? "Restock" : "Removal" }),
    });
    setLoading(false);
    if (res.ok) {
      toast({ title: "Inventory updated", description: `New stock: ${currentStock + change}` });
      setAmount("");
      router.refresh();
    } else {
      toast({ title: "Update failed", variant: "destructive" });
    }
  }

  const parsed = parseInt(amount, 10);
  const valid = !isNaN(parsed) && parsed !== 0;

  return (
    <div className="flex items-center justify-end gap-2">
      <Input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="±qty"
        className="h-8 w-20"
      />
      <Button size="sm" variant="outline" disabled={!valid || loading} onClick={() => adjust(parsed)}>
        Apply
      </Button>
    </div>
  );
}
