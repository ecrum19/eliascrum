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
const publicRdfFilePath = path.join(rootDir, "public", "site-data.ttl");
const vocabFilePath = path.join(rdfDir, "vocab.ttl");
const shapesFilePath = path.join(rdfDir, "site-shapes.ttl");
const publicVocabFilePath = path.join(rootDir, "public", "vocab.ttl");
const publicShapesFilePath = path.join(rootDir, "public", "site-shapes.ttl");

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

function addRelatedResource(
  triples,
  parentRef,
  resourceKind,
  resourceKey,
  index,
  resource,
) {
  if (!resource || typeof resource.url !== "string" || resource.url.length === 0) {
    return;
  }

  const resourceRef = ecRef("related-resource", resourceKind, `${resourceKey}-${index + 1}`);
  triples.add(`${resourceRef} rdf:type ec:RelatedResource .`);
  triples.add(`${parentRef} ec:hasRelatedResource ${resourceRef} .`);
  addTextValue(triples, resourceRef, "schema:name", resource.label);
  addIriValue(triples, resourceRef, "schema:url", resource.url);
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
    posterCatalogModule,
    talkMetadataModule,
    publicationsModule,
    softwareModule,
    softwareReleasesModule,
    fellowshipModule,
    citationsModule,
    homepageUpdatesModule,
  ] = await Promise.all([
    loadTsModule("cvData.ts"),
    loadTsModule("blogPostsData.ts"),
    loadTsModule("talksData.ts"),
    loadTsModule("talkCatalog.ts"),
    loadTsModule("posterCatalog.ts"),
    loadTsModule("talkMetadata.ts"),
    loadTsModule("publicationsData.ts"),
    loadTsModule("softwareData.ts"),
    loadTsModule("softwareReleases.ts"),
    loadTsModule("fellowshipData.ts"),
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
    (cvProfile.contacts ?? []).forEach((contact, contactIndex) => {
      const contactRef = ecRef("cv-contact", `${contactIndex + 1}`);
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
  cvSections.forEach((section, sectionIndex) => {
    const sectionRef = ecRef("cv-section", String(sectionIndex + 1));
    triples.add(`${sectionRef} rdf:type ec:CvSection .`);
    triples.add(`${sectionRef} dcterms:isPartOf ${websiteDatasetRef} .`);
    triples.add(`${sectionRef} ec:order ${integerLiteral(sectionIndex + 1)} .`);
    addTextValue(triples, sectionRef, "schema:name", section.title);
    addTextValue(triples, sectionRef, "ec:layout", section.layout);

    const sectionItems = Array.isArray(section.items) ? section.items : [];
    sectionItems.forEach((item, itemIndex) => {
      const itemRef = ecRef("cv-item", `${sectionIndex + 1}-${itemIndex + 1}`);
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
      artifacts.forEach((artifact, artifactIndex) => {
        const artifactRef = ecRef("cv-artifact", `${sectionIndex + 1}-${itemIndex + 1}-${artifactIndex + 1}`);
        triples.add(`${artifactRef} rdf:type ec:CvArtifact .`);
        triples.add(`${artifactRef} dcterms:isPartOf ${itemRef} .`);
        triples.add(`${itemRef} ec:hasArtifact ${artifactRef} .`);
        triples.add(`${artifactRef} ec:order ${integerLiteral(artifactIndex + 1)} .`);
        addTextValue(triples, artifactRef, "schema:name", artifact.label);
        addTextValue(triples, artifactRef, "ec:filePath", artifact.path);
        addUrlValue(triples, artifactRef, artifact.path);
      });

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
        if (typeof detail.internal === "boolean") {
          triples.add(`${detailRef} ec:isInternal ${booleanLiteral(detail.internal)} .`);
        }
      });
    });
  });

  const talksRaw = Array.isArray(talksModule.talks) ? talksModule.talks : [];
  const postersRaw = Array.isArray(talksModule.posters) ? talksModule.posters : [];
  const talkViewEntries =
    typeof talkCatalogModule.getTalkViewEntries === "function"
      ? talkCatalogModule.getTalkViewEntries(talksRaw)
      : talksRaw;
  const posterViewEntries =
    typeof posterCatalogModule.getPosterViewEntries === "function"
      ? posterCatalogModule.getPosterViewEntries(postersRaw)
      : postersRaw;
  const posterRefByPath = new Map();

  posterViewEntries.forEach((poster) => {
    const posterRef = ecRef("poster", poster.slug);
    posterRefByPath.set(poster.path, posterRef);

    triples.add(`${posterRef} rdf:type ec:Poster .`);
    triples.add(`${posterRef} dcterms:isPartOf ${websiteDatasetRef} .`);
    addTextValue(triples, posterRef, "dcterms:identifier", poster.slug);
    addTextValue(triples, posterRef, "schema:name", poster.displayTitle ?? poster.title);
    addTextValue(triples, posterRef, "ec:filePath", poster.path);
    addUrlValue(triples, posterRef, poster.path);
    addDateValue(triples, posterRef, "ec:displayDate", poster.displayDateIso, "ec:displayDateText");
    addTextValue(triples, posterRef, "ec:displayDateLabel", poster.displayDateLabel);
    addTextValue(triples, posterRef, "ec:displayDateDetailedLabel", poster.displayDateDetailedLabel);
    addTextValue(triples, posterRef, "ec:summary", poster.summary);
    addTextValue(triples, posterRef, "ec:abstract", poster.abstract);
    addTextValue(triples, posterRef, "ec:goal", poster.goal);
    addTextValue(triples, posterRef, "ec:audienceExpertise", poster.audienceExpertise);

    (poster.venueTags ?? []).forEach((tagLabel) => {
      const tagRef = makeTagRef(tagRegistry, triples, "venue", tagLabel);
      triples.add(`${posterRef} ec:hasVenueTag ${tagRef} .`);
    });
    (poster.topicTags ?? []).forEach((tagLabel) => {
      const tagRef = makeTagRef(tagRegistry, triples, "topic", tagLabel);
      triples.add(`${posterRef} ec:hasTopicTag ${tagRef} .`);
    });
    (poster.audienceGroups ?? []).forEach((tagLabel) => {
      const tagRef = makeTagRef(tagRegistry, triples, "audience-group", tagLabel);
      triples.add(`${posterRef} ec:hasAudienceGroupTag ${tagRef} .`);
    });
    (poster.relatedResources ?? []).forEach((resource, resourceIndex) => {
      addRelatedResource(triples, posterRef, "poster", poster.slug, resourceIndex, resource);
    });

    if (poster.linkedTalkSlug) {
      const linkedTalkRef = ecRef("talk", poster.linkedTalkSlug);
      triples.add(`${posterRef} ec:isPosterForTalk ${linkedTalkRef} .`);
      triples.add(`${linkedTalkRef} ec:hasPoster ${posterRef} .`);
    }
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
    addTextValue(triples, talkRef, "ec:goal", talk.goal);
    addTextValue(triples, talkRef, "ec:audienceExpertise", talk.audienceExpertise);
    addTextValue(triples, talkRef, "ec:sourceFile", talk.sourceFile);
    addIntegerValue(triples, talkRef, "ec:durationMinutes", talk.durationMinutes);
    addTextValue(triples, talkRef, "ec:durationCategory", talk.durationCategory);
    addIntegerValue(triples, talkRef, "ec:audienceSizeApprox", talk.audienceSizeApprox);
    addTextValue(triples, talkRef, "ec:audienceSizeCategory", talk.audienceSizeCategory);
    addTextValue(triples, talkRef, "ec:audienceSizeEstimate", talk.audienceSizeEstimate);

    addDateValue(triples, talkRef, "ec:displayDate", talk.displayDateIso, "ec:displayDateText");
    addTextValue(triples, talkRef, "ec:displayDateLabel", talk.displayDateLabel);
    addDateValue(triples, talkRef, "ec:sourceDate", talk.dateIso, "ec:sourceDateText");
    addTextValue(triples, talkRef, "ec:sourceDateLabel", talk.dateLabel);

    addTextValue(triples, talkRef, "ec:slidePath", talk.slidePath);
    addUrlValue(triples, talkRef, talk.slidePath);
    addIriValue(triples, talkRef, "schema:embedUrl", talk.slideEmbedUrl);

    (talk.relatedResources ?? []).forEach((resource, resourceIndex) => {
      addRelatedResource(triples, talkRef, "talk", talk.slug, resourceIndex, resource);
    });

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
      addTextValue(triples, talkMetadataRef, "ec:abstract", rawMetadata.abstract);
      addIriValue(triples, talkMetadataRef, "schema:embedUrl", rawMetadata.slideEmbedUrl);
      (rawMetadata.venueTags ?? []).forEach((tagLabel) => {
        const tagRef = makeTagRef(tagRegistry, triples, "venue", tagLabel);
        triples.add(`${talkMetadataRef} ec:hasVenueTag ${tagRef} .`);
      });
      (rawMetadata.topicTags ?? []).forEach((tagLabel) => {
        const tagRef = makeTagRef(tagRegistry, triples, "topic", tagLabel);
        triples.add(`${talkMetadataRef} ec:hasTopicTag ${tagRef} .`);
      });
      addTextValue(triples, talkMetadataRef, "ec:goal", rawMetadata.goal);
      addTextValue(triples, talkMetadataRef, "ec:audienceExpertise", rawMetadata.audienceExpertise);
      addIntegerValue(triples, talkMetadataRef, "ec:durationMinutes", rawMetadata.durationMinutes);
      addIntegerValue(triples, talkMetadataRef, "ec:audienceSizeApprox", rawMetadata.audienceSizeApprox);
      (rawMetadata.audienceGroups ?? []).forEach((tagLabel) => {
        const tagRef = makeTagRef(tagRegistry, triples, "audience-group", tagLabel);
        triples.add(`${talkMetadataRef} ec:hasAudienceGroupTag ${tagRef} .`);
      });
      (rawMetadata.relatedResources ?? []).forEach((resource, resourceIndex) => {
        addRelatedResource(triples, talkMetadataRef, "talk-metadata", talk.slug, resourceIndex, resource);
      });
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
    addTextValue(triples, publicationRef, "ec:paperPdfPath", publication.paperPdfPath);
    addUrlValue(triples, publicationRef, publication.paperPdfPath);

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

  const softwareRefById = new Map();
  const softwareSections = Array.isArray(softwareModule.softwareSections)
    ? softwareModule.softwareSections
    : [];
  const softwareReleasesBySoftwareId =
    softwareReleasesModule.softwareReleasesBySoftwareId ?? {};

  softwareSections.forEach((section, sectionIndex) => {
    const sectionRef = ecRef("software-section", section.id);
    triples.add(`${sectionRef} rdf:type ec:SoftwareSection .`);
    triples.add(`${sectionRef} dcterms:isPartOf ${websiteDatasetRef} .`);
    triples.add(`${websiteDatasetRef} ec:hasSoftwareSection ${sectionRef} .`);
    triples.add(`${sectionRef} ec:order ${integerLiteral(sectionIndex + 1)} .`);
    addTextValue(triples, sectionRef, "schema:name", section.title);
    addTextValue(triples, sectionRef, "ec:description", section.description);

    (section.entries ?? []).forEach((software) => {
      const softwareRef = ecRef("software", software.id);
      softwareRefById.set(software.id, softwareRef);
      triples.add(`${softwareRef} rdf:type ec:Software .`);
      triples.add(`${softwareRef} dcterms:isPartOf ${sectionRef} .`);
      triples.add(`${sectionRef} ec:hasSoftware ${softwareRef} .`);
      addTextValue(triples, softwareRef, "dcterms:identifier", software.id);
      addTextValue(triples, softwareRef, "schema:name", software.title);
      addTextValue(triples, softwareRef, "ec:softwareType", software.type);
      addTextValue(triples, softwareRef, "ec:purpose", software.purpose);
      addTextValue(triples, softwareRef, "ec:year", software.year);
      addTextValue(triples, softwareRef, "ec:summary", software.summary);
      addTextValue(triples, softwareRef, "ec:description", software.description);
      addIriValue(triples, softwareRef, "schema:codeRepository", software.repositoryUrl);
      addIriValue(triples, softwareRef, "ec:repositoryUrl", software.repositoryUrl);
      addIriValue(triples, softwareRef, "ec:webUrl", software.webUrl);
      addIriValue(triples, softwareRef, "schema:url", software.webUrl ?? software.repositoryUrl);

      (software.mainTopics ?? []).forEach((tagLabel) => {
        const tagRef = makeTagRef(tagRegistry, triples, "topic", tagLabel);
        triples.add(`${softwareRef} ec:hasTopicTag ${tagRef} .`);
      });

      (software.details ?? []).forEach((detail, detailIndex) => {
        const detailRef = ecRef("software-detail", `${software.id}-${detailIndex + 1}`);
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

      (software.relatedPublicationIds ?? []).forEach((publicationId) => {
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

      (software.relatedTalkSlugs ?? []).forEach((talkSlug) => {
        const relatedTalkRef = talkRefBySlug.get(talkSlug) ?? ecRef("talk", talkSlug);
        if (!talkRefBySlug.has(talkSlug)) {
          triples.add(`${relatedTalkRef} rdf:type ec:TalkReference .`);
          addTextValue(triples, relatedTalkRef, "dcterms:identifier", talkSlug);
          triples.add(`${relatedTalkRef} ec:isResolved ${booleanLiteral(false)} .`);
        }
        triples.add(`${softwareRef} ec:relatedTalk ${relatedTalkRef} .`);
        triples.add(`${relatedTalkRef} ec:relatedSoftware ${softwareRef} .`);
      });

      (software.relatedPosterSlugs ?? []).forEach((posterSlug) => {
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

    (fellowship.details ?? []).forEach((detail, detailIndex) => {
      const detailRef = ecRef("fellowship-detail", `${fellowship.id}-${detailIndex + 1}`);
      triples.add(`${detailRef} rdf:type ec:FellowshipDetail .`);
      triples.add(`${detailRef} dcterms:isPartOf ${fellowshipRef} .`);
      triples.add(`${fellowshipRef} ec:hasDetail ${detailRef} .`);
      triples.add(`${detailRef} ec:order ${integerLiteral(detailIndex + 1)} .`);
      addTextValue(triples, detailRef, "rdfs:label", detail.label);
      addTextValue(triples, detailRef, "rdf:value", detail.value);
    });
  }

  const profileLinks = Array.isArray(publicationsModule.publicationProfileLinks)
    ? [
        ...publicationsModule.publicationProfileLinks,
        {
          id: "research-portal",
          label: "Research Portal",
          url: publicationsModule.researchPortalProfileUrl,
          variant: "research-portal",
        },
      ]
    : [
        { id: "google-scholar", label: "Google Scholar", url: publicationsModule.scholarProfileUrl },
        { id: "semantic-scholar", label: "Semantic Scholar", url: publicationsModule.semanticScholarUrl },
      ];
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

  await fs.mkdir(rdfDir, { recursive: true });
  await fs.writeFile(rdfFilePath, output, "utf8");
  await fs.writeFile(publicRdfFilePath, output, "utf8");
  await fs.copyFile(vocabFilePath, publicVocabFilePath);
  await fs.copyFile(shapesFilePath, publicShapesFilePath);

  console.log(
    `Wrote RDF data to ${path.relative(rootDir, rdfFilePath)} and ${path.relative(rootDir, publicRdfFilePath)} (${triplesSorted.length} triples).`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
