#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadSiteContent } from "./lib/load-content.mjs";
import { writeGeneratedFile } from "./lib/write-generated.mjs";
import { isMain } from "./lib/cli.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const publicDir = path.join(rootDir, "public");
const outputJsonPath = path.join(publicDir, "recent_work.json");
const outputTtlPath = path.join(publicDir, "recent_work.ttl");

const BASE_IRI = process.env.RECENT_WORK_BASE_IRI ?? "https://eliascrum.info/";

const PREFIX_ORDER = ["rdf", "rdfs", "xsd", "schema", "dcterms", "ec"];
const PREFIXES = {
  rdf: "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
  rdfs: "http://www.w3.org/2000/01/rdf-schema#",
  xsd: "http://www.w3.org/2001/XMLSchema#",
  schema: "https://schema.org/",
  dcterms: "http://purl.org/dc/terms/",
  ec: new URL("vocab#", BASE_IRI).href,
};

function iri(value) {
  return `<${value}>`;
}

function formatPrefixLines() {
  return PREFIX_ORDER.map((prefix) => `@prefix ${prefix}: <${PREFIXES[prefix]}> .`).join("\n");
}

function escapeLiteralValue(value) {
  return String(value)
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .replace(/\t/g, "\\t")
    .replace(/"/g, '\\"');
}

function literal(value, datatype = null) {
  const encoded = `"${escapeLiteralValue(value)}"`;
  if (!datatype) {
    return encoded;
  }
  return `${encoded}^^${datatype}`;
}

function isAbsoluteUrl(value) {
  return typeof value === "string" && /^[a-z][a-z\d+\-.]*:/i.test(value);
}

function toAbsoluteUrl(value) {
  if (!value || typeof value !== "string") {
    return undefined;
  }
  try {
    if (isAbsoluteUrl(value)) {
      return new URL(value).href;
    }
    if (value.startsWith("//")) {
      return new URL(`https:${value}`).href;
    }
    return new URL(value.replace(/^\/+/, ""), BASE_IRI).href;
  } catch {
    return undefined;
  }
}

function sanitizeId(value) {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseIsoDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }
  const parsed = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return parsed;
}

