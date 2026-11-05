import { describe, expect, it } from "vitest";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Parser, Store } from "n3";
import { buildRdfData } from "../../scripts/export-rdf-data.mjs";
import {
  buildRecentWorkItems,
  buildRecentWorkJson,
  buildRecentWorkTtl,
} from "../../scripts/export-recent-work.mjs";
import { loadSiteContent } from "../../scripts/lib/load-content.mjs";
import { isMain } from "../../scripts/lib/cli.mjs";
import { writeGeneratedFile } from "../../scripts/lib/write-generated.mjs";
import {
  minimalSoftware,
  minimalSoftwareSection,
} from "../fixtures/minimalSoftware";

// Committed exports are compared with fresh ones by the CI drift check (`git diff --exit-code`).
const content = await loadSiteContent();

describe("exports", () => {
  it("exports a minimal new software record without optional metadata or exporter changes", () => {
    // Validation of this record is covered in tests/unit/catalog.test.ts.
    const softwareModule = {
      ...content.softwareModule,
      softwareCatalog: {
        entries: [minimalSoftware],
        sections: [minimalSoftwareSection],
      },
    };
    const { output, count } = buildRdfData({ ...content, softwareModule });
    const store = new Store(new Parser().parse(output));
    expect(store.size).toBe(count);
    const subject = "https://eliascrum.info/id/software/example";
    const objects = (predicate) =>
      store.getObjects(subject, predicate, null).map((term) => term.value);
    expect(objects("https://schema.org/name")).toEqual([minimalSoftware.title]);
    expect(objects("https://eliascrum.info/vocab#year")).toEqual(["Undated"]);
    expect(objects("https://schema.org/dateCreated")).toEqual([]);
    expect(objects("https://schema.org/codeRepository")).toEqual([]);
    const recent = buildRecentWorkItems({ ...content, softwareModule });
    expect(
      recent.find((item) => item.title === minimalSoftware.title),
    ).toMatchObject({
      itemUrl: "https://eliascrum.info/software/example",
      sourceUrl: undefined,
    });
  });
  it("rewrites a generated file only when more than its timestamp changes", async () => {
    const directory = await mkdtemp(path.join(os.tmpdir(), "website-export-"));
    const file = path.join(directory, "recent_work.ttl");
    try {
      const items = buildRecentWorkItems(content);
      const render = (iso) => buildRecentWorkTtl(items, iso);
      expect(await writeGeneratedFile(file, render)).toBe(true);
      const first = await readFile(file, "utf8");
      expect(await writeGeneratedFile(file, render)).toBe(false);
      expect(await readFile(file, "utf8")).toBe(first);
      const json = (iso) =>
        `${JSON.stringify(buildRecentWorkJson(items.slice(1), iso), null, 2)}\n`;
      await writeFile(file, json("2026-01-01T00:00:00.000Z"));
      expect(await writeGeneratedFile(file, json)).toBe(false);
      expect(await writeGeneratedFile(file, render)).toBe(true);
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });
  it("recognizes direct invocation without executing imported commands", () => {
    const self = fileURLToPath(import.meta.url);
    expect(isMain(import.meta.url, ["node", self])).toBe(true);
    expect(isMain(import.meta.url, ["node"])).toBe(false);
    expect(isMain(import.meta.url, ["node", "unrelated.mjs"])).toBe(false);
  });
});
