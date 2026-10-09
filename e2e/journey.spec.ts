import { test, expect } from "@playwright/test";
import { startVenture } from "./helpers";

test.describe("founder journey (English)", () => {
  test("new visitors land on the welcome page", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/welcome$/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Practise the business");
  });

  test("setup, record an expense, undo it", async ({ page }) => {
    await startVenture(page);
    await page.goto("/wallet");
    const available = page.locator(".wcard-capital .wcard-amount .sr-only");
    await expect(available).toHaveText("7,000");
    await page.getByRole("button", { name: "Record expense" }).first().click();
    await page.getByLabel("Amount").fill("850.250");
    await page.getByLabel("What was it for?").fill("Espresso machine deposit");
    await page.getByRole("button", { name: "Record expense" }).last().click();
    await expect(available).toHaveText("6,149.750");
    await expect(page.locator(".row-title", { hasText: "Espresso machine deposit" })).toBeVisible();
    await page.getByRole("button", { name: "Undo" }).click();
    await expect(available).toHaveText("7,000");
  });

  test("plan answers autosave and survive a reload", async ({ page }) => {
    await startVenture(page);
    await page.goto("/plan/idea");
    const first = page.getByRole("textbox").first();
    await first.fill("Students lack a quiet place to work that serves good coffee near campus.");
    await page.waitForTimeout(600);
    await page.reload();
    await expect(page.getByRole("textbox").first()).toHaveValue(/quiet place to work/);
  });

  test("forecast responds to price changes", async ({ page }) => {
    await startVenture(page);
    await page.goto("/forecast");
    const margin = page.locator(".kpi").first().locator(".sr-only");
    const before = await margin.textContent();
    await page.getByLabel("Price per unit").fill("3");
    await expect(margin).not.toHaveText(before ?? "");
  });

  test("guest work is imported into a new account", async ({ page }) => {
    await startVenture(page, "Import Check Café");
    const email = `founder-${Date.now()}@example.com`;
    await page.goto("/sign-up");
    await page.getByLabel("Name").fill("Test Founder");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill("correct-horse-battery");
    await page.getByRole("button", { name: /Create account/ }).click();
    await expect(page.locator(".venture-chip-name")).toHaveText("Import Check Café");
    // Clear the device copy: the account must hold the data on its own.
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await expect(page.locator(".venture-chip-name")).toHaveText("Import Check Café");
    await expect(page.getByText("You're practising as a guest")).toHaveCount(0);
  });
});

