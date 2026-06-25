import { test, expect } from "@playwright/test";

test("public portfolio page loads for admin slug", async ({ page }) => {
  const slug = process.env.ADMIN_PORTFOLIO_SLUG ?? "admin";
  const response = await page.goto(`/portfolio/${slug}`);
  expect(response?.status()).toBeLessThan(500);
});

test("portfolio page has meta description", async ({ page }) => {
  const slug = process.env.ADMIN_PORTFOLIO_SLUG ?? "admin";
  await page.goto(`/portfolio/${slug}`);
  const description = await page.locator('meta[name="description"]').getAttribute("content");
  expect(description).toBeTruthy();
});

test("robots.txt is accessible", async ({ page }) => {
  const response = await page.goto("/robots.txt");
  expect(response?.status()).toBe(200);
  await expect(page.locator("body")).toContainText("User-agent");
});

test("sitemap.xml is accessible", async ({ page }) => {
  const response = await page.goto("/sitemap.xml");
  expect(response?.status()).toBe(200);
});
