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
/** `paper` is a PDF hosted on this site; `publisher` is the canonical web version. */
export type LinkRole = "repository" | "website" | "documentation" | "paper" | "publisher";
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

/** The core every record shares, whatever its kind. */
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
export interface PublicationRecord extends ContentEntry {
  kind: "publication";
  /** Listing category, one of PUBLICATION_TYPE_OPTIONS for filtering. */
  type: string;
  /** Shown instead of `type` on the paper's page, e.g. "Demo Paper (Conference Paper)". */
  typeLabel?: string;
  authors: string;
  venue: string;
  venueTags: string[];
  abstract?: string;
  bibtex: string;
}
/** A named external resource, such as an event website or a demo video. */
export interface ResourceLink {
  label: string;
  url: string;
}

/** What talks and posters share: where they were presented, and for whom. Absent means unknown. */
export interface PresentationFields {
  venueTags: string[];
  abstract?: string;
  goal?: string;
  /** Free text describing the audience's background. */
  audienceExpertise?: string;
  audienceGroups: string[];
  durationMinutes?: number;
  /** Approximate attendance; sets the Audience Size category. */
  audienceSizeApprox?: number;
  /** Shown instead of "Approx. {audienceSizeApprox} attendees", e.g. "Approx. 8–10 attendees". */
  audienceSizeEstimate?: string;
  /** External materials only; site entries belong in `related`. */
  relatedResources?: ResourceLink[];
}

/**
 * PDF slides name their file in `.talk-assets/slides.tar.gz` and are served at
 * `/talks/slides/<slug>.pdf`; HTML decks are hosted elsewhere. `embedUrl` replaces the
 * PDF preview with an embedded presentation (Google Slides, or an HTML deck's player).
 */
export type SlideSource =
  | { format: "pdf"; source: string; embedUrl?: string }
  | { format: "html"; url: string; embedUrl?: string };

/** `related` lists the talk's poster(s) and other entries; the poster links back automatically. */
export interface TalkRecord extends ContentEntry, PresentationFields {
  kind: "talk";
  slides: SlideSource;
}
export interface PosterRecord extends ContentEntry, PresentationFields {
  kind: "poster";
  /** File name in `.talk-assets/posters.tar.gz`, served at `/talks/posters/<source>`. */
  source: string;
}
export interface ContentSection {
  id: string;
  title: string;
  description: string;
}
