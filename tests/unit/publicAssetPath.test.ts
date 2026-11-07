import { describe, expect, it, vi } from "vitest";
import { resolvePublicAssetPath } from "../../src/utils/publicAssetPath";

describe("public asset URLs", () => {
  it.each(["/", "/eliascrum/", "/eliascrum"])(
    "resolves local assets under %s",
    (base) => {
      vi.stubEnv("BASE_URL", base);
      const prefix = base.endsWith("/") ? base : `${base}/`;
      expect(resolvePublicAssetPath("/talks/slides/a.pdf")).toBe(
        `${prefix}talks/slides/a.pdf`,
      );
      expect(resolvePublicAssetPath("branding/icon.svg")).toBe(
        `${prefix}branding/icon.svg`,
      );
    },
  );
  it.each([
    "https://example.org/a",
    "//example.org/a",
    "data:text/plain,hello",
    "mailto:a@example.org",
    "",
  ])("preserves %s", (url) => {
    expect(resolvePublicAssetPath(url)).toBe(url);
  });
});
