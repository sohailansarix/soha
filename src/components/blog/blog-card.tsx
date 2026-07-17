import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

interface BlogCardPost {
  id: string;
  slug: string;
  title: string;
  excerpt?: string | null;
  coverImage?: string | null;
  publishedAt?: Date | null;
  readingTime?: number;
  author?: { name?: string | null } | null;
  category?: { name: string; slug: string } | null;
  _count?: { comments: number; likes: number };
}

export function BlogCard({ post, featured = false }: { post: BlogCardPost; featured?: boolean }) {
  return (
    <Link href={`/blog/${post.slug}`} className="group block">
      <Card className="h-full overflow-hidden transition hover:shadow-md">
        <div className={`relative w-full overflow-hidden bg-secondary ${featured ? "aspect-[16/9]" : "aspect-[16/10]"}`}>
          {post.coverImage ? (
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">SOHA</div>
          )}
          {post.category && (
            <span className="absolute left-3 top-3">
              <Badge variant="accent">{post.category.name}</Badge>
            </span>
          )}
        </div>
        <CardContent className="p-5">
          <p className="text-xs text-muted-foreground">
            {post.publishedAt ? formatDate(post.publishedAt) : "Draft"} · {post.author?.name ?? "SOHA"}
            {post.readingTime ? ` · ${post.readingTime} min read` : ""}
          </p>
          <h3 className={`mt-2 font-semibold ${featured ? "text-2xl" : "text-lg"} group-hover:text-accent`}>
            {post.title}
          </h3>
          {post.excerpt && (
            <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{post.excerpt}</p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
