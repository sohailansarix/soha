"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

export function RefundButton({ id, max }: { id: string; max: number }) {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(String(max));
  const [loading, setLoading] = useState(false);

  async function refund() {
    setLoading(true);
    const res = await fetch(`/api/admin/payments/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: Number(amount), reason: "Admin refund" }),
    });
    setLoading(false);
    if (res.ok) {
      toast({ title: "Refund issued" });
      setOpen(false);
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      toast({ title: "Refund failed", description: data.error, variant: "destructive" });
    }
  }

  if (!open) {
    return (
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
        Refund
      </Button>
    );
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <Input
        type="number"
        step="0.01"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="h-8 w-24"
      />
      <Button size="sm" variant="destructive" disabled={loading} onClick={refund}>
        Confirm
      </Button>
    </div>
  );
}
