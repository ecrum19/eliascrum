import { expect, it } from "vitest";
import { PDFDocument } from "pdf-lib";
import {
  generateCv,
  siteLink,
  publicationStatus,
  activityLabel,
} from "../../scripts/build-cv.mjs";
import { normalizeText } from "../../scripts/cv/render.mjs";
import * as content from "../../scripts/cv/content.ts";

it("generates both CV formats from the complete authored catalog", async () => {
  const outputs = await generateCv({
    date: new Date("2026-10-09T00:00:00Z"),
    siteUrl: "https://example.org/research/",
  });
  expect(outputs.map((output) => output.id)).toEqual(["focused", "complete"]);
  for (const output of outputs) {
    const document = await PDFDocument.load(output.bytes);
    expect(document.getPageCount()).toBeGreaterThan(0);
    expect(document.getAuthor()).toContain("Crum");
    expect(output.bytes.length).toBeLessThan(200_000);
  }
  expect(content.publications.length).toBeGreaterThan(0);
  expect(content.softwareProjects.length).toBeGreaterThan(0);
});

it("normalizes printable text and links and preserves activity labels", () => {
  expect(normalizeText("Plain text")).toBe("Plain text");
  expect(siteLink("/software/tool", "https://example.org/research/")).toBe(
    "https://example.org/research/software/tool",
  );
  expect(() => siteLink("javascript:alert(1)", "https://example.org")).toThrow(
    "Unsupported CV link",
  );
  expect(
    publicationStatus({ details: [{ label: "Status", value: "Accepted" }] }),
  ).toBe("Accepted");
  expect(
    activityLabel(content.softwareProjects[0], content, new Date("2026-10-09")),
  ).toBeTruthy();
});

it("runs the authoring validator as an import-safe read-only check", async () => {
  const { validateSiteContent } = await import(
    "../../scripts/validate-content.mjs"
  );
  expect(await validateSiteContent()).toEqual({
    errors: [],
    counts: {
      software: content.softwareProjects.length,
      publications: content.publications.length,
      talks: content.talks.length,
      posters: content.posters.length,
    },
  });
});
