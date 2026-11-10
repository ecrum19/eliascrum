import type { ContentDate } from "./types";

export function dateLabel(date: ContentDate): string {
  if (date === "ongoing") return "Ongoing";
  if (date === "unknown") return "Undated";
  return String(date);
}

/** "28/10/2026" for a day, as talk and poster listings print it; otherwise as dateLabel. */
export function numericDateLabel(date: ContentDate): string {
  if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return dateLabel(date);
  const [year, month, day] = date.split("-");
  return `${day}/${month}/${year}`;
}

export function dateYear(date: ContentDate): number | undefined {
  if (typeof date === "number") return date;
  return /^\d{4}-/.test(date) ? Number(date.slice(0, 4)) : undefined;
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
