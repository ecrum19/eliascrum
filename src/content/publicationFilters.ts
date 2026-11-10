import { dateYear } from "./dates";
import { choices, routeTag, sortEntries, type SortOrder } from "./listingFilters";
import { PUBLICATION_TYPE_OPTIONS } from "./publications";
import type { PublicationRecord } from "./types";
import { TOPIC_TAG_OPTIONS, VENUE_TAG_OPTIONS } from "./tags";

export type PublicationTagKind = "type" | "venue" | "topic";
export interface PublicationFilters {
  venue: string;
  topic: string;
  type: string;
  year: string;
  sort: SortOrder;
}
export const defaultPublicationFilters = (): PublicationFilters => ({
  venue: "All",
  topic: "All",
  type: "All",
  year: "All",
  sort: "date-desc",
});

/** Route chips intentionally select one tag; dropdowns can combine multiple dimensions. */
export function tagFilters(
  kind: PublicationTagKind,
  value: string,
  sort: SortOrder = "date-desc",
): PublicationFilters {
  return { ...defaultPublicationFilters(), [kind]: value, sort };
}
export function routeTagFilters(query: Record<string, unknown>): PublicationFilters | undefined {
  const tag = routeTag(query, ["type", "venue", "topic"] as const);
  return tag && tagFilters(tag.kind, tag.value);
}

export const publicationYear = (entry: PublicationRecord) =>
  String(dateYear(entry.date) ?? "Undated");

/** Dropdown options: the shared tag vocabularies plus every value in use. */
export function publicationFilterOptions(entries: PublicationRecord[]) {
  const years = [...new Set(entries.map(publicationYear))].sort((a, b) =>
    a === "Undated" ? 1 : b === "Undated" ? -1 : Number(b) - Number(a),
  );
  return {
    venues: choices([...VENUE_TAG_OPTIONS, ...entries.flatMap((entry) => entry.venueTags)]),
    topics: choices([...TOPIC_TAG_OPTIONS, ...entries.flatMap((entry) => entry.topics)]),
    types: choices([...PUBLICATION_TYPE_OPTIONS, ...entries.map((entry) => entry.type)]),
    years: ["All", ...years],
  };
}

export function filterPublications(
  entries: PublicationRecord[],
  filters: PublicationFilters,
): PublicationRecord[] {
  const matches = (selected: string, value: string) => selected === "All" || selected === value;
  return sortEntries(
    entries.filter(
      (entry) =>
        (filters.venue === "All" || entry.venueTags.includes(filters.venue)) &&
        (filters.topic === "All" || entry.topics.includes(filters.topic)) &&
        matches(filters.type, entry.type) &&
        matches(filters.year, publicationYear(entry)),
    ),
    filters.sort,
  );
}
