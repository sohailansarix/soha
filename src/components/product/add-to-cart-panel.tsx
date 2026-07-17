"use client";

import * as React from "react";
import { Minus, Plus, ShoppingBag, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/cart/cart-context";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

interface Variant {
  id: string;
  sku: string;
  attributes: Record<string, string>;
  stock: number;
  price: number | { toNumber(): number } | null;
  compareAtPrice?: number | { toNumber(): number } | null;
}

export function AddToCartPanel({
  productId,
  slug,
  name,
  price,
  variants,
  totalStock,
  image,
}: {
  productId: string;
  slug: string;
  name: string;
  price: number;
  variants: Variant[];
  totalStock: number;
  image?: string | null;
}) {
  const { add } = useCart();
  const { toast } = useToast();
  const [qty, setQty] = React.useState(1);
  const [wished, setWished] = React.useState(false);

  // Derive the set of option names + their possible values from the variants.
  const optionNames = Array.from(
    new Set(variants.flatMap((v) => Object.keys(v.attributes))),
  );
  const optionValues = Object.fromEntries(
    optionNames.map((name) => [
      name,
      Array.from(new Set(variants.map((v) => v.attributes[name]).filter(Boolean))) as string[],
    ]),
  );
  const [selected, setSelected] = React.useState<Record<string, string | null>>(() =>
    Object.fromEntries(optionNames.map((n) => [n, (optionValues[n] ?? [])[0] ?? null])),
  );

  const matched =
    variants.find((v) =>
      optionNames.every((n) => (optionValues[n]?.length ?? 0) === 0 || v.attributes[n] === selected[n]),
    ) ?? null;

  const stock = matched ? matched.stock : totalStock;
  const unitPrice = matched?.price ? Number(matched.price) : price;
  const outOfStock = stock <= 0;

  function handleAdd() {
    if (outOfStock) return;
    add({
      productId,
      variantId: matched?.id ?? null,
      slug,
      name,
      price: unitPrice,
      image: image ?? undefined,
      stock,
      attributes: matched?.attributes ?? {},
    });
  }

  return (
    <div className="space-y-4">
      {optionNames.map((name) => {
        const values = optionValues[name] ?? [];
        if (values.length === 0) return null;
        const current = selected[name];
        return (
          <div key={name}>
            <p className="mb-2 text-sm font-medium">
              {name}: {current}
            </p>
            <div className="flex flex-wrap gap-2">
              {values.map((val) => (
                <button
                  key={val}
                  onClick={() => setSelected((s) => ({ ...s, [name]: val }))}
                  className={cn(
                    "min-w-10 rounded-md border-2 px-3 py-1 text-sm transition-colors",
                    current === val ? "border-accent" : "border-input hover:border-muted-foreground",
                  )}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>
        );
      })}

      <div className="flex items-center gap-3">
        <div className="flex items-center rounded-md border">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="p-2 disabled:opacity-40"
            disabled={qty <= 1}
            aria-label="Decrease quantity"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-10 text-center text-sm">{qty}</span>
          <button
            onClick={() => setQty((q) => Math.min(stock || 99, q + 1))}
            className="p-2 disabled:opacity-40"
            disabled={qty >= (stock || 99)}
            aria-label="Increase quantity"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <span className="text-sm text-muted-foreground">
          {outOfStock ? "Out of stock" : `${stock} in stock`}
        </span>
      </div>

      <div className="flex gap-3">
        <Button onClick={handleAdd} disabled={outOfStock} className="flex-1" size="lg">
          <ShoppingBag className="h-4 w-4" />
          {outOfStock ? "Out of stock" : "Add to cart"}
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={() => {
            setWished((w) => !w);
            toast({ title: wished ? "Removed from wishlist" : "Added to wishlist", variant: wished ? "default" : "success" });
          }}
          aria-label="Add to wishlist"
        >
          <Heart className={cn("h-5 w-5", wished && "fill-accent text-accent")} />
        </Button>
      </div>
    </div>
  );
}
