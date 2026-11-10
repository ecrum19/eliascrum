import { softwareEntries, softwareSectionDefinitions } from "./software";
import type { ContentEntry, ContentKind } from "./types";

export { dateLabel } from "./dates";

/** IDs of the related entries of one kind, in authored order. */
export function relatedIds(entry: ContentEntry, kind: ContentKind): string[] {
  const prefix = `${kind}:`;
  return (entry.related ?? [])
    .filter((ref) => ref.startsWith(prefix))
    .map((ref) => ref.slice(prefix.length));
}

export function entryPath(entry: ContentEntry): string {
  switch (entry.kind) {
    case "publication":
      return `/publications/${entry.slug}/paper`;
    case "talk":
      return `/talks/${entry.slug}`;
    case "poster":
      return `/talks/posters/${entry.slug}`;
    case "software":
      return `/software/${entry.slug}`;
  }
}

/** Pure selectors: safe for both Vue and Node build scripts. */
export const softwareCatalog = {
  entries: softwareEntries,
  sections: softwareSectionDefinitions,
  byId: (id: string) => softwareEntries.find((entry) => entry.id === id),
  bySlug: (slug: string) =>
    softwareEntries.find((entry) => entry.slug === slug),
};
