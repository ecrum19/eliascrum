import type { ContentSection, SoftwareRecord } from "../../src/content/types";

/** The minimal software record from ADDING_CONTENT.md: required fields only. Shared by app and export tests. */
export const minimalSoftware: SoftwareRecord = {
  kind: "software",
  id: "example",
  slug: "example",
  title: "Example",
  summary: "A useful tool.",
  date: "unknown",
  topics: ["RDF"],
  sectionId: "utilities",
  type: "Utility",
  purpose: "Demonstration",
  description: "An example without optional metadata.",
};

export const minimalSoftwareSection: ContentSection = {
  id: "utilities",
  title: "Utilities",
  description: "Useful tools.",
};
