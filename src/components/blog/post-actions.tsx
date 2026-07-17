"use client";

import * as React from "react";
import { Heart, Bookmark, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

export function PostActions({ slug, initialLikes }: { slug: string; initialLikes: number }) {
  const { toast } = useToast();
  const [likes, setLikes] = React.useState(initialLikes);
  const [liked, setLiked] = React.useState(false);
  const [bookmarked, setBookmarked] = React.useState(false);
  const [busy, setBusy] = React.useState(false);

  async function toggleLike() {
    setBusy(true);
    try {
      const res = await fetch(`/api/blog/${slug}/like`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setLikes(data.likes);
        setLiked(data.liked);
      }
    } finally {
      setBusy(false);
    }
  }

  async function toggleBookmark() {
    const res = await fetch(`/api/blog/${slug}/bookmark`, { method: "POST" });
    if (res.ok) {
      const data = await res.json();
      setBookmarked(data.bookmarked);
      toast({ title: data.bookmarked ? "Saved to bookmarks" : "Removed bookmark" });
    }
  }

  function share() {
    if (navigator.share) {
      navigator.share({ title: document.title, url: window.location.href }).catch(() => null);
    } else {
      navigator.clipboard?.writeText(window.location.href);
      toast({ title: "Link copied to clipboard" });
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant={liked ? "default" : "outline"} size="sm" onClick={toggleLike} disabled={busy}>
        <Heart className={cn("h-4 w-4", liked && "fill-current")} /> {likes}
      </Button>
      <Button variant={bookmarked ? "default" : "outline"} size="sm" onClick={toggleBookmark}>
        <Bookmark className={cn("h-4 w-4", bookmarked && "fill-current")} /> Save
      </Button>
      <Button variant="outline" size="sm" onClick={share}>
        <Share2 className="h-4 w-4" /> Share
      </Button>
    </div>
  );
}
