import { talks, type TalkEntry } from "./talksData";
import { talkMetadataBySlug, type TalkMetadata, type TopicTag, type VenueTag } from "./talkMetadata";

export interface TalkViewEntry extends TalkEntry {
  displayTitle: string;
  displayDateIso: string;
  displayDateLabel: string;
  description: string;
  venueTags: VenueTag[];
  topicTags: TopicTag[];
}

const DEFAULT_DESCRIPTION =
  "Presentation slides for this talk. Update the description in src/data/talkMetadata.ts.";

function labelFromIso(dateIso: string): string {
  if (!dateIso || dateIso === "1900-01-01") {
    return "Undated";
  }

  const parts = dateIso.split("-");
  if (parts.length !== 3) {
    return dateIso;
  }

  const [year, month, day] = parts;
  return `${day}/${month}/${year}`;
}

function hydrateTalkEntry(talk: TalkEntry): TalkViewEntry {
  const meta: TalkMetadata | undefined = talkMetadataBySlug[talk.slug];

  const displayDateIso = meta?.dateIso ?? talk.dateIso;
  const displayDateLabel = meta?.dateLabel ?? labelFromIso(displayDateIso) ?? talk.dateLabel;

  return {
    ...talk,
    displayTitle: meta?.title ?? talk.title,
    displayDateIso,
    displayDateLabel,
    description: meta?.description ?? DEFAULT_DESCRIPTION,
    venueTags: meta?.venueTags ?? [],
    topicTags: meta?.topicTags ?? [],
  };
}

export function getTalkViewEntries(sourceTalks: TalkEntry[] = talks): TalkViewEntry[] {
  return sourceTalks.map(hydrateTalkEntry);
}

export function getTalkViewBySlug(slug: string): TalkViewEntry | undefined {
  return getTalkViewEntries(talks).find((talkEntry) => talkEntry.slug === slug);
}
