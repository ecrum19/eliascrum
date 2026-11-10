import { blogPosts } from "../data/blogPostsData";
import { cvSections } from "../data/cvData";
import { getAllHomepageUpdates } from "../data/homepageUpdates";
import {
  dateLabel,
  dateYear,
  entryPath,
  numericDateLabel,
  posterCatalog,
  publicationCatalog,
  softwareCatalog,
  talkCatalog,
} from "../content/catalog";
import { posterPdfPath, slidesUrl } from "../content/presentationDetails";
import type { SoftwareRecord } from "../content/types";
import { resolvePublicAssetPath } from "./publicAssetPath";

const WEBSITE_BASE_IRI = "https://eliascrum.info/";
const BASE_ROUTE_PATH = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");

export type SearchMode = "keyword" | "sparql";

export type SearchResultType =
  | "Talk"
  | "Poster"
  | "Publication"
  | "Software"
  | "CV"
  | "Blog"
  | "Update"
  | "SPARQL";

export interface SearchResult {
  id: string;
  type: SearchResultType;
  title: string;
  subtitle: string;
  snippet: string;
  route?: string;
  href?: string;
  score?: number;
}

interface SearchDocument {
  id: string;
  type: Exclude<SearchResultType, "SPARQL">;
  title: string;
  subtitle: string;
  snippet: string;
  route?: string;
  href?: string;
  searchableText: string;
  boost: number;
}

export interface SparqlSearchResponse {
  results: SearchResult[];
  notice?: string;
  error?: string;
}

let cachedSearchDocuments: SearchDocument[] | null = null;
let cachedRdfStorePromise: Promise<unknown> | null = null;
let cachedRdfSourcePromise: Promise<string> | null = null;

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenized(value: string): string[] {
  return normalizeText(value)
    .split(" ")
    .map((token) => token.trim())
    .filter((token) => token.length >= 2);
}

function asSearchResult(document: SearchDocument, score?: number): SearchResult {
  return {
    id: document.id,
    type: document.type,
    title: document.title,
    subtitle: document.subtitle,
    snippet: document.snippet,
    route: document.route,
    href: document.href,
    score,
  };
}

function normalizeInternalRoute(value: string): string | undefined {
  if (!value) {
    return undefined;
  }

  const stripBase = (pathnameValue: string): string => {
    let pathname = pathnameValue || "/";
    if (BASE_ROUTE_PATH && BASE_ROUTE_PATH !== "/" && pathname.startsWith(BASE_ROUTE_PATH)) {
      pathname = pathname.slice(BASE_ROUTE_PATH.length) || "/";
    }
    return pathname.startsWith("/") ? pathname : `/${pathname}`;
  };

  try {
    const placeholderOrigin = "https://local.internal";
    const parsed = new URL(value, placeholderOrigin);

    if (parsed.origin === placeholderOrigin) {
      return stripBase(parsed.pathname);
    }

    const websiteBase = new URL(WEBSITE_BASE_IRI);
    if (parsed.origin === websiteBase.origin) {
      return stripBase(parsed.pathname);
    }
  } catch {
    return undefined;
  }

  return undefined;
}

