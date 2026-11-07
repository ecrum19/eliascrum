import { defineConfig } from "vitest/config";

/** Maintenance code runs in Node; no browser emulation or live API requests are needed. */
export default defineConfig({
  test: {
    environment: "node",
    maxWorkers: 2,
    include: ["tests/scripts/**/*.test.mjs"],
    restoreMocks: true,
    unstubGlobals: true,
    unstubEnvs: true,
    testTimeout: 30_000,
    coverage: {
      provider: "v8",
      include: ["scripts/**/*.{mjs,ts}"],
      exclude: ["scripts/**/*.test.mjs"],
      reportsDirectory: "coverage/scripts",
      reporter: ["text", "html", "json-summary"],
      thresholds: {
        statements: 60,
        lines: 60,
        functions: 60,
        branches: 50,
      },
    },
  },
});
