import type { ContentDate } from "./types";

export function dateLabel(date: ContentDate): string {
  if (date === "ongoing") return "Ongoing";
  if (date === "unknown") return "Undated";
  return String(date);
}

/** Stable ordering only; year-only records are never exported as a fabricated full date. */
export function dateSortValue(date: ContentDate): number {
  if (date === "ongoing") return Infinity;
  if (date === "unknown") return 0;
  return typeof date === "number"
    ? date * 10000
    : Number(date.replaceAll("-", ""));
}

export function isValidDate(date: ContentDate): boolean {
  if (date === "ongoing" || date === "unknown") return true;
  if (typeof date === "number")
    return Number.isInteger(date) && date >= 1000 && date <= 9999;
  const parsed = new Date(`${date}T00:00:00Z`);
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(date) &&
    Number.isFinite(parsed.getTime()) &&
    parsed.toISOString().startsWith(date)
  );
}