export function buildSearchDocuments(softwareSource: SoftwareRecord[] = softwareCatalog.entries): SearchDocument[] {
  const documents: SearchDocument[] = [];

  talkCatalog.entries.forEach((talkEntry) => {
    const dateText = numericDateLabel(talkEntry.date);
    documents.push({
      id: `talk:${talkEntry.id}`,
      type: "Talk",
      title: talkEntry.title,
      subtitle: `Talk • ${dateText}`,
      snippet: talkEntry.summary,
      route: entryPath(talkEntry),
      href: resolvePublicAssetPath(slidesUrl(talkEntry)),
      searchableText: [
        talkEntry.title,
        talkEntry.summary,
        dateText,
        talkEntry.slides.format === "pdf" ? talkEntry.slides.source : talkEntry.slides.url,
        talkEntry.venueTags.join(" "),
        talkEntry.topics.join(" "),
      ].join(" "),
      boost: 9,
    });
  });

  posterCatalog.entries.forEach((posterEntry) => {
    const dateText = numericDateLabel(posterEntry.date);
    const path = posterPdfPath(posterEntry);
    documents.push({
      id: `poster:${posterEntry.id}`,
      type: "Poster",
      title: posterEntry.title,
      subtitle: `Poster • ${dateText}`,
      snippet: posterEntry.summary,
      route: entryPath(posterEntry),
      href: resolvePublicAssetPath(path),
      searchableText: [
        posterEntry.title,
        posterEntry.summary,
        posterEntry.abstract ?? "",
        dateText,
        path,
        posterEntry.slug,
        posterEntry.venueTags.join(" "),
        posterEntry.topics.join(" "),
        "poster talk",
      ].join(" "),
      boost: 7,
    });
  });

  publicationCatalog.entries.forEach((publicationEntry) => {
    documents.push({
      id: `publication:${publicationEntry.id}`,
      type: "Publication",
      title: publicationEntry.title,
      subtitle: `Publication • ${dateYear(publicationEntry.date)} • ${publicationEntry.type}`,
      snippet: publicationEntry.summary,
      route: entryPath(publicationEntry),
      href: publicationEntry.links?.publisher,
      searchableText: [
        publicationEntry.title,
        publicationEntry.authors,
        publicationEntry.venue,
        publicationEntry.summary,
        publicationEntry.abstract || "",
        publicationEntry.type,
        publicationEntry.venueTags.join(" "),
        publicationEntry.topics.join(" "),
        publicationEntry.bibtex,
      ].join(" "),
      boost: 10,
    });
  });

  const sectionsById = new Map(softwareCatalog.sections.map((section) => [section.id, section]));
  softwareSource.forEach((entry) => {
    const section = sectionsById.get(entry.sectionId);
    const { repository, website } = entry.links ?? {};
    documents.push({
      id: `software:${entry.id}`,
      type: "Software",
      title: entry.title,
      subtitle: `Software • ${section?.title ?? "Software"}`,
      snippet: entry.summary,
      route: entryPath(entry),
      href: website ?? repository,
      searchableText: [
        section?.title ?? "",
        section?.description ?? "",
        entry.title,
        entry.type,
        entry.purpose,
        dateLabel(entry.date),
        entry.summary,
        entry.description,
        entry.topics.join(" "),
        repository ?? "",
        website ?? "",
      ].join(" "),
      boost: 6,
    });
  });

  cvSections.forEach((cvSection) => {
    cvSection.items.forEach((cvItem, itemIndex) => {
      const flattenedDetails = (cvItem.details || [])
        .map((detail) => {
          if (typeof detail === "string") {
            return detail;
          }
          return [detail.prefix, detail.text, detail.url].filter(Boolean).join(" ");
        })
        .join(" ");
      const flattenedArtifacts = (cvItem.artifacts || [])
        .map((artifact) => [artifact.label, artifact.path].filter(Boolean).join(" "))
        .join(" ");

      documents.push({
        id: `cv:${cvSection.title}:${itemIndex}`,
        type: "CV",
        title: cvItem.role,
        subtitle: `CV • ${cvSection.title}`,
        snippet: [cvItem.organization, cvItem.location, cvItem.date, flattenedDetails]
          .filter(Boolean)
          .join(" • "),
        route: "/about/cv",
        searchableText: [
          cvSection.title,
          cvItem.group || "",
          cvItem.role,
          cvItem.organization || "",
          cvItem.location || "",
          cvItem.date || "",
          flattenedDetails,
          flattenedArtifacts,
        ].join(" "),
        boost: 5,
      });
    });
  });

  blogPosts.forEach((blogPost) => {
    const blogRoute = normalizeInternalRoute(blogPost.url);
    documents.push({
      id: `blog:${blogPost.id}`,
      type: "Blog",
      title: blogPost.title,
      subtitle: `Blog • ${blogPost.dateIso}`,
      snippet: blogPost.summary,
      route: blogRoute ?? "/blogs",
      href: blogRoute ? undefined : blogPost.url,
      searchableText: [
        blogPost.title,
        blogPost.summary,
        blogPost.category || "",
        blogPost.dateIso,
      ].join(" "),
      boost: 6,
    });
  });

  getAllHomepageUpdates().forEach((homepageUpdate) => {
    const updateRoute = normalizeInternalRoute(homepageUpdate.link);
    documents.push({
      id: `update:${homepageUpdate.id}`,
      type: "Update",
      title: homepageUpdate.title,
      subtitle: `Recent Work • ${homepageUpdate.type} • ${homepageUpdate.dateLabel}`,
      snippet: homepageUpdate.summary,
      route: updateRoute,
      href: updateRoute ? undefined : homepageUpdate.link,
      searchableText: [
        homepageUpdate.title,
        homepageUpdate.type,
        homepageUpdate.summary,
        homepageUpdate.dateIso,
      ].join(" "),
      boost: 4,
    });
  });

  return documents.map((document) => ({
    ...document,
    searchableText: normalizeText(document.searchableText),
  }));
}

