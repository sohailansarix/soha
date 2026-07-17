import Link from "next/link";
import { db } from "@/lib/db";
import { formatMoney } from "@/lib/currency";
import { getActiveCurrency } from "@/lib/currency-server";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default async function AdminOrdersPage() {
  const currency = await getActiveCurrency();
  const orders = await db.order.findMany({
    orderBy: [{ createdAt: "desc" }],
    include: { user: { select: { name: true, email: true } } },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Orders</h1>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((o) => (
              <TableRow key={o.id}>
                <TableCell className="font-medium">
                  <Link href={`/admin/orders/${o.id}`} className="hover:underline">{o.orderNumber}</Link>
                </TableCell>
                <TableCell>{o.user.name ?? o.user.email}</TableCell>
                <TableCell>{formatDate(o.createdAt)}</TableCell>
                <TableCell><Badge variant="secondary">{o.status}</Badge></TableCell>
                <TableCell><Badge variant={o.paymentStatus === "PAID" ? "success" : "secondary"}>{o.paymentStatus}</Badge></TableCell>
                <TableCell className="text-right font-semibold">{formatMoney(o.total, currency)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
