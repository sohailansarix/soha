import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { CategoryForm } from "../../category-form";

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [category, categories] = await Promise.all([
    db.category.findUnique({ where: { id } }),
    db.category.findMany({ where: { NOT: { id } }, orderBy: [{ name: "asc" }] }),
  ]);
  if (!category) notFound();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Edit Category</h1>
      <CategoryForm
        id={id}
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
        defaultValues={{
          name: category.name,
          slug: category.slug,
          description: category.description ?? "",
          parentId: category.parentId ?? "",
        }}
      />
    </div>
  );
}
