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
  name: z.string().min(1, "Name required"),
  slug: z.string().min(1, "Slug required"),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export function CategoryForm({ defaultValues, id }: { defaultValues?: Partial<FormValues>; id?: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit } = useForm<FormValues>({
    resolver: zodResolver(schema) as never,
    defaultValues: { ...defaultValues },
  });

  async function onSubmit(values: FormValues) {
    setLoading(true);
    const res = await fetch(id ? `/api/admin/blog/categories/${id}` : "/api/admin/blog/categories", {
      method: id ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    setLoading(false);
    if (res.ok) {
      toast({ title: id ? "Category updated" : "Category created" });
      router.push("/admin/blog/categories");
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
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" {...register("description")} />
      </div>
      <Button type="submit" disabled={loading}>{loading ? "Saving…" : "Save"}</Button>
    </form>
  );
}
