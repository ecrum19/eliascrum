import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { isMain } from "./lib/cli.mjs";
import { loadSiteContent } from "./lib/load-content.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
/** Validate authored content and its cross-catalog references without writing files. */
export async function validateSiteContent() {
  const {
    softwareModule,
    validationModule,
    publicationsModule,
    talksModule,
    talkMetadataModule,
    softwareReleasesModule,
  } = await loadSiteContent();
  const { entries, sections } = softwareModule.softwareCatalog;
  const { publications, publicationPresentationLinksById } = publicationsModule;
  const context = {
    relationKeys: new Set([
      ...entries.map((entry) => `software:${entry.id}`),
      ...publications.map((entry) => `publication:${entry.id}`),
      ...talksModule.talks.map((entry) => `talk:${entry.slug}`),
      ...talksModule.posters.map((entry) => `poster:${entry.slug}`),
    ]),
    localAssetExists: (asset) => existsSync(path.join(root, "public", asset)),
  };
  const errors = [
    ...validationModule.validateContent(entries, {
      ...context,
      sections,
      observationIds: Object.keys(softwareReleasesModule.softwareReleasesBySoftwareId),
    }),
    ...validationModule.validateHighlights(
      [
        ...publications.map((entry) => [`publication:${entry.id}`, entry.highlight]),
        ...Object.entries(talkMetadataModule.talkMetadataBySlug).map(([slug, meta]) => [
          `talk-metadata:${slug}`,
          meta.highlight,
        ]),
      ],
      context,
    ),
  ];
  // Presentation links are keyed by publication ID and must reach a real talk or poster.
  const posterPaths = new Set(talksModule.posters.map((poster) => poster.path));
  for (const [publicationId, links] of Object.entries(publicationPresentationLinksById)) {
    if (!context.relationKeys.has(`publication:${publicationId}`))
      errors.push(`presentation links: unknown publication ${publicationId}`);
    for (const link of links) {
      if (link.kind === "talk" && !context.relationKeys.has(`talk:${link.talkSlug}`))
        errors.push(`presentation links: ${publicationId} references unknown talk ${link.talkSlug}`);
      if (link.kind === "file" && !posterPaths.has(link.filePath))
        errors.push(`presentation links: ${publicationId} references unknown poster ${link.filePath}`);
    }
  }
  return { errors, count: entries.length };
}

if (isMain(import.meta.url)) {
  const { errors, count } = await validateSiteContent();
  if (errors.length) {
    console.error(errors.join("\n"));
    process.exitCode = 1;
  } else {
    console.log(
      `Validated ${count} software records, highlights, presentation links, relationships, and release IDs.`,
    );
  }
}
