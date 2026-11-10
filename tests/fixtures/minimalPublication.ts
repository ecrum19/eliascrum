import type { PublicationRecord } from "../../src/content/types";

/** The minimal publication record from ADDING_CONTENT.md: required fields only. */
export const minimalPublication: PublicationRecord = {
  kind: "publication",
  id: "example-paper-2026",
  slug: "example-paper",
  title: "An Example Paper",
  summary: "A short description of the paper.",
  date: "2026-01-01",
  topics: ["RDF"],
  type: "Conference Paper",
  authors: "A. Author",
  venue: "Example Conference 2026",
  venueTags: [],
  links: {},
  bibtex: "@inproceedings{example2026}",
};
