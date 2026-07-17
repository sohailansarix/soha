import { Suspense } from "react";
import { SiteLayout } from "@/components/layout/site-layout";
import { ProductFilters } from "@/components/product/product-filters";
import { ProductGrid, ProductGridSkeleton } from "@/components/product/product-grid";
import { Pagination } from "@/components/product/pagination";
import { getProducts } from "@/lib/products";
import { db } from "@/lib/db";

export const metadata = {
  title: "Shop All Products",
  description: "Browse the full SOHA catalog with filters and sorting.",
};

interface SearchParams {
  q?: string;
  category?: string;
  brand?: string;
  min?: string;
  max?: string;
  sort?: string;
  onSale?: string;
  trending?: string;
  page?: string;
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;

  const [categories, brands] = await Promise.all([
    db.category.findMany({ orderBy: { name: "asc" } }),
    db.brand.findMany({ orderBy: { name: "asc" } }),
  ]);

  const result = await getProducts({
    q: sp.q,
    category: sp.category,
    brand: sp.brand,
    minPrice: sp.min ? Number(sp.min) : undefined,
    maxPrice: sp.max ? Number(sp.max) : undefined,
    sort: sp.sort as never,
    onSale: sp.onSale === "1",
    trending: sp.trending === "1",
    page: sp.page ? Number(sp.page) : 1,
  });

  return (
    <SiteLayout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">
            {sp.q ? `Results for “${sp.q}”` : "All Products"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {result.total} product{result.total === 1 ? "" : "s"} found
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
          <aside className="hidden lg:block">
            <Suspense fallback={null}>
              <ProductFilters categories={categories} brands={brands} />
            </Suspense>
          </aside>
          <div>
            <Suspense fallback={<ProductGridSkeleton />}>
              {result.products.length === 0 ? (
                <div className="rounded-lg border border-dashed py-20 text-center">
                  <p className="text-muted-foreground">No products match your filters.</p>
                </div>
              ) : (
                <>
                  <ProductGrid products={result.products} />
                  <Pagination
                    page={result.page}
                    totalPages={result.totalPages}
                    basePath="/products"
                    searchParams={sp as Record<string, string | undefined>}
                  />
                </>
              )}
            </Suspense>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
