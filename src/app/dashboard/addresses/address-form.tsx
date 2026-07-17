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
import type { AddressType } from "@prisma/client";

const schema = z.object({
  fullName: z.string().min(1),
  line1: z.string().min(1),
  line2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().optional(),
  postalCode: z.string().min(1),
  country: z.string().min(1),
  phone: z.string().optional(),
  type: z.enum(["SHIPPING", "BILLING"]),
  isDefault: z.boolean().optional(),
});

type FormValues = z.infer<typeof schema>;

export function AddressForm({
  defaultValues,
  id,
}: {
  defaultValues?: Partial<FormValues>;
  id?: string;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { type: "SHIPPING", isDefault: false, ...defaultValues },
  });

  const isDefault = watch("isDefault");

  async function onSubmit(values: FormValues) {
    setLoading(true);
    const res = await fetch(id ? `/api/account/addresses/${id}` : "/api/account/addresses", {
      method: id ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    setLoading(false);
    if (res.ok) {
      toast({ title: id ? "Address updated" : "Address added" });
      router.push("/dashboard/addresses");
    } else {
      toast({ title: "Failed to save", variant: "destructive" });
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-lg space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full name</Label>
          <Input id="fullName" {...register("fullName")} />
          {errors.fullName && <p className="text-sm text-destructive">{errors.fullName.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" {...register("phone")} />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="line1">Address line 1</Label>
        <Input id="line1" {...register("line1")} />
        {errors.line1 && <p className="text-sm text-destructive">{errors.line1.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="line2">Address line 2</Label>
        <Input id="line2" {...register("line2")} />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input id="city" {...register("city")} />
          {errors.city && <p className="text-sm text-destructive">{errors.city.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="state">State</Label>
          <Input id="state" {...register("state")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="postalCode">Postal code</Label>
          <Input id="postalCode" {...register("postalCode")} />
          {errors.postalCode && <p className="text-sm text-destructive">{errors.postalCode.message}</p>}
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <Input id="country" {...register("country")} />
          {errors.country && <p className="text-sm text-destructive">{errors.country.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="type">Type</Label>
          <select id="type" className="h-10 w-full rounded-md border bg-background px-3" {...register("type")}>
            <option value="SHIPPING">Shipping</option>
            <option value="BILLING">Billing</option>
          </select>
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <Checkbox checked={isDefault} onCheckedChange={(v) => setValue("isDefault", Boolean(v))} />
        Set as default address
      </label>
      <Button type="submit" disabled={loading}>
        {loading ? "Saving..." : "Save address"}
      </Button>
    </form>
  );
}
