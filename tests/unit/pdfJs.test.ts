import { beforeEach, expect, it, vi } from "vitest";
const state = vi.hoisted(() => ({
  options: { workerPort: null as unknown, workerSrc: "" },
  fail: false,
}));
vi.mock("pdfjs-dist/build/pdf.mjs", () => ({
  GlobalWorkerOptions: state.options,
}));
vi.mock("pdfjs-dist/build/pdf.worker.mjs?worker", () => ({
  default: class {
    constructor() {
      if (state.fail) throw new Error("Workers unavailable");
    }
  },
}));
vi.mock("pdfjs-dist/build/pdf.worker.mjs?url", () => ({
  default: "/worker.js",
}));
beforeEach(() => {
  vi.resetModules();
  state.options.workerPort = null;
  state.options.workerSrc = "";
  state.fail = false;
});
it("shares one lazy worker configuration across concurrent viewers", async () => {
  const { loadPdfJs } = await import("../../src/utils/pdfJs");
  expect(loadPdfJs()).toBe(loadPdfJs());
  await loadPdfJs();
  expect(state.options.workerPort).toBeTruthy();
});
it("uses the worker URL fallback when worker construction is unavailable", async () => {
  state.fail = true;
  const { loadPdfJs } = await import("../../src/utils/pdfJs");
  await loadPdfJs();
  expect(state.options.workerSrc).toBe("/worker.js");
});
