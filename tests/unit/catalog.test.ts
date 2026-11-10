import { describe, it, expect } from "vitest";
import {
  softwareCatalog,
  entryPath,
  relatedIds,
} from "../../src/content/catalog";
import { dateLabel, dateSortValue } from "../../src/content/dates";
import {
  validateContent,
  validateHighlights,
  type ValidationContext,
} from "../../src/content/validation";
import type { ContentDate, SoftwareRecord } from "../../src/content/types";
import { publications } from "../../src/data/publicationsData";
import { talks, posters } from "../../src/data/talksData";
import { softwareReleasesBySoftwareId } from "../../src/data/softwareReleases";
import { buildSearchDocuments } from "../../src/utils/siteSearch";
import { minimalSoftware as minimal } from "../fixtures/minimalSoftware";

const context: ValidationContext = {
  sections: softwareCatalog.sections,
  relationKeys: new Set([
    ...publications.map((entry) => `publication:${entry.id}`),
    ...talks.map((entry) => `talk:${entry.slug}`),
    ...posters.map((entry) => `poster:${entry.slug}`),
    ...softwareCatalog.entries.map((entry) => `software:${entry.id}`),
  ]),
};

describe("authoring a software record", () => {
  it("accepts the minimal record without optional fields and indexes it for search", () => {
    expect(validateContent([minimal], context)).toEqual([]);
    expect(entryPath(minimal)).toBe("/software/example");
    expect(relatedIds(minimal, "publication")).toEqual([]);
    const documents = buildSearchDocuments([minimal]);
    expect(
      documents.find((document) => document.id === "software:example"),
    ).toMatchObject({
      title: "Example",
      subtitle: "Software • Utilities",
      route: "/software/example",
      href: undefined,
    });
  });
  it("validates all authored entries and release observation IDs", () => {
    expect(
      validateContent(softwareCatalog.entries, {
        ...context,
        observationIds: Object.keys(softwareReleasesBySoftwareId),
      }),
    ).toEqual([]);
    for (const entry of softwareCatalog.entries) {
      expect(softwareCatalog.byId(entry.id)).toBe(entry);
      expect(softwareCatalog.bySlug(entry.slug)).toBe(entry);
    }
    expect(softwareCatalog.bySlug("missing")).toBeUndefined();
  });
  it("selects related IDs by kind in authored order", () => {
    const entry: SoftwareRecord = {
      ...minimal,
      related: ["talk:b", "publication:a", "talk:c:with-colon"],
    };
    expect(relatedIds(entry, "talk")).toEqual(["b", "c:with-colon"]);
    expect(relatedIds(entry, "publication")).toEqual(["a"]);
    expect(relatedIds(entry, "poster")).toEqual([]);
  });
  it("reports independent errors together with the record identity", () => {
    const invalid = {
      ...minimal,
      title: " ",
      slug: "Bad Slug",
      sectionId: "missing",
      type: "",
      purpose: "",
      description: "",
      topics: [""],
      date: "2026-02-30",
      links: { website: "javascript:alert(1)", documentation: "/missing.pdf" },
      related: ["publication:missing"],
      extraDetails: [{ label: "", value: "", href: "invalid" }],
    } as SoftwareRecord;
    const errors = validateContent([invalid, invalid], {
      ...context,
      observationIds: ["missing"],
      localAssetExists: () => false,
    });
    for (const message of [
      "duplicate ID",
      "duplicate route",
      "title is required",
      "slug must",
      "invalid date",
      "unknown section",
      "type is required",
      "purpose is required",
      "description is required",
      "topics",
      "website: expected an http",
      "missing local asset /missing.pdf",
      "unknown relation publication:missing",
      "detail label",
      "unknown entry missing",
    ]) {
      expect(
        errors.some((error) => error.includes(message)),
        message,
      ).toBe(true);
    }
  });
  it("validates highlights on catalog entries and on legacy content", () => {
    expect(
      validateContent(
        [{ ...minimal, highlight: { label: "Demo", related: "publication:solid-cockpit-eswc-2026-demo" } }],
        context,
      ),
    ).toEqual([]);
    expect(
      validateContent(
        [{ ...minimal, highlight: { label: " ", href: "javascript:alert(1)", related: "software:missing" } }],
        context,
      ),
    ).toEqual([
      "software:example: highlight label is required",
      "software:example highlight: expected an http(s) URL or local asset path",
      "software:example: unknown highlight entry software:missing",
    ]);
    expect(validateHighlights([["publication:x", { label: "Site" }]], context)).toEqual([
      "publication:x: highlight needs an href or a related entry",
    ]);
  });
  it("accepts every date form and existing local assets, and rejects impossible dates", () => {
    for (const date of ["2024-02-29", 2026, "ongoing", "unknown"] as const) {
      expect(
        validateContent(
          [{ ...minimal, date, links: { documentation: "/guide.pdf" } }],
          { ...context, localAssetExists: () => true },
        ),
      ).toEqual([]);
    }
    for (const date of ["2026-2-01", "invalid", "2026-13-01", 12.5, 99999]) {
      expect(
        validateContent([{ ...minimal, date: date as ContentDate }], context),
        String(date),
      ).toEqual(["software:example: invalid date"]);
    }
  });
  it("labels and orders dates without inventing precision", () => {
    expect(dateLabel(2026)).toBe("2026");
    expect(dateLabel("2026-10-09")).toBe("2026-10-09");
    expect(dateLabel("ongoing")).toBe("Ongoing");
    expect(dateLabel("unknown")).toBe("Undated");
    // A year sorts before the days within it; ongoing work sorts as newest.
    const shuffled: ContentDate[] = ["2026-10-09", "ongoing", 2025, "unknown", "2026-01-01", 2026];
    expect(shuffled.sort((a, b) => dateSortValue(a) - dateSortValue(b))).toEqual(
      ["unknown", 2025, 2026, "2026-01-01", "2026-10-09", "ongoing"],
    );
  });
  it("builds the route for every content kind", () => {
    expect(entryPath({ ...minimal, kind: "publication" })).toBe(
      "/publications/example/paper",
    );
    expect(entryPath({ ...minimal, kind: "talk" })).toBe("/talks/example");
    expect(entryPath({ ...minimal, kind: "poster" })).toBe(
      "/talks/posters/example",
    );
  });
});
