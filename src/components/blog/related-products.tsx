"use client";

import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { useCurrency } from "@/components/currency/currency-provider";

interface RelatedProduct {
  product: {
    id: string;
    slug: string;
    name: string;
    price: number;
    images: { url: string }[];
  };
}

export function RelatedProducts({ products }: { products: RelatedProduct[] }) {
  const { format } = useCurrency();
  if (products.length === 0) return null;
  return (
    <section className="mt-12">
      <h2 className="mb-4 text-xl font-bold">Related Products</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {products.map(({ product }) => (
          <Link key={product.id} href={`/products/${product.slug}`}>
            <Card className="h-full overflow-hidden transition hover:shadow-md">
              <div className="relative aspect-square bg-secondary">
                {product.images[0]?.url && (
                  <Image src={product.images[0].url} alt={product.name} fill sizes="25vw" className="object-cover" />
                )}
              </div>
              <CardContent className="p-3">
                <p className="line-clamp-1 text-sm font-medium">{product.name}</p>
                <p className="mt-1 font-semibold">{format(product.price)}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
