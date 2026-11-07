import { isValidDate } from "./dates";
import type { ContentEntry, ContentSection, Highlight, SoftwareRecord } from "./types";

export interface ValidationContext {
  sections: ContentSection[];
  /** Full kind:id keys let us validate links while the legacy catalogs still exist. */
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

/** Highlights authored outside the catalog (publications, talk/poster metadata). */
export function validateHighlights(
  items: Array<[key: string, highlight: Highlight | undefined]>,
  context: Omit<ValidationContext, "sections">,
): string[] {
  const errors: string[] = [];
  const { checkHighlight } = createChecks(context, errors);
  for (const [key, highlight] of items) checkHighlight(key, highlight);
  return errors;
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
    for (const [role, url] of Object.entries(entry.links ?? {}))
      checkLink(url, `${key} ${role}`);
    for (const ref of entry.related ?? []) {
      if (!context.relationKeys.has(ref))
        errors.push(`${key}: unknown relation ${ref}`);
    }
    for (const detail of entry.extraDetails ?? []) {
      if (!detail.label.trim() || !detail.value.trim())
        errors.push(`${key}: detail label and value are required`);
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
