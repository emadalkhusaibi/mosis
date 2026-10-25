import { test, expect } from "@playwright/test";

test.describe("Arabic, mobile, dark", () => {
  test("renders right-to-left with Arabic copy", async ({ page, context }) => {
    await context.addCookies([{ name: "moasis-lang", value: "ar", url: "http://localhost:3000" }]);
    await page.goto("/welcome");
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("تدرّب");
  });
});

test.describe("Arabic workspace", () => {
  test("wallet reads right-to-left with exact amounts", async ({ page, context }) => {
    await context.addCookies([{ name: "moasis-lang", value: "ar", url: "http://localhost:3000" }]);
    await page.goto("/setup");
    await page.getByLabel("اسمك").fill("مؤسس تجريبي");
    await page.getByLabel("اسم المشروع").fill("ركن القهوة");
    await page.getByRole("button", { name: "متابعة" }).click();
    await page.getByRole("radio", { name: /مقهى/ }).click();
    for (let i = 0; i < 3; i++) await page.getByRole("button", { name: "متابعة" }).click();
    await page.getByRole("button", { name: "افتح مساحة عملي" }).click();
    await page.goto("/wallet");
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("محفظتي");
    await expect(page.locator(".wcard-capital .wcard-amount .money-value")).toHaveText("7,000");
  });
});
