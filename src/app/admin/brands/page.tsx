import Link from "next/link";
import { Plus } from "lucide-react";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default async function AdminBrandsPage() {
  const brands = await db.brand.findMany({
    orderBy: [{ name: "asc" }],
    include: { _count: { select: { products: true } } },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Brands</h1>
        <Button asChild size="sm">
          <Link href="/admin/brands/new"><Plus className="h-4 w-4" /> New brand</Link>
        </Button>
      </div>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead className="text-right">Products</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {brands.map((b) => (
              <TableRow key={b.id}>
                <TableCell className="font-medium">
                  <Link href={`/admin/brands/${b.id}/edit`} className="hover:underline">{b.name}</Link>
                </TableCell>
                <TableCell>{b.slug}</TableCell>
                <TableCell className="text-right">{b._count.products}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
