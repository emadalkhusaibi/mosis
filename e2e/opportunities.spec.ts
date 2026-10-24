import { test, expect } from "@playwright/test";
import { startVenture } from "./helpers";

test.describe("opportunities", () => {
  test("listings fit the founder's business, and examples can be saved but not applied to", async ({ page }) => {
    await startVenture(page);
    await page.goto("/opportunities");
    await expect(page.getByRole("heading", { name: "Opportunities", level: 1 })).toBeVisible();
    const first = page.locator(".opp-card").first();
    await expect(first.getByText(/Fits Café/)).toBeVisible();
    await expect(first.getByText("Example", { exact: true })).toBeVisible();

    await first.getByRole("button", { name: "Save" }).click();
    await expect(first.getByRole("button", { name: "Saved" })).toHaveAttribute("aria-pressed", "true");
    await page.reload();
    await expect(page.locator(".opp-card").first().getByRole("button", { name: "Saved" })).toBeVisible();

    await page.locator(".opp-card").first().getByRole("button", { name: "Apply" }).click();
    await expect(page.getByRole("dialog").getByText(/example listing/)).toBeVisible();
    await expect(page.getByRole("dialog").getByRole("button", { name: "Send application" })).toBeDisabled();
  });

  test("filters to 1:1 sessions", async ({ page }) => {
    await startVenture(page);
    await page.goto("/opportunities");
    await page.getByRole("radiogroup", { name: "Show" }).getByRole("radio", { name: "Everything" }).click();
    await page.getByRole("radiogroup", { name: "Type" }).getByRole("radio", { name: "1:1 sessions" }).click();
    await expect(page.locator(".opp-card")).toHaveCount(3);
    await expect(page.getByRole("button", { name: "Request a session" })).toHaveCount(3);
  });

  test("companies can offer places from the partner page", async ({ page }) => {
    await page.goto("/partners");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("next founders");
    await page.getByRole("button", { name: "Send" }).click();
    await expect(page.locator(".field-error")).toContainText("Add your organisation");
    await page.getByLabel("Organisation").fill("Test Co");
    await page.getByLabel("Your name").fill("Salim");
    await page.getByLabel("Email or phone").fill("salim@example.com");
    await page.getByLabel("Internships").check();
    await page.getByRole("button", { name: "Send" }).click();
    await expect(page.locator(".partner-done")).toBeVisible();
  });
});
