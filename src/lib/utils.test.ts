import { describe, it, expect } from "vitest";
import { formatCurrency, formatDate, slugify, truncate, generateOrderNumber } from "@/lib/utils";

describe("formatCurrency", () => {
  it("formats a number", () => {
    expect(formatCurrency(12.5)).toBe("$12.50");
  });
  it("formats a string", () => {
    expect(formatCurrency("9.99")).toBe("$9.99");
  });
  it("formats a Decimal-like object", () => {
    expect(formatCurrency({ toNumber: () => 20 })).toBe("$20.00");
  });
  it("returns $0.00 for null", () => {
    expect(formatCurrency(null)).toBe("$0.00");
  });
});

describe("slugify", () => {
  it("lowercases and hyphenates", () => {
    expect(slugify("Hello World!")).toBe("hello-world");
  });
});

describe("truncate", () => {
  it("truncates long strings", () => {
    expect(truncate("abcdefghij", 5)).toBe("abcde…");
  });
  it("leaves short strings", () => {
    expect(truncate("abc", 5)).toBe("abc");
  });
});

describe("formatDate", () => {
  it("formats a date", () => {
    const d = new Date("2026-01-15T00:00:00Z");
    expect(formatDate(d)).toMatch(/2026/);
  });
});

describe("generateOrderNumber", () => {
  it("returns a non-empty string", () => {
    expect(typeof generateOrderNumber()).toBe("string");
    expect(generateOrderNumber().length).toBeGreaterThan(0);
  });
});
