/**
 * `2026` (a year), `"2026-10-09"` (a day), `"ongoing"`, or `"unknown"`.
 * Authored dates keep their actual precision; a year never implies January 1.
 */
export type ContentDate =
  | number
  | `${number}-${number}-${number}`
  | "ongoing"
  | "unknown";

export type ContentKind = "software" | "publication" | "talk" | "poster";
/** `kind:id`, e.g. `"publication:solid-cockpit-eswc-2026-demo"`. Talks and posters use their slugs. */
export type EntryRef = `${ContentKind}:${string}`;
export type LinkRole = "repository" | "website" | "documentation";
export interface DetailField {
  label: string;
  value: string;
  href?: string;
}

/**
 * The part of an entry to feature on its page, such as a companion website that is a
 * large part of a paper's contribution: an external/local resource, a site entry, or both.
 */
export interface Highlight {
  label: string;
  description?: string;
  href?: string;
  related?: EntryRef;
}

/** The core contract shared by the forthcoming publication and talk migrations. */
export interface ContentEntry {
  kind: ContentKind;
  id: string;
  slug: string;
  title: string;
  summary: string;
  date: ContentDate;
  topics: string[];
  links?: Partial<Record<LinkRole, string>>;
  related?: EntryRef[];
  extraDetails?: DetailField[];
  highlight?: Highlight;
}
export interface SoftwareRecord extends ContentEntry {
  kind: "software";
  sectionId: string;
  type: string;
  purpose: string;
  description: string;
}
export interface ContentSection {
  id: string;
  title: string;
  description: string;
}
