import { dateLabel, dateSortValue } from "./dates";
import type { ContentSection, SoftwareRecord } from "./types";

export type SoftwareTagKind = "section" | "type" | "purpose" | "topic";
export interface SoftwareFilters {
  section: string;
  type: string;
  purpose: string;
  topic: string;
  year: string;
  sort: "date-desc" | "date-asc" | "title-asc" | "title-desc";
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
  if (typeof query.value !== "string" || !query.value.trim()) return;
  const kind = query.tag;
  if (
    kind !== "section" &&
    kind !== "type" &&
    kind !== "purpose" &&
    kind !== "topic"
  )
    return;
  return tagFilters(kind, query.value.trim());
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
  return entries
    .filter(
      (entry) =>
        matches(filters.section, sectionTitles.get(entry.sectionId) ?? "") &&
        matches(filters.type, entry.type) &&
        matches(filters.purpose, entry.purpose) &&
        (filters.topic === "All" || entry.topics.includes(filters.topic)) &&
        matches(filters.year, dateLabel(entry.date)),
    )
    .sort((left, right) => {
      if (filters.sort.startsWith("title")) {
        const order = left.title.localeCompare(right.title, undefined, {
          sensitivity: "base",
        });
        return filters.sort === "title-asc" ? order : -order;
      }
      const leftDate = dateSortValue(left.date);
      const rightDate = dateSortValue(right.date);
      const order = leftDate === rightDate ? 0 : leftDate < rightDate ? -1 : 1;
      return filters.sort === "date-asc" ? order : -order;
    });
}
