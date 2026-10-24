import { test, expect } from "@playwright/test";
import { startVenture } from "./helpers";

test.describe("founder record and launch steps", () => {
  test("the record shows six skills and the next step", async ({ page }) => {
    await startVenture(page);
    await page.goto("/record");
    await expect(page.getByRole("heading", { name: "Founder record", level: 1 })).toBeVisible();
    await expect(page.getByRole("meter")).toHaveCount(6);
    await expect(page.getByRole("button", { name: "Print or save as PDF" })).toBeVisible();
    await page.locator(".skill summary", { hasText: "Pricing" }).click();
    await expect(page.getByRole("link", { name: "Test your price with real people" })).toBeVisible();
  });

  test("launch steps are ticked off and kept", async ({ page }) => {
    await startVenture(page);
    await page.goto("/launch");
    await expect(page.getByText("0 of 8 done")).toBeVisible();
    await page.getByLabel(/commercial registration/i).first().check();
    await expect(page.getByText("1 of 8 done")).toBeVisible();
    await page.reload();
    await expect(page.getByText("1 of 8 done")).toBeVisible();
  });
});
