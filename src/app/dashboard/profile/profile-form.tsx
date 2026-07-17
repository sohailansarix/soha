"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(8).optional().or(z.literal("")),
});

type FormValues = z.infer<typeof schema>;

export function ProfileForm({ defaultValues }: { defaultValues: { name: string; email: string } }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues });

  async function onSubmit(values: FormValues) {
    setLoading(true);
    const res = await fetch("/api/account/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    setLoading(false);
    if (res.ok) {
      toast({ title: "Profile updated", description: "Your changes have been saved." });
    } else {
      const data = await res.json().catch(() => ({}));
      toast({ title: "Update failed", description: data.error ?? "Please try again.", variant: "destructive" });
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-md space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" {...register("name")} />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" {...register("email")} />
        {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="currentPassword">Current password (to change password)</Label>
        <Input id="currentPassword" type="password" {...register("currentPassword")} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="newPassword">New password</Label>
        <Input id="newPassword" type="password" {...register("newPassword")} />
        {errors.newPassword && <p className="text-sm text-destructive">{errors.newPassword.message}</p>}
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? "Saving..." : "Save changes"}
      </Button>
    </form>
  );
}
