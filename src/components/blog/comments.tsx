"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { formatDate } from "@/lib/utils";

interface CommentNode {
  id: string;
  authorName: string;
  content: string;
  createdAt: string;
  replies?: CommentNode[];
}

export function Comments({ slug, initialComments }: { slug: string; initialComments: CommentNode[] }) {
  const { toast } = useToast();
  const [comments, setComments] = React.useState<CommentNode[]>(initialComments);
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [content, setContent] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/blog/${slug}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, content }),
      });
      if (res.ok) {
        toast({ title: "Comment submitted for moderation" });
        setContent("");
      } else {
        toast({ title: "Could not submit comment", variant: "destructive" });
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mt-12">
      <h2 className="text-xl font-bold">Comments ({comments.length})</h2>

      <form onSubmit={submit} className="mt-4 space-y-3 rounded-lg border p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <Label htmlFor="cname">Name</Label>
            <Input id="cname" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="cemail">Email</Label>
            <Input id="cemail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
        </div>
        <div className="space-y-1">
          <Label htmlFor="ccontent">Comment</Label>
          <Textarea id="ccontent" value={content} onChange={(e) => setContent(e.target.value)} required />
        </div>
        <Button type="submit" disabled={busy}>{busy ? "Posting…" : "Post comment"}</Button>
      </form>

      <ul className="mt-6 space-y-4">
        {comments.map((c) => (
          <li key={c.id} className="rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">{c.authorName}</span>
              <span className="text-xs text-muted-foreground">{formatDate(c.createdAt)}</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{c.content}</p>
            {c.replies?.map((r) => (
              <div key={r.id} className="mt-3 ml-4 border-l pl-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{r.authorName}</span>
                  <span className="text-xs text-muted-foreground">{formatDate(r.createdAt)}</span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{r.content}</p>
              </div>
            ))}
          </li>
        ))}
        {comments.length === 0 && (
          <li className="text-sm text-muted-foreground">No comments yet. Be the first!</li>
        )}
      </ul>
    </section>
  );
}
