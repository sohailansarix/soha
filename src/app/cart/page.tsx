"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag, Heart } from "lucide-react";
import { SiteLayout } from "@/components/layout/site-layout";
import { useCart } from "@/components/cart/cart-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { useCurrency } from "@/components/currency/currency-provider";
import { cn } from "@/lib/utils";
import { SITE } from "@/lib/constants";

export default function CartPage() {
  const { items, saved, updateQty, remove, saveForLater, moveToCart, subtotal, totalSavings, isLoaded } = useCart();
  const { format } = useCurrency();
  const [productShipping, setProductShipping] = React.useState<number | null>(null);
  const [nudgeThreshold, setNudgeThreshold] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (items.length === 0) {
      setProductShipping(null);
      setNudgeThreshold(null);
      return;
    }
    const ids = items.map((i) => i.productId);
    fetch(`/api/products/shipping`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data?.products) return;
        const map = new Map<string, { id: string; shippingFee: number | null; freeShippingOver: number | null }>(
          data.products.map((p: { id: string; shippingFee: number | null; freeShippingOver: number | null }) => [p.id, p]),
        );
        let total = 0;
        let hasProductShipping = false;
        let nudge: number | null = null;
        for (const item of items) {
          const p = map.get(item.productId);
          if (p?.shippingFee != null) {
            hasProductShipping = true;
            const lineSubtotal = item.price * item.quantity;
            const freeOver = p.freeShippingOver != null ? Number(p.freeShippingOver) : null;
            if (freeOver == null || lineSubtotal < freeOver) {
              total += Number(p.shippingFee) * item.quantity;
              // Track the lowest free-shipping threshold among products
              // that currently incur a delivery charge (so the nudge is accurate).
              if (freeOver != null) {
                nudge = nudge == null ? freeOver : Math.min(nudge, freeOver);
              }
            }
          }
        }
        setProductShipping(hasProductShipping ? total : null);
        // Use the product-specific threshold when applicable; otherwise the
        // site-wide free-shipping threshold. Null means shipping is already free.
        setNudgeThreshold(hasProductShipping ? nudge : SITE.freeShippingThreshold);
      })
      .catch(() => setProductShipping(null));
  }, [items]);

  if (!isLoaded) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-7xl px-4 py-16 text-center text-muted-foreground">
          Loading cart…
        </div>
      </SiteLayout>
    );
  }

  const shipping =
    productShipping != null
      ? productShipping
      : subtotal >= SITE.freeShippingThreshold || subtotal === 0
        ? 0
        : SITE.standardShippingFee;
  const tax = subtotal * SITE.taxRate;
  const total = subtotal + shipping + tax;

  return (
    <SiteLayout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight">Your Cart</h1>

        {items.length === 0 ? (
          <div className="mt-12 rounded-lg border border-dashed py-20 text-center">
            <ShoppingBag className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">Your cart is empty.</p>
            <Button asChild className="mt-4">
              <Link href="/products">Continue shopping</Link>
            </Button>
          </div>
        ) : (
          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
            <div className="space-y-4">
              {items.map((item) => (
                <div key={`${item.productId}-${item.variantId ?? "b"}`} className="flex gap-4 rounded-lg border p-4">
                  <Link href={`/products/${item.slug}`} className="relative h-24 w-24 shrink-0 overflow-hidden rounded-md bg-secondary">
                    {item.image ? (
                      <Image src={item.image} alt={item.name} fill sizes="96px" className="object-cover" />
                    ) : null}
                  </Link>
                  <div className="flex flex-1 flex-col">
                    <div className="flex justify-between gap-2">
                      <Link href={`/products/${item.slug}`} className="font-medium hover:underline">
                        {item.name}
                      </Link>
                      <div className="flex items-center gap-2">
                        {item.compareAtPrice != null && item.compareAtPrice > item.price && (
                          <span className="text-sm text-muted-foreground line-through">
                            {format(item.compareAtPrice * item.quantity)}
                          </span>
                        )}
                        <span className="font-semibold">{format(item.price * item.quantity)}</span>
                      </div>
                    </div>
                    {(item.attributes && Object.keys(item.attributes).length > 0) && (
                      <p className="text-sm text-muted-foreground">
                        {Object.entries(item.attributes)
                          .map(([k, v]) => `${k}: ${v}`)
                          .join(" / ")}
                      </p>
                    )}
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <div className="flex items-center rounded-md border">
                        <button
                          onClick={() => updateQty(item.productId, item.variantId, item.quantity - 1)}
                          className="p-1.5"
                          aria-label="Decrease"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-8 text-center text-sm">{item.quantity}</span>
                        <button
                          onClick={() => updateQty(item.productId, item.variantId, item.quantity + 1)}
                          className="p-1.5"
                          aria-label="Increase"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => saveForLater(item.productId, item.variantId)}>
                          <Heart className="h-4 w-4" /> Save
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => remove(item.productId, item.variantId)}>
                          <Trash2 className="h-4 w-4" /> Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {saved.length > 0 && (
                <div className="mt-8">
                  <h2 className="mb-3 text-lg font-semibold">Saved for later</h2>
                  <div className="space-y-3">
                    {saved.map((item) => (
                      <div key={`${item.productId}-${item.variantId ?? "b"}`} className="flex items-center gap-4 rounded-lg border p-3">
                        <Link href={`/products/${item.slug}`} className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-secondary">
                          {item.image ? <Image src={item.image} alt={item.name} fill sizes="64px" className="object-cover" /> : null}
                        </Link>
                        <div className="flex-1">
                          <Link href={`/products/${item.slug}`} className="text-sm font-medium hover:underline">
                            {item.name}
                          </Link>
                          <p className="text-sm text-muted-foreground">{format(item.price)}</p>
                        </div>
                        <Button size="sm" variant="outline" onClick={() => moveToCart(item.productId, item.variantId)}>
                          Move to cart
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Summary */}
            <div>
              <Card className="sticky top-20">
                <CardContent className="space-y-4 p-6">
                  <h2 className="text-lg font-semibold">Order Summary</h2>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>{format(subtotal)}</span>
                    </div>
                    {totalSavings > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>You saved</span>
                        <span>-{format(totalSavings)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shipping</span>
                      <span>{shipping === 0 ? "Free" : format(shipping)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tax ({(SITE.taxRate * 100).toFixed(0)}%)</span>
                      <span>{format(tax)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-base font-semibold">
                      <span>Total</span>
                      <span>{format(total)}</span>
                    </div>
                  </div>
                  {nudgeThreshold != null && subtotal < nudgeThreshold && (
                    <p className="rounded-md bg-secondary p-2 text-center text-xs text-muted-foreground">
                      Add {format(nudgeThreshold - subtotal)} more for free shipping
                    </p>
                  )}
                  <Button asChild className="w-full" size="lg">
                    <Link href="/checkout">Proceed to checkout</Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/products">Continue shopping</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </SiteLayout>
  );
}
