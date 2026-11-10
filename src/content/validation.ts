import { isValidDate } from "./dates";
import { posterPdfPath, slidesUrl, type PresentationRecord } from "./presentationDetails";
import { GENERATED_PUBLICATION_ROWS } from "./publicationDetails";
import type {
  ContentEntry,
  ContentSection,
  Highlight,
  PublicationRecord,
  SoftwareRecord,
} from "./types";

export interface ValidationContext {
  sections: ContentSection[];
  /** Every `kind:id` a relation or highlight may point at. */
  relationKeys: ReadonlySet<string>;
  observationIds?: string[];
  localAssetExists?: (path: string) => boolean;
}

const isHttpUrl = (url: string) => {
  try {
    return /^https?:\/\/\S+$/.test(url) && Boolean(new URL(url));
  } catch {
    return false;
  }
};

function createChecks(context: Omit<ValidationContext, "sections">, errors: string[]) {
  const checkLink = (url: string, label: string) => {
    if (isHttpUrl(url)) return;
    if (url.startsWith("/") && !url.startsWith("//")) {
      if (context.localAssetExists && !context.localAssetExists(url))
        errors.push(`${label}: missing local asset ${url}`);
      return;
    }
    errors.push(`${label}: expected an http(s) URL or local asset path`);
  };
  const checkHighlight = (key: string, highlight?: Highlight) => {
    if (!highlight) return;
    if (!highlight.label?.trim()) errors.push(`${key}: highlight label is required`);
    if (!highlight.href && !highlight.related)
      errors.push(`${key}: highlight needs an href or a related entry`);
    if (highlight.href) checkLink(highlight.href, `${key} highlight`);
    if (highlight.related && !context.relationKeys.has(highlight.related))
      errors.push(`${key}: unknown highlight entry ${highlight.related}`);
  };
  return { checkLink, checkHighlight };
}

/** Where a talk's PDF slides or a poster is published, if it is a file on this site. */
export function presentationAssetPath(entry: PresentationRecord): string | undefined {
  if (entry.kind === "poster") return posterPdfPath(entry);
  return entry.slides.format === "pdf" ? slidesUrl(entry) : undefined;
}

/** Each PDF talk and poster must have been built by `build:slides`, and each built file must have a record. */
export function validateTalkAssets(entries: PresentationRecord[], builtPaths: string[]): string[] {
  const expected = new Map(
    entries.flatMap((entry) => {
      const path = presentationAssetPath(entry);
      return path ? [[path, `${entry.kind}:${entry.id}`] as const] : [];
    }),
  );
  return [
    ...[...expected]
      .filter(([path]) => !builtPaths.includes(path))
      .map(([path, key]) => `${key}: ${path} is not built yet; run npm run build:slides`),
    ...builtPaths
      .filter((path) => !expected.has(path))
      .map((path) => `talk assets: ${path} has no talk or poster record`),
  ];
}

/** Return all actionable authoring errors together, rather than stopping at the first. */
export function validateContent(
  entries: ContentEntry[],
  context: ValidationContext,
): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();
  const routes = new Set<string>();
  const sectionIds = new Set(context.sections.map((section) => section.id));
  const { checkLink, checkHighlight } = createChecks(context, errors);
  for (const entry of entries) {
    const key = `${entry.kind}:${entry.id}`;
    if (ids.has(key)) errors.push(`${key}: duplicate ID`);
    ids.add(key);
    const route = `${entry.kind}:${entry.slug}`;
    if (routes.has(route))
      errors.push(`${key}: duplicate route slug ${entry.slug}`);
    routes.add(route);
    for (const field of ["id", "slug", "title", "summary"] as const) {
      if (!entry[field]?.trim()) errors.push(`${key}: ${field} is required`);
    }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(entry.slug))
      errors.push(`${key}: slug must be lowercase words joined by hyphens`);
    if (!isValidDate(entry.date)) errors.push(`${key}: invalid date`);
    if (!entry.topics.length || entry.topics.some((topic) => !topic.trim()))
      errors.push(`${key}: topics must contain nonblank values`);
    if (entry.kind === "software") {
      const software = entry as SoftwareRecord;
      for (const field of ["type", "purpose", "description"] as const) {
        if (!software[field]?.trim())
          errors.push(`${key}: ${field} is required`);
      }
      if (!sectionIds.has(software.sectionId))
        errors.push(`${key}: unknown section ${software.sectionId}`);
    }
    if (entry.kind === "talk" || entry.kind === "poster") {
      const presentation = entry as PresentationRecord;
      for (const field of ["venueTags", "audienceGroups"] as const) {
        if (!Array.isArray(presentation[field]) || presentation[field].some((tag) => !tag.trim()))
          errors.push(`${key}: ${field} must be a list of nonblank values`);
      }
      for (const field of ["durationMinutes", "audienceSizeApprox"] as const) {
        const value = presentation[field];
        if (value !== undefined && !(Number.isInteger(value) && value > 0))
          errors.push(`${key}: ${field} must be a positive whole number`);
      }
      for (const resource of presentation.relatedResources ?? []) {
        if (!resource.label.trim()) errors.push(`${key}: resource label is required`);
        checkLink(resource.url, `${key} ${resource.label}`);
      }
      if (presentation.kind === "poster" && !presentation.source?.trim())
        errors.push(`${key}: source is required`);
      if (presentation.kind === "talk") {
        const { slides } = presentation;
        if (slides?.format === "pdf") {
          if (!slides.source?.trim()) errors.push(`${key}: slides.source is required`);
        } else if (slides?.format === "html") {
          checkLink(slides.url, `${key} slides`);
        } else {
          errors.push(`${key}: slides.format must be "pdf" or "html"`);
        }
        if (slides?.embedUrl) checkLink(slides.embedUrl, `${key} slides embed`);
      }
      const asset = presentationAssetPath(presentation);
      if (asset && context.localAssetExists && !context.localAssetExists(asset))
        errors.push(`${key}: missing local asset ${asset}; run npm run build:slides`);
    }
    if (entry.kind === "publication") {
      const publication = entry as PublicationRecord;
      for (const field of ["type", "authors", "venue", "bibtex"] as const) {
        if (!publication[field]?.trim())
          errors.push(`${key}: ${field} is required`);
      }
      for (const detail of entry.extraDetails ?? []) {
        if (GENERATED_PUBLICATION_ROWS.includes(detail.label))
          errors.push(`${key}: "${detail.label}" is generated from the record; remove the detail row`);
      }
    }
    for (const [role, url] of Object.entries(entry.links ?? {}))
      checkLink(url, `${key} ${role}`);
    for (const ref of entry.related ?? []) {
      if (!context.relationKeys.has(ref))
        errors.push(`${key}: unknown relation ${ref}`);
    }
    // Detail labels name their RDF resources, so they must be unique per entry.
    const labels = new Set<string>();
    for (const detail of entry.extraDetails ?? []) {
      if (!detail.label.trim() || !detail.value.trim())
        errors.push(`${key}: detail label and value are required`);
      if (labels.has(detail.label)) errors.push(`${key}: duplicate detail label ${detail.label}`);
      labels.add(detail.label);
      if (detail.href) checkLink(detail.href, `${key} ${detail.label}`);
    }
    checkHighlight(key, entry.highlight);
  }
  for (const id of context.observationIds ?? []) {
    if (!entries.some((entry) => entry.id === id))
      errors.push(`observation: unknown entry ${id}`);
  }
  return errors;
}
