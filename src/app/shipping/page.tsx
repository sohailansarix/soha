import { DELIVERY_METHODS } from "@/lib/constants";
import { formatMoney } from "@/lib/currency";
import { getActiveCurrency } from "@/lib/currency-server";

export const metadata = { title: "Shipping & Delivery" };

export default async function ShippingPage() {
  const currency = await getActiveCurrency();
  return (
    <div className="container max-w-3xl py-10">
      <h1 className="text-3xl font-bold">Shipping & Delivery</h1>
      <p className="mt-2 text-muted-foreground">
        Enjoy free standard shipping on orders over {formatMoney(75, currency)}.
      </p>
      <div className="mt-8 space-y-4">
        {DELIVERY_METHODS.map((m) => (
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
