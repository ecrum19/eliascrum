import { dateYear } from "./dates";
import { choices, routeTag, sortEntries, type SortOrder } from "./listingFilters";
import {
  audienceSizeCategory,
  durationCategory,
  type PresentationRecord,
} from "./presentationDetails";
import {
  AUDIENCE_GROUP_TAG_OPTIONS,
  AUDIENCE_SIZE_TAG_OPTIONS,
  DURATION_TAG_OPTIONS,
  TOPIC_TAG_OPTIONS,
  VENUE_TAG_OPTIONS,
} from "./tags";

export const MATERIAL_TAG_OPTIONS = ["Slides", "Poster"] as const;
export type MaterialTag = (typeof MATERIAL_TAG_OPTIONS)[number];
export const materialTag = (entry: PresentationRecord): MaterialTag =>
  entry.kind === "talk" ? "Slides" : "Poster";

const TAG_KINDS = ["material", "venue", "topic", "duration", "audienceSize", "audienceGroup"] as const;
export type PresentationTagKind = (typeof TAG_KINDS)[number];
export interface PresentationFilters extends Record<PresentationTagKind, string> {
  year: string;
  sort: SortOrder;
}
export const defaultPresentationFilters = (): PresentationFilters => ({
  material: "All",
  venue: "All",
  topic: "All",
  duration: "All",
  audienceSize: "All",
  audienceGroup: "All",
  year: "All",
  sort: "date-desc",
});

/** A tag chip selects only its own tag, keeping the chosen sort order. */
export function tagFilters(
  kind: PresentationTagKind,
  value: string,
  sort: SortOrder = "date-desc",
): PresentationFilters {
  return { ...defaultPresentationFilters(), [kind]: value, sort };
}
export function routeTagFilters(query: Record<string, unknown>): PresentationFilters | undefined {
  const tag = routeTag(query, TAG_KINDS);
  return tag && tagFilters(tag.kind, tag.value);
}

/** The listing anchor of an entry, kept from the original page so shared links still land. */
export const presentationAnchor = (entry: PresentationRecord) =>
  `talk-entry-${entry.kind === "talk" ? "slide" : "poster"}-${entry.slug}`;

export const presentationYear = (entry: PresentationRecord) =>
  String(dateYear(entry.date) ?? "Undated");

/** Every tag value an entry carries, by filter dimension; unknown values carry none. */
export function presentationTags(entry: PresentationRecord): Record<PresentationTagKind, string[]> {
  const known = (value: string | undefined) => (value ? [value] : []);
  return {
    material: [materialTag(entry)],
    venue: entry.venueTags,
    topic: entry.topics,
    duration: known(durationCategory(entry)),
    audienceSize: known(audienceSizeCategory(entry)),
    audienceGroup: entry.audienceGroups,
  };
}

/** Dropdown options: the shared vocabularies plus every value in use. */
export function presentationFilterOptions(entries: PresentationRecord[]) {
  const used = (kind: PresentationTagKind) => entries.flatMap((entry) => presentationTags(entry)[kind]);
  const years = [...new Set(entries.map(presentationYear))].sort((a, b) =>
    a === "Undated" ? 1 : b === "Undated" ? -1 : Number(b) - Number(a),
  );
  return {
    venues: choices([...VENUE_TAG_OPTIONS, ...used("venue")]),
    topics: choices([...TOPIC_TAG_OPTIONS, ...used("topic")]),
    materials: ["All", ...MATERIAL_TAG_OPTIONS],
    durations: ["All", ...DURATION_TAG_OPTIONS],
    audienceSizes: ["All", ...AUDIENCE_SIZE_TAG_OPTIONS],
    audienceGroups: choices([...AUDIENCE_GROUP_TAG_OPTIONS, ...used("audienceGroup")]),
    years: ["All", ...years],
  };
}

/** An entry without a value for a dimension is excluded only while that dimension is filtered. */
export function filterPresentations<T extends PresentationRecord>(
  entries: T[],
  filters: PresentationFilters,
): T[] {
  return sortEntries(
    entries.filter((entry) => {
      const tags = presentationTags(entry);
      return (
        TAG_KINDS.every((kind) => filters[kind] === "All" || tags[kind].includes(filters[kind])) &&
        (filters.year === "All" || filters.year === presentationYear(entry))
      );
    }),
    filters.sort,
  );
}
