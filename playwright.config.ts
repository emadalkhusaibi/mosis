import { defineConfig, devices } from "@playwright/test";

const port = Number(process.env.PORT ?? 3000);

export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  fullyParallel: false,
  workers: 1,
  reporter: [["list"]],
  use: {
    baseURL: `http://localhost:${port}`,
    trace: "retain-on-failure",
    launchOptions: process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : undefined,
  },
  projects: [
    { name: "desktop", testIgnore: /arabic/, use: { ...devices["Desktop Chrome"] } },
    { name: "mobile-ar", testMatch: /arabic/, use: { ...devices["Pixel 7"], locale: "ar-OM", colorScheme: "dark" } },
  ],
  webServer: { command: "npm run dev", port, reuseExistingServer: true, timeout: 120_000 },
});
