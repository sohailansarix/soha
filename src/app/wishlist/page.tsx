"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Trash2, ShoppingBag, Heart } from "lucide-react";
import { SiteLayout } from "@/components/layout/site-layout";
import { useWishlist } from "@/components/wishlist/wishlist-context";
import { useCart } from "@/components/cart/cart-context";
import { useCurrency } from "@/components/currency/currency-provider";
import { Button } from "@/components/ui/button";

export default function WishlistPage() {
  const { items, remove, clear, isLoaded } = useWishlist();
  const { add } = useCart();
  const { format } = useCurrency();

  if (!isLoaded) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-7xl px-4 py-16 text-center text-muted-foreground">Loading…</div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Wishlist</h1>
          {items.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clear}>
              Clear all
            </Button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="mt-12 rounded-lg border border-dashed py-20 text-center">
            <Heart className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">Your wishlist is empty.</p>
            <Button asChild className="mt-4">
              <Link href="/products">Browse products</Link>
            </Button>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {items.map((item) => (
              <div key={item.productId} className="group overflow-hidden rounded-lg border">
                <Link href={`/products/${item.slug}`} className="relative block aspect-square bg-secondary">
                  {item.image ? (
                    <Image src={item.image} alt={item.name} fill sizes="25vw" className="object-cover" />
                  ) : null}
                </Link>
                <div className="space-y-2 p-4">
                  <Link href={`/products/${item.slug}`}>
                    <h3 className="line-clamp-1 text-sm font-medium hover:underline">{item.name}</h3>
                  </Link>
                  <div className="font-semibold">{format(item.price)}</div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() =>
                        add({
                          productId: item.productId,
                          variantId: null,
                          slug: item.slug,
                          name: item.name,
                          price: item.price,
                          image: item.image ?? undefined,
                          stock: 99,
                        })
                      }
                    >
                      <ShoppingBag className="h-4 w-4" /> Add
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => remove(item.productId)} aria-label="Remove">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </SiteLayout>
  );
}
