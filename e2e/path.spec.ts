import { expect, test } from "@playwright/test";
import { answerSetup } from "./helpers";

test("the path follows the business type and what the founder needs", async ({ page }) => {
  await answerSetup(page, { sector: /Gym/, stage: /Preparing to launch/, need: /Learn from people who've done it/, business: "Strong Gym" });

  const path = page.getByRole("region", { name: "Your path" });
  await expect(path.getByText("Learn from people who've done it")).toBeVisible();
  const steps = path.getByRole("list").getByRole("link");
  await expect(steps).toHaveCount(4);
  await expect(steps.nth(1)).toHaveAttribute("href", "/opportunities");

  await page.goto("/launch");
  await expect(page.getByText(/^For a gym/)).toBeVisible();
});

test("every opening answer changes what the founder sees", async ({ page }) => {
  await answerSetup(page, {
    need: /Get the money right/, experience: /This is my first/, channel: /Online/, time: /A few hours a week/, worry: /Finding customers/,
  });

  // First business: the money basics come second on the path.
  const steps = page.getByRole("region", { name: "Your path" }).getByRole("list").getByRole("link");
  await expect(steps.nth(1)).toHaveAttribute("href", "/learn/margin");
  await expect(page.getByText("About one step a week fits a few hours.")).toBeVisible();

  // The biggest worry gets its own next step.
  await expect(page.getByRole("heading", { name: "Finding customers" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Learn to listen before you build/ })).toHaveAttribute("href", "/learn/interviews");

  // Selling online: launch steps say a shop may not be needed.
  await page.goto("/launch");
  await expect(page.getByText(/customers won't come to a shop/)).toBeVisible();

  // A first business sees internships before other opportunities.
  await page.goto("/opportunities");
  await page.getByRole("radio", { name: "Everything" }).click();
  await expect(page.locator(".opp-card .chip").first()).toContainText("Internship");
});
