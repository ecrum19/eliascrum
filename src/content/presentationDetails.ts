import { posterCatalog, relatedIds } from "./catalog";
import type { AudienceSizeTag, DurationTag } from "./tags";
import type { DetailField, PosterRecord, PresentationFields, TalkRecord } from "./types";

export type PresentationRecord = TalkRecord | PosterRecord;

/** Categories exist only when the underlying value is known. */
export function durationCategory({ durationMinutes: minutes }: PresentationFields): DurationTag | undefined {
  if (minutes === undefined) return undefined;
  return minutes <= 15 ? "Short" : minutes <= 45 ? "Medium" : "Long";
}

export function audienceSizeCategory({ audienceSizeApprox: size }: PresentationFields): AudienceSizeTag | undefined {
  if (size === undefined) return undefined;
  return size <= 25 ? "Small" : size <= 70 ? "Medium" : "Large";
}

export function audienceSizeEstimate(entry: PresentationFields): string | undefined {
  if (entry.audienceSizeEstimate) return entry.audienceSizeEstimate;
  return entry.audienceSizeApprox === undefined ? undefined : `Approx. ${entry.audienceSizeApprox} attendees`;
}

/** The Details rows of a talk or poster page: only what is recorded. */
export function presentationDetailRows(entry: PresentationRecord): DetailField[] {
  const size = audienceSizeEstimate(entry);
  const rows: (DetailField | false | undefined)[] = [
    entry.goal ? { label: "Goal", value: entry.goal } : undefined,
    entry.audienceExpertise ? { label: "Audience Expertise", value: entry.audienceExpertise } : undefined,
    entry.durationMinutes !== undefined && { label: "Duration", value: `~ ${entry.durationMinutes} minutes` },
    size ? { label: "Audience Size", value: size.replace(/^Approx\.?\s*/i, "~ ") } : undefined,
    ...(entry.relatedResources ?? []).map(({ label, url }) => ({ label, value: url, href: url })),
    ...(entry.extraDetails ?? []),
  ];
  return rows.filter((row): row is DetailField => Boolean(row));
}

/** Where `build:slides` publishes a talk's PDF slides; HTML decks keep their own URL. */
export function slidesUrl(talk: TalkRecord): string {
  return talk.slides.format === "pdf" ? `/talks/slides/${talk.slug}.pdf` : talk.slides.url;
}

/** Where `build:slides` publishes a poster PDF, under its source file name. */
export const posterPdfPath = (poster: PosterRecord) =>
  `/talks/posters/${encodeURIComponent(poster.source)}`;

/** The posters a talk lists in `related`. */
export const talkPosters = (talk: TalkRecord): PosterRecord[] =>
  relatedIds(talk, "poster").flatMap((id) => posterCatalog.byId(id) ?? []);
