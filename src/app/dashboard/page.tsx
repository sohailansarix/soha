import Link from "next/link";
import { Package, Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { formatMoney } from "@/lib/currency";
import { getActiveCurrency } from "@/lib/currency-server";
import { formatDate } from "@/lib/utils";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user.id;
  const currency = await getActiveCurrency();

  const [orderCount, orders, wishlistCount] = await Promise.all([
    db.order.count({ where: { userId } }),
    db.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    db.wishlistItem.count({ where: { userId } }),
  ]);

  const stats = [
    { label: "Orders", value: orderCount, icon: Package, href: "/dashboard/orders" },
    { label: "Wishlist", value: wishlistCount, href: "/dashboard/wishlist", icon: Heart },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        {stats.map((s) => (
          <Link key={s.label} href={s.href}>
            <Card className="transition-shadow hover:shadow-md">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="rounded-full bg-secondary p-3">
                  <s.icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{s.value}</div>
                  <div className="text-sm text-muted-foreground">{s.label}</div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent Orders</h2>
          <Link href="/dashboard/orders" className="text-sm text-accent hover:underline">
            View all
          </Link>
        </div>
        {orders.length === 0 ? (
          <p className="text-sm text-muted-foreground">No orders yet.</p>
        ) : (
          <div className="space-y-3">
            {orders.map((o) => (
              <Link
                key={o.id}
                href={`/dashboard/orders/${o.id}`}
                className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-secondary/50"
              >
                <div>
                  <div className="font-medium">{o.orderNumber}</div>
                  <div className="text-sm text-muted-foreground">{formatDate(o.createdAt)}</div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={o.status === "DELIVERED" ? "success" : "secondary"}>{o.status}</Badge>
                  <span className="font-semibold">{formatMoney(o.total, currency)}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
