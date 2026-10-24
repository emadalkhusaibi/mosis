import { test, expect } from "@playwright/test";
import { startVenture } from "./helpers";

const availableText = (page: import("@playwright/test").Page) => page.locator(".balance-list .is-strong dd .money-value").first();

test.describe("founder journey (English)", () => {
  test("new visitors land on the welcome page", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/welcome$/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Practise the business");
  });

  test("setup keeps its draft through a reload and states reserve coverage honestly", async ({ page }) => {
    await page.goto("/setup");
    await page.getByLabel("Your name").fill("Test Founder");
    await page.getByLabel("Business name").fill("Draft Café");
    await page.getByRole("button", { name: "Continue" }).click();
    await page.reload();
    await expect(page.getByText("Step 2 of 5")).toBeVisible();
    await page.getByRole("radio", { name: /Café/ }).click();
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByRole("button", { name: "Continue" }).click();
    // 3 months of café fixed costs (4,500) is more than 30% of 10,000, so it says so.
    await expect(page.getByText(/more than 30% of your capital/)).toBeVisible();
    await expect(page.getByText(/2(\.0)? months of fixed costs/)).toBeVisible();
  });

  test("record an expense, undo it with an audited reversal", async ({ page }) => {
    await startVenture(page);
    await page.goto("/wallet");
    await expect(availableText(page)).toHaveText("7,000");
    await page.getByRole("button", { name: "Record expense" }).first().click();
    await page.getByLabel("Amount").fill("850.250");
    await page.getByLabel("What was it for?").fill("Espresso machine deposit");
    await page.getByRole("dialog").getByRole("button", { name: "Record expense" }).click();
    await expect(availableText(page)).toHaveText("6,149.750");
    await page.getByRole("button", { name: "Undo" }).click();
    await expect(availableText(page)).toHaveText("7,000");
    // Nothing is deleted: the original and its reversal both stay in the history.
    await expect(page.locator(".ledger .row-title", { hasText: "Espresso machine deposit" })).toBeVisible();
    await expect(page.locator(".ledger .chip", { hasText: "Reversed" })).toBeVisible();
  });

  test("expense validation explains the problem next to the field", async ({ page }) => {
    await startVenture(page);
    await page.goto("/wallet");
    await page.getByRole("button", { name: "Record expense" }).first().click();
    await page.getByLabel("Amount").fill("12.3456");
    await page.getByRole("dialog").getByRole("button", { name: "Record expense" }).click();
    await expect(page.getByText("Rials have at most three decimals (baisa).")).toBeVisible();
    await expect(page.getByText("Say what it was for.")).toBeVisible();
  });

  test("plan answers autosave and survive a reload", async ({ page }) => {
    await startVenture(page);
    await page.goto("/plan/idea");
    const first = page.getByRole("textbox", { name: /What problem will you solve/ });
    await first.fill("Students lack a quiet place to work that serves good coffee near campus.");
    await expect(page.locator("#main").getByText("Saved on this device")).toBeVisible();
    await page.reload();
    await expect(page.getByRole("textbox", { name: /What problem will you solve/ })).toHaveValue(/quiet place to work/);
  });

  test("forecast responds to price changes and capacity is explicitly unlimited", async ({ page }) => {
    await startVenture(page);
    await page.goto("/forecast");
    const margin = page.locator(".forecast-stat", { hasText: "Unit margin" }).locator(".money-value");
    await expect(margin).toHaveText("1.600");
    await page.getByLabel("Price per unit").fill("3");
    await expect(margin).toHaveText("2.100");
    await expect(page.getByRole("switch", { name: /Unlimited/ })).toBeChecked();
    await page.getByRole("switch", { name: /Unlimited/ }).uncheck();
    await expect(page.getByRole("textbox", { name: "Units you can make or serve a month" })).toBeVisible();
  });

  test("committing a decision twice charges once", async ({ page }) => {
    await startVenture(page);
    await page.goto("/practice/capacity");
    await page.getByRole("radio", { name: /Improve the process first/ }).click();
    await expect(page.getByText("Available after")).toBeVisible();
    const commit = page.getByRole("button", { name: "Commit decision" });
    await commit.dblclick();
    await page.goto("/wallet");
    await expect(page.locator(".ledger .row-title", { hasText: "Improve the process first" })).toHaveCount(1);
  });

  test("320px wide pages reflow without sideways scrolling", async ({ page }) => {
    await startVenture(page);
    await page.setViewportSize({ width: 320, height: 720 });
    for (const path of ["/", "/wallet", "/forecast", "/plan/idea", "/practice", "/prove", "/prove/review", "/learn", "/settings"]) {
      await page.goto(path);
      await page.waitForLoadState("networkidle");
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow, path).toBeLessThanOrEqual(0);
    }
  });

  test("guest work is imported into a new account", async ({ page }) => {
    await startVenture(page, "Import Check Café");
    const email = `founder-${Date.now()}@example.com`;
    await page.goto("/sign-up");
    await page.getByLabel("Name").fill("Test Founder");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password", { exact: true }).fill("correct-horse-battery");
    await page.getByRole("button", { name: /Create account/ }).click();
    await expect(page.locator(".venture-chip-name")).toHaveText("Import Check Café");
    // Clear the device copy: the account must hold the data on its own.
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await expect(page.locator(".venture-chip-name")).toHaveText("Import Check Café");
    await expect(page.getByText("You're practising as a guest")).toHaveCount(0);
  });
});
