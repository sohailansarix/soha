import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { BrandForm } from "../../brand-form";

export default async function EditBrandPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const brand = await db.brand.findUnique({ where: { id } });
  if (!brand) notFound();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Edit Brand</h1>
      <BrandForm
        id={id}
        defaultValues={{
          name: brand.name,
          slug: brand.slug,
          description: brand.description ?? "",
          logo: brand.logo ?? "",
        }}
      />
    </div>
  );
}
