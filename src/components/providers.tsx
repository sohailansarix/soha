"use client";

import * as React from "react";
import { CartProvider } from "@/components/cart/cart-context";
import { WishlistProvider } from "@/components/wishlist/wishlist-context";
import { CurrencyProvider } from "@/components/currency/currency-provider";

export function Providers({
  children,
  initialCurrency,
}: {
  children: React.ReactNode;
  initialCurrency?: string;
}) {
  return (
    <CurrencyProvider initialCurrency={initialCurrency}>
      <CartProvider>
        <WishlistProvider>{children}</WishlistProvider>
      </CartProvider>
    </CurrencyProvider>
  );
}
