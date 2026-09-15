import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // e2e/ is run by Playwright (npm run e2e)
    exclude: [...configDefaults.exclude, "e2e/**"],
  },
});
