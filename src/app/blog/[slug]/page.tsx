import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { SiteLayout } from "@/components/layout/site-layout";
import { Badge } from "@/components/ui/badge";
import { JsonLd } from "@/components/seo/json-ld";
import { BlogContent } from "@/components/blog/blog-content";
import { BlogCard } from "@/components/blog/blog-card";
import { ReadingProgress } from "@/components/blog/reading-progress";
import { PostActions } from "@/components/blog/post-actions";
import { Comments } from "@/components/blog/comments";
import { RelatedProducts } from "@/components/blog/related-products";
import { parseContent, buildToc } from "@/lib/blog";
import { getPostBySlug, getAdjacentPosts, getRelatedPosts } from "@/lib/blog-queries";
import { SITE } from "@/lib/constants";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await db.blogPost.findUnique({ where: { slug } });
  if (!post) return {};
  const title = post.metaTitle ?? post.title;
  const description = post.metaDescription ?? post.excerpt ?? "";
  return {
    title,
    description,
    alternates: post.canonicalUrl ? { canonical: post.canonicalUrl } : undefined,
    openGraph: {
      type: "article",
      title: post.title,
      description,
      url: `${SITE.url}/blog/${post.slug}`,
      images: post.coverImage ? [{ url: post.coverImage }] : undefined,
      publishedTime: post.publishedAt?.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
      images: post.coverImage ? [post.coverImage] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post || !post.isPublished) notFound();

  const blocks = parseContent(post.content);
  const toc = buildToc(post.content);
  const [{ prev, next }, relatedPosts] = await Promise.all([
    getAdjacentPosts(post.publishedAt, post.id),
    getRelatedPosts(post.id, post.categoryId, 3),
  ]);

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt ?? "",
    image: post.coverImage ? [post.coverImage] : [],
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: post.author?.name ? { "@type": "Person", name: post.author.name } : { "@type": "Organization", name: SITE.name },
    publisher: { "@type": "Organization", name: SITE.name },
    mainEntityOfPage: `${SITE.url}/blog/${post.slug}`,
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE.url },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE.url}/blog` },
      { "@type": "ListItem", position: 3, name: post.title, item: `${SITE.url}/blog/${post.slug}` },
    ],
  };

  // Record a view (best-effort).
  db.blogView.create({ data: { postId: post.id } }).catch(() => null);
  db.blogPost.update({ where: { id: post.id }, data: { viewCount: { increment: 1 } } }).catch(() => null);

  return (
    <SiteLayout>
      <ReadingProgress />
      <JsonLd data={articleLd} />
      <JsonLd data={breadcrumbLd} />
      <article className="container max-w-3xl py-10">
        {/* Breadcrumb */}
        <nav className="mb-4 text-sm text-muted-foreground">
          <Link href="/blog" className="hover:underline">Blog</Link>
          {post.category && (
            <>
              <span className="mx-2">/</span>
              <Link href={`/blog?cat=${post.category.slug}`} className="hover:underline">{post.category.name}</Link>
            </>
          )}
        </nav>

        <p className="text-xs text-muted-foreground">
          {post.publishedAt ? formatDate(post.publishedAt) : "Draft"} · {post.author?.name ?? "SOHA"}
          {post.readingTime ? ` · ${post.readingTime} min read` : ""}
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">{post.title}</h1>
        {post.subtitle && <p className="mt-3 text-lg text-muted-foreground">{post.subtitle}</p>}

        {post.coverImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.coverImage} alt={post.title} className="mt-6 w-full rounded-lg object-cover" />
        )}

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {post.tags.map((t) => (
            <Link key={t.tag.id} href={`/blog?tag=${t.tag.slug}`}>
              <Badge variant="outline">#{t.tag.name}</Badge>
            </Link>
          ))}
        </div>

        <div className="mt-6">
          <PostActions slug={post.slug} initialLikes={post.likeCount} />
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[200px_1fr]">
          {/* TOC */}
          {toc.length > 0 && (
            <aside className="hidden lg:block">
              <div className="sticky top-24">
                <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Contents</h3>
                <ul className="space-y-1 text-sm">
                  {toc.map((item) => (
                    <li key={item.id} style={{ paddingLeft: (item.level - 2) * 12 }}>
                      <a href={`#${item.id}`} className="text-muted-foreground hover:text-accent">{item.text}</a>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          )}

          <div>
            <BlogContent blocks={blocks} />

            {/* Related products */}
            <RelatedProducts
              products={post.relatedProducts.map((rp) => ({
                product: {
                  id: rp.product.id,
                  slug: rp.product.slug,
                  name: rp.product.name,
                  price: Number([...rp.product.variants].sort((a, b) => Number(a.price) - Number(b.price))[0]?.price ?? 0),
                  images: rp.product.images,
                },
              }))}
            />

            {/* Prev / Next */}
            <div className="mt-10 flex items-center justify-between gap-4 border-t pt-6">
              {prev ? (
                <Link href={`/blog/${prev.slug}`} className="text-sm font-medium hover:text-accent">← {prev.title}</Link>
              ) : <span />}
              {next ? (
                <Link href={`/blog/${next.slug}`} className="text-sm font-medium hover:text-accent">{next.title} →</Link>
              ) : <span />}
            </div>

            {/* Comments */}
            <Comments
              slug={post.slug}
              initialComments={post.comments.map((c) => ({
                id: c.id,
                authorName: c.authorName,
                content: c.content,
                createdAt: c.createdAt.toISOString(),
                replies: c.replies.map((r) => ({
                  id: r.id,
                  authorName: r.authorName,
                  content: r.content,
                  createdAt: r.createdAt.toISOString(),
                })),
              }))}
            />
          </div>
        </div>

        {/* Related articles */}
        {relatedPosts.length > 0 && (
          <section className="mt-12">
            <h2 className="mb-4 text-xl font-bold">Related Articles</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedPosts.map((p) => (
                <BlogCard key={p.id} post={p as never} />
              ))}
            </div>
          </section>
        )}
      </article>
    </SiteLayout>
  );
}
