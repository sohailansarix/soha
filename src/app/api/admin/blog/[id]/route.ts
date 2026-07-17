import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { hasRole } from "@/lib/constants";
import { readingTime, makeExcerpt } from "@/lib/blog";
import { syncTags, syncProducts } from "../route";

const schema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  subtitle: z.string().optional(),
  excerpt: z.string().optional(),
  content: z.string().min(1),
  coverImage: z.string().optional(),
  categoryId: z.string().optional(),
  tags: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  keywords: z.string().optional(),
  canonicalUrl: z.string().optional(),
  relatedProductIds: z.string().optional(),
  isPublished: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  publishedAt: z.string().optional(),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!hasRole(session?.user?.role, "ADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const { tags, relatedProductIds, publishedAt, ...rest } = parsed.data;
  const existing = await db.blogPost.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isPublished = Boolean(rest.isPublished);
  const wasPublished = existing.isPublished;
  const newPublishedAt =
    isPublished && !wasPublished ? (publishedAt ? new Date(publishedAt) : new Date()) : existing.publishedAt;

  const post = await db.blogPost.update({
    where: { id },
    data: {
      ...rest,
      excerpt: rest.excerpt || makeExcerpt(rest.content),
      readingTime: readingTime(rest.content),
      isPublished,
      publishedAt: newPublishedAt,
    },
  });

  await syncTags(post.id, (tags ?? "").split(","));
  await syncProducts(post.id, (relatedProductIds ?? "").split(","));

  return NextResponse.json({ ok: true, post });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!hasRole(session?.user?.role, "ADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;
  await db.blogPost.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
