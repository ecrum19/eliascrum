import { posters, type PosterEntry } from "./talksData";
import { getTalkViewEntries, type TalkViewEntry } from "./talkCatalog";
import {
  type AudienceGroupTag,
  talkMetadataBySlug,
  type TopicTag,
  type VenueTag,
} from "./talkMetadata";

export interface PosterViewEntry extends PosterEntry {
  displayTitle: string;
  displayDateIso: string;
  displayDateLabel: string;
  displayDateDetailedLabel: string;
  summary: string;
  abstract: string;
  goal: string;
  audienceExpertise: string;
  audienceGroups: AudienceGroupTag[];
  venueTags: VenueTag[];
  topicTags: TopicTag[];
  relatedResources: Array<{
    label: string;
    url: string;
  }>;
  linkedTalkSlug?: string;
  linkedTalkTitle?: string;
}

const DEFAULT_SUMMARY = "Poster presentation materials.";

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

function detailedLabelFromIso(dateIso: string): string {
  if (!dateIso || dateIso === "1900-01-01") {
    return "Undated";
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateIso)) {
    return dateIso;
  }

  const parsed = new Date(`${dateIso}T12:00:00Z`);
  if (Number.isNaN(parsed.getTime())) {
    return dateIso;
  }

  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(parsed);
}

function hydratePosterEntry(
  poster: PosterEntry,
  talkEntries: TalkViewEntry[],
): PosterViewEntry {
  const linkedTalk = talkEntries.find((talkEntry) => talkEntry.posterPath === poster.path);
  const metadata = talkMetadataBySlug[poster.slug];
  const displayDateIso = metadata?.dateIso ?? linkedTalk?.displayDateIso ?? "1900-01-01";
  const displayDateLabel = metadata?.dateLabel ?? linkedTalk?.displayDateLabel ?? labelFromIso(displayDateIso);
  const displayDateDetailedLabel = detailedLabelFromIso(displayDateIso);

  return {
    ...poster,
    displayTitle: metadata?.title ?? poster.title,
    displayDateIso,
    displayDateLabel,
    displayDateDetailedLabel,
    summary: metadata?.summary ?? linkedTalk?.summary ?? DEFAULT_SUMMARY,
    abstract: metadata?.abstract ?? linkedTalk?.abstract ?? "",
    goal: metadata?.goal ?? linkedTalk?.goal ?? "",
    audienceExpertise: metadata?.audienceExpertise ?? linkedTalk?.audienceExpertise ?? "",
    audienceGroups: metadata?.audienceGroups ?? linkedTalk?.audienceGroups ?? [],
    venueTags: metadata?.venueTags ?? linkedTalk?.venueTags ?? [],
    topicTags: metadata?.topicTags ?? linkedTalk?.topicTags ?? [],
    relatedResources: metadata?.relatedResources ?? linkedTalk?.relatedResources ?? [],
    linkedTalkSlug: linkedTalk?.slug,
    linkedTalkTitle: linkedTalk?.displayTitle,
  };
}

export function getPosterViewEntries(sourcePosters: PosterEntry[] = posters): PosterViewEntry[] {
  const talkEntries = getTalkViewEntries();
  return sourcePosters.map((poster) => hydratePosterEntry(poster, talkEntries));
}

export function getPosterViewBySlug(slug: string): PosterViewEntry | undefined {
  return getPosterViewEntries(posters).find((posterEntry) => posterEntry.slug === slug);
}
