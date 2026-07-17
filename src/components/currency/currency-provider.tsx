"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CURRENCIES, DEFAULT_CURRENCY, CURRENCY_COOKIE, formatMoney, type CurrencyDef } from "@/lib/currency";

interface CurrencyContextValue {
  currency: string;
  setCurrency: (code: string) => void;
  currencies: CurrencyDef[];
  // Format a base (USD) amount in the active currency.
  format: (amountUsd: number | string | { toNumber(): number } | null | undefined) => string;
}

const CurrencyContext = React.createContext<CurrencyContextValue | null>(null);

const STORAGE_KEY = "soha:currency";

export function CurrencyProvider({
  children,
  initialCurrency,
}: {
  children: React.ReactNode;
  initialCurrency?: string;
}) {
  const router = useRouter();
  const [currency, setCurrencyState] = React.useState(initialCurrency ?? DEFAULT_CURRENCY);

  // Hydrate from localStorage on mount (client preference wins for guests).
  React.useEffect(() => {
    const stored = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
    if (stored && stored in CURRENCIES) setCurrencyState(stored);
  }, []);

  const setCurrency = React.useCallback(
    (code: string) => {
      if (!(code in CURRENCIES)) return;
      setCurrencyState(code);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(STORAGE_KEY, code);
        // Cookie lets server components read the active currency.
        document.cookie = `${CURRENCY_COOKIE}=${code}; path=/; max-age=31536000; samesite=lax`;
      }
      // Persist for authenticated users.
      fetch("/api/account/currency", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currency: code }),
      }).catch(() => null);
      // Refresh so server-rendered (admin) pages pick up the new currency.
      router.refresh();
    },
    [router],
  );

  const format = React.useCallback(
    (amountUsd: number | string | { toNumber(): number } | null | undefined) =>
      formatMoney(amountUsd, currency),
    [currency],
  );

  const value = React.useMemo<CurrencyContextValue>(
    () => ({ currency, setCurrency, currencies: Object.values(CURRENCIES), format }),
    [currency, setCurrency, format],
  );

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  const ctx = React.useContext(CurrencyContext);
  if (!ctx) {
    // Safe fallback so components don't crash outside the provider.
    return {
      currency: DEFAULT_CURRENCY,
      setCurrency: () => {},
      currencies: Object.values(CURRENCIES),
      format: formatMoney,
    } as CurrencyContextValue;
  }
  return ctx;
}
