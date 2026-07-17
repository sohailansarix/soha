import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { CURRENCIES } from "@/lib/currency";
import { ProductForm } from "../../product-form";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, categories, brands] = await Promise.all([
    db.product.findUnique({
      where: { id },
      include: {
        images: { orderBy: [{ position: "asc" }] },
        attributes: true,
        options: { orderBy: [{ position: "asc" }], include: { values: { orderBy: [{ position: "asc" }] } } },
        variants: true,
      },
    }),
    db.category.findMany({ orderBy: [{ name: "asc" }] }),
    db.brand.findMany({ orderBy: [{ name: "asc" }] }),
  ]);
  if (!product) notFound();

  // Prices stored as USD base; show them in INR in the form.
  const inrRate = CURRENCIES.INR.rate;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Edit Product</h1>
      <ProductForm
        id={id}
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
        brands={brands.map((b) => ({ id: b.id, name: b.name }))}
        initialImages={product.images.map((img) => ({ url: img.url, alt: img.alt ?? "" }))}
        initialAttributes={product.attributes.map((a) => ({ key: a.key, value: a.value }))}
        initialOptions={product.options.map((o) => ({ name: o.name, values: o.values.map((val) => val.value) }))}
        initialVariants={product.variants.map((v) => ({
          id: v.id,
          sku: v.sku,
          attributes: (v.attributes as Record<string, string>) ?? {},
          stock: v.stock,
          price: v.price != null ? Number(v.price) * inrRate : undefined,
          compareAtPrice: v.compareAtPrice != null ? Number(v.compareAtPrice) * inrRate : undefined,
        }))}
        initialReturnable={product.isReturnable}
        initialReturnWindow={product.returnWindow}
        initialShippingFee={product.shippingFee != null ? Number(product.shippingFee) * inrRate : null}
        initialFreeShippingOver={product.freeShippingOver != null ? Number(product.freeShippingOver) * inrRate : null}
        defaultValues={{
          name: product.name,
          slug: product.slug,
          description: product.description ?? "",
          sku: product.sku ?? "",
          categoryId: product.categoryId ?? "",
          brandId: product.brandId ?? "",
          isActive: product.isActive,
          isFeatured: product.isFeatured,
        }}
      />
    </div>
  );
}
