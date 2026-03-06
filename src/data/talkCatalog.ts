import { talks, type TalkEntry } from "./talksData";
import {
  talkMetadataBySlug,
  type AudienceGroupTag,
  type AudienceSizeTag,
  type TalkMetadata,
  type TopicTag,
  type VenueTag,
} from "./talkMetadata";

export const DURATION_TAG_OPTIONS = ["Short", "Medium", "Long"] as const;
export type DurationTag = (typeof DURATION_TAG_OPTIONS)[number];

export const AUDIENCE_EXPERTISE_TAG_OPTIONS = [
  "Introductory",
  "Technical",
  "Interdisciplinary",
] as const;
export type AudienceExpertiseTag = (typeof AUDIENCE_EXPERTISE_TAG_OPTIONS)[number];

export interface TalkViewEntry extends TalkEntry {
  displayTitle: string;
  displayDateIso: string;
  displayDateLabel: string;
  displayDateDetailedLabel: string;
  summary: string;
  abstract: string;
  goal: string;
  audienceExpertise: string;
  audienceExpertiseTag: AudienceExpertiseTag;
  audienceGroups: AudienceGroupTag[];
  durationMinutes: number;
  durationCategory: DurationTag;
  audienceSizeApprox: number;
  audienceSizeCategory: AudienceSizeTag;
  audienceSizeEstimate: string;
  // Backward-compatible alias for list/homepage uses.
  description: string;
  venueTags: VenueTag[];
  topicTags: TopicTag[];
}

const DEFAULT_SUMMARY =
  "Presentation slides for this talk. Update summary and detail fields in src/data/talkMetadata.ts.";
const DEFAULT_ABSTRACT =
  "This presentation is currently missing a full abstract in talk metadata.";
const DEFAULT_GOAL =
  "Define the primary objective of this talk in src/data/talkMetadata.ts.";
const DEFAULT_AUDIENCE_EXPERTISE =
  "Audience background not yet specified in talk metadata.";
const DEFAULT_AUDIENCE_GROUPS: AudienceGroupTag[] = [];
const DEFAULT_DURATION_MINUTES = 30;
const DEFAULT_AUDIENCE_SIZE_APPROX = 30;

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

function audienceSizeCategoryFromApprox(audienceSizeApprox: number): AudienceSizeTag {
  if (audienceSizeApprox <= 25) {
    return "Small";
  }
  if (audienceSizeApprox <= 70) {
    return "Medium";
  }
  return "Large";
}

function durationCategoryFromMinutes(durationMinutes: number): DurationTag {
  if (durationMinutes <= 15) {
    return "Short";
  }
  if (durationMinutes <= 45) {
    return "Medium";
  }
  return "Long";
}

function audienceExpertiseTagFromText(audienceExpertise: string): AudienceExpertiseTag {
  const normalized = audienceExpertise.toLowerCase();

  if (
    normalized.includes("limited prior exposure") ||
    normalized.includes("students") ||
    normalized.includes("trainees") ||
    normalized.includes("intro")
  ) {
    return "Introductory";
  }

  if (
    normalized.includes("interdisciplinary") ||
    normalized.includes("mixed") ||
    normalized.includes("spanning")
  ) {
    return "Interdisciplinary";
  }

  return "Technical";
}

function hydrateTalkEntry(talk: TalkEntry): TalkViewEntry {
  const meta: TalkMetadata | undefined = talkMetadataBySlug[talk.slug];

  const displayDateIso = meta?.dateIso ?? talk.dateIso;
  const displayDateLabel = meta?.dateLabel ?? labelFromIso(displayDateIso) ?? talk.dateLabel;
  const displayDateDetailedLabel = detailedLabelFromIso(displayDateIso);
  const summary = meta?.summary ?? DEFAULT_SUMMARY;
  const abstract = meta?.abstract ?? DEFAULT_ABSTRACT;
  const goal = meta?.goal ?? DEFAULT_GOAL;
  const audienceExpertise = meta?.audienceExpertise ?? DEFAULT_AUDIENCE_EXPERTISE;
  const audienceExpertiseTag = audienceExpertiseTagFromText(audienceExpertise);
  const audienceGroups = meta?.audienceGroups ?? DEFAULT_AUDIENCE_GROUPS;
  const durationMinutes = meta?.durationMinutes ?? DEFAULT_DURATION_MINUTES;
  const durationCategory = durationCategoryFromMinutes(durationMinutes);
  const audienceSizeApprox = Math.max(
    1,
    Number.isFinite(meta?.audienceSizeApprox)
      ? Number(meta?.audienceSizeApprox)
      : DEFAULT_AUDIENCE_SIZE_APPROX
  );
  const audienceSizeCategory = audienceSizeCategoryFromApprox(audienceSizeApprox);
  const audienceSizeEstimate = `Approx. ${audienceSizeApprox} attendees`;

  return {
    ...talk,
    displayTitle: meta?.title ?? talk.title,
    displayDateIso,
    displayDateLabel,
    displayDateDetailedLabel,
    summary,
    abstract,
    goal,
    audienceExpertise,
    audienceExpertiseTag,
    audienceGroups,
    durationMinutes,
    durationCategory,
    audienceSizeApprox,
    audienceSizeCategory,
    audienceSizeEstimate,
    description: summary,
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
