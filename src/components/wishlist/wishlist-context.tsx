"use client";

import * as React from "react";

export interface WishlistItem {
  productId: string;
  slug: string;
  name: string;
  price: number;
  image?: string | null;
}

interface WishlistContextValue {
  items: WishlistItem[];
  has: (productId: string) => boolean;
  toggle: (item: WishlistItem) => void;
  remove: (productId: string) => void;
  clear: () => void;
  count: number;
  isLoaded: boolean;
}

const WishlistContext = React.createContext<WishlistContextValue | null>(null);
const STORAGE_KEY = "soha-wishlist";

function load(): WishlistItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as WishlistItem[]) : [];
  } catch {
    return [];
  }
}

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<WishlistItem[]>([]);
  const [loaded, setLoaded] = React.useState(false);

  React.useEffect(() => {
    setItems(load());
    setLoaded(true);
  }, []);

  React.useEffect(() => {
    if (loaded) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, loaded]);

  const has = React.useCallback((productId: string) => items.some((i) => i.productId === productId), [items]);

  const toggle: WishlistContextValue["toggle"] = (item) => {
    setItems((prev) =>
      prev.some((i) => i.productId === item.productId)
        ? prev.filter((i) => i.productId !== item.productId)
        : [...prev, item],
    );
  };

  const remove: WishlistContextValue["remove"] = (productId) =>
    setItems((prev) => prev.filter((i) => i.productId !== productId));

  const clear = () => setItems([]);

  return (
    <WishlistContext.Provider value={{ items, has, toggle, remove, clear, count: items.length, isLoaded: loaded }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = React.useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
