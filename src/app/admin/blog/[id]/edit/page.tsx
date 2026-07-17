import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { PostForm } from "../../post-form";

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [post, categories, products] = await Promise.all([
    db.blogPost.findUnique({
      where: { id },
      include: { tags: { include: { tag: true } }, relatedProducts: true },
    }),
    db.blogCategory.findMany({ orderBy: [{ name: "asc" }] }),
    db.product.findMany({ orderBy: [{ name: "asc" }], take: 100, select: { id: true, name: true } }),
  ]);
  if (!post) notFound();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Edit Article</h1>
      <PostForm
        id={id}
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
        products={products.map((p) => ({ id: p.id, name: p.name }))}
        defaultValues={{
          title: post.title,
          slug: post.slug,
          subtitle: post.subtitle ?? "",
          excerpt: post.excerpt ?? "",
          content: post.content,
          coverImage: post.coverImage ?? "",
          categoryId: post.categoryId ?? "",
          tags: post.tags.map((t) => t.tag.name).join(", "),
          metaTitle: post.metaTitle ?? "",
          metaDescription: post.metaDescription ?? "",
          keywords: post.keywords ?? "",
          canonicalUrl: post.canonicalUrl ?? "",
          relatedProductIds: post.relatedProducts.map((rp) => rp.productId).join(", "),
          isPublished: post.isPublished,
          isFeatured: post.isFeatured,
          publishedAt: post.publishedAt ? post.publishedAt.toISOString().slice(0, 10) : "",
        }}
      />
    </div>
  );
}
