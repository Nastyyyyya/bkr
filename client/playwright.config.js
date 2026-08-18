import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./src/tests-e2e",

  timeout: 60000,

  use: {
    baseURL: "http://localhost:5173",
    headless: true,

    actionTimeout: 15000,
    navigationTimeout: 30000,
  },

  webServer: {
    command: "npm run dev",
    url: "http://localhost:5173",
    reuseExistingServer: true,
    timeout: 120000,
  },
});
