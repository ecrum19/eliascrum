import { expect, it, vi } from "vitest";
import { normalizeLinkUrl, linkTarget, linkRel } from "../../src/utils/links";

it("prefixes local resources once for project deployments and preserves external links", () => {
  vi.stubEnv("BASE_URL", "/research/");
  expect(normalizeLinkUrl("/guides/tool.pdf")).toBe(
    "/research/guides/tool.pdf",
  );
  expect(normalizeLinkUrl("/research/guides/tool.pdf")).toBe(
    "/research/guides/tool.pdf",
  );
  expect(normalizeLinkUrl("")).toBe("");
  for (const href of [
    "https://example.org/tool",
    "//example.org/tool",
    "mailto:example@example.org",
  ]) {
    expect(normalizeLinkUrl(href)).toBe(href);
    expect(linkTarget(href)).toBe("_blank");
    expect(linkRel(href)).toBe("noopener noreferrer");
  }
  expect(linkTarget("/local.pdf")).toBeUndefined();
  expect(linkRel("/local.pdf")).toBeUndefined();
});
