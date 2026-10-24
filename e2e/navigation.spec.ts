import { test, expect } from "@playwright/test";
import { startVenture } from "./helpers";

test.describe("navigation", () => {
  test("four spaces, each with its pages and a way back", async ({ page }) => {
    await startVenture(page);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    const tabs = page.locator(".mobile-nav .mobile-tab");
    await expect(tabs).toHaveText(["Today", "Build", "Prove", "Connect", "Wallet"]);

    await tabs.filter({ hasText: "Build" }).click();
    await expect(page.getByRole("heading", { name: "Build", level: 1 })).toBeVisible();
    await page.getByRole("link", { name: /Business plan/ }).click();
    await expect(page.locator(".mobile-nav [aria-current=page]")).toHaveText("Build");
    await page.locator(".topbar-back").click();
    await expect(page).toHaveURL(/\/build$/);

    await page.goto("/practice/team");
    await expect(page.locator(".mobile-nav [aria-current=page]")).toHaveText("Build");
    await page.goto("/practice");
    await expect(page.locator(".mobile-nav [aria-current=page]")).toHaveText("Prove");
  });
});

test("the wallet has its own tab", async ({ page }) => {
  await startVenture(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator(".mobile-nav .mobile-tab", { hasText: "Wallet" }).click();
  await expect(page.getByRole("heading", { name: "My wallet", level: 1 })).toBeVisible();
  await expect(page.locator(".mobile-nav [aria-current=page]")).toHaveText("Wallet");
  await expect(page.locator(".topbar-back")).toHaveCount(0);
});
