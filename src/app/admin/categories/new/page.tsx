import { db } from "@/lib/db";
import { CategoryForm } from "../category-form";

export default async function NewCategoryPage() {
  const categories = await db.category.findMany({ orderBy: [{ name: "asc" }] });
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">New Category</h1>
      <CategoryForm categories={categories.map((c) => ({ id: c.id, name: c.name }))} />
    </div>
  );
}
