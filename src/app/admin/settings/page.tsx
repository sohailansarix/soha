import { SITE } from "@/lib/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminSettingsPage() {
  const settings = [
    { label: "Site name", value: SITE.name },
    { label: "Site URL", value: SITE.url },
    { label: "Free shipping threshold", value: `$${SITE.freeShippingThreshold}` },
    { label: "Standard shipping", value: `$${SITE.standardShippingFee}` },
    { label: "Express shipping", value: `$${SITE.expressShippingFee}` },
    { label: "Same-day shipping", value: `$${SITE.sameDayShippingFee}` },
    { label: "Tax rate", value: `${(SITE.taxRate * 100).toFixed(0)}%` },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Settings</h1>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Store Configuration</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          {settings.map((s) => (
            <div key={s.label} className="flex items-center justify-between rounded-md border p-3 text-sm">
              <span className="text-muted-foreground">{s.label}</span>
              <span className="font-medium">{s.value}</span>
            </div>
          ))}
        </CardContent>
      </Card>
      <p className="text-sm text-muted-foreground">
        Store settings are configured via environment variables. Update <code>.env</code> to change these values.
      </p>
    </div>
  );
}
