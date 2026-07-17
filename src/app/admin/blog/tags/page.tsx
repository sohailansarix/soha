import Link from "next/link";
import { Plus, Trash2 } from "lucide-react";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const dynamic = "force-dynamic";

export default async function AdminBlogTagsPage() {
  const tags = await db.blogTag.findMany({
    orderBy: [{ name: "asc" }],
    include: { _count: { select: { posts: true } } },
  });

  async function deleteTag(formData: FormData) {
    "use server";
    const id = String(formData.get("id"));
    await db.blogTag.delete({ where: { id } });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Blog Tags</h1>
        <Button asChild size="sm">
          <Link href="/admin/blog/tags/new"><Plus className="h-4 w-4" /> New tag</Link>
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
            {tags.map((t) => (
              <TableRow key={t.id}>
                <TableCell className="font-medium">{t.name}</TableCell>
                <TableCell>{t.slug}</TableCell>
                <TableCell>{t._count.posts}</TableCell>
                <TableCell className="text-right">
                  <form action={deleteTag}>
                    <input type="hidden" name="id" value={t.id} />
                    <Button type="submit" variant="outline" size="sm" className="text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </form>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
