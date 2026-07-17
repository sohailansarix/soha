import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { CategoryForm } from "../../category-form";

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const category = await db.blogCategory.findUnique({ where: { id } });
  if (!category) notFound();
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Edit Category</h1>
      <CategoryForm
        id={id}
        defaultValues={{ name: category.name, slug: category.slug, description: category.description ?? "" }}
      />
    </div>
  );
}
