import { expect, type Page } from "@playwright/test";

/** Completes the setup wizard as a guest and lands on Today. */
export async function startVenture(page: Page, name = "Nook Coffee") {
  await page.goto("/setup");
  await page.getByLabel("Your name").fill("Test Founder");
  await page.getByLabel("Business name").fill(name);
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("radio", { name: /Café/ }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("radio", { name: /Testing with customers/ }).click();
  await page.getByLabel(/Your idea/).fill("A quiet specialty coffee corner for students in Al Khoud.");
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Open my workspace" }).click();
  await expect(page).toHaveURL(/\/$/);
}
