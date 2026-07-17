import Link from "next/link";
import { Plus } from "lucide-react";
import { db } from "@/lib/db";
import { formatMoney } from "@/lib/currency";
import { getActiveCurrency } from "@/lib/currency-server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default async function AdminProductsPage() {
  const currency = await getActiveCurrency();
  const products = await db.product.findMany({
    orderBy: [{ createdAt: "desc" }],
    include: { brand: true, category: true, _count: { select: { reviews: true } } },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Products</h1>
        <Button asChild size="sm">
          <Link href="/admin/products/new">
            <Plus className="h-4 w-4" /> New product
          </Link>
        </Button>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Brand</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.name}</TableCell>
                <TableCell>{p.category?.name ?? "—"}</TableCell>
                <TableCell>{p.brand?.name ?? "—"}</TableCell>
                <TableCell>{formatMoney(p.minPrice ?? 0, currency)}</TableCell>
                <TableCell>
                  <Badge variant={p.isActive ? "success" : "secondary"}>
                    {p.isActive ? "Active" : "Draft"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/admin/products/${p.id}/edit`}>Edit</Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
