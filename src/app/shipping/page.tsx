import { getDeliveryMethods } from "@/lib/constants";
import { getStoreSettings } from "@/lib/store-settings";
import { formatMoney } from "@/lib/currency";
import { getActiveCurrency } from "@/lib/currency-server";

export const metadata = { title: "Shipping & Delivery" };

// Always render fresh so delivery charges reflect the latest admin settings.
export const dynamic = "force-dynamic";

export default async function ShippingPage() {
  const currency = await getActiveCurrency();
  const settings = await getStoreSettings();
  const methods = getDeliveryMethods(settings);
  return (
    <div className="container max-w-3xl py-10">
      <h1 className="text-3xl font-bold">Shipping & Delivery</h1>
      <p className="mt-2 text-muted-foreground">
        Free standard shipping is available on select products — check each product's details page to see if it qualifies. Otherwise, a delivery charge applies per item.
      </p>
      <div className="mt-8 space-y-4">
        {methods.map((m) => (
          <div key={m.id} className="rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">{m.label}</h3>
              <span className="text-sm font-medium">{formatMoney(m.fee, currency)}</span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">Estimated delivery: {m.eta}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
