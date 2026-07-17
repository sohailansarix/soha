import { db } from "@/lib/db";
import { ProductForm } from "../product-form";

export default async function NewProductPage() {
  const [categories, brands] = await Promise.all([
    db.category.findMany({ orderBy: [{ name: "asc" }] }),
    db.brand.findMany({ orderBy: [{ name: "asc" }] }),
  ]);
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">New Product</h1>
      <ProductForm
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
        brands={brands.map((b) => ({ id: b.id, name: b.name }))}
      />
    </div>
  );
}
