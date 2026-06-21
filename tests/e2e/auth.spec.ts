import { test, expect } from "@playwright/test";

test("login page loads", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
});

test("redirects unauthenticated users from dashboard", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/login/);
});