function getSearchDocuments(): SearchDocument[] {
  if (!cachedSearchDocuments) {
    cachedSearchDocuments = buildSearchDocuments();
  }
  return cachedSearchDocuments;
}

function scoreDocument(document: SearchDocument, tokens: string[], normalizedQuery: string): number {
  let score = 0;
  const normalizedTitle = normalizeText(document.title);
  const normalizedSubtitle = normalizeText(document.subtitle);
  const normalizedSnippet = normalizeText(document.snippet);

  if (normalizedTitle.includes(normalizedQuery)) {
    score += 26;
  } else if (document.searchableText.includes(normalizedQuery)) {
    score += 12;
  }

  tokens.forEach((token) => {
    if (normalizedTitle.includes(token)) {
      score += 11;
    }
    if (normalizedSubtitle.includes(token)) {
      score += 6;
    }
    if (normalizedSnippet.includes(token)) {
      score += 4;
    }
    if (document.searchableText.includes(token)) {
      score += 2;
    }
  });

  // A ranking bonus must never turn an unrelated document into a match.
  return score > 0 ? score + document.boost : 0;
}

export function searchByKeyword(query: string, limit = 18): SearchResult[] {
  const normalizedQuery = normalizeText(query);
  const tokens = tokenized(query);
  if (!tokens.length) return [];
  const documents = getSearchDocuments();

  const withScores = documents
    .map((document) => ({
      document,
      score: scoreDocument(document, tokens, normalizedQuery),
    }))
    .filter(({ score }) => score > 0)
    .sort((left, right) => {
      const byScore = right.score - left.score;
      if (byScore !== 0) {
        return byScore;
      }
      return left.document.title.localeCompare(right.document.title);
    })
    .slice(0, Math.max(1, limit));

  return withScores.map(({ document, score }) => asSearchResult(document, score));
}

export function getDefaultSearchResults(limit = 10): SearchResult[] {
  return getSearchDocuments()
    .sort((left, right) => right.boost - left.boost)
    .slice(0, Math.max(1, limit))
    .map((document) => asSearchResult(document, document.boost));
}

async function getComunicaStore() {
  if (!cachedRdfStorePromise) {
    cachedRdfStorePromise = (async () => {
      const n3Module = await import("n3");
      if (!cachedRdfSourcePromise) {
        cachedRdfSourcePromise = fetch(resolvePublicAssetPath("/site-data.ttl"), {
          headers: {
            Accept: "text/turtle",
          },
        }).then(async (response) => {
          if (!response.ok) {
            throw new Error(`RDF data request failed with HTTP ${response.status}.`);
          }
          return response.text();
        });
      }

      const rdfSource = await cachedRdfSourcePromise;
      const n3Any = n3Module as unknown as {
        Parser: new (options?: Record<string, unknown>) => {
          parse: (input: string) => unknown[];
        };
        Store: new (quads: unknown[]) => unknown;
      };

      const parser = new n3Any.Parser({ baseIRI: WEBSITE_BASE_IRI });
      const quads = parser.parse(rdfSource);
      return new n3Any.Store(quads);
    })().catch((error) => {
      // Failed requests must not poison every later attempt for the lifetime of the page.
      cachedRdfStorePromise = null;
      cachedRdfSourcePromise = null;
      throw error;
    });
  }

  return cachedRdfStorePromise;
}

