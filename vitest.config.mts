import { defineConfig } from "vitest/config";
import vue from "@vitejs/plugin-vue";

/** Unit and component tests run without a browser or external network requests. */
export default defineConfig({
  plugins: [vue()],
  test: {
    environment: "jsdom",
    maxWorkers: 2,
    testTimeout: 15_000,
    setupFiles: ["tests/setup.ts"],
    include: ["tests/unit/**/*.test.ts", "tests/components/**/*.test.ts"],
    restoreMocks: true,
    unstubGlobals: true,
    unstubEnvs: true,
    coverage: {
      provider: "v8",
      include: ["src/**/*.{ts,vue}"],
      exclude: ["src/**/*.d.ts"],
      reporter: ["text", "html", "json-summary"],
      thresholds: {
        lines: 80,
        statements: 80,
        functions: 75,
        branches: 70,
      },
    },
  },
});
