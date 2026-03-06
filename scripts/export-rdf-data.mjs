#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { fileURLToPath, pathToFileURL } from "node:url";
import esbuild from "esbuild";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const dataDir = path.join(rootDir, "src", "data");
const rdfDir = path.join(dataDir, "rdf");
const rdfFilePath = path.join(rdfDir, "site-data.ttl");

const BASE_IRI = process.env.RDF_BASE_IRI ?? "https://eliascrum.github.io/eliascrum/";
const ID_BASE_IRI = new URL("id/", BASE_IRI).href;
const VOCAB_IRI = new URL("vocab#", BASE_IRI).href;

const PREFIX_ORDER = [
  "rdf",
  "rdfs",
  "xsd",
  "schema",
  "dcterms",
  "skos",
  "ec",
];

const PREFIXES = {
  rdf: "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
  rdfs: "http://www.w3.org/2000/01/rdf-schema#",
  xsd: "http://www.w3.org/2001/XMLSchema#",
  schema: "https://schema.org/",
  dcterms: "http://purl.org/dc/terms/",
  skos: "http://www.w3.org/2004/02/skos/core#",
  ec: VOCAB_IRI,
};

function iri(value) {
  return `<${value}>`;
}

function ecRef(...segments) {
  const pathFragment = segments.map((segment) => encodeURIComponent(String(segment))).join("/");
  return iri(`${ID_BASE_IRI}${pathFragment}`);
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

function integerLiteral(value) {
  return literal(String(value), "xsd:integer");
}

function gYearLiteral(value) {
  return literal(String(value), "xsd:gYear");
}

function booleanLiteral(value) {
  return value ? '"true"^^xsd:boolean' : '"false"^^xsd:boolean';
}

function isValidIsoDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  const parsed = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) {
    return false;
  }
  return parsed.toISOString().slice(0, 10) === value;
}

function isValidIsoDateTime(value) {
  if (typeof value !== "string") {
    return false;
  }
  const parsed = new Date(value);
  return !Number.isNaN(parsed.getTime()) && value.includes("T");
}

function resolveUrl(urlValue) {
  if (!urlValue || typeof urlValue !== "string") {
    return null;
  }

  try {
    if (/^[a-z][a-z\d+\-.]*:/i.test(urlValue)) {
      return new URL(urlValue).href;
    }

    if (urlValue.startsWith("//")) {
      return new URL(`https:${urlValue}`).href;
    }

    const relativePath = urlValue.replace(/^\/+/, "");
    return new URL(relativePath, BASE_IRI).href;
  } catch {
    return null;
  }
}

function addTextValue(triples, subject, predicate, value) {
  if (value === undefined || value === null || value === "") {
    return;
  }
  triples.add(`${subject} ${predicate} ${literal(value)} .`);
}

function addUrlValue(triples, subject, urlValue) {
  const resolved = resolveUrl(urlValue);
  if (!resolved) {
    addTextValue(triples, subject, "ec:rawUrl", urlValue);
    return;
  }
  triples.add(`${subject} schema:url ${iri(resolved)} .`);
}

function addDateValue(triples, subject, predicate, value, fallbackPredicate) {
  if (!value) {
    return;
  }

  if (isValidIsoDate(value)) {
    triples.add(`${subject} ${predicate} ${literal(value, "xsd:date")} .`);
    return;
  }

  if (fallbackPredicate) {
    triples.add(`${subject} ${fallbackPredicate} ${literal(value)} .`);
  }
}

function addDateTimeValue(triples, subject, predicate, value, fallbackPredicate) {
  if (!value) {
    return;
  }

  if (isValidIsoDateTime(value)) {
    triples.add(`${subject} ${predicate} ${literal(value, "xsd:dateTime")} .`);
    return;
  }

  if (fallbackPredicate) {
    triples.add(`${subject} ${fallbackPredicate} ${literal(value)} .`);
  }
}

function slugify(label) {
  return String(label)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "")
    .replace(/-{2,}/g, "-")
    .slice(0, 64) || "tag";
}

function shortHash(value) {
  return crypto.createHash("sha1").update(String(value)).digest("hex").slice(0, 8);
}

