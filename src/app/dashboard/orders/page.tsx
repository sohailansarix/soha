import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { formatMoney } from "@/lib/currency";
import { getActiveCurrency } from "@/lib/currency-server";
import { formatDate } from "@/lib/utils";

export default async function OrdersPage() {
  const session = await auth();
  const currency = await getActiveCurrency();
  const orders = await db.order.findMany({
    where: { userId: session!.user.id },
    orderBy: { createdAt: "desc" },
    include: { items: { include: { product: { include: { images: { take: 1 } } } } } },
  });

  if (orders.length === 0) {
    return (
      <div className="rounded-lg border border-dashed py-16 text-center">
        <p className="text-muted-foreground">You have no orders yet.</p>
        <Button asChild className="mt-4">
          <Link href="/products">Start shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Your Orders</h2>
      {orders.map((o) => (
        <div key={o.id} className="rounded-lg border p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <Link href={`/dashboard/orders/${o.id}`} className="font-medium hover:underline">
                {o.orderNumber}
              </Link>
              <p className="text-sm text-muted-foreground">{formatDate(o.createdAt)}</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={o.status === "DELIVERED" ? "success" : "secondary"}>{o.status}</Badge>
              <span className="font-semibold">{formatMoney(o.total, currency)}</span>
            </div>
          </div>
          <div className="mt-3 flex gap-3 overflow-x-auto">
            {o.items.map((i) => (
              <Link
                key={i.id}
                href={`/dashboard/orders/${o.id}`}
                className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-secondary"
              >
                {i.product.images[0]?.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={i.product.images[0].url} alt={i.name} className="h-full w-full object-cover" />
                ) : null}
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
