import type { Role } from "@prisma/client";

export const SITE = {
  name: process.env.NEXT_PUBLIC_APP_NAME ?? "SOHA",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  description:
    "SOHA — a premium, modern shopping experience. Curated products, fast delivery, and elegant design.",
  // Free shipping threshold (in major currency units)
  freeShippingThreshold: 75,
  // Flat standard shipping fee
  standardShippingFee: 5.99,
  expressShippingFee: 14.99,
  sameDayShippingFee: 24.99,
  // Tax rate applied to taxable amount (e.g. 0.08 = 8%)
  taxRate: 0.08,
};

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

export const DELIVERY_METHODS = [
  { id: "STANDARD", label: "Standard", eta: "5-7 business days", fee: SITE.standardShippingFee },
  { id: "EXPRESS", label: "Express", eta: "2-3 business days", fee: SITE.expressShippingFee },
  { id: "SAME_DAY", label: "Same Day", eta: "Today", fee: SITE.sameDayShippingFee },
] as const;
