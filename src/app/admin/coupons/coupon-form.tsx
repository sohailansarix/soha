"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { CURRENCIES } from "@/lib/currency";

const INR_RATE = CURRENCIES.INR.rate;
// Coupon flat (FIXED) values are entered in INR and stored as USD base.
const inrToUsd = (n: number) => n / INR_RATE;
const usdToInr = (n: number) => n * INR_RATE;

const schema = z.object({
  code: z.string().min(1),
  type: z.enum(["PERCENTAGE", "FIXED"]),
  value: z.coerce.number().min(0),
  minOrder: z.coerce.number().min(0).optional(),
  maxUses: z.coerce.number().int().min(0).optional(),
  perUserLimit: z.coerce.number().int().min(0).optional(),
  expiresAt: z.string().optional(),
  isActive: z.boolean().optional(),
});

export function CouponForm({ defaultValues, id }: { defaultValues?: Partial<z.infer<typeof schema>>; id?: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, setValue, watch } = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) as never, defaultValues: { isActive: true, type: "PERCENTAGE", ...defaultValues } as z.infer<typeof schema> });
  const active = watch("isActive");
  const isFixed = watch("type") === "FIXED";

  async function onSubmit(values: z.infer<typeof schema>) {
    setLoading(true);
    // FIXED values and min order are entered in INR; convert to USD base for storage.
    const storedValue = isFixed ? inrToUsd(Number(values.value)) : values.value;
    const storedMinOrder = values.minOrder != null ? inrToUsd(Number(values.minOrder)) : undefined;
    const res = await fetch(id ? `/api/admin/coupons/${id}` : "/api/admin/coupons", {
      method: id ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: values.code,
        type: values.type,
        value: storedValue,
        minOrder: storedMinOrder,
        maxUses: values.maxUses ?? null,
        perUserLimit: values.perUserLimit ?? null,
        isActive: values.isActive,
        expiresAt: values.expiresAt || undefined,
      }),
    });
    setLoading(false);
    if (res.ok) {
      toast({ title: id ? "Coupon updated" : "Coupon created" });
      router.push("/admin/coupons");
    } else {
      toast({ title: "Save failed", variant: "destructive" });
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-lg space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="code">Code</Label>
          <Input id="code" {...register("code")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="type">Type</Label>
          <select id="type" className="h-10 w-full rounded-md border bg-background px-3" {...register("type")}>
            <option value="PERCENTAGE">Percentage</option>
            <option value="FIXED">Fixed</option>
          </select>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="value">{isFixed ? "Value (₹ INR)" : "Value (%)"}</Label>
          <Input id="value" type="number" step="0.01" {...register("value")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="minOrder">Min order (₹ INR)</Label>
          <Input id="minOrder" type="number" step="0.01" {...register("minOrder")} />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="maxUses">Max uses (total)</Label>
          <Input id="maxUses" type="number" step="1" min="0" placeholder="Unlimited" {...register("maxUses")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="perUserLimit">Max uses per customer</Label>
          <Input id="perUserLimit" type="number" step="1" min="0" placeholder="Unlimited" {...register("perUserLimit")} />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="expiresAt">Expires (date)</Label>
          <Input id="expiresAt" type="date" {...register("expiresAt")} />
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <Checkbox checked={active} onCheckedChange={(v) => setValue("isActive", Boolean(v))} /> Active
      </label>
      <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save"}</Button>
    </form>
  );
}

