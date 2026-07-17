"use client";

import * as React from "react";
import { Rating } from "@/components/ui/rating";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { formatDate } from "@/lib/utils";

interface ReviewItem {
  id: string;
  rating: number;
  title: string | null;
  comment: string | null;
  createdAt: Date;
  user: { name: string | null; image?: string | null };
}

export function ProductReviews({
  productId,
  reviews,
  rating,
  reviewCount,
}: {
  productId: string;
  reviews: ReviewItem[];
  rating: number;
  reviewCount: number;
}) {
  const { toast } = useToast();
  const [open, setOpen] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [form, setForm] = React.useState({ rating: 5, title: "", comment: "" });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, ...form }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Could not submit review");
      }
      toast({ title: "Review submitted!", description: "It will appear after approval.", variant: "success" });
      setOpen(false);
      setForm({ rating: 5, title: "", comment: "" });
    } catch (e) {
      toast({
        title: "Could not submit",
        description: e instanceof Error ? e.message : undefined,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div className="flex flex-col gap-8 sm:flex-row sm:items-start">
        <div className="sm:w-64">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">{rating.toFixed(1)}</span>
            <span className="text-muted-foreground">/ 5</span>
          </div>
          <Rating value={rating} className="mt-1" />
          <p className="mt-1 text-sm text-muted-foreground">{reviewCount} reviews</p>
          <Button variant="outline" className="mt-4" onClick={() => setOpen((o) => !o)}>
            {open ? "Cancel" : "Write a review"}
          </Button>
        </div>

        <div className="flex-1 space-y-4">
          {open && (
            <Card>
              <CardContent className="pt-6">
                <form onSubmit={submit} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Your rating</Label>
                    <Rating
                      value={form.rating}
                      readOnly={false}
                      onChange={(v) => setForm((f) => ({ ...f, rating: v }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rtitle">Title</Label>
                    <Input
                      id="rtitle"
                      value={form.title}
                      onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                      placeholder="Summarize your experience"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rcomment">Review</Label>
                    <Textarea
                      id="rcomment"
                      required
                      value={form.comment}
                      onChange={(e) => setForm((f) => ({ ...f, comment: e.target.value }))}
                      placeholder="Tell others what you think"
                    />
                  </div>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? "Submitting…" : "Submit review"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {reviews.length === 0 ? (
            <p className="text-sm text-muted-foreground">No reviews yet. Be the first!</p>
          ) : (
            reviews.map((r) => (
              <div key={r.id} className="border-b pb-4 last:border-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Rating value={r.rating} size={14} />
                    {r.title && <span className="text-sm font-medium">{r.title}</span>}
                  </div>
                  <span className="text-xs text-muted-foreground">{formatDate(r.createdAt)}</span>
                </div>
                {r.comment && <p className="mt-2 text-sm text-muted-foreground">{r.comment}</p>}
                <p className="mt-2 text-xs font-medium">{r.user.name ?? "Customer"}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
