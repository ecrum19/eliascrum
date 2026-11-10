import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { isMain } from "./lib/cli.mjs";
import { loadSiteContent } from "./lib/load-content.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
/** Validate authored content and its cross-catalog references without writing files. */
export async function validateSiteContent() {
  const { catalogModule, validationModule, softwareReleasesModule, citationsModule, talkAssetsModule } =
    await loadSiteContent();
  const { publicationCatalog, softwareCatalog, talkCatalog, posterCatalog } = catalogModule;
  const catalogs = [softwareCatalog, publicationCatalog, talkCatalog, posterCatalog];
  const context = {
    relationKeys: new Set(
      catalogs.flatMap((catalog) => catalog.entries.map((entry) => `${entry.kind}:${entry.id}`)),
    ),
    // Published paths are URL-encoded; files on disk are not.
    localAssetExists: (asset) => existsSync(path.join(root, "public", decodeURIComponent(asset))),
  };
  const presentations = [...talkCatalog.entries, ...posterCatalog.entries];
  const errors = [
    ...validationModule.validateContent(softwareCatalog.entries, {
      ...context,
      sections: softwareCatalog.sections,
      observationIds: Object.keys(softwareReleasesModule.softwareReleasesBySoftwareId),
    }),
    ...validationModule.validateContent(publicationCatalog.entries, {
      ...context,
      sections: [],
      observationIds: [
        ...Object.keys(citationsModule.scholarCitationsByPublicationId),
        ...Object.keys(citationsModule.publicationDownloadsByPublicationId),
      ],
    }),
    ...validationModule.validateContent(presentations, { ...context, sections: [] }),
    ...validationModule.validateTalkAssets(presentations, Object.keys(talkAssetsModule.talkAssets)),
  ];
  return {
    errors,
    counts: Object.fromEntries(
      [["software", softwareCatalog], ["publications", publicationCatalog], ["talks", talkCatalog], ["posters", posterCatalog]]
        .map(([name, catalog]) => [name, catalog.entries.length]),
    ),
  };
}

if (isMain(import.meta.url)) {
  const { errors, counts } = await validateSiteContent();
  if (errors.length) {
    console.error(errors.join("\n"));
    process.exitCode = 1;
  } else {
    console.log(
      `Validated ${counts.software} software, ${counts.publications} publication, ${counts.talks} talk, and ${counts.posters} poster records, their relationships, assets, and observation IDs.`,
    );
  }
}