function makeTagRef(tagRegistry, triples, kind, label, isDeclaredOption = false) {
  const normalizedKind = String(kind).trim().toLowerCase();
  const normalizedLabel = String(label).trim();
  const key = `${normalizedKind}::${normalizedLabel.toLowerCase()}`;

  const existing = tagRegistry.get(key);
  if (existing) {
    if (isDeclaredOption) {
      triples.add(`${existing} ec:isDeclaredOption ${booleanLiteral(true)} .`);
    }
    return existing;
  }

  const identifier = `${slugify(normalizedLabel)}-${shortHash(key)}`;
  const tagRef = ecRef("tag", normalizedKind, identifier);
  const kindClass =
    normalizedKind === "topic"
      ? "ec:TopicTag"
      : normalizedKind === "venue"
        ? "ec:VenueTag"
        : normalizedKind === "publication-type"
          ? "ec:PublicationTypeTag"
          : normalizedKind === "blog-category"
            ? "ec:BlogCategoryTag"
            : "ec:Tag";

  triples.add(`${tagRef} rdf:type ec:Tag .`);
  triples.add(`${tagRef} rdf:type ${kindClass} .`);
  triples.add(`${tagRef} skos:prefLabel ${literal(normalizedLabel)} .`);
  triples.add(`${tagRef} ec:tagKind ${literal(normalizedKind)} .`);
  triples.add(`${tagRef} ec:isDeclaredOption ${booleanLiteral(Boolean(isDeclaredOption))} .`);

  tagRegistry.set(key, tagRef);
  return tagRef;
}

async function loadTsModule(relativeFilePath) {
  const absoluteInputPath = path.join(dataDir, relativeFilePath);
  const tempOutputPath = path.join(
    os.tmpdir(),
    `rdf-export-${slugify(relativeFilePath)}-${Date.now()}-${Math.random().toString(16).slice(2)}.mjs`,
  );

  await esbuild.build({
    entryPoints: [absoluteInputPath],
    bundle: true,
    platform: "node",
    target: ["node20"],
    format: "esm",
    outfile: tempOutputPath,
    logLevel: "silent",
    define: {
      "import.meta.env.BASE_URL": '"/"',
    },
  });

  try {
    return await import(`${pathToFileURL(tempOutputPath).href}?v=${Date.now()}`);
  } finally {
    await fs.unlink(tempOutputPath).catch(() => {});
  }
}

function sortTriples(triples) {
  return [...triples].sort((a, b) => a.localeCompare(b));
}

function parseEntityReferenceFromUpdateId(id) {
  if (typeof id !== "string") {
    return null;
  }
  const parts = id.split(":");
  if (parts.length !== 2) {
    return null;
  }
  const [kind, key] = parts;
  if (!kind || !key) {
    return null;
  }

  if (kind === "publication") {
    return ecRef("publication", key);
  }
  if (kind === "talk") {
    return ecRef("talk", key);
  }
  if (kind === "blog") {
    return ecRef("blog-post", key);
  }
  return null;
}

