import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { formatMoney } from "@/lib/currency";
import { getActiveCurrency } from "@/lib/currency-server";
import { formatDate } from "@/lib/utils";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const order = await db.order.findUnique({
    where: { id },
    include: {
      items: true,
      address: true,
      payments: true,
    },
  });

  if (!order || order.userId !== session!.user.id) notFound();
  const currency = await getActiveCurrency();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-bold">{order.orderNumber}</h2>
          <p className="text-sm text-muted-foreground">Placed {formatDate(order.createdAt)}</p>
        </div>
        <Badge variant={order.status === "DELIVERED" ? "success" : "secondary"}>{order.status}</Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-3">
          {order.items.map((i) => (
            <div key={i.id} className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <div className="font-medium">{i.name}</div>
                <div className="text-sm text-muted-foreground">
                  {i.sku} · Qty {i.quantity}
                </div>
              </div>
              <span className="font-semibold">{formatMoney(Number(i.price) * i.quantity, currency)}</span>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border p-4">
            <h3 className="text-sm font-semibold">Shipping Address</h3>
            {order.address && (
              <p className="mt-2 text-sm text-muted-foreground">
                {order.address.fullName}
                <br />
                {order.address.line1} {order.address.line2}
                <br />
                {order.address.city} {order.address.postalCode}
                <br />
                {order.address.country}
              </p>
            )}
          </div>

          <div className="rounded-lg border p-4">
            <h3 className="text-sm font-semibold">Summary</h3>
            <div className="mt-2 space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatMoney(order.subtotal, currency)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Discount</span>
                <span>{formatMoney(order.discount, currency)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>{formatMoney(order.shipping, currency)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span>{formatMoney(order.tax, currency)}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>{formatMoney(order.total, currency)}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Button variant="outline" asChild>
              <Link href={`/dashboard/orders/${order.id}/invoice`}>Download Invoice</Link>
            </Button>
            {order.status === "PENDING" || order.status === "CONFIRMED" ? (
              <Button variant="outline" asChild>
                <Link href={`/dashboard/orders/${order.id}/cancel`}>Cancel Order</Link>
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
