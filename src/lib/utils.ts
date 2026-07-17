import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes safely. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a number as currency. Accepts number, string, or Prisma Decimal. */
export function formatCurrency(
  amount: number | string | { toNumber(): number } | null | undefined,
  currency = "USD",
  locale = "en-US",
) {
  let value: number;
  if (amount == null) value = 0;
  else if (typeof amount === "number") value = amount;
  else if (typeof amount === "string") value = parseFloat(amount);
  else value = amount.toNumber();
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(value);
}

/** Format a date. */
export function formatDate(date: Date | string, opts?: Intl.DateTimeFormatOptions) {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    ...opts,
  }).format(d);
}

/** Slugify a string. */
export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Generate a short unique order number. */
export function generateOrderNumber() {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).toUpperCase().slice(2, 6);
  return `SOHA-${ts}${rand}`;
}

/** Truncate text. */
export function truncate(text: string, length = 80) {
  return text.length > length ? text.slice(0, length).trimEnd() + "…" : text;
}

/** Build absolute URL from a path using the configured app URL. */
export function absoluteUrl(path: string) {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return new URL(path, base).toString();
}

/** Sleep helper (used in tests / retries). */
export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