async function main() {
  const [
    cvModule,
    blogModule,
    talksModule,
    talkCatalogModule,
    talkMetadataModule,
    publicationsModule,
    citationsModule,
    homepageUpdatesModule,
  ] = await Promise.all([
    loadTsModule("cvData.ts"),
    loadTsModule("blogPostsData.ts"),
    loadTsModule("talksData.ts"),
    loadTsModule("talkCatalog.ts"),
    loadTsModule("talkMetadata.ts"),
    loadTsModule("publicationsData.ts"),
    loadTsModule("scholarCitations.ts"),
    loadTsModule("homepageUpdates.ts"),
  ]);

  const triples = new Set();
  const tagRegistry = new Map();
  const generatedAtIso = new Date().toISOString();

  const websiteDatasetRef = ecRef("dataset", "website");
  triples.add(`${websiteDatasetRef} rdf:type schema:Dataset .`);
  triples.add(`${websiteDatasetRef} rdf:type ec:WebsiteDataset .`);
  triples.add(
    `${websiteDatasetRef} schema:name ${literal("Elias Crum personal website data graph")} .`,
  );
  triples.add(
    `${websiteDatasetRef} dcterms:description ${literal(
      "RDF/Turtle projection of the TypeScript data modules under src/data.",
    )} .`,
  );
  addDateTimeValue(
    triples,
    websiteDatasetRef,
    "dcterms:modified",
    generatedAtIso,
    "ec:modifiedText",
  );
  triples.add(`${websiteDatasetRef} ec:sourceDirectory ${literal("src/data")} .`);

  const cvSections = Array.isArray(cvModule.cvSections) ? cvModule.cvSections : [];
  cvSections.forEach((section, sectionIndex) => {
    const sectionRef = ecRef("cv-section", String(sectionIndex + 1));
    triples.add(`${sectionRef} rdf:type ec:CvSection .`);
    triples.add(`${sectionRef} dcterms:isPartOf ${websiteDatasetRef} .`);
    triples.add(`${sectionRef} ec:order ${integerLiteral(sectionIndex + 1)} .`);
    addTextValue(triples, sectionRef, "schema:name", section.title);

    const sectionItems = Array.isArray(section.items) ? section.items : [];
    sectionItems.forEach((item, itemIndex) => {
      const itemRef = ecRef("cv-item", `${sectionIndex + 1}-${itemIndex + 1}`);
      triples.add(`${itemRef} rdf:type ec:CvItem .`);
      triples.add(`${itemRef} dcterms:isPartOf ${sectionRef} .`);
      triples.add(`${itemRef} ec:order ${integerLiteral(itemIndex + 1)} .`);
      triples.add(`${sectionRef} ec:hasItem ${itemRef} .`);

      addTextValue(triples, itemRef, "ec:role", item.role);
      addTextValue(triples, itemRef, "ec:organization", item.organization);
      addTextValue(triples, itemRef, "ec:dateText", item.date);

      const itemDetails = Array.isArray(item.details) ? item.details : [];
      itemDetails.forEach((detail, detailIndex) => {
        const detailRef = ecRef("cv-detail", `${sectionIndex + 1}-${itemIndex + 1}-${detailIndex + 1}`);
        triples.add(`${detailRef} rdf:type ec:CvDetail .`);
        triples.add(`${detailRef} dcterms:isPartOf ${itemRef} .`);
        triples.add(`${detailRef} ec:order ${integerLiteral(detailIndex + 1)} .`);
        triples.add(`${itemRef} ec:hasDetail ${detailRef} .`);

        if (typeof detail === "string") {
          addTextValue(triples, detailRef, "ec:text", detail);
          return;
        }

        addTextValue(triples, detailRef, "ec:text", detail.text);
        addTextValue(triples, detailRef, "ec:prefix", detail.prefix);
        addUrlValue(triples, detailRef, detail.url);
      });
    });
  });

  const talksRaw = Array.isArray(talksModule.talks) ? talksModule.talks : [];
  const postersRaw = Array.isArray(talksModule.posters) ? talksModule.posters : [];
  const talkViewEntries =
    typeof talkCatalogModule.getTalkViewEntries === "function"
      ? talkCatalogModule.getTalkViewEntries(talksRaw)
      : talksRaw;
  const posterRefByPath = new Map();

  postersRaw.forEach((poster) => {
    const posterRef = ecRef("poster", poster.slug);
    posterRefByPath.set(poster.path, posterRef);

    triples.add(`${posterRef} rdf:type ec:Poster .`);
    triples.add(`${posterRef} dcterms:isPartOf ${websiteDatasetRef} .`);
    addTextValue(triples, posterRef, "dcterms:identifier", poster.slug);
    addTextValue(triples, posterRef, "schema:name", poster.title);
    addTextValue(triples, posterRef, "ec:filePath", poster.path);
    addUrlValue(triples, posterRef, poster.path);
  });

  const talkMetadataBySlug = talkMetadataModule.talkMetadataBySlug ?? {};
  talkViewEntries.forEach((talk) => {
    const talkRef = ecRef("talk", talk.slug);
    triples.add(`${talkRef} rdf:type ec:Talk .`);
    triples.add(`${talkRef} dcterms:isPartOf ${websiteDatasetRef} .`);

    addTextValue(triples, talkRef, "dcterms:identifier", talk.slug);
    addTextValue(triples, talkRef, "schema:name", talk.displayTitle ?? talk.title);
    addTextValue(triples, talkRef, "ec:sourceTitle", talk.title);
    addTextValue(triples, talkRef, "ec:summary", talk.summary ?? talk.description);
    addTextValue(triples, talkRef, "ec:description", talk.abstract ?? talk.description);
    addTextValue(triples, talkRef, "ec:sourceFile", talk.sourceFile);

    addDateValue(triples, talkRef, "ec:displayDate", talk.displayDateIso, "ec:displayDateText");
    addTextValue(triples, talkRef, "ec:displayDateLabel", talk.displayDateLabel);
    addDateValue(triples, talkRef, "ec:sourceDate", talk.dateIso, "ec:sourceDateText");
    addTextValue(triples, talkRef, "ec:sourceDateLabel", talk.dateLabel);

    addTextValue(triples, talkRef, "ec:slidePath", talk.slidePath);
    addUrlValue(triples, talkRef, talk.slidePath);

    if (talk.posterPath) {
      addTextValue(triples, talkRef, "ec:posterPath", talk.posterPath);
      addTextValue(triples, talkRef, "ec:posterTitle", talk.posterTitle);
      const linkedPosterRef = posterRefByPath.get(talk.posterPath);
      if (linkedPosterRef) {
        triples.add(`${talkRef} ec:hasPoster ${linkedPosterRef} .`);
        triples.add(`${linkedPosterRef} ec:isPosterForTalk ${talkRef} .`);
      }
    }

    const venueTags = Array.isArray(talk.venueTags) ? talk.venueTags : [];
    venueTags.forEach((tagLabel) => {
      const tagRef = makeTagRef(tagRegistry, triples, "venue", tagLabel);
      triples.add(`${talkRef} ec:hasVenueTag ${tagRef} .`);
    });

    const topicTags = Array.isArray(talk.topicTags) ? talk.topicTags : [];
    topicTags.forEach((tagLabel) => {
      const tagRef = makeTagRef(tagRegistry, triples, "topic", tagLabel);
      triples.add(`${talkRef} ec:hasTopicTag ${tagRef} .`);
    });

    const audienceSizeTag = talk.audienceSizeCategory;
    if (audienceSizeTag) {
      const tagRef = makeTagRef(tagRegistry, triples, "audience-size", audienceSizeTag);
      triples.add(`${talkRef} ec:hasAudienceSizeTag ${tagRef} .`);
    }

    const audienceGroupTags = Array.isArray(talk.audienceGroups) ? talk.audienceGroups : [];
    audienceGroupTags.forEach((tagLabel) => {
      const tagRef = makeTagRef(tagRegistry, triples, "audience-group", tagLabel);
      triples.add(`${talkRef} ec:hasAudienceGroupTag ${tagRef} .`);
    });

    const talkMetadataRef = ecRef("talk-metadata", talk.slug);
    const rawMetadata = talkMetadataBySlug[talk.slug];
    if (rawMetadata) {
      triples.add(`${talkMetadataRef} rdf:type ec:TalkMetadata .`);
      triples.add(`${talkMetadataRef} ec:forTalk ${talkRef} .`);
      addTextValue(triples, talkMetadataRef, "schema:name", rawMetadata.title);
      addDateValue(triples, talkMetadataRef, "ec:date", rawMetadata.dateIso, "ec:dateText");
      addTextValue(triples, talkMetadataRef, "ec:dateLabel", rawMetadata.dateLabel);
      addTextValue(
        triples,
        talkMetadataRef,
        "ec:description",
        rawMetadata.summary ?? rawMetadata.description,
      );
      addTextValue(triples, talkMetadataRef, "ec:summary", rawMetadata.summary);
    }
  });

  const venueOptions = Array.isArray(talkMetadataModule.VENUE_TAG_OPTIONS)
    ? talkMetadataModule.VENUE_TAG_OPTIONS
    : [];
  venueOptions.forEach((optionLabel) => {
    makeTagRef(tagRegistry, triples, "venue", optionLabel, true);
  });

  const topicOptions = Array.isArray(talkMetadataModule.TOPIC_TAG_OPTIONS)
    ? talkMetadataModule.TOPIC_TAG_OPTIONS
    : [];
  topicOptions.forEach((optionLabel) => {
    makeTagRef(tagRegistry, triples, "topic", optionLabel, true);
  });

  const audienceSizeOptions = Array.isArray(talkMetadataModule.AUDIENCE_SIZE_TAG_OPTIONS)
    ? talkMetadataModule.AUDIENCE_SIZE_TAG_OPTIONS
    : [];
  audienceSizeOptions.forEach((optionLabel) => {
    makeTagRef(tagRegistry, triples, "audience-size", optionLabel, true);
  });

  const audienceGroupOptions = Array.isArray(talkMetadataModule.AUDIENCE_GROUP_TAG_OPTIONS)
    ? talkMetadataModule.AUDIENCE_GROUP_TAG_OPTIONS
    : [];
  audienceGroupOptions.forEach((optionLabel) => {
    makeTagRef(tagRegistry, triples, "audience-group", optionLabel, true);
  });

  const publicationTypeOptions = Array.isArray(publicationsModule.PUBLICATION_TYPE_TAG_OPTIONS)
    ? publicationsModule.PUBLICATION_TYPE_TAG_OPTIONS
    : [];
  publicationTypeOptions.forEach((optionLabel) => {
    makeTagRef(tagRegistry, triples, "publication-type", optionLabel, true);
  });

  const publications = Array.isArray(publicationsModule.publications)
    ? publicationsModule.publications
    : [];
  const publicationRefById = new Map();
  const talkRefBySlug = new Map();

  talkViewEntries.forEach((talk) => {
    talkRefBySlug.set(talk.slug, ecRef("talk", talk.slug));
  });

  publications.forEach((publication) => {
    const publicationRef = ecRef("publication", publication.id);
    publicationRefById.set(publication.id, publicationRef);

    triples.add(`${publicationRef} rdf:type ec:Publication .`);
    triples.add(`${publicationRef} dcterms:isPartOf ${websiteDatasetRef} .`);
    addTextValue(triples, publicationRef, "dcterms:identifier", publication.id);
    addTextValue(triples, publicationRef, "schema:name", publication.title);
    addTextValue(triples, publicationRef, "ec:authors", publication.authors);
    addTextValue(triples, publicationRef, "ec:venue", publication.venue);
    if (typeof publication.year === "number") {
      triples.add(`${publicationRef} ec:publicationYear ${gYearLiteral(publication.year)} .`);
    }
    addDateValue(triples, publicationRef, "ec:sortDate", publication.sortDate, "ec:sortDateText");
    addUrlValue(triples, publicationRef, publication.url);
    addTextValue(triples, publicationRef, "ec:summary", publication.summary);
    addTextValue(triples, publicationRef, "ec:abstract", publication.abstract);
    addTextValue(triples, publicationRef, "ec:bibtex", publication.bibtex);

    const typeTagRef = makeTagRef(tagRegistry, triples, "publication-type", publication.type);
    triples.add(`${publicationRef} ec:hasPublicationTypeTag ${typeTagRef} .`);

    const venueTags = Array.isArray(publication.venueTags) ? publication.venueTags : [];
    venueTags.forEach((tagLabel) => {
      const tagRef = makeTagRef(tagRegistry, triples, "venue", tagLabel);
      triples.add(`${publicationRef} ec:hasVenueTag ${tagRef} .`);
    });

    const topicTags = Array.isArray(publication.topicTags) ? publication.topicTags : [];
    topicTags.forEach((tagLabel) => {
      const tagRef = makeTagRef(tagRegistry, triples, "topic", tagLabel);
      triples.add(`${publicationRef} ec:hasTopicTag ${tagRef} .`);
    });

    const publicationDetails = Array.isArray(publication.details) ? publication.details : [];
    publicationDetails.forEach((detail, detailIndex) => {
      const detailRef = ecRef("publication-detail", `${publication.id}-${detailIndex + 1}`);
      triples.add(`${detailRef} rdf:type ec:PublicationDetail .`);
      triples.add(`${detailRef} dcterms:isPartOf ${publicationRef} .`);
      triples.add(`${detailRef} ec:order ${integerLiteral(detailIndex + 1)} .`);
      triples.add(`${publicationRef} ec:hasDetail ${detailRef} .`);
      addTextValue(triples, detailRef, "rdfs:label", detail.label);
      addTextValue(triples, detailRef, "rdf:value", detail.value);
      addUrlValue(triples, detailRef, detail.href);
    });
  });

  const publicationPresentationLinksById =
    publicationsModule.publicationPresentationLinksById ?? {};
  Object.entries(publicationPresentationLinksById).forEach(
    ([publicationId, presentationLinks]) => {
      if (!Array.isArray(presentationLinks)) {
        return;
      }

      const publicationRef =
        publicationRefById.get(publicationId) ?? ecRef("publication", publicationId);

      if (!publicationRefById.has(publicationId)) {
        triples.add(`${publicationRef} rdf:type ec:PublicationReference .`);
        addTextValue(triples, publicationRef, "dcterms:identifier", publicationId);
        triples.add(`${publicationRef} ec:isResolved ${booleanLiteral(false)} .`);
      }

      presentationLinks.forEach((presentationLink, linkIndex) => {
        const linkRef = ecRef("publication-presentation-link", `${publicationId}-${linkIndex + 1}`);
        triples.add(`${linkRef} rdf:type ec:PublicationPresentationLink .`);
        triples.add(`${linkRef} ec:forPublication ${publicationRef} .`);
        triples.add(`${publicationRef} ec:hasPresentationLink ${linkRef} .`);
        triples.add(`${linkRef} ec:order ${integerLiteral(linkIndex + 1)} .`);
        addTextValue(triples, linkRef, "schema:name", presentationLink.label);

        if (presentationLink.kind === "talk") {
          const talkRef = talkRefBySlug.get(presentationLink.talkSlug) ?? ecRef("talk", presentationLink.talkSlug);
          if (!talkRefBySlug.has(presentationLink.talkSlug)) {
            triples.add(`${talkRef} rdf:type ec:TalkReference .`);
            addTextValue(triples, talkRef, "dcterms:identifier", presentationLink.talkSlug);
            triples.add(`${talkRef} ec:isResolved ${booleanLiteral(false)} .`);
          }
          triples.add(`${linkRef} ec:linksTalk ${talkRef} .`);
          triples.add(`${publicationRef} ec:relatedTalk ${talkRef} .`);
          triples.add(`${talkRef} ec:relatedPublication ${publicationRef} .`);
        } else if (presentationLink.kind === "file") {
          addTextValue(triples, linkRef, "ec:filePath", presentationLink.filePath);
          addUrlValue(triples, linkRef, presentationLink.filePath);
        }
      });
    },
  );

  const scholarProfileRef = ecRef("profile", "google-scholar");
  const semanticScholarRef = ecRef("profile", "semantic-scholar");
  triples.add(`${scholarProfileRef} rdf:type ec:ExternalProfile .`);
  triples.add(`${semanticScholarRef} rdf:type ec:ExternalProfile .`);
  addTextValue(triples, scholarProfileRef, "schema:name", "Google Scholar");
  addTextValue(triples, semanticScholarRef, "schema:name", "Semantic Scholar");
  addUrlValue(triples, scholarProfileRef, publicationsModule.scholarProfileUrl);
  addUrlValue(triples, semanticScholarRef, publicationsModule.semanticScholarUrl);
  triples.add(`${websiteDatasetRef} ec:hasExternalProfile ${scholarProfileRef} .`);
  triples.add(`${websiteDatasetRef} ec:hasExternalProfile ${semanticScholarRef} .`);

  const blogPosts = Array.isArray(blogModule.blogPosts) ? blogModule.blogPosts : [];
  blogPosts.forEach((blogPost, index) => {
    const blogPostRef = ecRef("blog-post", blogPost.id);
    triples.add(`${blogPostRef} rdf:type ec:BlogPost .`);
    triples.add(`${blogPostRef} rdf:type schema:BlogPosting .`);
    triples.add(`${blogPostRef} dcterms:isPartOf ${websiteDatasetRef} .`);
    triples.add(`${blogPostRef} ec:order ${integerLiteral(index + 1)} .`);
    addTextValue(triples, blogPostRef, "dcterms:identifier", blogPost.id);
    addTextValue(triples, blogPostRef, "schema:name", blogPost.title);
    addDateValue(triples, blogPostRef, "dcterms:date", blogPost.dateIso, "ec:dateText");
    addTextValue(triples, blogPostRef, "ec:summary", blogPost.summary);
    addTextValue(triples, blogPostRef, "ec:linkLabel", blogPost.linkLabel);
    addUrlValue(triples, blogPostRef, blogPost.url);

    if (blogPost.category) {
      const categoryTag = makeTagRef(tagRegistry, triples, "blog-category", blogPost.category);
      triples.add(`${blogPostRef} ec:hasTag ${categoryTag} .`);
    }
  });

  const homepageUpdates =
    typeof homepageUpdatesModule.getAllHomepageUpdates === "function"
      ? homepageUpdatesModule.getAllHomepageUpdates()
      : [];
  homepageUpdates.forEach((homepageUpdate, index) => {
    const updateRef = ecRef("homepage-update", homepageUpdate.id);
    triples.add(`${updateRef} rdf:type ec:HomepageUpdate .`);
    triples.add(`${updateRef} dcterms:isPartOf ${websiteDatasetRef} .`);
    triples.add(`${updateRef} ec:order ${integerLiteral(index + 1)} .`);
    addTextValue(triples, updateRef, "dcterms:identifier", homepageUpdate.id);
    addTextValue(triples, updateRef, "ec:updateType", homepageUpdate.type);
    addDateValue(triples, updateRef, "ec:updateDate", homepageUpdate.dateIso, "ec:updateDateText");
    addTextValue(triples, updateRef, "ec:dateLabel", homepageUpdate.dateLabel);
    addTextValue(triples, updateRef, "schema:name", homepageUpdate.title);
    addTextValue(triples, updateRef, "ec:summary", homepageUpdate.summary);
    addTextValue(triples, updateRef, "ec:linkLabel", homepageUpdate.linkLabel);
    addUrlValue(triples, updateRef, homepageUpdate.link);

    const relatedEntityRef = parseEntityReferenceFromUpdateId(homepageUpdate.id);
    if (relatedEntityRef) {
      triples.add(`${updateRef} ec:referencesEntity ${relatedEntityRef} .`);
    }
  });

  const citationSnapshotRef = ecRef("scholar-citations", "latest");
  triples.add(`${citationSnapshotRef} rdf:type ec:ScholarCitationSnapshot .`);
  triples.add(`${citationSnapshotRef} dcterms:isPartOf ${websiteDatasetRef} .`);
  addDateTimeValue(
    triples,
    citationSnapshotRef,
    "dcterms:modified",
    citationsModule.scholarCitationLastUpdatedIso,
    "ec:modifiedText",
  );

  const citationsByPublicationId = citationsModule.scholarCitationsByPublicationId ?? {};
  Object.entries(citationsByPublicationId).forEach(([publicationId, citationCount]) => {
    const observationRef = ecRef("citation-observation", publicationId);
    triples.add(`${observationRef} rdf:type ec:CitationObservation .`);
    triples.add(`${observationRef} ec:fromSnapshot ${citationSnapshotRef} .`);
    addTextValue(triples, observationRef, "ec:publicationId", publicationId);

    const publicationRef = publicationRefById.get(publicationId);
    if (publicationRef) {
      triples.add(`${observationRef} ec:forPublication ${publicationRef} .`);
    }

    if (typeof citationCount === "number") {
      triples.add(`${observationRef} ec:citationCount ${integerLiteral(citationCount)} .`);
    }
  });

  const triplesSorted = sortTriples(triples);
  const output = [
    "# Auto-generated by scripts/export-rdf-data.mjs",
    "# Run: npm run rdf:export",
    "",
    formatPrefixLines(),
    "",
    triplesSorted.join("\n"),
    "",
  ].join("\n");

  await fs.mkdir(rdfDir, { recursive: true });
  await fs.writeFile(rdfFilePath, output, "utf8");

  console.log(
    `Wrote RDF data to ${path.relative(rootDir, rdfFilePath)} (${triplesSorted.length} triples).`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