function parseYearToDate(value) {
  if (typeof value !== "string") {
    return null;
  }
  if (/^\d{4}$/.test(value)) {
    const parsed = new Date(`${value}-01-01T00:00:00Z`);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  return null;
}

function normalizeDate(value) {
  if (typeof value !== "string" || value.trim().length === 0) {
    return undefined;
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }
  if (/^\d{4}$/.test(value)) {
    return `${value}-01-01`;
  }
  return undefined;
}

function sortByDateDesc(items) {
  return [...items].sort((a, b) => {
    const aTime = a.sortTimestamp ?? -Infinity;
    const bTime = b.sortTimestamp ?? -Infinity;
    if (bTime !== aTime) {
      return bTime - aTime;
    }
    return a.title.localeCompare(b.title);
  });
}

function jsonItemBase(type, id, title) {
  return {
    id: `${type}:${id}`,
    type,
    title,
    tags: [],
  };
}

export function buildRecentWorkItems({
  publicationsModule,
  talkCatalogModule,
  posterCatalogModule,
  softwareModule,
  softwareReleasesModule,
  blogModule,
}) {
  const publicationItems = (publicationsModule.publications ?? []).map((publication) => {
    const dateIso = normalizeDate(publication.sortDate);
    const parsed = dateIso ? parseIsoDate(dateIso) : null;
    return {
      ...jsonItemBase("Publication", publication.id, publication.title),
      slug: publicationsModule.getPublicationSlug(publication),
      dateIso,
      summary: publication.summary ?? "",
      url: toAbsoluteUrl(publicationsModule.getPublicationPagePath(publication)),
      sourceUrl: toAbsoluteUrl(publication.url),
      itemUrl: toAbsoluteUrl(publicationsModule.getPublicationPagePath(publication)),
      tags: [
        publication.type,
        ...(publication.venueTags ?? []),
        ...(publication.topicTags ?? []),
      ].filter(Boolean),
      sortTimestamp: parsed ? parsed.getTime() : null,
    };
  });

  const talkItems = (talkCatalogModule.getTalkViewEntries?.() ?? []).map((talk) => {
    const dateIso = normalizeDate(talk.displayDateIso);
    const parsed = dateIso ? parseIsoDate(dateIso) : null;
    return {
      ...jsonItemBase("Talk", talk.slug, talk.displayTitle),
      slug: talk.slug,
      dateIso,
      summary: talk.summary ?? "",
      url: toAbsoluteUrl(`/talks/${talk.slug}`),
      sourceUrl: toAbsoluteUrl(talk.slidePath),
      itemUrl: toAbsoluteUrl(`/talks/${talk.slug}`),
      tags: [
        talk.materialTag,
        ...(talk.venueTags ?? []),
        ...(talk.topicTags ?? []),
        ...(talk.audienceGroups ?? []),
        talk.durationCategory,
        talk.audienceSizeCategory,
      ].filter(Boolean),
      sortTimestamp: parsed ? parsed.getTime() : null,
    };
  });

  const posterItems = (posterCatalogModule.getPosterViewEntries?.() ?? []).map((poster) => {
    const dateIso = normalizeDate(poster.dateIso);
    const parsed = dateIso ? parseIsoDate(dateIso) : null;
    return {
      ...jsonItemBase("Poster", poster.slug, poster.displayTitle),
      slug: poster.slug,
      dateIso,
      summary: poster.summary ?? poster.abstract ?? "",
      url: toAbsoluteUrl(`/talks/${poster.slug}`),
      sourceUrl: toAbsoluteUrl(poster.path),
      itemUrl: toAbsoluteUrl(`/talks/${poster.slug}`),
      tags: [
        "Poster",
        ...(poster.venueTags ?? []),
        ...(poster.topicTags ?? []),
        ...(poster.audienceGroups ?? []),
      ].filter(Boolean),
      sortTimestamp: parsed ? parsed.getTime() : null,
    };
  });

  const { softwareCatalog, dateLabel, entryPath } = softwareModule;
  const softwareItems = softwareCatalog.entries.map((software) => {
    const yearDate = parseYearToDate(dateLabel(software.date));
    const { repository, website } = software.links ?? {};
    const dateIso = yearDate ? yearDate.toISOString().slice(0, 10) : undefined;
    const release = softwareReleasesModule?.softwareReleasesBySoftwareId?.[software.id] ?? null;
    return {
      ...jsonItemBase("Software", software.id, software.title),
      slug: software.slug,
      dateIso,
      summary: software.summary ?? "",
      url: toAbsoluteUrl(entryPath(software)),
      sourceUrl: toAbsoluteUrl(repository || website),
      itemUrl: toAbsoluteUrl(entryPath(software)),
      tags: [software.type, software.purpose, ...software.topics].filter(Boolean),
      latestRelease:
        release &&
        (release.tagName || release.name || release.url || release.publishedAt)
          ? {
              tagName: release.tagName ?? null,
              name: release.name ?? null,
              url: toAbsoluteUrl(release.url),
              publishedAt: release.publishedAt ?? null,
            }
          : null,
      latestReleaseDateIso:
        release?.publishedAt && typeof release.publishedAt === "string"
          ? release.publishedAt.slice(0, 10)
          : null,
      sortTimestamp: yearDate ? yearDate.getTime() : null,
    };
  });

  const blogItems = (blogModule.blogPosts ?? []).map((blog) => {
    const dateIso = normalizeDate(blog.dateIso);
    const parsed = dateIso ? parseIsoDate(dateIso) : null;
    return {
      ...jsonItemBase("Blog", blog.id, blog.title),
      slug: sanitizeId(blog.title || blog.id),
      dateIso,
      summary: blog.summary ?? "",
      url: toAbsoluteUrl(blog.url),
      sourceUrl: toAbsoluteUrl(blog.url),
      itemUrl: toAbsoluteUrl(blog.url),
      tags: [...(blog.categories ?? [])].filter(Boolean),
      sortTimestamp: parsed ? parsed.getTime() : null,
    };
  });

  return sortByDateDesc([
    ...publicationItems,
    ...talkItems,
    ...posterItems,
    ...softwareItems,
    ...blogItems,
  ]);
}

export function buildRecentWorkJson(items, generatedAt = new Date().toISOString()) {
  return {
    generatedAt,
    baseIri: BASE_IRI,
    datasetUrl: toAbsoluteUrl("/recent_work.json"),
    sparqlGraphUrl: toAbsoluteUrl("/recent_work.ttl"),
    totalItems: items.length,
    recentWork: items.map(({ sortTimestamp, ...item }) => item),
  };
}

function addTriple(triples, subject, predicate, object) {
  triples.push(`${subject} ${predicate} ${object} .`);
}

export function buildRecentWorkTtl(items, generatedAt = new Date().toISOString()) {
  const triples = [];
  const datasetRef = iri(new URL("data/recent-work", BASE_IRI).href);
  const datasetJsonRef = iri(new URL("recent_work.json", BASE_IRI).href);
  const datasetTtlRef = iri(new URL("recent_work.ttl", BASE_IRI).href);

  addTriple(triples, datasetRef, "rdf:type", "schema:Dataset");
  addTriple(triples, datasetRef, "rdf:type", "ec:WebsiteDataset");
  addTriple(triples, datasetRef, "schema:name", literal("Recent Work"));
  addTriple(
    triples,
    datasetRef,
    "schema:description",
    literal("Aggregated recent work items from publications, talks, posters, software, and blogs."),
  );
  addTriple(triples, datasetRef, "dcterms:modified", literal(generatedAt, "xsd:dateTime"));
  addTriple(triples, datasetRef, "schema:url", datasetJsonRef);
  addTriple(triples, datasetRef, "schema:distribution", datasetJsonRef);
  addTriple(triples, datasetRef, "schema:distribution", datasetTtlRef);

  addTriple(triples, datasetJsonRef, "rdf:type", "schema:DataDownload");
  addTriple(triples, datasetJsonRef, "schema:encodingFormat", literal("application/json"));
  addTriple(triples, datasetJsonRef, "schema:url", datasetJsonRef);

  addTriple(triples, datasetTtlRef, "rdf:type", "schema:DataDownload");
  addTriple(triples, datasetTtlRef, "schema:encodingFormat", literal("text/turtle"));
  addTriple(triples, datasetTtlRef, "schema:url", datasetTtlRef);

  items.forEach((item) => {
    const itemRef = iri(new URL(`id/recent-work/${sanitizeId(item.type)}/${sanitizeId(item.id)}`, BASE_IRI).href);
    addTriple(triples, itemRef, "rdf:type", "schema:CreativeWork");
    addTriple(triples, itemRef, "rdf:type", "ec:RecentWorkItem");
    addTriple(triples, itemRef, "schema:name", literal(item.title));
    addTriple(triples, itemRef, "ec:workType", literal(item.type));
    addTriple(triples, itemRef, "dcterms:identifier", literal(item.id));
    addTriple(triples, itemRef, "schema:dateModified", literal(generatedAt, "xsd:dateTime"));
    addTriple(triples, datasetRef, "schema:hasPart", itemRef);

    if (item.summary) {
      addTriple(triples, itemRef, "schema:abstract", literal(item.summary));
    }
    if (item.dateIso) {
      addTriple(triples, itemRef, "schema:datePublished", literal(item.dateIso, "xsd:date"));
    }
    if (item.itemUrl) {
      addTriple(triples, itemRef, "schema:url", iri(item.itemUrl));
    }
    if (item.sourceUrl) {
      addTriple(triples, itemRef, "schema:sameAs", iri(item.sourceUrl));
    }
    if (item.slug) {
      addTriple(triples, itemRef, "ec:slug", literal(item.slug));
    }
    if (item.type === "Software" && item.latestRelease) {
      if (item.latestRelease.tagName) {
        addTriple(triples, itemRef, "schema:softwareVersion", literal(item.latestRelease.tagName));
        addTriple(triples, itemRef, "ec:releaseTag", literal(item.latestRelease.tagName));
      }
      if (item.latestRelease.name) {
        addTriple(triples, itemRef, "ec:releaseName", literal(item.latestRelease.name));
      }
      if (item.latestRelease.url) {
        addTriple(triples, itemRef, "ec:releaseUrl", iri(item.latestRelease.url));
      }
      if (item.latestRelease.publishedAt) {
        addTriple(triples, itemRef, "ec:releasePublishedAt", literal(item.latestRelease.publishedAt, "xsd:dateTime"));
      }
    }
    if (item.type === "Software" && item.latestReleaseDateIso) {
      addTriple(triples, itemRef, "ec:latestReleaseDate", literal(item.latestReleaseDateIso, "xsd:date"));
    }

    for (const tag of item.tags ?? []) {
      addTriple(triples, itemRef, "schema:keywords", literal(tag));
    }
  });

  const header = [
    "# Auto-generated by scripts/export-recent-work.mjs",
    "# Run: npm run recent-work:export",
    formatPrefixLines(),
    "",
  ].join("\n");

  return `${header}${triples.sort((a, b) => a.localeCompare(b)).join("\n")}\n`;
}

async function main() {
  const items = buildRecentWorkItems(await loadSiteContent());

  await fs.mkdir(publicDir, { recursive: true });
  await writeGeneratedFile(
    outputJsonPath,
    (iso) => `${JSON.stringify(buildRecentWorkJson(items, iso), null, 2)}\n`,
  );
  await writeGeneratedFile(outputTtlPath, (iso) => buildRecentWorkTtl(items, iso));

  // eslint-disable-next-line no-console
  console.log(
    `Exported ${path.relative(rootDir, outputJsonPath)} and ${path.relative(rootDir, outputTtlPath)} (${items.length} items).`,
  );
}

if (isMain(import.meta.url)) {
  main().catch((error) => {
    // eslint-disable-next-line no-console
    console.error(error);
    process.exitCode = 1;
  });
}
