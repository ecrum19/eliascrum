#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadSiteContent } from "./lib/load-content.mjs";
import { writeGeneratedFile } from "./lib/write-generated.mjs";
import { isMain } from "./lib/cli.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const dataDir = path.join(rootDir, "src", "data");
const rdfDir = path.join(dataDir, "rdf");
const rdfFilePath = path.join(rdfDir, "site-data.ttl");
const publicRdfFilePath = path.join(rootDir, "public", "site-data.ttl");
const vocabFilePath = path.join(rdfDir, "vocab.ttl");
const shapesFilePath = path.join(rdfDir, "site-shapes.ttl");
const publicVocabFilePath = path.join(rootDir, "public", "vocab.ttl");
const publicShapesFilePath = path.join(rootDir, "public", "site-shapes.ttl");

const BASE_IRI = process.env.RDF_BASE_IRI ?? "https://eliascrum.info/";
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
  addIriValue(triples, subject, "schema:url", urlValue);
}

function addIriValue(triples, subject, predicate, urlValue) {
  const resolved = resolveUrl(urlValue);
  if (!resolved) {
    if (urlValue) {
      addTextValue(triples, subject, "ec:rawUrl", urlValue);
    }
    return;
  }
  triples.add(`${subject} ${predicate} ${iri(resolved)} .`);
}

function addIntegerValue(triples, subject, predicate, value) {
  if (typeof value === "number" && Number.isFinite(value)) {
    triples.add(`${subject} ${predicate} ${integerLiteral(value)} .`);
  }
}

function addRelatedResources(triples, parentRef, resourceKind, resourceKey, resources = []) {
  const used = new Set();
  resources.forEach((resource, index) => {
    if (!resource || typeof resource.url !== "string" || resource.url.length === 0) {
      return;
    }
    const resourceRef = ecRef("related-resource", resourceKind, resourceKey, stableKey(resource.label, used));
    triples.add(`${resourceRef} rdf:type ec:RelatedResource .`);
    triples.add(`${parentRef} ec:hasRelatedResource ${resourceRef} .`);
    triples.add(`${resourceRef} ec:order ${integerLiteral(index + 1)} .`);
    addTextValue(triples, resourceRef, "schema:name", resource.label);
    addIriValue(triples, resourceRef, "schema:url", resource.url);
  });
}

