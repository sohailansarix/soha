import { test, expect } from "@playwright/test";

test("homepage loads with hero and product sections", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByText(/Flash Sale/i)).toBeVisible();
});

test("user can browse products and open a product page", async ({ page }) => {
  await page.goto("/products");
  await expect(page.getByRole("heading", { name: /All Products/i })).toBeVisible();
  const firstCard = page.locator("a[href^='/products/']").first();
  await expect(firstCard).toBeVisible();
  await firstCard.click();
  await expect(page).toHaveURL(/\/products\/.+/);
});
