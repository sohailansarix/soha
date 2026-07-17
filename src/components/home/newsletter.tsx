"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

export function Newsletter() {
  const { toast } = useToast();
  const [email, setEmail] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error();
      toast({ title: "Subscribed!", description: "Thanks for joining the SOHA list.", variant: "success" });
      setEmail("");
    } catch {
      toast({ title: "Something went wrong", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="bg-primary text-primary-foreground">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-4 py-16 text-center sm:px-6 lg:px-8">
        <div>
          <h2 className="text-2xl font-bold sm:text-3xl">Join the SOHA newsletter</h2>
          <p className="mt-2 text-sm text-primary-foreground/70">
            Be first to know about new arrivals, exclusive offers, and members-only sales.
          </p>
        </div>
        <form onSubmit={onSubmit} className="flex w-full max-w-md flex-col gap-3 sm:flex-row">
          <Input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="bg-primary-foreground text-primary"
            aria-label="Email address"
          />
          <Button type="submit" variant="accent" disabled={loading}>
            {loading ? "…" : "Subscribe"}
          </Button>
        </form>
      </div>
    </section>
  );
}
