"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import type { Role } from "@prisma/client";

const ROLES: Role[] = ["GUEST", "CUSTOMER", "ADMIN", "SUPER_ADMIN"];

export function RoleEditor({
  userId,
  currentRole,
  isSelf,
}: {
  userId: string;
  currentRole: Role;
  isSelf: boolean;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [role, setRole] = useState<Role>(currentRole);
  const [loading, setLoading] = useState(false);

  async function onChange(next: Role) {
    if (next === role) return;
    setLoading(true);
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: next }),
    });
    setLoading(false);
    if (res.ok) {
      setRole(next);
      toast({ title: "Role updated", description: `User is now ${next}` });
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      toast({ title: "Update failed", description: data.error ?? "Please try again.", variant: "destructive" });
    }
  }

  return (
    <Select value={role} onValueChange={(v) => onChange(v as Role)} disabled={loading || isSelf}>
      <SelectTrigger className="h-8 w-36">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {ROLES.map((r) => (
          <SelectItem key={r} value={r}>
            {r}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
