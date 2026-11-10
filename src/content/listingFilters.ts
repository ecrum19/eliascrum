import { dateSortValue } from "./dates";
import type { ContentDate } from "./types";

export type SortOrder = "date-desc" | "date-asc" | "title-asc" | "title-desc";
export const SORT_OPTIONS: { value: SortOrder; label: string }[] = [
  { value: "date-desc", label: "Newest First" },
  { value: "date-asc", label: "Oldest First" },
  { value: "title-asc", label: "Title (A-Z)" },
  { value: "title-desc", label: "Title (Z-A)" },
];

/** Sorted copy; entries with equal keys keep their authored order. */
export function sortEntries<T extends { title: string; date: ContentDate }>(
  entries: T[],
  sort: SortOrder,
): T[] {
  return [...entries].sort((left, right) => {
    if (sort.startsWith("title")) {
      const order = left.title.localeCompare(right.title, undefined, { sensitivity: "base" });
      return sort === "title-asc" ? order : -order;
    }
    const [a, b] = [dateSortValue(left.date), dateSortValue(right.date)];
    const order = a === b ? 0 : a < b ? -1 : 1;
    return sort === "date-asc" ? order : -order;
  });
}

/** The `?tag=…&value=…` filter a tag link sends to a listing, if it names a known kind. */
export function routeTag<K extends string>(
  query: Record<string, unknown>,
  kinds: readonly K[],
): { kind: K; value: string } | undefined {
  const { tag, value } = query;
  if (typeof value !== "string" || !value.trim()) return;
  if (!kinds.includes(tag as K)) return;
  return { kind: tag as K, value: value.trim() };
}

/** "All" followed by the distinct values, alphabetically. */
export const choices = (values: Iterable<string>) => [
  "All",
  ...[...new Set(values)].sort((a, b) => a.localeCompare(b)),
];
