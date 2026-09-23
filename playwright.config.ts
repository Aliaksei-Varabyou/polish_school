import { defineConfig } from "@playwright/test";

const PORT = 8790;

export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  fullyParallel: false,
  workers: 1,
  reporter: [["list"]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    // system Chrome by default; set PW_CHANNEL= (empty) to use Playwright's bundled Chromium
    channel: process.env.PW_CHANNEL ?? "chrome",
    locale: "ru-RU",
    trace: "retain-on-failure",
  },
  webServer: {
    // Nothing seeds the pool here on purpose: biology fills an empty one itself on the first
    // request, and that is exactly the path a real deploy takes. Math generates through the mock.
    command: "npm run build && npm start",
    url: `http://localhost:${PORT}/api/health`,
    reuseExistingServer: false,
    timeout: 300_000,
    env: { LLM_PROVIDER: "mock", PORT: String(PORT), TASK_DB_PATH: ":memory:" },
  },
});
