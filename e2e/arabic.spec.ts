import { test, expect } from "@playwright/test";
import { answerSetup } from "./helpers";

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
    await answerSetup(page, { ar: true, name: "مؤسس تجريبي", business: "ركن القهوة", idea: "ركن قهوة هادئ للطلاب." });
    await page.goto("/wallet");
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("محفظتي");
    await expect(page.locator(".wcard-capital .wcard-amount .money-value")).toHaveText("7,000");
  });
});
