import { test, expect } from "@playwright/test";

test("login page loads", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByLabel("Email")).toBeVisible();
  await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
  await expect(page.getByText("Forgot password?")).toBeVisible();
});

test("redirects unauthenticated users from dashboard", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/login/);
});

test("forgot password page loads", async ({ page }) => {
  await page.goto("/forgot-password");
  await expect(page.getByText("Forgot Password", { exact: true })).toBeVisible();
});
