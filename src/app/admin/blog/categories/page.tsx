import Link from "next/link";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const dynamic = "force-dynamic";

export default async function AdminBlogCategoriesPage() {
  const categories = await db.blogCategory.findMany({
    orderBy: [{ name: "asc" }],
    include: { _count: { select: { posts: true } } },
  });

  async function deleteCategory(formData: FormData) {
    "use server";
    const id = String(formData.get("id"));
    await db.blogCategory.delete({ where: { id } });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Blog Categories</h1>
        <Button asChild size="sm">
          <Link href="/admin/blog/categories/new"><Plus className="h-4 w-4" /> New category</Link>
        </Button>
      </div>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Posts</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell>{c.slug}</TableCell>
                <TableCell>{c._count.posts}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/admin/blog/categories/${c.id}/edit`}><Pencil className="h-4 w-4" /> Edit</Link>
                    </Button>
                    <form action={deleteCategory}>
                      <input type="hidden" name="id" value={c.id} />
                      <Button type="submit" variant="outline" size="sm" className="text-destructive">
                        <Trash2 className="h-4 w-4" />
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
