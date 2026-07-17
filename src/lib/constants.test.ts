import { describe, it, expect } from "vitest";
import { hasRole, roleHasPermission, PERMISSIONS } from "@/lib/constants";

describe("hasRole", () => {
  it("grants equal or higher rank", () => {
    expect(hasRole("ADMIN", "ADMIN")).toBe(true);
    expect(hasRole("SUPER_ADMIN", "ADMIN")).toBe(true);
  });
  it("denies lower rank", () => {
    expect(hasRole("CUSTOMER", "ADMIN")).toBe(false);
  });
  it("treats undefined as GUEST", () => {
    expect(hasRole(undefined, "GUEST")).toBe(true);
    expect(hasRole(undefined, "CUSTOMER")).toBe(false);
  });
});

describe("roleHasPermission", () => {
  it("ADMIN can view admin", () => {
    expect(roleHasPermission("ADMIN", PERMISSIONS.VIEW_ADMIN)).toBe(true);
  });
  it("ADMIN cannot manage users", () => {
    expect(roleHasPermission("ADMIN", PERMISSIONS.MANAGE_USERS)).toBe(false);
  });
  it("SUPER_ADMIN can manage users", () => {
    expect(roleHasPermission("SUPER_ADMIN", PERMISSIONS.MANAGE_USERS)).toBe(true);
  });
  it("CUSTOMER has no admin permissions", () => {
    expect(roleHasPermission("CUSTOMER", PERMISSIONS.VIEW_ADMIN)).toBe(false);
  });
});
