import "server-only";

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
 * Read store settings from the DB (with sensible defaults). Cached per
 * request via a module-level promise so repeated calls in one render don't
 * hit the database multiple times.
 *
 * This module is server-only (`import "server-only"`) so the `pg` driver is
 * never pulled into client bundles.
 */
let settingsCache: Promise<StoreSettings> | null = null;
export function getStoreSettings(): Promise<StoreSettings> {
  if (!settingsCache) {
    settingsCache = (async () => {
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
    })();
  }
  return settingsCache;
}

/** Clear the cached settings (call after an admin update). */
export function clearStoreSettingsCache() {
  settingsCache = null;
}
