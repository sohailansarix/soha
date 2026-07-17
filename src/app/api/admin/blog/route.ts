import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { hasRole } from "@/lib/constants";
import { readingTime, makeExcerpt, slugifyTitle } from "@/lib/blog";

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

export async function syncTags(postId: string, tagNames: string[]) {
  const names = Array.from(
    new Set(tagNames.map((t) => t.trim()).filter(Boolean).map((t) => t.toLowerCase())),
  );
  // Ensure tags exist.
  const tags = [];
  for (const name of names) {
    const slug = slugifyTitle(name);
    const tag = await db.blogTag.upsert({
      where: { slug },
      update: {},
      create: { name, slug },
    });
    tags.push(tag);
  }
  // Replace associations.
  await db.blogPostTag.deleteMany({ where: { postId } });
  for (const tag of tags) {
    await db.blogPostTag.create({ data: { postId, tagId: tag.id } });
  }
}

export async function syncProducts(postId: string, productIds: string[]) {
  const ids = Array.from(new Set(productIds.map((p) => p.trim()).filter(Boolean)));
  await db.blogPostProduct.deleteMany({ where: { postId } });
  for (const pid of ids) {
    const exists = await db.product.findUnique({ where: { id: pid } });
    if (exists) await db.blogPostProduct.create({ data: { postId, productId: pid } });
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!hasRole(session?.user?.role, "ADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const { tags, relatedProductIds, publishedAt, ...rest } = parsed.data;
  const isPublished = Boolean(rest.isPublished);
  const post = await db.blogPost.create({
    data: {
      ...rest,
      categoryId: rest.categoryId ? rest.categoryId : null,
      authorId: session!.user.id,
      excerpt: rest.excerpt || makeExcerpt(rest.content),
      readingTime: readingTime(rest.content),
      isPublished,
      publishedAt: isPublished ? (publishedAt ? new Date(publishedAt) : new Date()) : null,
    },
  });

  await syncTags(post.id, (tags ?? "").split(","));
  await syncProducts(post.id, (relatedProductIds ?? "").split(","));

  return NextResponse.json({ ok: true, post });
}

export async function GET() {
  const session = await auth();
  if (!hasRole(session?.user?.role, "ADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const posts = await db.blogPost.findMany({ orderBy: [{ createdAt: "desc" }] });
  return NextResponse.json({ posts });
}
