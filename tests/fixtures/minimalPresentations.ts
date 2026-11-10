import type { PosterRecord, TalkRecord } from "../../src/content/types";

/** The minimal talk and poster records from ADDING_CONTENT.md: required fields only. */
export const minimalTalk: TalkRecord = {
  kind: "talk",
  id: "example-talk",
  slug: "example-talk",
  title: "An Example Talk",
  summary: "What the audience will learn.",
  date: "2026-01-01",
  topics: ["RDF"],
  venueTags: ["Conference"],
  audienceGroups: [],
  slides: { format: "html", url: "https://example.org/slides/" },
};

export const minimalPoster: PosterRecord = {
  kind: "poster",
  id: "example-poster",
  slug: "example-poster",
  title: "An Example Poster",
  summary: "What the poster shows.",
  date: "2026-01-01",
  topics: ["RDF"],
  venueTags: ["Conference"],
  audienceGroups: [],
  source: "example_poster.pdf",
};
