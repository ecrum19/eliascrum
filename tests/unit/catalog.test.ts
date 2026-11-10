import { describe, it, expect } from "vitest";
import {
  posterCatalog,
  publicationCatalog,
  softwareCatalog,
  talkCatalog,
  entryPath,
  relatedIds,
} from "../../src/content/catalog";
import { dateLabel, dateSortValue } from "../../src/content/dates";
import {
  validateContent,
  validateTalkAssets,
  type ValidationContext,
} from "../../src/content/validation";
import { talkAssets } from "../../src/content/generated/talkAssets";
import type {
  ContentDate,
  PosterRecord,
  PublicationRecord,
  SoftwareRecord,
  TalkRecord,
} from "../../src/content/types";
import {
  publicationDownloadsByPublicationId,
  scholarCitationsByPublicationId,
} from "../../src/data/scholarCitations";
import { softwareReleasesBySoftwareId } from "../../src/data/softwareReleases";
import { buildSearchDocuments } from "../../src/utils/siteSearch";
import { minimalSoftware as minimal } from "../fixtures/minimalSoftware";
import { minimalPublication } from "../fixtures/minimalPublication";
import { minimalPoster, minimalTalk } from "../fixtures/minimalPresentations";

const context: ValidationContext = {
  sections: softwareCatalog.sections,
  relationKeys: new Set([
    ...publicationCatalog.entries.map((entry) => `publication:${entry.id}`),
    ...talkCatalog.entries.map((entry) => `talk:${entry.id}`),
    ...posterCatalog.entries.map((entry) => `poster:${entry.id}`),
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
  it("validates highlights", () => {
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
    expect(validateContent([{ ...minimal, highlight: { label: "Site" } }], context)).toEqual([
      "software:example: highlight needs an href or a related entry",
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

describe("authoring a publication record", () => {
  it("accepts the minimal record and routes it to its paper page", () => {
    expect(validateContent([minimalPublication], context)).toEqual([]);
    expect(entryPath(minimalPublication)).toBe("/publications/example-paper/paper");
  });
  it("validates all authored publications and their citation and download IDs", () => {
    expect(
      validateContent(publicationCatalog.entries, {
        ...context,
        observationIds: [
          ...Object.keys(scholarCitationsByPublicationId),
          ...Object.keys(publicationDownloadsByPublicationId),
        ],
      }),
    ).toEqual([]);
    for (const entry of publicationCatalog.entries) {
      expect(publicationCatalog.byId(entry.id)).toBe(entry);
      expect(publicationCatalog.bySlug(entry.slug)).toBe(entry);
    }
    expect(publicationCatalog.byId("missing")).toBeUndefined();
  });
  it("requires citation fields and rejects generated or repeated detail rows", () => {
    const invalid = {
      ...minimalPublication,
      authors: "",
      bibtex: " ",
      extraDetails: [
        { label: "Date", value: "2026" },
        { label: "DOI", value: "10.1/a" },
        { label: "DOI", value: "10.1/b" },
      ],
    } as PublicationRecord;
    expect(validateContent([invalid], context)).toEqual([
      "publication:example-paper-2026: authors is required",
      "publication:example-paper-2026: bibtex is required",
      'publication:example-paper-2026: "Date" is generated from the record; remove the detail row',
      "publication:example-paper-2026: duplicate detail label DOI",
    ]);
  });
});

describe("authoring a talk or poster", () => {
  const presentations = [...talkCatalog.entries, ...posterCatalog.entries];
  it("accepts the minimal records, which need no duration, audience, or abstract", () => {
    expect(validateContent([minimalTalk, minimalPoster], context)).toEqual([]);
    expect(entryPath(minimalTalk)).toBe("/talks/example-talk");
    expect(entryPath(minimalPoster)).toBe("/talks/posters/example-poster");
  });
  it("validates all authored talks and posters against their built assets", () => {
    expect(
      validateContent(presentations, { ...context, localAssetExists: () => true }),
    ).toEqual([]);
    expect(validateTalkAssets(presentations, Object.keys(talkAssets))).toEqual([]);
  });
  it("reports PDFs that were not built, and built files without a record", () => {
    const pdfTalk: TalkRecord = { ...minimalTalk, slides: { format: "pdf", source: "Example.pdf" } };
    expect(validateTalkAssets([pdfTalk, minimalTalk, minimalPoster], ["/talks/posters/example_poster.pdf", "/talks/slides/old.pdf"])).toEqual([
      "talk:example-talk: /talks/slides/example-talk.pdf is not built yet; run npm run build:slides",
      "talk assets: /talks/slides/old.pdf has no talk or poster record",
    ]);
    expect(
      validateContent([pdfTalk], { ...context, localAssetExists: () => false }),
    ).toEqual([
      "talk:example-talk: missing local asset /talks/slides/example-talk.pdf; run npm run build:slides",
    ]);
  });
  it("rejects malformed slides, posters, and presentation values", () => {
    const talk = {
      ...minimalTalk,
      slides: { format: "pptx" },
      durationMinutes: 0,
      audienceSizeApprox: 12.5,
      venueTags: [" "],
      relatedResources: [{ label: "", url: "ftp://example.org" }],
    } as unknown as TalkRecord;
    const poster = { ...minimalPoster, source: "", audienceGroups: undefined } as unknown as PosterRecord;
    expect(validateContent([talk, poster], context)).toEqual([
      "talk:example-talk: venueTags must be a list of nonblank values",
      "talk:example-talk: durationMinutes must be a positive whole number",
      "talk:example-talk: audienceSizeApprox must be a positive whole number",
      "talk:example-talk: resource label is required",
      "talk:example-talk : expected an http(s) URL or local asset path",
      'talk:example-talk: slides.format must be "pdf" or "html"',
      "poster:example-poster: audienceGroups must be a list of nonblank values",
      "poster:example-poster: source is required",
    ]);
  });
});
