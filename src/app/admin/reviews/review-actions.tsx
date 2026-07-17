"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

export function ReviewActions({ id, isApproved }: { id: string; isApproved: boolean }) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  async function act(method: "PATCH" | "DELETE", body?: object) {
    setLoading(true);
    const res = await fetch(`/api/admin/reviews/${id}`, {
      method,
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
    setLoading(false);
    if (res.ok) {
      toast({ title: method === "DELETE" ? "Review deleted" : "Review updated" });
      router.refresh();
    } else {
      toast({ title: "Action failed", variant: "destructive" });
    }
  }

  return (
    <div className="flex justify-end gap-2">
      {!isApproved && (
        <Button size="sm" variant="outline" disabled={loading} onClick={() => act("PATCH", { isApproved: true })}>
          Approve
        </Button>
      )}
      <Button size="sm" variant="destructive" disabled={loading} onClick={() => act("DELETE")}>
        Delete
      </Button>
    </div>
  );
}
