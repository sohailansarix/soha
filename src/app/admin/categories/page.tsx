import Link from "next/link";
import { Plus } from "lucide-react";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default async function AdminCategoriesPage() {
  const categories = await db.category.findMany({
    orderBy: [{ name: "asc" }],
    include: { parent: true, _count: { select: { products: true, children: true } } },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Categories</h1>
        <Button asChild size="sm">
          <Link href="/admin/categories/new"><Plus className="h-4 w-4" /> New category</Link>
        </Button>
      </div>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Parent</TableHead>
              <TableHead className="text-right">Products</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">
                  <Link href={`/admin/categories/${c.id}/edit`} className="hover:underline">{c.name}</Link>
                </TableCell>
                <TableCell>{c.slug}</TableCell>
                <TableCell>{c.parent?.name ?? "—"}</TableCell>
                <TableCell className="text-right">{c._count.products}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
