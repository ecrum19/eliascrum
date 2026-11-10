import { describe, expect, it } from "vitest";
import { talkCatalog } from "../../src/content/catalog";
import {
  audienceSizeCategory,
  durationCategory,
  posterPdfPath,
  presentationDetailRows,
  slidesUrl,
  talkPosters,
} from "../../src/content/presentationDetails";
import {
  defaultPresentationFilters,
  filterPresentations,
  presentationAnchor,
  presentationFilterOptions,
  routeTagFilters,
} from "../../src/content/presentationFilters";
import type { PosterRecord, TalkRecord } from "../../src/content/types";
import { minimalPoster, minimalTalk } from "../fixtures/minimalPresentations";

const talk = (overrides: Partial<TalkRecord>): TalkRecord => ({ ...minimalTalk, ...overrides });

describe("presentation details", () => {
  it("derives categories only from recorded values, at the existing boundaries", () => {
    expect([15, 16, 45, 46].map((durationMinutes) => durationCategory(talk({ durationMinutes })))).toEqual([
      "Short",
      "Medium",
      "Medium",
      "Long",
    ]);
    expect([25, 26, 70, 71].map((audienceSizeApprox) => audienceSizeCategory(talk({ audienceSizeApprox })))).toEqual([
      "Small",
      "Medium",
      "Medium",
      "Large",
    ]);
    expect(durationCategory(minimalTalk)).toBeUndefined();
    expect(audienceSizeCategory(minimalTalk)).toBeUndefined();
  });
  it("lists only recorded details, preferring an authored audience estimate", () => {
    expect(presentationDetailRows(minimalTalk)).toEqual([]);
    expect(
      presentationDetailRows(
        talk({
          goal: "Share results.",
          durationMinutes: 20,
          audienceSizeApprox: 9,
          audienceSizeEstimate: "Approx. 8–10 attendees",
          relatedResources: [{ label: "Event", url: "https://example.org" }],
        }),
      ),
    ).toEqual([
      { label: "Goal", value: "Share results." },
      { label: "Duration", value: "~ 20 minutes" },
      { label: "Audience Size", value: "~ 8–10 attendees" },
      { label: "Event", value: "https://example.org", href: "https://example.org" },
    ]);
    expect(presentationDetailRows(talk({ audienceSizeApprox: 30 }))).toEqual([
      { label: "Audience Size", value: "~ 30 attendees" },
    ]);
  });
  it("publishes PDF slides under the talk's slug and posters under their file name", () => {
    expect(slidesUrl(talk({ slides: { format: "pdf", source: "Talk_2026.pdf" } }))).toBe(
      "/talks/slides/example-talk.pdf",
    );
    expect(slidesUrl(minimalTalk)).toBe("https://example.org/slides/");
    expect(posterPdfPath({ ...minimalPoster, source: "Poster (final).pdf" })).toBe(
      "/talks/posters/Poster%20(final).pdf",
    );
    expect(talkPosters(talkCatalog.byId("sosy2026")!).map((poster) => poster.id)).toEqual(["eswc-2026-print"]);
  });
});

describe("presentation filters", () => {
  const entries = [
    talk({ id: "a", title: "Alpha", date: "2026-03-01", durationMinutes: 10, venueTags: ["ESWC"] }),
    talk({ id: "b", title: "Beta", date: "2025-01-01" }),
    { ...minimalPoster, id: "c", title: "Gamma", date: "2024-06-01" } satisfies PosterRecord,
  ];
  const ids = (filters: Partial<ReturnType<typeof defaultPresentationFilters>>) =>
    filterPresentations(entries, { ...defaultPresentationFilters(), ...filters }).map((entry) => entry.id);

  it("combines dimensions, excluding unknown values only while that dimension is filtered", () => {
    expect(ids({})).toEqual(["a", "b", "c"]);
    expect(ids({ duration: "Short" })).toEqual(["a"]);
    expect(ids({ material: "Poster" })).toEqual(["c"]);
    expect(ids({ venue: "ESWC", year: "2026" })).toEqual(["a"]);
    expect(ids({ venue: "ESWC", year: "2025" })).toEqual([]);
    expect(ids({ sort: "title-desc" })).toEqual(["c", "b", "a"]);
  });
  it("offers the shared vocabularies plus values in use, and selects one tag from a route", () => {
    const options = presentationFilterOptions(entries);
    expect(options.venues).toEqual(expect.arrayContaining(["All", "Conference", "ESWC"]));
    expect(options.durations).toEqual(["All", "Short", "Medium", "Long"]);
    expect(options.years).toEqual(["All", "2026", "2025", "2024"]);
    expect(routeTagFilters({ tag: "audienceGroup", value: "Biologists" })).toEqual({
      ...defaultPresentationFilters(),
      audienceGroup: "Biologists",
    });
    expect(routeTagFilters({ tag: "unknown", value: "x" })).toBeUndefined();
  });
  it("keeps the listing anchors existing links point at", () => {
    expect(presentationAnchor(minimalTalk)).toBe("talk-entry-slide-example-talk");
    expect(presentationAnchor(minimalPoster)).toBe("talk-entry-poster-example-poster");
  });
});
