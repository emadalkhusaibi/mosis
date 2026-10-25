import { expect, test } from "@playwright/test";

test("the path follows the business type and what the founder needs", async ({ page }) => {
  await page.goto("/setup");
  await page.getByLabel("Your name").fill("Path Founder");
  await page.getByLabel("Business name").fill("Strong Gym");
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("radio", { name: /Gym/ }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("radio", { name: /Preparing to launch/ }).click();
  await page.getByRole("radio", { name: /Learn from people who've done it/ }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Open my workspace" }).click();
  await expect(page).toHaveURL(/\/$/);

  const path = page.getByRole("region", { name: "Your path" });
  await expect(path.getByText("Learn from people who've done it")).toBeVisible();
  const steps = path.getByRole("list").getByRole("link");
  await expect(steps).toHaveCount(4);
  await expect(steps.nth(1)).toHaveAttribute("href", "/opportunities");

  await page.goto("/launch");
  await expect(page.getByText(/^For a gym/)).toBeVisible();
});
