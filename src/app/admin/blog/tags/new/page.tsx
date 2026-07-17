"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

const schema = z.object({ name: z.string().min(1, "Name required"), slug: z.string().optional() });
type FormValues = z.infer<typeof schema>;

export default function NewTagPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit } = useForm<FormValues>({ resolver: zodResolver(schema) as never });

  async function onSubmit(values: FormValues) {
    setLoading(true);
    const res = await fetch("/api/admin/blog/tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    setLoading(false);
    if (res.ok) {
      toast({ title: "Tag created" });
      router.push("/admin/blog/tags");
    } else {
      toast({ title: "Save failed", variant: "destructive" });
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">New Tag</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-lg space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" {...register("name")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="slug">Slug (optional)</Label>
          <Input id="slug" {...register("slug")} />
        </div>
        <Button type="submit" disabled={loading}>{loading ? "Saving…" : "Save"}</Button>
      </form>
    </div>
  );
}
