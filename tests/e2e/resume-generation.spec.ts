import { test, expect } from "@playwright/test";
import { loginAsAdmin } from "./helpers/auth";

test("resumes page shows generate and upload sections", async ({ page }) => {
  await loginAsAdmin(page);
  await page.goto("/resumes");
  await expect(page.getByRole("heading", { name: "Resumes" })).toBeVisible();
  await expect(page.getByText("Generate resume")).toBeVisible();
  await expect(page.getByText("Upload resume")).toBeVisible();
});

test("template selection works on resumes page", async ({ page }) => {
  await loginAsAdmin(page);
  await page.goto("/resumes");
  await page.getByRole("button", { name: /Classic/i }).click();
  await expect(page.getByText("Conservative industries")).toBeVisible();
});

test("generate resume button is present", async ({ page }) => {
  await loginAsAdmin(page);
  await page.goto("/resumes");
  await expect(page.getByRole("button", { name: "Generate PDF" })).toBeVisible();
});
