"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingBag } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Rating } from "@/components/ui/rating";
import { useCart } from "@/components/cart/cart-context";
import { useWishlist } from "@/components/wishlist/wishlist-context";
import { useToast } from "@/components/ui/use-toast";
import { useCurrency } from "@/components/currency/currency-provider";
import { cn } from "@/lib/utils";

export interface ProductCardData {
  id: string;
  slug: string;
  name: string;
  price: number;
  compareAtPrice?: number | null;
  image?: string | null;
  rating?: number;
  reviewCount?: number;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  stock?: number;
  color?: string | null;
  size?: string | null;
  variantId?: string | null;
  variantCount?: number;
}

export function ProductCard({ product }: { product: ProductCardData }) {
  const { add } = useCart();
  const { has, toggle } = useWishlist();
  const { toast } = useToast();
  const { format } = useCurrency();
  const wished = has(product.id);

  const discount = product.compareAtPrice
    ? Math.round((1 - product.price / Number(product.compareAtPrice)) * 100)
    : 0;

  // If the product has more than one variant, force the user to pick options
  // on the detail page rather than adding a variant-less item. Products with a
  // single variant (or none) can be quick-added using the cheapest variant.
  const hasMultipleVariants = (product.variantCount ?? 0) > 1;

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    if (hasMultipleVariants) {
      // Send the user to the product page to choose size/color/etc.
      window.location.href = `/products/${product.slug}`;
      return;
    }
    add({
      productId: product.id,
      variantId: product.variantId ?? null,
      slug: product.slug,
      name: product.name,
      price: product.price,
      compareAtPrice: product.compareAtPrice ?? null,
      image: product.image ?? undefined,
      stock: product.stock ?? 99,
      attributes: null,
    });
  }

  function handleWishlist(e: React.MouseEvent) {
    e.preventDefault();
    toggle({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: product.image ?? null,
    });
    toast({
      title: wished ? "Removed from wishlist" : "Added to wishlist",
      variant: wished ? "default" : "success",
    });
  }

  return (
    <Card className="group relative overflow-hidden transition-shadow hover:shadow-md">
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-secondary">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              No image
            </div>
          )}
          <div className="absolute left-3 top-3 flex flex-col gap-1">
            {discount > 0 && <Badge variant="destructive">-{discount}%</Badge>}
            {product.isNewArrival && <Badge variant="accent">New</Badge>}
            {product.isBestSeller && <Badge variant="secondary">Bestseller</Badge>}
          </div>
          <button
            onClick={handleWishlist}
            aria-label="Toggle wishlist"
            className="absolute right-3 top-3 rounded-full bg-background/80 p-2 backdrop-blur transition-colors hover:bg-background"
          >
            <Heart
              className={cn("h-4 w-4", wished && "fill-accent text-accent")}
            />
          </button>
        </div>
      </Link>

      <div className="space-y-2 p-4">
        <Link href={`/products/${product.slug}`}>
          <h3 className="line-clamp-1 text-sm font-medium hover:underline">{product.name}</h3>
        </Link>
        {(product.rating ?? 0) > 0 && (
          <div className="flex items-center gap-1">
            <Rating value={product.rating ?? 0} size={14} />
            <span className="text-xs text-muted-foreground">({product.reviewCount ?? 0})</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <span className="font-semibold">{format(product.price)}</span>
          {product.compareAtPrice && (
            <span className="text-sm text-muted-foreground line-through">
              {format(product.compareAtPrice)}
            </span>
          )}
        </div>
        <Button
          size="sm"
          className="w-full"
          onClick={handleAdd}
          disabled={(product.stock ?? 0) <= 0}
        >
          <ShoppingBag className="h-4 w-4" />
          {(product.stock ?? 0) <= 0
            ? "Out of stock"
            : hasMultipleVariants
              ? "Select options"
              : "Add to cart"}
        </Button>
      </div>
    </Card>
  );
}
