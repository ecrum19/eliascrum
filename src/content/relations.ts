import {
  getPublicationById,
  getPublicationPagePath,
  publicationPresentationLinksById,
} from "../data/publicationsData";
import { getTalkViewBySlug } from "../data/talkCatalog";
import { getPosterViewBySlug, getPosterViewEntries } from "../data/posterCatalog";
import { entryPath, softwareCatalog } from "./catalog";
import type { ContentKind, EntryRef, Highlight } from "./types";

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

export function splitRef(ref: EntryRef): [ContentKind, string] {
  const separator = ref.indexOf(":");
  return [ref.slice(0, separator) as ContentKind, ref.slice(separator + 1)];
}

/** Legacy lookups stay here until publications, talks, and posters join the catalog. */
function findTarget(kind: ContentKind, id: string) {
  switch (kind) {
    case "publication": {
      const target = getPublicationById(id);
      return target && { title: target.title, to: getPublicationPagePath(target) };
    }
    case "talk": {
      const target = getTalkViewBySlug(id);
      return target && { title: target.displayTitle, to: `/talks/${target.slug}` };
    }
    case "poster": {
      const target = getPosterViewBySlug(id);
      return target && { title: target.displayTitle, to: `/talks/posters/${target.slug}` };
    }
    case "software": {
      const target = softwareCatalog.byId(id);
      return target && { title: target.title, to: entryPath(target) };
    }
  }
}

export function resolveEntryRef(ref: EntryRef): RelatedItem | undefined {
  const [kind, id] = splitRef(ref);
  const target = findTarget(kind, id);
  return target && { key: ref, label: `${KIND_LABELS[kind]}: ${target.title}`, to: target.to };
}

const posterRefForPath = (path: string): EntryRef | undefined => {
  const poster = getPosterViewEntries().find((entry) => entry.path === path);
  return poster && `poster:${poster.slug}`;
};

/**
 * An entry's authored relationships plus every relationship stored on the other side
 * (software → anything, publication ↔ presentation, talk ↔ poster), each listed once.
 */
export function relatedItems(self: EntryRef, authored: EntryRef[] = []): RelatedItem[] {
  const refs = new Set<EntryRef>(authored);
  for (const entry of softwareCatalog.entries) {
    if (entry.related?.includes(self)) refs.add(`software:${entry.id}`);
  }
  const [kind, id] = splitRef(self);
  for (const [publicationId, links] of Object.entries(publicationPresentationLinksById)) {
    for (const link of links) {
      const presentation =
        link.kind === "talk" ? (`talk:${link.talkSlug}` as const) : posterRefForPath(link.filePath);
      if (!presentation) continue;
      if (kind === "publication" && publicationId === id) refs.add(presentation);
      if (presentation === self) refs.add(`publication:${publicationId}`);
    }
  }
  if (kind === "talk") {
    const posterPath = getTalkViewBySlug(id)?.posterPath;
    const poster = posterPath && posterRefForPath(posterPath);
    if (poster) refs.add(poster);
  }
  if (kind === "poster") {
    const talkSlug = getPosterViewBySlug(id)?.linkedTalkSlug;
    if (talkSlug) refs.add(`talk:${talkSlug}`);
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
