import { test, expect } from "@playwright/test";
import { startVenture } from "./helpers";

test.describe("prove (English)", () => {
  test("a field test moves its assumption and can revise the forecast", async ({ page }) => {
    await startVenture(page);
    await page.goto("/prove");
    await page.getByRole("button", { name: "Add", exact: true }).click();
    await page.getByLabel("I believe that…").fill("900 orders in month one");
    await page.getByRole("dialog").getByRole("button", { name: "Add assumption" }).click();
    await expect(page.locator(".chip", { hasText: "Untested" })).toBeVisible();

    await page.getByRole("button", { name: "Test this" }).click();
    const plan = page.getByRole("dialog");
    await plan.getByLabel("What I'll do").fill("Count footfall at three times of day");
    await plan.getByLabel("What I'll count or watch for").fill("People passing per hour");
    await plan.getByLabel("My decision rule").fill("Under 30 an hour: lower the month-one estimate");
    await plan.getByRole("button", { name: "Plan test" }).click();

    await page.getByRole("button", { name: "Record result" }).click();
    const rec = page.getByRole("dialog");
    await rec.getByRole("radio", { name: "Contradicts it" }).click();
    await rec.getByLabel("What happened").fill("Only 18 people an hour at the best time");
    await rec.getByLabel("Forecast number").selectOption("units");
    await rec.getByLabel("New value").fill("500");
    await rec.getByRole("button", { name: "Save result" }).click();

    await expect(page.locator(".chip", { hasText: "Contradicted" }).first()).toBeVisible();
    await expect(page.locator(".stat", { hasText: "Forecast changes from evidence" }).locator(".stat-value")).toHaveText("1");
  });

  test("weekly review saves once per week and shows on Today", async ({ page }) => {
    await startVenture(page);
    await page.goto("/prove/review");
    await page.getByLabel("What did you learn?").fill("Mornings are quieter than I assumed.");
    await page.getByRole("button", { name: "Save review" }).click();
    await expect(page.getByRole("button", { name: "Update review" })).toBeVisible();
    await page.goto("/");
    await expect(page.getByText("Done for this week")).toBeVisible();
  });

  test("daily decision reveals what each choice costs", async ({ page }) => {
    await startVenture(page);
    await page.goto("/");
    const card = page.locator(".daily");
    await expect(card.locator(".daily-weigh")).toHaveCount(0);
    await card.locator(".daily-option").first().click();
    await expect(card.locator(".daily-option").first()).toHaveAttribute("aria-pressed", "true");
    expect(await card.locator(".daily-weigh").count()).toBeGreaterThanOrEqual(2);
  });

  test("forecast shows the market calendar and can switch it off", async ({ page }) => {
    await startVenture(page);
    await page.goto("/forecast");
    await expect(page.getByRole("heading", { name: "Omani market calendar" })).toBeVisible();
    await expect(page.locator(".season-month")).toHaveCount(12);
    await page.getByRole("radiogroup", { name: "Market calendar" }).getByRole("radio", { name: "Off" }).click();
    await expect(page.getByText("Off: every month follows the growth trend only.")).toBeVisible();
  });
});
