import { defineConfig } from "@playwright/test";

// Visual baselines are local: compare on the same OS, browser, and font cache.
export default defineConfig({
  testDir: "./tests/visual",
  outputDir: ".cache/visual-results",
  snapshotPathTemplate: "{testDir}/snapshots/{arg}{ext}",
  fullyParallel: true,
  workers: 2,
  timeout: 60_000,
  use: { baseURL: "http://127.0.0.1:4173", browserName: "chromium" },
  webServer: {
    command: "npx vite --host 127.0.0.1 --port 4173 --strictPort",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: !process.env.CI,
  },
});
