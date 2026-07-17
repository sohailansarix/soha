import Link from "next/link";
import { Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const dynamic = "force-dynamic";

export default async function AdminBlogPage() {
  const posts = await db.blogPost.findMany({
    orderBy: [{ createdAt: "desc" }],
    include: { author: { select: { name: true } }, category: { select: { name: true } }, _count: { select: { comments: true } } },
  });

  async function deletePost(formData: FormData) {
    "use server";
    const id = String(formData.get("id"));
    await db.blogPost.delete({ where: { id } });
  }
  async function togglePublish(formData: FormData) {
    "use server";
    const id = String(formData.get("id"));
    const post = await db.blogPost.findUnique({ where: { id } });
    if (post) {
      await db.blogPost.update({
        where: { id },
        data: { isPublished: !post.isPublished, publishedAt: !post.isPublished ? new Date() : post.publishedAt },
      });
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">Blog</h1>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/blog/categories">Categories</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/blog/tags">Tags</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/blog/comments">Comments</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/admin/blog/new"><Plus className="h-4 w-4" /> New article</Link>
          </Button>
        </div>
      </div>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Views</TableHead>
              <TableHead>Comments</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.title}</TableCell>
                <TableCell>{p.category?.name ?? "—"}</TableCell>
                <TableCell>
                  <Badge variant={p.isPublished ? "success" : "secondary"}>{p.isPublished ? "Published" : "Draft"}</Badge>
                </TableCell>
                <TableCell>{p.viewCount}</TableCell>
                <TableCell>{p._count.comments}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{formatDate(p.updatedAt)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <form action={togglePublish}>
                      <input type="hidden" name="id" value={p.id} />
                      <Button type="submit" variant="outline" size="sm">
                        {p.isPublished ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </form>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/admin/blog/${p.id}/edit`}><Pencil className="h-4 w-4" /> Edit</Link>
                    </Button>
                    <form action={deletePost}>
                      <input type="hidden" name="id" value={p.id} />
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
