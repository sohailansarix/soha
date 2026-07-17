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
  parentId: z.string().optional(),
});

export function CategoryForm({
  categories,
  defaultValues,
  id,
}: {
  categories: { id: string; name: string }[];
  defaultValues?: Partial<z.infer<typeof schema>>;
  id?: string;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit } = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema), defaultValues: defaultValues as z.infer<typeof schema> });

  async function onSubmit(values: z.infer<typeof schema>) {
    setLoading(true);
    const res = await fetch(id ? `/api/admin/categories/${id}` : "/api/admin/categories", {
      method: id ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...values, parentId: values.parentId || undefined }),
    });
    setLoading(false);
    if (res.ok) {
      toast({ title: id ? "Category updated" : "Category created" });
      router.push("/admin/categories");
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
      <div className="space-y-2">
        <Label htmlFor="parentId">Parent</Label>
        <select id="parentId" className="h-10 w-full rounded-md border bg-background px-3" {...register("parentId")}>
          <option value="">None</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>
      <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save"}</Button>
    </form>
  );
}
