import Link from "next/link";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { db } from "@/lib/db";
import { formatMoney } from "@/lib/currency";
import { getActiveCurrency } from "@/lib/currency-server";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default async function AdminCouponsPage() {
  const currency = await getActiveCurrency();
  const coupons = await db.coupon.findMany({ orderBy: [{ createdAt: "desc" }] });

  async function deleteCoupon(formData: FormData) {
    "use server";
    const id = String(formData.get("id"));
    await db.coupon.delete({ where: { id } });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Coupons</h1>
        <Button asChild size="sm">
          <Link href="/admin/coupons/new"><Plus className="h-4 w-4" /> New coupon</Link>
        </Button>
      </div>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Min order</TableHead>
              <TableHead>Max uses</TableHead>
              <TableHead>Per customer</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {coupons.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.code}</TableCell>
                <TableCell>{c.type}</TableCell>
                <TableCell>{c.type === "PERCENTAGE" ? `${c.value}%` : formatMoney(Number(c.value), currency)}</TableCell>
                <TableCell>{c.minOrder ? formatMoney(Number(c.minOrder), currency) : "—"}</TableCell>
                <TableCell>{c.maxUses ? `${c.usedCount}/${c.maxUses}` : "Unlimited"}</TableCell>
                <TableCell>{c.perUserLimit ? `${c.perUserLimit}` : "Unlimited"}</TableCell>
                <TableCell>{c.expiresAt ? formatDate(c.expiresAt) : "—"}</TableCell>
                <TableCell>
                  <Badge variant={c.isActive ? "success" : "secondary"}>{c.isActive ? "Active" : "Inactive"}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/admin/coupons/${c.id}/edit`}><Pencil className="h-4 w-4" /> Edit</Link>
                    </Button>
                    <form action={deleteCoupon}>
                      <input type="hidden" name="id" value={c.id} />
                      <Button type="submit" variant="outline" size="sm" className="text-destructive">
                        <Trash2 className="h-4 w-4" /> Delete
                      </Button>
                    </form>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
