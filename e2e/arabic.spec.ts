import { test, expect } from "@playwright/test";

test.describe("Arabic, mobile, dark", () => {
  test("renders right-to-left with Arabic copy", async ({ page, context }) => {
    await context.addCookies([{ name: "moasis-lang", value: "ar", url: "http://localhost:3000" }]);
    await page.goto("/welcome");
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("تدرّب");
  });
});
