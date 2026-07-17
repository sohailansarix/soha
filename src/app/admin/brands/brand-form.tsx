"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

const schema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  logo: z.string().url().optional().or(z.literal("")),
});

export function BrandForm({ defaultValues, id }: { defaultValues?: Partial<z.infer<typeof schema>>; id?: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit } = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema), defaultValues: defaultValues as z.infer<typeof schema> });

  async function onSubmit(values: z.infer<typeof schema>) {
    setLoading(true);
    const res = await fetch(id ? `/api/admin/brands/${id}` : "/api/admin/brands", {
      method: id ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    setLoading(false);
    if (res.ok) {
      toast({ title: id ? "Brand updated" : "Brand created" });
      router.push("/admin/brands");
    } else {
      toast({ title: "Save failed", variant: "destructive" });
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-lg space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" {...register("name")} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="slug">Slug</Label>
        <Input id="slug" {...register("slug")} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="logo">Logo URL</Label>
        <Input id="logo" {...register("logo")} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" {...register("description")} />
      </div>
      <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save"}</Button>
    </form>
  );
}
