import type { Role } from "@prisma/client";

export const SITE = {
  name: process.env.NEXT_PUBLIC_APP_NAME ?? "SOHA",
  // Optional site logo URL (e.g. a Cloudinary upload). Falls back to the
  // text wordmark in the header when not set.
  logo: process.env.NEXT_PUBLIC_SITE_LOGO || "",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  description:
    "SOHA — a premium, modern shopping experience. Curated products, fast delivery, and elegant design.",
};

// Default delivery fees (USD) — used as fallback before the DB-backed
// settings have been saved. Free shipping is entirely product-specific via
// each product's `freeShippingOver` field — there is no site-wide
// free-shipping threshold.
export const DEFAULT_STANDARD_FEE = 5.99;
export const DEFAULT_EXPRESS_FEE = 14.99;
export const DEFAULT_SAME_DAY_FEE = 24.99;
export const DEFAULT_TAX_RATE = 0.08;

export const ROLES: Role[] = ["GUEST", "CUSTOMER", "ADMIN", "SUPER_ADMIN"];

/** Role hierarchy — higher rank includes lower privileges. */
export const ROLE_RANK: Record<Role, number> = {
  GUEST: 0,
  CUSTOMER: 1,
  ADMIN: 2,
  SUPER_ADMIN: 3,
};

/** Returns true if `role` has at least the privileges of `required`. */
export function hasRole(role: Role | undefined, required: Role): boolean {
  if (!role) return required === "GUEST";
  return ROLE_RANK[role] >= ROLE_RANK[required];
}

export const PERMISSIONS = {
  // Admin area
  VIEW_ADMIN: "VIEW_ADMIN",
  MANAGE_PRODUCTS: "MANAGE_PRODUCTS",
  MANAGE_ORDERS: "MANAGE_ORDERS",
  MANAGE_USERS: "MANAGE_USERS",
  MANAGE_SETTINGS: "MANAGE_SETTINGS",
  VIEW_ANALYTICS: "VIEW_ANALYTICS",
  MANAGE_STAFF: "MANAGE_STAFF",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

/** Map roles to the permissions they implicitly grant. */
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  GUEST: [],
  CUSTOMER: [],
  ADMIN: [
    PERMISSIONS.VIEW_ADMIN,
    PERMISSIONS.MANAGE_PRODUCTS,
    PERMISSIONS.MANAGE_ORDERS,
    PERMISSIONS.VIEW_ANALYTICS,
  ],
  SUPER_ADMIN: [
    PERMISSIONS.VIEW_ADMIN,
    PERMISSIONS.MANAGE_PRODUCTS,
    PERMISSIONS.MANAGE_ORDERS,
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.MANAGE_SETTINGS,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.MANAGE_STAFF,
  ],
};

export function roleHasPermission(role: Role | undefined, permission: Permission): boolean {
  if (!role) return false;
  return ROLE_PERMISSIONS[role].includes(permission);
}

export interface StoreSettings {
  standardShippingFee: number;
  expressShippingFee: number;
  sameDayShippingFee: number;
  taxRate: number;
}

export interface DeliveryMethodDef {
  id: "STANDARD" | "EXPRESS" | "SAME_DAY";
  label: string;
  eta: string;
  fee: number;
}

/** Build delivery methods from the (DB-backed) store settings. */
export function getDeliveryMethods(s: StoreSettings): DeliveryMethodDef[] {
  return [
    { id: "STANDARD", label: "Standard", eta: "5-7 business days", fee: s.standardShippingFee },
    { id: "EXPRESS", label: "Express", eta: "2-3 business days", fee: s.expressShippingFee },
    { id: "SAME_DAY", label: "Same Day", eta: "Today", fee: s.sameDayShippingFee },
  ];
}
