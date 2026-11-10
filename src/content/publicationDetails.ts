import { dateLabel } from "./dates";
import { resolvePublicAssetPath } from "../utils/publicAssetPath";
import type { DetailField, PublicationRecord } from "./types";
import {
  publicationDownloadsByPublicationId,
  scholarCitationsByPublicationId,
} from "../data/scholarCitations";

/** Rows generated from the record itself; authored `extraDetails` must not repeat them. */
export const GENERATED_PUBLICATION_ROWS = ["Publication Type", "Date"];

/** The Details rows shown wherever a publication is described, and exported to RDF. */
export function publicationDetailRows(entry: PublicationRecord): DetailField[] {
  return [
    { label: "Publication Type", value: entry.typeLabel ?? entry.type },
    { label: "Date", value: dateLabel(entry.date) },
    ...(entry.extraDetails ?? []),
  ];
}

/** Theses report repository downloads; papers report Google Scholar citations. */
export function publicationMetric(entry: PublicationRecord): DetailField {
  const isThesis = entry.type === "Thesis";
  const count = (isThesis ? publicationDownloadsByPublicationId : scholarCitationsByPublicationId)[
    entry.id
  ];
  return {
    label: isThesis ? "Loyola eCommons Downloads" : "Google Scholar Citations",
    value: count === null || count === undefined ? "N/A" : String(count),
  };
}

const isPdfUrl = (url: string) => url.trim().toLowerCase().split(/[?#]/, 1)[0].endsWith(".pdf");

/** A PDF that can be previewed inline: the hosted paper, or a publisher link that is itself a PDF. */
export function publicationPdfUrl(entry: PublicationRecord): string | undefined {
  const { paper, publisher } = entry.links ?? {};
  if (paper) return resolvePublicAssetPath(paper);
  return publisher && isPdfUrl(publisher) ? publisher : undefined;
}
