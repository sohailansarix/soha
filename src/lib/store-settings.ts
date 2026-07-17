import "server-only";
import { cache } from "react";

import {
  DEFAULT_EXPRESS_FEE,
  DEFAULT_SAME_DAY_FEE,
  DEFAULT_STANDARD_FEE,
  DEFAULT_TAX_RATE,
} from "@/lib/constants";

// Setting keys persisted in the `Setting` table (editable from admin panel).
export const SETTING_KEYS = {
  standardFee: "standardShippingFee",
  expressFee: "expressShippingFee",
  sameDayFee: "sameDayShippingFee",
  taxRate: "taxRate",
} as const;

export interface StoreSettings {
  standardShippingFee: number;
  expressShippingFee: number;
  sameDayShippingFee: number;
  taxRate: number;
}

/**
 * Read store settings from the DB (with sensible defaults). Memoized per
 * request via React's `cache()` so repeated calls within a single render
 * don't hit the database multiple times, but every new request re-reads the
 * latest values from the DB — so admin updates are reflected immediately
 * (e.g. on the /shipping page) without a rebuild.
 *
 * This module is server-only (`import "server-only"`) so the `pg` driver is
 * never pulled into client bundles.
 */
export const getStoreSettings = cache(async (): Promise<StoreSettings> => {
  const { db } = await import("@/lib/db");
  const keys = Object.values(SETTING_KEYS);
  const rows = await db.setting
    .findMany({ where: { key: { in: keys } } })
    .catch(() => []);
  const map = new Map(rows.map((r) => [r.key, r.value]));
  const num = (key: string, fallback: number) => {
    const v = map.get(key);
    const n = v != null ? Number(v) : NaN;
    return Number.isFinite(n) ? n : fallback;
  };
  return {
    standardShippingFee: num(SETTING_KEYS.standardFee, DEFAULT_STANDARD_FEE),
    expressShippingFee: num(SETTING_KEYS.expressFee, DEFAULT_EXPRESS_FEE),
    sameDayShippingFee: num(SETTING_KEYS.sameDayFee, DEFAULT_SAME_DAY_FEE),
    taxRate: num(SETTING_KEYS.taxRate, DEFAULT_TAX_RATE),
  };
});
