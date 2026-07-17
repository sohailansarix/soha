import Link from "next/link";
import { Check, X, Trash2 } from "lucide-react";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const dynamic = "force-dynamic";

export default async function AdminBlogCommentsPage() {
  const comments = await db.blogComment.findMany({
    orderBy: [{ createdAt: "desc" }],
    take: 100,
    include: { post: { select: { title: true, slug: true } } },
  });

  async function moderate(formData: FormData) {
    "use server";
    const id = String(formData.get("id"));
    const action = String(formData.get("action"));
    if (action === "approve") {
      await db.blogComment.update({ where: { id }, data: { isApproved: true } });
    } else if (action === "reject") {
      await db.blogComment.update({ where: { id }, data: { isApproved: false } });
    } else if (action === "delete") {
      await db.blogComment.delete({ where: { id } });
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Blog Comments</h1>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Author</TableHead>
              <TableHead>Post</TableHead>
              <TableHead>Comment</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {comments.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.authorName}</TableCell>
                <TableCell>
                  <Link href={`/blog/${c.post.slug}`} className="text-primary hover:underline">
                    {c.post.title}
                  </Link>
                </TableCell>
                <TableCell className="max-w-xs truncate">{c.content}</TableCell>
                <TableCell>
                  <Badge variant={c.isApproved ? "default" : "secondary"}>
                    {c.isApproved ? "Approved" : "Pending"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    {!c.isApproved && (
                      <form action={moderate}>
                        <input type="hidden" name="id" value={c.id} />
                        <input type="hidden" name="action" value="approve" />
                        <Button type="submit" variant="outline" size="sm"><Check className="h-4 w-4" /></Button>
                      </form>
                    )}
                    {c.isApproved && (
                      <form action={moderate}>
                        <input type="hidden" name="id" value={c.id} />
                        <input type="hidden" name="action" value="reject" />
                        <Button type="submit" variant="outline" size="sm"><X className="h-4 w-4" /></Button>
                      </form>
                    )}
                    <form action={moderate}>
                      <input type="hidden" name="id" value={c.id} />
                      <input type="hidden" name="action" value="delete" />
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
