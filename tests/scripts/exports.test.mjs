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
import { minimalPublication } from "../fixtures/minimalPublication";
import { minimalPoster, minimalTalk } from "../fixtures/minimalPresentations";

// Committed exports are compared with fresh ones by the CI drift check (`git diff --exit-code`).
const content = await loadSiteContent();

describe("exports", () => {
  it("exports a minimal new software record without optional metadata or exporter changes", () => {
    // Validation of this record is covered in tests/unit/catalog.test.ts.
    const catalogModule = {
      ...content.catalogModule,
      softwareCatalog: {
        entries: [minimalSoftware],
        sections: [minimalSoftwareSection],
      },
    };
    const { output, count } = buildRdfData({ ...content, catalogModule });
    const store = new Store(new Parser().parse(output));
    expect(store.size).toBe(count);
    const subject = "https://eliascrum.info/id/software/example";
    const objects = (predicate) =>
      store.getObjects(subject, predicate, null).map((term) => term.value);
    expect(objects("https://schema.org/name")).toEqual([minimalSoftware.title]);
    expect(objects("https://eliascrum.info/vocab#year")).toEqual(["Undated"]);
    expect(objects("https://schema.org/dateCreated")).toEqual([]);
    expect(objects("https://schema.org/codeRepository")).toEqual([]);
    const recent = buildRecentWorkItems({ ...content, catalogModule });
    expect(
      recent.find((item) => item.title === minimalSoftware.title),
    ).toMatchObject({
      itemUrl: "https://eliascrum.info/software/example",
      sourceUrl: undefined,
    });
  });
  it("exports a minimal talk and poster, whose unknown audience and duration stay unknown", () => {
    const catalogModule = {
      ...content.catalogModule,
      talkCatalog: { ...content.catalogModule.talkCatalog, entries: [{ ...minimalTalk, related: ["poster:example-poster"] }] },
      posterCatalog: { ...content.catalogModule.posterCatalog, entries: [minimalPoster] },
    };
    const store = new Store(new Parser().parse(buildRdfData({ ...content, catalogModule }).output));
    const id = "https://eliascrum.info/id/";
    const ec = (name) => `https://eliascrum.info/vocab#${name}`;
    const objects = (subject, predicate) => store.getObjects(subject, predicate, null).map((term) => term.value);
    expect(objects(`${id}talk/example-talk`, "https://schema.org/name")).toEqual([minimalTalk.title]);
    expect(objects(`${id}talk/example-talk`, ec("displayDate"))).toEqual(["2026-01-01"]);
    expect(objects(`${id}talk/example-talk`, ec("hasPoster"))).toEqual([`${id}poster/example-poster`]);
    expect(objects(`${id}poster/example-poster`, ec("isPosterForTalk"))).toEqual([`${id}talk/example-talk`]);
    expect(objects(`${id}poster/example-poster`, ec("filePath"))).toEqual(["/talks/posters/example_poster.pdf"]);
    for (const predicate of ["durationMinutes", "durationCategory", "audienceSizeApprox", "audienceSizeCategory"])
      expect(objects(`${id}talk/example-talk`, ec(predicate))).toEqual([]);
    const recent = buildRecentWorkItems({ ...content, catalogModule });
    expect(recent.find((item) => item.id === "Talk:example-talk")).toMatchObject({
      itemUrl: "https://eliascrum.info/talks/example-talk",
      sourceUrl: "https://example.org/slides/",
      tags: ["Slides", "Conference", "RDF"],
    });
    expect(recent.find((item) => item.id === "Poster:example-poster")?.dateIso).toBe("2026-01-01");
  });
  it("names detail resources by label, so reordering rows keeps their IRIs", () => {
    const id = "example-paper-2026";
    const render = (extraDetails) => {
      const catalogModule = {
        ...content.catalogModule,
        publicationCatalog: { entries: [{ ...minimalPublication, extraDetails }] },
      };
      const store = new Store(new Parser().parse(buildRdfData({ ...content, catalogModule }).output));
      return (label) => {
        const [detail] = store
          .getSubjects("http://www.w3.org/2000/01/rdf-schema#label", null, null)
          .filter((subject) => subject.value.includes(`/publication-detail/${id}/`))
          .filter((subject) => store.getObjects(subject, "http://www.w3.org/2000/01/rdf-schema#label", null)[0].value === label);
        const order = store.getObjects(detail, "https://eliascrum.info/vocab#order", null)[0].value;
        return [detail.value, order];
      };
    };
    const doi = { label: "DOI", value: "10.1/x" };
    const status = { label: "Status", value: "Accepted" };
    const before = render([doi, status]);
    const after = render([status, doi]);
    const base = `https://eliascrum.info/id/publication-detail/${id}`;
    expect(before("DOI")).toEqual([`${base}/doi`, "3"]);
    expect(after("DOI")).toEqual([`${base}/doi`, "4"]);
    expect(before("Publication Type")).toEqual([`${base}/publication-type`, "1"]);
  });
  it("exports a highlight and the entry it features", () => {
    const store = new Store(new Parser().parse(buildRdfData(content).output));
    const highlight = "https://eliascrum.info/id/highlight/publication/real-world-federation-iswc-2026";
    const objects = (predicate) => store.getObjects(highlight, predicate, null).map((term) => term.value);
    expect(objects("https://schema.org/url")).toEqual(["https://ecrum19.github.io/fed-survey-results/"]);
    expect(objects("https://eliascrum.info/vocab#highlightsEntry")).toEqual([
      "https://eliascrum.info/id/software/fed-survey-results-explorer",
    ]);
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
