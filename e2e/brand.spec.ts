import { test, expect } from "@playwright/test";
import { startVenture } from "./helpers";

test.describe("Tailoring and brand studio", () => {
  test("plan questions use the founder's business words", async ({ page }) => {
    await startVenture(page);
    await page.goto("/plan/operations");
    await expect(page.getByText("Who will supply coffee beans, milk and cups?")).toBeVisible();
    await expect(page.getByText(/For example/).first()).toBeVisible();
    await expect(page.getByText("For your business").first()).toBeVisible();
  });

  test("build a name, palette and logo, and they survive a reload", async ({ page }) => {
    await startVenture(page);
    await page.goto("/brand");
    await page.getByLabel("Name in English").fill("Sidr Coffee");
    await page.getByLabel("Name in Arabic").fill("قهوة سدر");
    await page.getByRole("radio", { name: /Wadi/ }).click();
    await page.getByRole("radio", { name: "Omani arch" }).click();
    await page.getByRole("button", { name: "Use as my business name" }).click();
    await page.reload();
    await expect(page.getByLabel("Name in English")).toHaveValue("Sidr Coffee");
    await expect(page.getByRole("radio", { name: /Wadi/ })).toHaveAttribute("aria-checked", "true");
    await expect(page.getByRole("radio", { name: "Omani arch" })).toHaveAttribute("aria-checked", "true");
    await expect(page.getByRole("button", { name: "Use as my business name" })).toHaveCount(0);
  });

  test("the brand partner says plainly when it isn't switched on", async ({ page }) => {
    await page.route("/api/brand-assistant", (r) => r.fulfill({ status: 503, json: { error: "not_configured" } }));
    await startVenture(page);
    await page.goto("/brand");
    await page.getByRole("button", { name: "Which colours suit my business?" }).click();
    await expect(page.getByText(/isn't switched on/)).toBeVisible();
    await expect(page.getByLabel("Message the brand partner")).toHaveValue("Which colours suit my business?");
  });

  test("brand partner suggestions apply in one tap", async ({ page }) => {
    await page.route("/api/brand-assistant", (r) =>
      r.fulfill({ json: { reply: "Here are two directions.", names: [{ en: "Falaj Coffee", ar: "قهوة فلج", why: "Fair sharing." }], palettes: [{ name: "Date", primary: "#4A3B1F", accent: "#A8873A", surface: "#F5F1E6", why: "Warm." }], logo: null } }),
    );
    await startVenture(page);
    await page.goto("/brand");
    await page.getByLabel("Message the brand partner").fill("Ideas please");
    await page.getByRole("button", { name: "Send" }).click();
    await expect(page.getByText("Here are two directions.")).toBeVisible();
    await page.locator(".brand-suggest-card").filter({ hasText: "Falaj Coffee" }).getByRole("button", { name: "Use" }).click();
    await expect(page.getByLabel("Name in English")).toHaveValue("Falaj Coffee");
    await page.locator(".brand-suggest-card").filter({ hasText: "Date" }).getByRole("button", { name: "Apply" }).click();
    await expect(page.getByRole("radio", { name: /Date palm/ })).toHaveAttribute("aria-checked", "true");
  });
});
