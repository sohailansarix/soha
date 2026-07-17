"use client";

import * as React from "react";
import { useToast } from "@/components/ui/use-toast";

export interface CartLine {
  productId: string;
  variantId?: string | null;
  slug: string;
  name: string;
  price: number;
  compareAtPrice?: number | null;
  image?: string;
  quantity: number;
  stock: number;
  savedForLater?: boolean;
  attributes?: Record<string, string> | null;
}

interface CartContextValue {
  items: CartLine[];
  saved: CartLine[];
  count: number;
  subtotal: number;
  totalSavings: number;
  add: (line: Omit<CartLine, "quantity">, qty?: number) => void;
  updateQty: (productId: string, variantId: string | null | undefined, qty: number) => void;
  remove: (productId: string, variantId: string | null | undefined) => void;
  saveForLater: (productId: string, variantId: string | null | undefined) => void;
  moveToCart: (productId: string, variantId: string | null | undefined) => void;
  clear: () => void;
  isLoaded: boolean;
}

const CartContext = React.createContext<CartContextValue | null>(null);

const STORAGE_KEY = "soha-cart";

function loadCart(): CartLine[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CartLine[]) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<CartLine[]>([]);
  const [isLoaded, setIsLoaded] = React.useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    setItems(loadCart());
    setIsLoaded(true);
  }, []);

  React.useEffect(() => {
    if (isLoaded) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, isLoaded]);

  const find = (list: CartLine[], productId: string, variantId?: string | null) =>
    list.find((i) => i.productId === productId && (i.variantId ?? null) === (variantId ?? null));

  const add: CartContextValue["add"] = (line, qty = 1) => {
    setItems((prev) => {
      const existing = find(prev, line.productId, line.variantId);
      if (existing) {
        const nextQty = Math.min(existing.quantity + qty, existing.stock);
        toast({ title: "Updated cart", description: `${line.name} quantity updated.` });
        return prev.map((i) =>
          i === existing ? { ...i, quantity: nextQty } : i,
        );
      }
      toast({ title: "Added to cart", description: line.name, variant: "success" });
      return [...prev, { ...line, quantity: Math.min(qty, line.stock) }];
    });
  };

  const updateQty: CartContextValue["updateQty"] = (productId, variantId, qty) => {
    setItems((prev) =>
      prev.map((i) =>
        i.productId === productId && (i.variantId ?? null) === (variantId ?? null)
          ? { ...i, quantity: Math.max(1, Math.min(qty, i.stock)) }
          : i,
      ),
    );
  };

  const remove: CartContextValue["remove"] = (productId, variantId) => {
    setItems((prev) =>
      prev.filter(
        (i) => !(i.productId === productId && (i.variantId ?? null) === (variantId ?? null)),
      ),
    );
    toast({ title: "Removed from cart" });
  };

  const saveForLater: CartContextValue["saveForLater"] = (productId, variantId) => {
    setItems((prev) => {
      const target = find(prev, productId, variantId);
      if (!target) return prev;
      const rest = prev.filter((i) => i !== target);
      const savedItem: CartLine = { ...target, savedForLater: true };
      // store saved items in the same array but flagged
      return [...rest, savedItem];
    });
  };

  const moveToCart: CartContextValue["moveToCart"] = (productId, variantId) => {
    setItems((prev) =>
      prev.map((i) =>
        i.productId === productId && (i.variantId ?? null) === (variantId ?? null)
          ? { ...i, savedForLater: false }
          : i,
      ),
    );
  };

  const clear = () => setItems([]);

  const active = items.filter((i) => !i.savedForLater);
  const saved = items.filter((i) => i.savedForLater);
  const count = active.reduce((s, i) => s + i.quantity, 0);
  const subtotal = active.reduce((s, i) => s + i.price * i.quantity, 0);
  // Total savings across all active items: (compareAt - price) * qty.
  const totalSavings = active.reduce((s, i) => {
    const cmp = i.compareAtPrice != null ? Number(i.compareAtPrice) : null;
    return cmp != null && cmp > i.price ? s + (cmp - i.price) * i.quantity : s;
  }, 0);

  const value: CartContextValue = {
    items: active,
    saved,
    count,
    subtotal,
    totalSavings,
    add,
    updateQty,
    remove,
    saveForLater,
    moveToCart,
    clear,
    isLoaded,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = React.useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