/** The one part of an entry its page emphasizes; one per entry, so it is named after its owner. */
function addHighlight(triples, ownerRef, kind, id, highlight) {
  if (!highlight) {
    return;
  }
  const highlightRef = ecRef("highlight", kind, id);
  triples.add(`${highlightRef} rdf:type ec:Highlight .`);
  triples.add(`${ownerRef} ec:hasHighlight ${highlightRef} .`);
  addTextValue(triples, highlightRef, "schema:name", highlight.label);
  addTextValue(triples, highlightRef, "schema:description", highlight.description);
  addUrlValue(triples, highlightRef, highlight.href);
  if (highlight.related) {
    const separator = highlight.related.indexOf(":");
    const relatedRef = ecRef(highlight.related.slice(0, separator), highlight.related.slice(separator + 1));
    triples.add(`${highlightRef} ec:highlightsEntry ${relatedRef} .`);
  }
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

/**
 * Names a sub-resource by what it is rather than where it sits, so reordering or removing
 * a sibling never renames it. Order is kept separately as ec:order.
 */
function stableKey(label, used) {
  const key = slugify(label);
  if (used.has(key)) {
    throw new Error(`Two sibling resources would both be named "${key}"; give them distinct labels.`);
  }
  used.add(key);
  return key;
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

/** Pure RDF projection; callers control content and the observation timestamp. */
export function buildRdfData({
  cvModule, blogModule, catalogModule, publicationDetailsModule, presentationDetailsModule,
  tagsModule, profilesModule,
  softwareReleasesModule, fellowshipModule, citationsModule, homepageUpdatesModule,
}, generatedAt = new Date()) {
  const triples = new Set();
  const tagRegistry = new Map();
  const generatedAtIso = generatedAt.toISOString();

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

  const cvProfile = cvModule.cvProfile;
  if (cvProfile) {
    const cvProfileRef = ecRef("cv-profile", "elias-crum");
    triples.add(`${cvProfileRef} rdf:type ec:CvProfile .`);
    triples.add(`${cvProfileRef} dcterms:isPartOf ${websiteDatasetRef} .`);
    triples.add(`${websiteDatasetRef} ec:hasCvProfile ${cvProfileRef} .`);
    addTextValue(triples, cvProfileRef, "schema:name", cvProfile.name);
    addTextValue(triples, cvProfileRef, "ec:headline", cvProfile.headline);
    addTextValue(triples, cvProfileRef, "ec:address", cvProfile.address);
    (cvProfile.focusTags ?? []).forEach((tagLabel) => {
      const tagRef = makeTagRef(tagRegistry, triples, "cv-focus", tagLabel);
      triples.add(`${cvProfileRef} ec:hasFocusTag ${tagRef} .`);
    });
    const contactKeys = new Set();
    (cvProfile.contacts ?? []).forEach((contact, contactIndex) => {
      const contactRef = ecRef("cv-contact", stableKey(contact.label, contactKeys));
      triples.add(`${contactRef} rdf:type ec:CvContact .`);
      triples.add(`${contactRef} dcterms:isPartOf ${cvProfileRef} .`);
      triples.add(`${cvProfileRef} ec:hasContact ${contactRef} .`);
      triples.add(`${contactRef} ec:order ${integerLiteral(contactIndex + 1)} .`);
      addTextValue(triples, contactRef, "rdfs:label", contact.label);
      addTextValue(triples, contactRef, "rdf:value", contact.value);
      addTextValue(triples, contactRef, "ec:icon", contact.icon);
      addUrlValue(triples, contactRef, contact.href);
    });
  }

  const cvSections = Array.isArray(cvModule.cvSections) ? cvModule.cvSections : [];
  const sectionKeys = new Set();
  cvSections.forEach((section, sectionIndex) => {
    const sectionKey = stableKey(section.title, sectionKeys);
    const sectionRef = ecRef("cv-section", sectionKey);
    triples.add(`${sectionRef} rdf:type ec:CvSection .`);
    triples.add(`${sectionRef} dcterms:isPartOf ${websiteDatasetRef} .`);
    triples.add(`${sectionRef} ec:order ${integerLiteral(sectionIndex + 1)} .`);
    addTextValue(triples, sectionRef, "schema:name", section.title);
    addTextValue(triples, sectionRef, "ec:layout", section.layout);

    const sectionItems = Array.isArray(section.items) ? section.items : [];
    const itemKeys = new Set();
    sectionItems.forEach((item, itemIndex) => {
      const itemKey = stableKey([item.organization, item.role].filter(Boolean).join(" "), itemKeys);
      const itemRef = ecRef("cv-item", sectionKey, itemKey);
      triples.add(`${itemRef} rdf:type ec:CvItem .`);
      triples.add(`${itemRef} dcterms:isPartOf ${sectionRef} .`);
      triples.add(`${itemRef} ec:order ${integerLiteral(itemIndex + 1)} .`);
      triples.add(`${sectionRef} ec:hasItem ${itemRef} .`);

      addTextValue(triples, itemRef, "ec:role", item.role);
      addTextValue(triples, itemRef, "ec:organization", item.organization);
      addTextValue(triples, itemRef, "ec:location", item.location);
      addTextValue(triples, itemRef, "ec:dateText", item.date);
      addTextValue(triples, itemRef, "ec:group", item.group);

      const artifacts = Array.isArray(item.artifacts) ? item.artifacts : [];
      const artifactKeys = new Set();
      artifacts.forEach((artifact, artifactIndex) => {
        const artifactRef = ecRef("cv-artifact", sectionKey, itemKey, stableKey(artifact.label, artifactKeys));
        triples.add(`${artifactRef} rdf:type ec:CvArtifact .`);
        triples.add(`${artifactRef} dcterms:isPartOf ${itemRef} .`);
        triples.add(`${itemRef} ec:hasArtifact ${artifactRef} .`);
        triples.add(`${artifactRef} ec:order ${integerLiteral(artifactIndex + 1)} .`);
        addTextValue(triples, artifactRef, "schema:name", artifact.label);
        addTextValue(triples, artifactRef, "ec:filePath", artifact.path);
        addUrlValue(triples, artifactRef, artifact.path);
      });

      const itemDetails = Array.isArray(item.details) ? item.details : [];
      const detailKeys = new Set();
      itemDetails.forEach((detail, detailIndex) => {
        const detailText = typeof detail === "string" ? detail : detail.text;
        const detailRef = ecRef("cv-detail", sectionKey, itemKey, stableKey(detailText, detailKeys));
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
        if (typeof detail.internal === "boolean") {
          triples.add(`${detailRef} ec:isInternal ${booleanLiteral(detail.internal)} .`);
        }
      });
    });
  });

  const {
    publicationCatalog, softwareCatalog, talkCatalog, posterCatalog,
    dateLabel, dateYear, numericDateLabel, relatedIds,
  } = catalogModule;
  const {
    slidesUrl, posterPdfPath, durationCategory, audienceSizeCategory, audienceSizeEstimate,
  } = presentationDetailsModule;
  // Looked up in the entries given, so an exported catalog never mixes in another one.
  const posterById = new Map(posterCatalog.entries.map((poster) => [poster.id, poster]));

  // What talks and posters share: dates, audience, venue and topic tags, resources.
  const addPresentation = (ref, kind, entry) => {
    triples.add(`${ref} dcterms:isPartOf ${websiteDatasetRef} .`);
    addTextValue(triples, ref, "dcterms:identifier", entry.slug);
    addTextValue(triples, ref, "schema:name", entry.title);
    addHighlight(triples, ref, kind, entry.id, entry.highlight);
    addDateValue(triples, ref, "ec:displayDate", dateLabel(entry.date), "ec:displayDateText");
    addTextValue(triples, ref, "ec:displayDateLabel", numericDateLabel(entry.date));
    addTextValue(triples, ref, "ec:summary", entry.summary);
    addTextValue(triples, ref, "ec:goal", entry.goal);
    addTextValue(triples, ref, "ec:audienceExpertise", entry.audienceExpertise);
    addIntegerValue(triples, ref, "ec:durationMinutes", entry.durationMinutes);
    addTextValue(triples, ref, "ec:durationCategory", durationCategory(entry));
    addIntegerValue(triples, ref, "ec:audienceSizeApprox", entry.audienceSizeApprox);
    addTextValue(triples, ref, "ec:audienceSizeCategory", audienceSizeCategory(entry));
    addTextValue(triples, ref, "ec:audienceSizeEstimate", audienceSizeEstimate(entry));
    const sizeTag = audienceSizeCategory(entry);
    if (sizeTag) {
      triples.add(`${ref} ec:hasAudienceSizeTag ${makeTagRef(tagRegistry, triples, "audience-size", sizeTag)} .`);
    }
    entry.venueTags.forEach((tagLabel) => {
      triples.add(`${ref} ec:hasVenueTag ${makeTagRef(tagRegistry, triples, "venue", tagLabel)} .`);
    });
    entry.topics.forEach((tagLabel) => {
      triples.add(`${ref} ec:hasTopicTag ${makeTagRef(tagRegistry, triples, "topic", tagLabel)} .`);
    });
    entry.audienceGroups.forEach((tagLabel) => {
      triples.add(`${ref} ec:hasAudienceGroupTag ${makeTagRef(tagRegistry, triples, "audience-group", tagLabel)} .`);
    });
    addRelatedResources(triples, ref, kind, entry.slug, entry.relatedResources);
    // Talks and posters can also point at papers and software; those sides link back.
    const inverse = kind === "talk" ? "ec:relatedTalk" : "ec:relatedPoster";
    relatedIds(entry, "publication").forEach((id) => {
      triples.add(`${ref} ec:relatedPublication ${ecRef("publication", id)} .`);
      triples.add(`${ecRef("publication", id)} ${inverse} ${ref} .`);
    });
    relatedIds(entry, "software").forEach((id) => {
      triples.add(`${ref} ec:relatedSoftware ${ecRef("software", id)} .`);
      triples.add(`${ecRef("software", id)} ${inverse} ${ref} .`);
    });
  };

  const detailedDate = (date) =>
    /^\d{4}-\d{2}-\d{2}$/.test(String(date))
      ? new Intl.DateTimeFormat("en-GB", {
          weekday: "long", day: "2-digit", month: "long", year: "numeric", timeZone: "UTC",
        }).format(new Date(`${date}T12:00:00Z`))
      : dateLabel(date);

  posterCatalog.entries.forEach((poster) => {
    const posterRef = ecRef("poster", poster.id);
    const path = posterPdfPath(poster);
    triples.add(`${posterRef} rdf:type ec:Poster .`);
    addPresentation(posterRef, "poster", poster);
    addTextValue(triples, posterRef, "ec:filePath", path);
    addUrlValue(triples, posterRef, path);
    addTextValue(triples, posterRef, "ec:displayDateDetailedLabel", detailedDate(poster.date));
    addTextValue(triples, posterRef, "ec:abstract", poster.abstract);
  });

  talkCatalog.entries.forEach((talk) => {
    const talkRef = ecRef("talk", talk.id);
    const { slides } = talk;
    const url = slidesUrl(talk);
    triples.add(`${talkRef} rdf:type ec:Talk .`);
    addPresentation(talkRef, "talk", talk);
    addTextValue(triples, talkRef, "ec:description", talk.abstract ?? talk.summary);
    addTextValue(triples, talkRef, "ec:sourceFile", slides.format === "pdf" ? slides.source : slides.url);
    addTextValue(triples, talkRef, "ec:slidePath", url);
    addTextValue(triples, talkRef, "schema:encodingFormat", slides.format === "html" ? "text/html" : "application/pdf");
    addUrlValue(triples, talkRef, url);
    addIriValue(triples, talkRef, "schema:embedUrl", slides.embedUrl ?? (slides.format === "html" ? slides.url : undefined));
    relatedIds(talk, "poster").flatMap((id) => posterById.get(id) ?? []).forEach((poster) => {
      const posterRef = ecRef("poster", poster.id);
      addTextValue(triples, talkRef, "ec:posterPath", posterPdfPath(poster));
      addTextValue(triples, talkRef, "ec:posterTitle", poster.title);
      triples.add(`${talkRef} ec:hasPoster ${posterRef} .`);
      triples.add(`${posterRef} ec:isPosterForTalk ${talkRef} .`);
    });
  });

  const { VENUE_TAG_OPTIONS, TOPIC_TAG_OPTIONS, AUDIENCE_SIZE_TAG_OPTIONS, AUDIENCE_GROUP_TAG_OPTIONS } = tagsModule;
  VENUE_TAG_OPTIONS.forEach((optionLabel) => makeTagRef(tagRegistry, triples, "venue", optionLabel, true));
  TOPIC_TAG_OPTIONS.forEach((optionLabel) => makeTagRef(tagRegistry, triples, "topic", optionLabel, true));
  AUDIENCE_SIZE_TAG_OPTIONS.forEach((optionLabel) =>
    makeTagRef(tagRegistry, triples, "audience-size", optionLabel, true),
  );
  AUDIENCE_GROUP_TAG_OPTIONS.forEach((optionLabel) =>
    makeTagRef(tagRegistry, triples, "audience-group", optionLabel, true),
  );

  catalogModule.PUBLICATION_TYPE_OPTIONS.forEach((optionLabel) => {
    makeTagRef(tagRegistry, triples, "publication-type", optionLabel, true);
  });

  const publicationRefById = new Map();
  const talkRefBySlug = new Map(talkCatalog.entries.map((talk) => [talk.slug, ecRef("talk", talk.id)]));
  publicationCatalog.entries.forEach((publication) => {
    const publicationRef = ecRef("publication", publication.id);
    publicationRefById.set(publication.id, publicationRef);
    const { paper, publisher } = publication.links ?? {};
    const year = dateYear(publication.date);

    triples.add(`${publicationRef} rdf:type ec:Publication .`);
    triples.add(`${publicationRef} dcterms:isPartOf ${websiteDatasetRef} .`);
    addTextValue(triples, publicationRef, "dcterms:identifier", publication.id);
    addHighlight(triples, publicationRef, "publication", publication.id, publication.highlight);
    addTextValue(triples, publicationRef, "schema:name", publication.title);
    addTextValue(triples, publicationRef, "ec:authors", publication.authors);
    addTextValue(triples, publicationRef, "ec:venue", publication.venue);
    if (year !== undefined) {
      triples.add(`${publicationRef} ec:publicationYear ${gYearLiteral(year)} .`);
    }
    addDateValue(triples, publicationRef, "ec:sortDate", dateLabel(publication.date), "ec:sortDateText");
    addUrlValue(triples, publicationRef, publisher);
    addTextValue(triples, publicationRef, "ec:summary", publication.summary);
    addTextValue(triples, publicationRef, "ec:abstract", publication.abstract);
    addTextValue(triples, publicationRef, "ec:bibtex", publication.bibtex);
    addTextValue(triples, publicationRef, "ec:paperPdfPath", paper);
    addUrlValue(triples, publicationRef, paper);

    const typeTagRef = makeTagRef(tagRegistry, triples, "publication-type", publication.type);
    triples.add(`${publicationRef} ec:hasPublicationTypeTag ${typeTagRef} .`);
    publication.venueTags.forEach((tagLabel) => {
      const tagRef = makeTagRef(tagRegistry, triples, "venue", tagLabel);
      triples.add(`${publicationRef} ec:hasVenueTag ${tagRef} .`);
    });
    publication.topics.forEach((tagLabel) => {
      const tagRef = makeTagRef(tagRegistry, triples, "topic", tagLabel);
      triples.add(`${publicationRef} ec:hasTopicTag ${tagRef} .`);
    });

    const detailKeys = new Set();
    publicationDetailsModule.publicationDetailRows(publication).forEach((detail, detailIndex) => {
      const detailRef = ecRef("publication-detail", publication.id, stableKey(detail.label, detailKeys));
      triples.add(`${detailRef} rdf:type ec:PublicationDetail .`);
      triples.add(`${detailRef} dcterms:isPartOf ${publicationRef} .`);
      triples.add(`${detailRef} ec:order ${integerLiteral(detailIndex + 1)} .`);
      triples.add(`${publicationRef} ec:hasDetail ${detailRef} .`);
      addTextValue(triples, detailRef, "rdfs:label", detail.label);
      addTextValue(triples, detailRef, "rdf:value", detail.value);
      addUrlValue(triples, detailRef, detail.href);
    });

    // Presentation links are the paper's related talks and posters, named by their target.
    const presentations = [
      ...relatedIds(publication, "talk").map((id) => ["talk", id]),
      ...relatedIds(publication, "poster").map((id) => ["poster", id]),
    ];
    presentations.forEach(([kind, id], linkIndex) => {
      const linkRef = ecRef("publication-presentation-link", publication.id, kind, id);
      triples.add(`${linkRef} rdf:type ec:PublicationPresentationLink .`);
      triples.add(`${linkRef} ec:forPublication ${publicationRef} .`);
      triples.add(`${publicationRef} ec:hasPresentationLink ${linkRef} .`);
      triples.add(`${linkRef} ec:order ${integerLiteral(linkIndex + 1)} .`);
      addTextValue(triples, linkRef, "schema:name", kind === "talk" ? "Presentation" : "Poster");
      if (kind === "talk") {
        const talkRef = talkRefBySlug.get(id) ?? ecRef("talk", id);
        triples.add(`${linkRef} ec:linksTalk ${talkRef} .`);
        triples.add(`${publicationRef} ec:relatedTalk ${talkRef} .`);
        triples.add(`${talkRef} ec:relatedPublication ${publicationRef} .`);
      } else {
        const posterRef = ecRef("poster", id);
        const poster = posterById.get(id);
        addTextValue(triples, linkRef, "ec:filePath", poster && posterPdfPath(poster));
        addUrlValue(triples, linkRef, poster && posterPdfPath(poster));
        triples.add(`${publicationRef} ec:relatedPoster ${posterRef} .`);
        triples.add(`${posterRef} ec:relatedPublication ${publicationRef} .`);
      }
    });
  });

  const softwareRefById = new Map();
  const softwareReleasesBySoftwareId =
    softwareReleasesModule.softwareReleasesBySoftwareId ?? {};

  softwareCatalog.sections.forEach((section, sectionIndex) => {
    const sectionRef = ecRef("software-section", section.id);
    triples.add(`${sectionRef} rdf:type ec:SoftwareSection .`);
    triples.add(`${sectionRef} dcterms:isPartOf ${websiteDatasetRef} .`);
    triples.add(`${websiteDatasetRef} ec:hasSoftwareSection ${sectionRef} .`);
    triples.add(`${sectionRef} ec:order ${integerLiteral(sectionIndex + 1)} .`);
    addTextValue(triples, sectionRef, "schema:name", section.title);
    addTextValue(triples, sectionRef, "ec:description", section.description);

    softwareCatalog.entries.filter((software) => software.sectionId === section.id).forEach((software) => {
      const softwareRef = ecRef("software", software.id);
      const { repository, website } = software.links ?? {};
      softwareRefById.set(software.id, softwareRef);
      addHighlight(triples, softwareRef, "software", software.id, software.highlight);
      triples.add(`${softwareRef} rdf:type ec:Software .`);
      triples.add(`${softwareRef} dcterms:isPartOf ${sectionRef} .`);
      triples.add(`${sectionRef} ec:hasSoftware ${softwareRef} .`);
      addTextValue(triples, softwareRef, "dcterms:identifier", software.id);
      addTextValue(triples, softwareRef, "schema:name", software.title);
      addTextValue(triples, softwareRef, "ec:softwareType", software.type);
      addTextValue(triples, softwareRef, "ec:purpose", software.purpose);
      addTextValue(triples, softwareRef, "ec:year", dateLabel(software.date));
      addTextValue(triples, softwareRef, "ec:summary", software.summary);
      addTextValue(triples, softwareRef, "ec:description", software.description);
      addIriValue(triples, softwareRef, "schema:codeRepository", repository);
      addIriValue(triples, softwareRef, "ec:repositoryUrl", repository);
      addIriValue(triples, softwareRef, "ec:webUrl", website);
      addIriValue(triples, softwareRef, "schema:url", website ?? repository);

      software.topics.forEach((tagLabel) => {
        const tagRef = makeTagRef(tagRegistry, triples, "topic", tagLabel);
        triples.add(`${softwareRef} ec:hasTopicTag ${tagRef} .`);
      });

      const detailKeys = new Set();
      (software.extraDetails ?? []).forEach((detail, detailIndex) => {
        const detailRef = ecRef("software-detail", software.id, stableKey(detail.label, detailKeys));
        triples.add(`${detailRef} rdf:type ec:SoftwareDetail .`);
        triples.add(`${detailRef} dcterms:isPartOf ${softwareRef} .`);
        triples.add(`${softwareRef} ec:hasDetail ${detailRef} .`);
        triples.add(`${detailRef} ec:order ${integerLiteral(detailIndex + 1)} .`);
        addTextValue(triples, detailRef, "rdfs:label", detail.label);
        addTextValue(triples, detailRef, "rdf:value", detail.value);
        addUrlValue(triples, detailRef, detail.href);
      });

      const release = softwareReleasesBySoftwareId[software.id];
      if (release) {
        const releaseRef = ecRef("software-release", software.id);
        triples.add(`${releaseRef} rdf:type ec:SoftwareRelease .`);
        triples.add(`${releaseRef} dcterms:isPartOf ${softwareRef} .`);
        triples.add(`${softwareRef} ec:latestRelease ${releaseRef} .`);
        addTextValue(triples, releaseRef, "schema:name", release.name);
        addTextValue(triples, releaseRef, "ec:releaseTag", release.tagName);
        addDateTimeValue(
          triples,
          releaseRef,
          "ec:releasePublishedAt",
          release.publishedAt,
          "ec:releasePublishedAtText",
        );
        addIriValue(triples, releaseRef, "schema:url", release.url);
        addTextValue(
          triples,
          releaseRef,
          "ec:releaseKind",
          release.tagName ? "release" : "repository-update",
        );
      }

      relatedIds(software, "publication").forEach((publicationId) => {
        const relatedPublicationRef =
          publicationRefById.get(publicationId) ?? ecRef("publication", publicationId);
        if (!publicationRefById.has(publicationId)) {
          triples.add(`${relatedPublicationRef} rdf:type ec:PublicationReference .`);
          addTextValue(triples, relatedPublicationRef, "dcterms:identifier", publicationId);
          triples.add(`${relatedPublicationRef} ec:isResolved ${booleanLiteral(false)} .`);
        }
        triples.add(`${softwareRef} ec:relatedPublication ${relatedPublicationRef} .`);
        triples.add(`${relatedPublicationRef} ec:relatedSoftware ${softwareRef} .`);
      });

      relatedIds(software, "talk").forEach((talkSlug) => {
        const relatedTalkRef = talkRefBySlug.get(talkSlug) ?? ecRef("talk", talkSlug);
        if (!talkRefBySlug.has(talkSlug)) {
          triples.add(`${relatedTalkRef} rdf:type ec:TalkReference .`);
          addTextValue(triples, relatedTalkRef, "dcterms:identifier", talkSlug);
          triples.add(`${relatedTalkRef} ec:isResolved ${booleanLiteral(false)} .`);
        }
        triples.add(`${softwareRef} ec:relatedTalk ${relatedTalkRef} .`);
        triples.add(`${relatedTalkRef} ec:relatedSoftware ${softwareRef} .`);
      });

      relatedIds(software, "poster").forEach((posterSlug) => {
        const relatedPosterRef = ecRef("poster", posterSlug);
        triples.add(`${softwareRef} ec:relatedPoster ${relatedPosterRef} .`);
        triples.add(`${relatedPosterRef} ec:relatedSoftware ${softwareRef} .`);
      });
    });
  });

  const fellowship = fellowshipModule.fwoPhdFellowship;
  if (fellowship) {
    const fellowshipRef = ecRef("fellowship", fellowship.id);
    triples.add(`${fellowshipRef} rdf:type ec:Fellowship .`);
    triples.add(`${fellowshipRef} dcterms:isPartOf ${websiteDatasetRef} .`);
    triples.add(`${websiteDatasetRef} ec:hasFellowship ${fellowshipRef} .`);
    addTextValue(triples, fellowshipRef, "dcterms:identifier", fellowship.id);
    addTextValue(triples, fellowshipRef, "ec:slug", fellowship.slug);
    addTextValue(triples, fellowshipRef, "schema:name", fellowship.title);
    addTextValue(triples, fellowshipRef, "ec:subtitle", fellowship.subtitle);
    addTextValue(triples, fellowshipRef, "ec:summary", fellowship.summary);
    addTextValue(triples, fellowshipRef, "ec:projectDescriptionPdfPath", fellowship.projectDescriptionPdfUrl);
    addIriValue(triples, fellowshipRef, "ec:projectDescriptionPdfUrl", fellowship.projectDescriptionPdfUrl);
    addIriValue(triples, fellowshipRef, "ec:moreInfoUrl", fellowship.moreInfoUrl);
    addIriValue(triples, fellowshipRef, "ec:defenseSlidesUrl", fellowship.defenseSlidesUrl);

    const defenseTalkMatch = /^\/talks\/([^/]+)$/.exec(fellowship.defenseSlidesUrl ?? "");
    if (defenseTalkMatch) {
      const defenseTalkRef = talkRefBySlug.get(defenseTalkMatch[1]) ?? ecRef("talk", defenseTalkMatch[1]);
      triples.add(`${fellowshipRef} ec:hasDefenseTalk ${defenseTalkRef} .`);
      triples.add(`${defenseTalkRef} ec:relatedFellowship ${fellowshipRef} .`);
    }

    const detailKeys = new Set();
    (fellowship.details ?? []).forEach((detail, detailIndex) => {
      const detailRef = ecRef("fellowship-detail", fellowship.id, stableKey(detail.label, detailKeys));
      triples.add(`${detailRef} rdf:type ec:FellowshipDetail .`);
      triples.add(`${detailRef} dcterms:isPartOf ${fellowshipRef} .`);
      triples.add(`${fellowshipRef} ec:hasDetail ${detailRef} .`);
      triples.add(`${detailRef} ec:order ${integerLiteral(detailIndex + 1)} .`);
      addTextValue(triples, detailRef, "rdfs:label", detail.label);
      addTextValue(triples, detailRef, "rdf:value", detail.value);
    });
  }

  const profileLinks = profilesModule.researchProfileLinks;
  profileLinks.forEach((profile) => {
    const profileRef = ecRef("profile", profile.id);
    triples.add(`${profileRef} rdf:type ec:ExternalProfile .`);
    triples.add(`${websiteDatasetRef} ec:hasExternalProfile ${profileRef} .`);
    addTextValue(triples, profileRef, "dcterms:identifier", profile.id);
    addTextValue(triples, profileRef, "schema:name", profile.label);
    addTextValue(triples, profileRef, "ec:profileVariant", profile.variant);
    addUrlValue(triples, profileRef, profile.url);
  });

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

  return { output, count: triplesSorted.length };
}

async function main() {
  const content = await loadSiteContent();
  let count = 0;
  const render = (iso) => {
    const result = buildRdfData(content, new Date(iso));
    count = result.count;
    return result.output;
  };

  await fs.mkdir(rdfDir, { recursive: true });
  await writeGeneratedFile(rdfFilePath, render);
  await writeGeneratedFile(publicRdfFilePath, render);
  await fs.copyFile(vocabFilePath, publicVocabFilePath);
  await fs.copyFile(shapesFilePath, publicShapesFilePath);

  console.log(
    `Exported RDF data to ${path.relative(rootDir, rdfFilePath)} and ${path.relative(rootDir, publicRdfFilePath)} (${count} triples).`,
  );
}

if (isMain(import.meta.url)) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
