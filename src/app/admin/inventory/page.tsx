import { db } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { InventoryAdjust } from "./inventory-adjust";

export default async function AdminInventoryPage() {
  const variants = await db.productVariant.findMany({
    orderBy: [{ product: { name: "asc" } }],
    include: {
      product: { select: { name: true, slug: true } },
      _count: { select: { inventory: true } },
    },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Inventory</h1>
      <p className="text-sm text-muted-foreground">
        Stock is tracked per product variant. Adjust quantities to keep levels accurate.
      </p>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Variant</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead className="text-right">Adjust</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {variants.map((v) => (
              <TableRow key={v.id}>
                <TableCell className="font-medium">
                  <a href={`/products/${v.product.slug}`} className="hover:underline">
                    {v.product.name}
                  </a>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {Object.entries((v.attributes as Record<string, string>) ?? {})
                    .map(([k, val]) => `${k}: ${val}`)
                    .join(" / ") || "—"}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{v.sku}</TableCell>
                <TableCell>
                  <Badge variant={v.stock > 0 ? "success" : "destructive"}>{v.stock}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <InventoryAdjust variantId={v.id} currentStock={v.stock} />
                </TableCell>
              </TableRow>
            ))}
            {variants.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
                  No variants found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
