import { db } from "@/lib/db";

const POST_INCLUDE = {
  author: { select: { id: true, name: true, image: true } },
  category: { select: { id: true, name: true, slug: true } },
  tags: { include: { tag: { select: { id: true, name: true, slug: true } } } },
  _count: { select: { comments: true, likes: true } },
};

export const BLOG_PAGE_SIZE = 9;

export async function getPublishedPosts({
  page = 1,
  categorySlug,
  tagSlug,
  authorId,
  query,
  take,
}: {
  page?: number;
  categorySlug?: string;
  tagSlug?: string;
  authorId?: string;
  query?: string;
  take?: number;
} = {}) {
  const where: Record<string, unknown> = { isPublished: true };
  if (categorySlug) where.category = { slug: categorySlug };
  if (authorId) where.authorId = authorId;
  if (tagSlug) where.tags = { some: { tag: { slug: tagSlug } } };
  if (query) {
    where.OR = [
      { title: { contains: query, mode: "insensitive" } },
      { excerpt: { contains: query, mode: "insensitive" } },
      { content: { contains: query, mode: "insensitive" } },
    ];
  }

  const skip = take ? 0 : (page - 1) * BLOG_PAGE_SIZE;
  const takeVal = take ?? BLOG_PAGE_SIZE;

  const [posts, total] = await Promise.all([
    db.blogPost.findMany({
      where,
      include: POST_INCLUDE,
      orderBy: [{ publishedAt: "desc" }],
      skip,
      take: takeVal,
    }),
    db.blogPost.count({ where }),
  ]);

  return { posts, total, page, pageSize: BLOG_PAGE_SIZE, totalPages: Math.ceil(total / BLOG_PAGE_SIZE) };
}

export async function getFeaturedPost() {
  return db.blogPost.findFirst({
    where: { isPublished: true, isFeatured: true },
    include: POST_INCLUDE,
    orderBy: [{ publishedAt: "desc" }],
  });
}

export async function getPostBySlug(slug: string) {
  return db.blogPost.findUnique({
    where: { slug },
    include: {
      author: { select: { id: true, name: true, image: true } },
      category: { select: { id: true, name: true, slug: true } },
      tags: { include: { tag: { select: { id: true, name: true, slug: true } } } },
      _count: { select: { comments: true, likes: true } },
      relatedProducts: {
        include: { product: { include: { images: { take: 1 }, variants: true } } },
      },
      comments: {
        where: { isApproved: true, parentId: null },
        include: { replies: { where: { isApproved: true }, orderBy: [{ createdAt: "asc" }] } },
        orderBy: [{ createdAt: "asc" }],
      },
    },
  });
}

export async function getAdjacentPosts(publishedAt: Date | null, id: string) {
  if (!publishedAt) return { prev: null, next: null };
  const [prev, next] = await Promise.all([
    db.blogPost.findFirst({
      where: { isPublished: true, publishedAt: { lt: publishedAt } },
      orderBy: [{ publishedAt: "desc" }],
      select: { slug: true, title: true },
    }),
    db.blogPost.findFirst({
      where: { isPublished: true, publishedAt: { gt: publishedAt } },
      orderBy: [{ publishedAt: "asc" }],
      select: { slug: true, title: true },
    }),
  ]);
  return { prev, next };
}

export async function getRelatedPosts(postId: string, categoryId: string | null, limit = 3) {
  return db.blogPost.findMany({
    where: {
      isPublished: true,
      id: { not: postId },
      ...(categoryId ? { categoryId } : {}),
    },
    include: POST_INCLUDE,
    orderBy: [{ publishedAt: "desc" }],
    take: limit,
  });
}

export async function getCategoriesWithCounts() {
  const cats = await db.blogCategory.findMany({
    orderBy: [{ name: "asc" }],
    include: { _count: { select: { posts: { where: { isPublished: true } } } } },
  });
  return cats;
}

export async function getPopularTags(limit = 12) {
  const tags = await db.blogTag.findMany({
    orderBy: [{ name: "asc" }],
    include: { _count: { select: { posts: true } } },
    take: 50,
  });
  return tags
    .filter((t) => t._count.posts > 0)
    .sort((a, b) => b._count.posts - a._count.posts)
    .slice(0, limit);
}

export async function getTrendingPosts(limit = 5) {
  return db.blogPost.findMany({
    where: { isPublished: true },
    include: POST_INCLUDE,
    orderBy: [{ viewCount: "desc" }, { publishedAt: "desc" }],
    take: limit,
  });
}

export async function getMostLiked(limit = 5) {
  return db.blogPost.findMany({
    where: { isPublished: true },
    include: POST_INCLUDE,
    orderBy: [{ likeCount: "desc" }, { publishedAt: "desc" }],
    take: limit,
  });
}

export async function getAuthors() {
  return db.blogPost.groupBy({
    by: ["authorId"],
    where: { isPublished: true, authorId: { not: null } },
    _count: { _all: true },
  });
}
