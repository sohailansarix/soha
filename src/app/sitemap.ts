import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { SITE } from "@/lib/constants";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE.url;

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${base}/products`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/categories`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/brands`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/blog`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${base}/contact`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/faq`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${base}/about`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${base}/privacy`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/terms`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/shipping`, changeFrequency: "yearly", priority: 0.2 },
  ];

  // DB reads are best-effort: if the database is unavailable (e.g. build-time
  // without connectivity), fall back to the static routes only so the build
  // still succeeds.
  try {
    const [products, categories, brands, posts, blogCategories] = await Promise.all([
      db.product.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true } }),
      db.category.findMany({ select: { slug: true, updatedAt: true } }),
      db.brand.findMany({ select: { slug: true, updatedAt: true } }),
      db.blogPost.findMany({ where: { isPublished: true }, select: { slug: true, updatedAt: true } }),
      db.blogCategory.findMany({ select: { slug: true } }),
    ]);

    const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
      url: `${base}/products/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly",
      priority: 0.8,
    }));
    const categoryRoutes: MetadataRoute.Sitemap = categories.map((c) => ({
      url: `${base}/products?category=${c.slug}`,
      lastModified: c.updatedAt,
      changeFrequency: "weekly",
      priority: 0.6,
    }));
    const brandRoutes: MetadataRoute.Sitemap = brands.map((b) => ({
      url: `${base}/products?brand=${b.slug}`,
      lastModified: b.updatedAt,
      changeFrequency: "weekly",
      priority: 0.6,
    }));
    const postRoutes: MetadataRoute.Sitemap = posts.map((p) => ({
      url: `${base}/blog/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "monthly",
      priority: 0.5,
    }));
    const blogCategoryRoutes: MetadataRoute.Sitemap = blogCategories.map((c) => ({
      url: `${base}/blog?cat=${c.slug}`,
      changeFrequency: "weekly",
      priority: 0.4,
    }));

    return [
      ...staticRoutes,
      ...productRoutes,
      ...categoryRoutes,
      ...brandRoutes,
      ...postRoutes,
      ...blogCategoryRoutes,
    ];
  } catch (error) {
    console.error("Sitemap DB fetch failed, returning static routes only:", error);
    return staticRoutes;
  }
}
