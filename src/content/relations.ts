import { entryPath, posterCatalog, publicationCatalog, softwareCatalog, talkCatalog } from "./catalog";
import type { ContentEntry, ContentKind, EntryRef, Highlight } from "./types";

export interface RelatedItem {
  key: EntryRef;
  label: string;
  to: string;
}

const KIND_LABELS: Record<ContentKind, string> = {
  publication: "Publication",
  talk: "Talk",
  poster: "Poster",
  software: "Software",
};

/** Reverse links are listed in this order, after the entry's own. */
const CATALOGS = {
  publication: publicationCatalog,
  software: softwareCatalog,
  talk: talkCatalog,
  poster: posterCatalog,
} satisfies Record<ContentKind, { entries: ContentEntry[]; byId(id: string): ContentEntry | undefined }>;

export function splitRef(ref: EntryRef): [ContentKind, string] {
  const separator = ref.indexOf(":");
  return [ref.slice(0, separator) as ContentKind, ref.slice(separator + 1)];
}

export const findEntry = (ref: EntryRef): ContentEntry | undefined => {
  const [kind, id] = splitRef(ref);
  return CATALOGS[kind]?.byId(id);
};

export function resolveEntryRef(ref: EntryRef): RelatedItem | undefined {
  const target = findEntry(ref);
  return target && { key: ref, label: `${KIND_LABELS[target.kind]}: ${target.title}`, to: entryPath(target) };
}

/**
 * An entry's authored relationships plus every relationship authored on the other side
 * (any entry that lists this one, such as a talk listing its poster), each listed once.
 */
export function relatedItems(self: EntryRef, authored: EntryRef[] = []): RelatedItem[] {
  const refs = new Set<EntryRef>(authored);
  for (const catalog of Object.values(CATALOGS)) {
    for (const entry of catalog.entries as ContentEntry[]) {
      if (entry.related?.includes(self)) refs.add(`${entry.kind}:${entry.id}`);
    }
  }
  refs.delete(self);
  return [...refs].flatMap((ref) => resolveEntryRef(ref) ?? []);
}

export interface ResolvedHighlight extends Omit<Highlight, "related"> {
  related?: RelatedItem;
}

export function resolveHighlight(highlight?: Highlight): ResolvedHighlight | undefined {
  if (!highlight) return undefined;
  const { related, ...rest } = highlight;
  return { ...rest, related: related && resolveEntryRef(related) };
}

/** An item page's Related list, without the entry its highlight already features. */
export function detailRelated(
  self: EntryRef,
  authored: EntryRef[] = [],
  highlight?: Highlight,
): RelatedItem[] {
  return relatedItems(self, authored).filter((item) => item.key !== highlight?.related);
}
