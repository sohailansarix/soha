import Link from "next/link";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { ProductGrid } from "@/components/product/product-grid";
import type { ProductCardData } from "@/components/product/product-card";

export default async function DashboardWishlistPage() {
  const session = await auth();
  const items = await db.wishlistItem.findMany({
    where: { userId: session!.user.id },
    include: { product: { include: { images: { take: 1 }, variants: true } } },
  });

  const products: ProductCardData[] = items.map((i) => {
    const cheapest = [...i.product.variants].sort((a, b) => Number(a.price) - Number(b.price))[0];
    return {
      id: i.product.id,
      slug: i.product.slug,
      name: i.product.name,
      price: cheapest ? Number(cheapest.price) : 0,
      compareAtPrice: cheapest?.compareAtPrice ? Number(cheapest.compareAtPrice) : null,
      image: i.product.images[0]?.url ?? null,
      rating: Number(i.product.rating),
      reviewCount: i.product.reviewCount,
      stock: 99,
    };
  });

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Saved Items</h2>
      {products.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nothing saved yet. <Link href="/products" className="text-accent hover:underline">Browse products</Link>.
        </p>
      ) : (
        <ProductGrid products={products} />
      )}
    </div>
  );
}
