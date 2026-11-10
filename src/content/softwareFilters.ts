import { dateLabel } from "./dates";
import { routeTag, sortEntries, type SortOrder } from "./listingFilters";
import type { ContentSection, SoftwareRecord } from "./types";

export type SoftwareTagKind = "section" | "type" | "purpose" | "topic";
export interface SoftwareFilters {
  section: string;
  type: string;
  purpose: string;
  topic: string;
  year: string;
  sort: SortOrder;
}
export const defaultSoftwareFilters = (): SoftwareFilters => ({
  section: "All",
  type: "All",
  purpose: "All",
  topic: "All",
  year: "All",
  sort: "date-desc",
});

/** Route chips intentionally select one tag; dropdowns can combine multiple dimensions. */
export function tagFilters(
  kind: SoftwareTagKind,
  value: string,
  sort: SoftwareFilters["sort"] = "date-desc",
): SoftwareFilters {
  return { ...defaultSoftwareFilters(), [kind]: value, sort };
}
export function routeTagFilters(
  query: Record<string, unknown>,
): SoftwareFilters | undefined {
  const tag = routeTag(query, ["section", "type", "purpose", "topic"] as const);
  return tag && tagFilters(tag.kind, tag.value);
}
export function filterSoftware(
  entries: SoftwareRecord[],
  sections: ContentSection[],
  filters: SoftwareFilters,
): SoftwareRecord[] {
  const matches = (selected: string, value: string) =>
    selected === "All" || selected === value;
  const sectionTitles = new Map(
    sections.map((section) => [section.id, section.title]),
  );
  return sortEntries(
    entries.filter(
      (entry) =>
        matches(filters.section, sectionTitles.get(entry.sectionId) ?? "") &&
        matches(filters.type, entry.type) &&
        matches(filters.purpose, entry.purpose) &&
        (filters.topic === "All" || entry.topics.includes(filters.topic)) &&
        matches(filters.year, dateLabel(entry.date)),
    ),
    filters.sort,
  );
}