function termValue(term: unknown): string {
  const maybeTerm = term as { value?: string; termType?: string; id?: string };
  if (typeof maybeTerm?.value === "string") {
    return maybeTerm.value;
  }
  if (typeof maybeTerm?.id === "string") {
    return maybeTerm.id;
  }
  return String(term ?? "");
}

function mapIriToRoute(iriValue: string): string | undefined {
  if (!iriValue.startsWith(WEBSITE_BASE_IRI)) {
    return undefined;
  }

  if (iriValue.includes("/id/talk/")) {
    return `/talks/${iriValue.split("/id/talk/")[1]}`;
  }
  const [kind, id] = iriValue.slice(WEBSITE_BASE_IRI.length).split("/").slice(1).map(decodeURIComponent);
  if (iriValue.includes("/id/publication/")) {
    const publication = publicationCatalog.byId(id);
    return publication ? entryPath(publication) : "/publications";
  }
  if (kind === "software") {
    const software = softwareCatalog.byId(id);
    return software ? entryPath(software) : "/software";
  }
  if (kind === "poster") {
    return `/talks/posters/${id}`;
  }
  if (iriValue.includes("/id/blog-post/")) {
    return "/blogs";
  }
  if (iriValue.includes("/id/cv-")) {
    return "/about/cv";
  }
  return undefined;
}

function mapBindingsToSearchResult(binding: unknown, index: number): SearchResult {
  // RDF/JS Bindings are iterable; Comunica's internal `entries` field is not a method.
  const entries = [...(binding as Iterable<[unknown, unknown]>)];

  const keyValuePairs = entries.map(([variableTerm, valueTerm]) => {
    const variableLabel = String(termValue(variableTerm)).replace(/^\?/, "");
    const value = termValue(valueTerm);
    return {
      variableLabel,
      value,
      route: mapIriToRoute(value),
      href: value.startsWith("http://") || value.startsWith("https://") ? value : undefined,
    };
  });

  const firstPair = keyValuePairs[0];
  const title = firstPair
    ? `${firstPair.variableLabel}: ${firstPair.value}`
    : `SPARQL Result ${index + 1}`;

  const snippet = keyValuePairs
    .slice(1)
    .map((pair) => `${pair.variableLabel}: ${pair.value}`)
    .join(" • ");

  const route = keyValuePairs.find((pair) => pair.route)?.route;
  const href = keyValuePairs.find((pair) => pair.href)?.href;

  return {
    id: `sparql:${index}`,
    type: "SPARQL",
    title,
    subtitle: "SPARQL result binding",
    snippet: snippet || "No additional binding values.",
    route,
    href,
  };
}

export async function runSparqlSearch(query: string, limit = 25): Promise<SparqlSearchResponse> {
  const queryText = query.trim();
  if (!queryText) {
    return {
      results: [],
      notice: "Enter a SPARQL SELECT query to search the RDF graph.",
    };
  }

  try {
    const comunicaModule = await import("@comunica/query-sparql");
    const comunicaAny = comunicaModule as unknown as {
      QueryEngine: new () => {
        queryBindings: (
          queryValue: string,
          context: Record<string, unknown>,
        ) => Promise<{
          toArray: () => Promise<unknown[]>;
        }>;
      };
    };

    const rdfStore = await getComunicaStore();
    const queryEngine = new comunicaAny.QueryEngine();
    const bindingsStream = await queryEngine.queryBindings(queryText, {
      sources: [rdfStore],
    });
    const bindings = await bindingsStream.toArray();

    return {
      results: bindings.slice(0, Math.max(1, limit)).map(mapBindingsToSearchResult),
      notice: "Results from Comunica over local RDF graph.",
    };
  } catch (error) {
    const fallbackResults = searchByKeyword(queryText, Math.max(6, limit));
    return {
      results: fallbackResults,
      notice:
        "Comunica runtime is unavailable right now, so this is a keyword fallback over the same site data.",
      error:
        error instanceof Error
          ? error.message
          : "Unknown SPARQL runtime error",
    };
  }
}
