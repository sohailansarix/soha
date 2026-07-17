// Multi-currency support.
// Prices are STORED in the database in the BASE currency (USD).
// Display currencies convert from USD using the rates below.

export const BASE_CURRENCY = "USD";
export const DEFAULT_CURRENCY = "INR";

export interface CurrencyDef {
  code: string;
  symbol: string;
  label: string;
  // How many units of this currency equal 1 USD.
  rate: number;
  locale: string;
}

export const CURRENCIES: Record<string, CurrencyDef> = {
  USD: { code: "USD", symbol: "$", label: "US Dollar", rate: 1, locale: "en-US" },
  INR: { code: "INR", symbol: "₹", label: "Indian Rupee", rate: 83.5, locale: "en-IN" },
  EUR: { code: "EUR", symbol: "€", label: "Euro", rate: 0.92, locale: "de-DE" },
  GBP: { code: "GBP", symbol: "£", label: "British Pound", rate: 0.79, locale: "en-GB" },
  AED: { code: "AED", symbol: "د.إ", label: "UAE Dirham", rate: 3.67, locale: "ar-AE" },
};

export const CURRENCY_LIST = Object.values(CURRENCIES);

// Cookie used to persist the active display currency for server components.
export const CURRENCY_COOKIE = "soha:currency";

/** Convert an amount from the base (USD) to the target currency. */
export function convert(amountUsd: number, currency: string): number {
  const def = CURRENCIES[currency] ?? CURRENCIES[DEFAULT_CURRENCY];
  return amountUsd * def.rate;
}

/** Format a base (USD) amount in the target currency. */
export function formatMoney(
  amountUsd: number | string | { toNumber(): number } | null | undefined,
  currency: string = DEFAULT_CURRENCY,
): string {
  let value: number;
  if (amountUsd == null) value = 0;
  else if (typeof amountUsd === "number") value = amountUsd;
  else if (typeof amountUsd === "string") value = parseFloat(amountUsd);
  else value = amountUsd.toNumber();

  const def = CURRENCIES[currency] ?? CURRENCIES[DEFAULT_CURRENCY];
  const converted = value * def.rate;
  return new Intl.NumberFormat(def.locale, {
    style: "currency",
    currency: def.code,
    maximumFractionDigits: def.code === "INR" ? 0 : 2,
  }).format(converted);
}
