import { posterEntries } from "./posters";
import { publicationEntries } from "./publications";
import { softwareEntries, softwareSectionDefinitions } from "./software";
import { talkEntries } from "./talks";
import type { ContentEntry, ContentKind } from "./types";

export { dateLabel, dateYear, numericDateLabel } from "./dates";
export { PUBLICATION_TYPE_OPTIONS } from "./publications";

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
function catalogOf<T extends ContentEntry>(entries: T[]) {
  return {
    entries,
    byId: (id: string) => entries.find((entry) => entry.id === id),
    bySlug: (slug: string) => entries.find((entry) => entry.slug === slug),
  };
}

export const publicationCatalog = catalogOf(publicationEntries);
export const softwareCatalog = { ...catalogOf(softwareEntries), sections: softwareSectionDefinitions };
/** Talk and poster IDs are their slugs, which also name their RDF resources. */
export const talkCatalog = catalogOf(talkEntries);
export const posterCatalog = catalogOf(posterEntries);
