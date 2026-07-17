import Link from "next/link";
import { db } from "@/lib/db";
import { formatMoney } from "@/lib/currency";
import { getActiveCurrency } from "@/lib/currency-server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SalesChart } from "./sales-chart";

export default async function AdminOverviewPage() {
  const currency = await getActiveCurrency();
  const [totalProducts, totalOrders, totalCustomers, totalRevenueAgg, recentOrders, salesData, pendingOrders, lowStock, aovAgg, refundedAgg, refundedCount] =
    await Promise.all([
      db.product.count(),
      db.order.count(),
      db.user.count({ where: { role: { in: ["CUSTOMER"] } } }),
      db.order.aggregate({ _sum: { total: true }, where: { paymentStatus: "PAID" } }),
      db.order.findMany({
        take: 5,
        orderBy: [{ createdAt: "desc" }],
        include: { user: { select: { name: true, email: true } } },
      }),
      db.order.groupBy({
        by: ["createdAt"],
        where: { paymentStatus: "PAID" },
        _sum: { total: true },
        orderBy: [{ createdAt: "asc" }],
        take: 30,
      }),
      db.order.count({ where: { status: { in: ["PENDING", "CONFIRMED"] } } }),
      db.productVariant.count({ where: { stock: { lte: 5 } } }),
      db.order.aggregate({ _avg: { total: true }, where: { paymentStatus: "PAID" } }),
      db.order.aggregate({ _sum: { total: true }, where: { paymentStatus: "REFUNDED" } }),
      db.order.count({ where: { paymentStatus: "REFUNDED" } }),
    ]);

  const totalRevenue = Number(totalRevenueAgg._sum.total ?? 0);
  const aov = Number(aovAgg._avg.total ?? 0);
  const refundedRevenue = Number(refundedAgg._sum.total ?? 0);
  const chartData = salesData.map((s) => ({
    date: new Date(s.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    revenue: Number(s._sum.total ?? 0),
  }));

  const stats = [
    { label: "Revenue", value: formatMoney(totalRevenue, currency) },
    { label: "Avg Order Value", value: formatMoney(aov, currency) },
    { label: "Orders", value: String(totalOrders) },
    { label: "Pending Orders", value: String(pendingOrders) },
    { label: "Products", value: String(totalProducts) },
    { label: "Low Stock Variants", value: String(lowStock) },
    { label: "Customers", value: String(totalCustomers) },
    { label: "Refunded", value: String(refundedCount) },
    { label: "Refunded Amount", value: formatMoney(refundedRevenue, currency) },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Button asChild size="sm">
          <Link href="/admin/products/new">Add product</Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-bold">{s.value}</CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Revenue (last 30 paid orders)</CardTitle>
        </CardHeader>
        <CardContent>
          <SalesChart data={chartData} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Orders</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {recentOrders.map((o) => (
            <div key={o.id} className="flex items-center justify-between text-sm">
              <Link href={`/admin/orders/${o.id}`} className="font-medium hover:underline">
                {o.orderNumber}
              </Link>
              <span className="text-muted-foreground">{o.user.name ?? o.user.email}</span>
              <span className="font-semibold">{formatMoney(o.total, currency)}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
