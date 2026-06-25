import { test, expect } from "@playwright/test";
import { loginAsAdmin } from "./helpers/auth";

test("dashboard shows stat cards and search", async ({ page }) => {
  await loginAsAdmin(page);
  await page.goto("/dashboard");
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  await expect(page.getByText("Skills")).toBeVisible();
  await expect(page.getByPlaceholder("Search skills, certs, projects...")).toBeVisible();
});

test("dashboard stat cards link to resource pages", async ({ page }) => {
  await loginAsAdmin(page);
  await page.goto("/dashboard");
  await page.getByRole("link").filter({ hasText: "Skills" }).first().click();
  await expect(page).toHaveURL(/skills/);
});

test("onboarding checklist or welcome card may appear", async ({ page }) => {
  await loginAsAdmin(page);
  await page.goto("/dashboard");
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
});
