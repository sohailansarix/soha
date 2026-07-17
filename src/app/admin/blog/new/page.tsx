import { db } from "@/lib/db";
import { PostForm } from "../post-form";

export default async function NewPostPage() {
  const [categories, products] = await Promise.all([
    db.blogCategory.findMany({ orderBy: [{ name: "asc" }] }),
    db.product.findMany({ orderBy: [{ name: "asc" }], take: 100, select: { id: true, name: true } }),
  ]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">New Article</h1>
      <PostForm
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
        products={products.map((p) => ({ id: p.id, name: p.name }))}
      />
    </div>
  );
}
