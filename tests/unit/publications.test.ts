import { describe, expect, it } from "vitest";
import { publicationCatalog } from "../../src/content/catalog";
import {
  publicationDetailRows,
  publicationMetric,
  publicationPdfUrl,
} from "../../src/content/publicationDetails";
import {
  defaultPublicationFilters,
  filterPublications,
  publicationFilterOptions,
  routeTagFilters,
} from "../../src/content/publicationFilters";
import type { PublicationRecord } from "../../src/content/types";
import { minimalPublication as minimal } from "../fixtures/minimalPublication";

const paper = (overrides: Partial<PublicationRecord>): PublicationRecord => ({ ...minimal, ...overrides });

describe("publication details", () => {
  it("generates the type and date rows ahead of the authored rows", () => {
    const entry = paper({
      typeLabel: "Demo Paper (Conference Paper)",
      extraDetails: [{ label: "DOI", value: "10.1/x" }],
    });
    expect(publicationDetailRows(entry)).toEqual([
      { label: "Publication Type", value: "Demo Paper (Conference Paper)" },
      { label: "Date", value: "2026-01-01" },
      { label: "DOI", value: "10.1/x" },
    ]);
    expect(publicationDetailRows(minimal)[0].value).toBe("Conference Paper");
  });
  it("reports citations for papers, downloads for theses, and N/A when unknown", () => {
    const thesis = publicationCatalog.entries.find((entry) => entry.type === "Thesis")!;
    expect(publicationMetric(thesis).label).toBe("Loyola eCommons Downloads");
    expect(publicationMetric(minimal)).toEqual({ label: "Google Scholar Citations", value: "N/A" });
  });
  it("previews the hosted paper, or a publisher link only when it is a PDF", () => {
    expect(publicationPdfUrl(paper({ links: { paper: "/publications/papers/a.pdf" } }))).toBe(
      "/publications/papers/a.pdf",
    );
    expect(publicationPdfUrl(paper({ links: { publisher: "https://x.org/a.PDF?download=1" } }))).toBe(
      "https://x.org/a.PDF?download=1",
    );
    expect(publicationPdfUrl(paper({ links: { publisher: "https://doi.org/10.1/x" } }))).toBeUndefined();
  });
});

describe("publication filters", () => {
  const entries = [
    paper({ id: "a", title: "Alpha", date: "2024-05-01", venueTags: ["ESWC"], topics: ["Solid"] }),
    paper({ id: "b", title: "Beta", date: "2026-02-01", type: "Preprint" }),
    paper({ id: "c", title: "Gamma", date: "unknown" }),
  ];
  const ids = (filters: Partial<ReturnType<typeof defaultPublicationFilters>>) =>
    filterPublications(entries, { ...defaultPublicationFilters(), ...filters }).map((entry) => entry.id);

  it("combines dimensions and sorts newest first by default", () => {
    expect(ids({})).toEqual(["b", "a", "c"]);
    expect(ids({ venue: "ESWC" })).toEqual(["a"]);
    expect(ids({ topic: "Solid", year: "2024" })).toEqual(["a"]);
    expect(ids({ type: "Preprint", topic: "Solid" })).toEqual([]);
    expect(ids({ year: "Undated" })).toEqual(["c"]);
    expect(ids({ sort: "title-desc" })).toEqual(["c", "b", "a"]);
  });
  it("offers years newest first with undated work last", () => {
    const options = publicationFilterOptions(entries);
    expect(options.years).toEqual(["All", "2026", "2024", "Undated"]);
    expect(options.types).toEqual(expect.arrayContaining(["All", "Conference Paper", "Preprint", "Thesis"]));
  });
  it("selects one tag from a route and ignores unknown kinds", () => {
    expect(routeTagFilters({ tag: "venue", value: " ESWC " })).toEqual({
      ...defaultPublicationFilters(),
      venue: "ESWC",
    });
    expect(routeTagFilters({ tag: "audience", value: "x" })).toBeUndefined();
  });
});
