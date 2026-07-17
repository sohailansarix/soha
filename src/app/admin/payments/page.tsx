import { db } from "@/lib/db";
import { formatMoney } from "@/lib/currency";
import { getActiveCurrency } from "@/lib/currency-server";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RefundButton } from "./refund-button";

export const dynamic = "force-dynamic";

export default async function AdminPaymentsPage() {
  const currency = await getActiveCurrency();
  const [payments, refunds] = await Promise.all([
    db.payment.findMany({
      orderBy: [{ createdAt: "desc" }],
      include: { order: { select: { orderNumber: true } } },
    }),
    db.refund.findMany({ orderBy: [{ createdAt: "desc" }], include: { order: { select: { orderNumber: true } } } }),
  ]);

  const totalCollected = payments
    .filter((p) => p.status === "PAID")
    .reduce((s, p) => s + Number(p.amount), 0);
  const totalRefunded = refunds.reduce((s, r) => s + Number(r.amount), 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Payments</h1>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Collected</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{formatMoney(totalCollected, currency)}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Refunded</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{formatMoney(totalRefunded, currency)}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Transactions</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{payments.length}</CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Payments</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.order.orderNumber}</TableCell>
                  <TableCell>{p.method}</TableCell>
                  <TableCell>{formatMoney(p.amount, currency)}</TableCell>
                  <TableCell>
                    <Badge variant={p.status === "PAID" ? "success" : "secondary"}>{p.status}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatDate(p.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    {p.status === "PAID" && <RefundButton id={p.id} max={Number(p.amount)} />}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Refunds</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {refunds.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.order.orderNumber}</TableCell>
                  <TableCell>{formatMoney(r.amount, currency)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{r.reason ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{r.status}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatDate(r.createdAt)}</TableCell>
                </TableRow>
              ))}
              {refunds.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
                    No refunds yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
