"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

interface SettingsForm {
  standardShippingFee: string;
  expressShippingFee: string;
  sameDayShippingFee: string;
  taxRate: string;
}

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const [form, setForm] = React.useState<SettingsForm>({
    standardShippingFee: "",
    expressShippingFee: "",
    sameDayShippingFee: "",
    taxRate: "",
  });
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    fetch(`/api/admin/settings`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) setForm(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Could not save settings");
      toast({ title: "Settings saved", variant: "success" });
    } catch (err) {
      toast({
        title: "Save failed",
        description: err instanceof Error ? err.message : undefined,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Settings</h1>
      <form onSubmit={save}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Delivery & Tax</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="standardShippingFee">Standard shipping fee (USD)</Label>
              <Input
                id="standardShippingFee"
                type="number"
                step="0.01"
                min={0}
                value={form.standardShippingFee}
                onChange={(e) => setForm({ ...form, standardShippingFee: e.target.value })}
                placeholder="5.99"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expressShippingFee">Express shipping fee (USD)</Label>
              <Input
                id="expressShippingFee"
                type="number"
                step="0.01"
                min={0}
                value={form.expressShippingFee}
                onChange={(e) => setForm({ ...form, expressShippingFee: e.target.value })}
                placeholder="14.99"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sameDayShippingFee">Same-day shipping fee (USD)</Label>
              <Input
                id="sameDayShippingFee"
                type="number"
                step="0.01"
                min={0}
                value={form.sameDayShippingFee}
                onChange={(e) => setForm({ ...form, sameDayShippingFee: e.target.value })}
                placeholder="24.99"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="taxRate">Tax rate (e.g. 0.08 = 8%)</Label>
              <Input
                id="taxRate"
                type="number"
                step="0.01"
                min={0}
                max={1}
                value={form.taxRate}
                onChange={(e) => setForm({ ...form, taxRate: e.target.value })}
                placeholder="0.08"
              />
            </div>
          </CardContent>
        </Card>
        <div className="mt-4 flex gap-2">
          <Button type="submit" disabled={saving || loading}>
            {saving ? "Saving…" : "Save settings"}
          </Button>
        </div>
      </form>
      <p className="text-sm text-muted-foreground">
        These values are stored in the database and apply store-wide. Free shipping remains product-specific per item.
      </p>
    </div>
  );
}
