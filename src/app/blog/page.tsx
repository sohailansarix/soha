import Link from "next/link";
import { Search } from "lucide-react";
import { SiteLayout } from "@/components/layout/site-layout";
import { SectionHeading } from "@/components/product/section-heading";
import { BlogCard } from "@/components/blog/blog-card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/product/pagination";
import {
  getPublishedPosts,
  getFeaturedPost,
  getCategoriesWithCounts,
  getPopularTags,
  getTrendingPosts,
} from "@/lib/blog-queries";

export const metadata = {
  title: "Blog — The SOHA Journal",
  description:
    "Guides, product reviews, and stories from SOHA. Fashion, beauty, electronics, home & kitchen, lifestyle and more.",
};

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; cat?: string; tag?: string }>;
}) {
  const sp = await searchParams;
  const page = Number(sp.page ?? "1") || 1;
  const query = sp.q?.trim() || undefined;
  const categorySlug = sp.cat?.trim() || undefined;
  const tagSlug = sp.tag?.trim() || undefined;

  const [result, featured, categories, tags, trending] = await Promise.all([
    getPublishedPosts({ page, query, categorySlug, tagSlug }),
    query || categorySlug || tagSlug ? Promise.resolve(null) : getFeaturedPost(),
    getCategoriesWithCounts(),
    getPopularTags(),
    getTrendingPosts(5),
  ]);

  const activeCat = categories.find((c) => c.slug === categorySlug);

  return (
    <SiteLayout>
      <div className="container py-10">
        <SectionHeading title="The SOHA Journal" subtitle="Stories, guides, and product highlights" />

        {/* Search */}
        <form action="/blog" method="get" className="mt-6 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input name="q" defaultValue={query ?? ""} placeholder="Search articles…" className="pl-9" />
          </div>
          <button type="submit" className="rounded-md bg-accent px-4 text-sm font-medium text-accent-foreground">
            Search
          </button>
        </form>

        {/* Category filter bar */}
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/blog">
            <Badge variant={!categorySlug ? "accent" : "secondary"}>All</Badge>
          </Link>
          {categories.map((c) => (
            <Link key={c.id} href={`/blog?cat=${c.slug}`}>
              <Badge variant={c.slug === categorySlug ? "accent" : "secondary"}>
                {c.name} ({c._count.posts})
              </Badge>
            </Link>
          ))}
        </div>

        {/* Featured */}
        {featured && (
          <section className="mt-8">
            <SectionHeading title="Featured" />
            <BlogCard post={featured as never} featured />
          </section>
        )}

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_300px]">
          <div>
            {/* Latest / results */}
            <SectionHeading
              title={query ? `Results for "${query}"` : activeCat ? activeCat.name : "Latest Articles"}
            />
            <div className="grid gap-6 sm:grid-cols-2">
              {result.posts.map((p) => (
                <BlogCard key={p.id} post={p as never} />
              ))}
            </div>
            {result.posts.length === 0 && (
              <p className="text-sm text-muted-foreground">No articles found.</p>
            )}
            {result.totalPages > 1 && (
              <div className="mt-8">
                <Pagination
                  page={result.page}
                  totalPages={result.totalPages}
                  basePath="/blog"
                  searchParams={{ q: query, cat: categorySlug, tag: tagSlug }}
                />
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-8">
            <div>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Trending
              </h3>
              <ul className="space-y-3">
                {trending.map((t) => (
                  <li key={t.id}>
                    <Link href={`/blog/${t.slug}`} className="line-clamp-2 text-sm font-medium hover:text-accent">
                      {t.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Popular Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {tags.map((t) => (
                  <Link key={t.id} href={`/blog?tag=${t.slug}`}>
                    <Badge variant="outline">#{t.name}</Badge>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </SiteLayout>
  );
}
