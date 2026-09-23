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
    // Biology never calls an LLM, so its tasks have to be in the pool before the API starts; the
    // render script writes them wherever the API will read from (SQLite here, Postgres when the
    // environment carries Supabase credentials). Math still generates through the mock provider.
    command:
      "npm run build && npm run render:templates -w @portal/trainer-bio -- --target=20 --db=../../../e2e/.pool.db && npm start",
    url: `http://localhost:${PORT}/api/health`,
    reuseExistingServer: false,
    timeout: 240_000,
    env: { LLM_PROVIDER: "mock", PORT: String(PORT), TASK_DB_PATH: "./e2e/.pool.db" },
  },
});
