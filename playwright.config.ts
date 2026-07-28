import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  timeout: 15_000,
  expect: { timeout: 4_000 },
  retries: 0,
  workers: 1,
  reporter: process.env.BENCHMARK_JSON_REPORT
    ? [["json", { outputFile: process.env.BENCHMARK_JSON_REPORT }]]
    : "list",
  use: {
    baseURL: "http://127.0.0.1:4173",
    actionTimeout: 3_000,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run dev -- --host 127.0.0.1 --port 4173",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
