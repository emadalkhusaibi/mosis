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

const CUP = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><path d="M50 80h90v40a45 45 0 0 1-90 0Z" fill="#5B4232"/><path d="M140 92h12a16 16 0 0 1 0 32h-14" fill="none" stroke="#5B4232" stroke-width="10"/><path d="M80 66c-8-12 8-20 0-34M100 66c-8-12 8-20 0-34M120 66c-8-12 8-20 0-34" fill="none" stroke="#C8A06A" stroke-width="7" stroke-linecap="round"/></svg>';
const BAD = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" onload="alert(1)"><circle cx="100" cy="100" r="50"/></svg>';

test.describe("AI logo concepts", () => {
  test("drawn concepts can be used as the logo, and unsafe drawings are never shown", async ({ page }) => {
    await page.route("/api/brand-logos", (r) =>
      r.fulfill({ json: { concepts: [{ title: "Steam cup", idea: "A cup with rising steam.", svg: CUP }, { title: "Bad", idea: "x", svg: BAD }] } }),
    );
    await startVenture(page);
    await page.goto("/brand");
    await page.getByLabel("Describe the logo you want").fill("a coffee cup");
    await page.getByRole("button", { name: "Draw logo ideas" }).click();
    await expect(page.getByRole("img", { name: "Steam cup" })).toBeVisible();
    await expect(page.getByText("Bad", { exact: true })).toHaveCount(0);
    await page.getByRole("button", { name: "Use this logo" }).click();
    await expect(page.getByRole("button", { name: "In use" })).toBeVisible();
    await page.reload();
    await expect(page.getByRole("button", { name: "In use" })).toBeVisible();
    await expect(page.locator(".brand-stage img.brand-art").first()).toBeVisible();
    await page.getByRole("radio", { name: "Hexagon" }).click();
    await expect(page.getByRole("button", { name: "Use this logo" })).toBeVisible();
  });

  test("says plainly when drawing isn't switched on", async ({ page }) => {
    await page.route("/api/brand-logos", (r) => r.fulfill({ status: 503, json: { error: "not_configured" } }));
    await startVenture(page);
    await page.goto("/brand");
    await page.getByRole("button", { name: "Draw logo ideas" }).click();
    await expect(page.getByText(/Logo drawing isn't switched on/)).toBeVisible();
  });
});
