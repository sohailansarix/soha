import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { formatMoney } from "@/lib/currency";
import { getActiveCurrency } from "@/lib/currency-server";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { OrderStatusActions } from "./order-status-actions";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const currency = await getActiveCurrency();
  const order = await db.order.findUnique({
    where: { id },
    include: { items: true, address: true, user: true, payments: true },
  });
  if (!order) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin/orders" className="text-sm text-muted-foreground hover:underline">← Orders</Link>
          <h1 className="text-2xl font-bold">{order.orderNumber}</h1>
        </div>
        <Badge variant="secondary">{order.status}</Badge>
      </div>

      <OrderStatusActions id={order.id} currentStatus={order.status} />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-3">
          {order.items.map((i) => (
            <div key={i.id} className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <div className="font-medium">{i.name}</div>
                <div className="text-sm text-muted-foreground">{i.sku} · Qty {i.quantity}</div>
              </div>
              <span className="font-semibold">{formatMoney(Number(i.price) * i.quantity, currency)}</span>
            </div>
          ))}
        </div>
        <div className="space-y-4">
          <div className="rounded-lg border p-4">
            <h3 className="text-sm font-semibold">Customer</h3>
            <p className="mt-2 text-sm text-muted-foreground">{order.user.name ?? "—"}<br />{order.user.email}</p>
          </div>
          <div className="rounded-lg border p-4">
            <h3 className="text-sm font-semibold">Ship to</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {order.address?.fullName}<br />
              {order.address?.line1} {order.address?.city} {order.address?.postalCode}<br />
              {order.address?.country}
            </p>
          </div>
          <div className="rounded-lg border p-4">
            <h3 className="text-sm font-semibold">Summary</h3>
            <div className="mt-2 space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Total</span><span className="font-semibold">{formatMoney(order.total, currency)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Payment</span><span>{order.paymentStatus}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Placed</span><span>{formatDate(order.createdAt)}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
