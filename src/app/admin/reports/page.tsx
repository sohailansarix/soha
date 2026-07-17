import { db } from "@/lib/db";
import { formatMoney } from "@/lib/currency";
import { getActiveCurrency } from "@/lib/currency-server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SalesChart } from "../sales-chart";
import { ReportsExport } from "./reports-export";

export const dynamic = "force-dynamic";

export default async function AdminReportsPage() {
  const currency = await getActiveCurrency();
  const [paidAgg, ordersByStatus, revenueByDay, topProducts, refundedAgg, refundedCount] = await Promise.all([
    db.order.aggregate({ _sum: { total: true }, _avg: { total: true }, _count: true, where: { paymentStatus: "PAID" } }),
    db.order.groupBy({ by: ["status"], _count: { _all: true } }),
    db.order.groupBy({
      by: ["createdAt"],
      where: { paymentStatus: "PAID" },
      _sum: { total: true },
      orderBy: [{ createdAt: "asc" }],
      take: 30,
    }),
    db.orderItem.groupBy({
      by: ["name"],
      _sum: { quantity: true, price: true },
      orderBy: [{ _sum: { quantity: "desc" } }],
      take: 5,
    }),
    db.order.aggregate({ _sum: { total: true }, where: { paymentStatus: "REFUNDED" } }),
    db.order.count({ where: { paymentStatus: "REFUNDED" } }),
  ]);

  const revenue = Number(paidAgg._sum.total ?? 0);
  const aov = Number(paidAgg._avg.total ?? 0);
  const orderCount = paidAgg._count;
  const refundedRevenue = Number(refundedAgg._sum.total ?? 0);
  const chartData = revenueByDay.map((s) => ({
    date: new Date(s.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    revenue: Number(s._sum.total ?? 0),
  }));

  const kpis = [
    { label: "Total Revenue (paid)", value: formatMoney(revenue, currency) },
    { label: "Avg Order Value", value: formatMoney(aov, currency) },
    { label: "Paid Orders", value: String(orderCount) },
    { label: "Refunded Orders", value: String(refundedCount) },
    { label: "Refunded Amount", value: formatMoney(refundedRevenue, currency) },
    { label: "Order Statuses", value: String(ordersByStatus.length) },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Sales Reports</h1>
        <ReportsExport
          revenueByDay={revenueByDay.map((s) => ({
            date: new Date(s.createdAt).toISOString().slice(0, 10),
            revenue: Number(s._sum.total ?? 0),
          }))}
          topProducts={topProducts.map((p) => ({
            name: p.name,
            quantity: Number(p._sum.quantity ?? 0),
            revenue: Number(p._sum.price ?? 0),
          }))}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <Card key={k.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{k.label}</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-bold">{k.value}</CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Revenue trend (last 30 paid orders)</CardTitle>
        </CardHeader>
        <CardContent>
          <SalesChart data={chartData} />
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Orders by Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {ordersByStatus.map((s) => (
              <div key={s.status} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{s.status}</span>
                <span className="font-semibold">{s._count._all}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Products</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {topProducts.map((p) => (
              <div key={p.name} className="flex items-center justify-between text-sm">
                <span>{p.name}</span>
                <span className="font-semibold">{formatMoney(Number(p._sum.price ?? 0), currency)}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
