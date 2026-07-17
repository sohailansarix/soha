import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ReviewActions } from "./review-actions";

export const dynamic = "force-dynamic";

export default async function AdminReviewsPage() {
  const reviews = await db.review.findMany({
    orderBy: [{ createdAt: "desc" }],
    include: {
      user: { select: { name: true, email: true } },
      product: { select: { name: true, slug: true } },
    },
  });

  const pending = reviews.filter((r) => !r.isApproved).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Reviews</h1>
        <Badge variant={pending > 0 ? "secondary" : "success"}>{pending} pending</Badge>
      </div>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Comment</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reviews.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-medium">
                  <a href={`/products/${r.product.slug}`} className="hover:underline">
                    {r.product.name}
                  </a>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{r.user.name ?? r.user.email}</TableCell>
                <TableCell>{r.rating}/5</TableCell>
                <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                  {r.comment ?? r.title ?? "—"}
                </TableCell>
                <TableCell>
                  <Badge variant={r.isApproved ? "success" : "secondary"}>
                    {r.isApproved ? "Approved" : "Pending"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <ReviewActions id={r.id} isApproved={r.isApproved} />
                </TableCell>
              </TableRow>
            ))}
            {reviews.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-sm text-muted-foreground">
                  No reviews yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
