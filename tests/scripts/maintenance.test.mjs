import { beforeEach, describe, expect, it, vi } from "vitest";
import { mkdtemp, readFile, writeFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { PDFDocument } from "pdf-lib";
import {
  parseGitHubRepo,
  normalizeIsoDate,
  fetchLatestRelease,
} from "../../scripts/update-software-releases.mjs";
import {
  normalizeTitle,
  extractScholarEntries,
  findBestScholarMatch,
  parseDownloadCountFromHtml,
  parseDownloadCountFromApiValue,
} from "../../scripts/update-scholar-citations.mjs";
import {
  makeSnapshot,
  fetchDailyRows,
  updateExistingSnapshot,
} from "../../scripts/update-alphabet-stock.mjs";
import {
  parseArgs,
  parsePrefixesFromText,
  parseTriplesFromBlock,
  extractDataBlocks,
  compactCanonicalTriple,
  serializePrefixMap,
} from "../../scripts/apply-rdf-update.mjs";
import {
  toSlug,
  toTitleFromStem,
  parseDateInfo,
  jaccardScore,
  watermarkPdfInPlace,
} from "../../scripts/build-slides.mjs";

beforeEach(() =>
  vi.stubGlobal(
    "fetch",
    vi.fn(() => Promise.reject(new Error("Unexpected network request"))),
  ),
);

describe("release snapshots", () => {
  it("identifies GitHub repositories and rejects unrelated or malformed URLs", () => {
    expect(parseGitHubRepo("https://github.com/owner/repo.git")).toEqual({
      owner: "owner",
      repo: "repo",
      key: "owner/repo",
    });
    for (const value of [
      "",
      null,
      "not a url",
      "https://example.org/a/b",
      "https://github.com/owner",
    ])
      expect(parseGitHubRepo(value)).toBeNull();
    expect(normalizeIsoDate("2026-10-09")).toBe("2026-10-09T00:00:00.000Z");
    expect(normalizeIsoDate("invalid")).toBeNull();
  });
  it("preserves cache semantics and distinguishes missing releases from failed requests", async () => {
    for (const [status, result] of [
      [304, { status: "not-modified" }],
      [404, { status: "missing" }],
      [403, { status: "error", code: 403 }],
    ]) {
      fetch.mockResolvedValueOnce(new Response(null, { status }));
      expect(await fetchLatestRelease("owner", "repo", "cached-etag")).toEqual(
        result,
      );
    }
    fetch.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          tag_name: "v1",
          name: "Version One",
          html_url: "https://github.com/owner/repo/releases/tag/v1",
          published_at: "2026-10-09",
        }),
        { headers: { etag: "new-etag" } },
      ),
    );
    expect(await fetchLatestRelease("owner", "repo")).toMatchObject({
      status: "ok",
      etag: "new-etag",
      release: { tagName: "v1", publishedAt: "2026-10-09T00:00:00.000Z" },
    });
    expect(fetch.mock.calls[0][1].headers["If-None-Match"]).toBe("cached-etag");
  });
});

describe("citation and download observations", () => {
  it("parses HTML entities and citation counts and selects the closest title", () => {
    const entries = extractScholarEntries(
      '<tr class="gsc_a_tr"><a class="gsc_a_at">Data &amp; Queries</a><a class="gsc_a_ac">1,234</a></tr><tr class="gsc_a_tr">Missing title</tr>',
    );
    expect(entries).toEqual([
      {
        title: "Data & Queries",
        normalizedTitle: "data queries",
        citationCount: 1234,
      },
    ]);
    expect(normalizeTitle("<b>Data</b> &amp; Queries!")).toBe("data queries");
    expect(
      findBestScholarMatch({ normalizedTitle: "data queries" }, entries),
    ).toBe(entries[0]);
    expect(findBestScholarMatch({ normalizedTitle: "data" }, entries)).toBe(
      entries[0],
    );
    expect(
      findBestScholarMatch({ normalizedTitle: "missing" }, entries),
    ).toBeNull();
    expect(extractScholarEntries("")).toEqual([]);
  });
  it("treats missing download observations as unknown", () => {
    expect(
      parseDownloadCountFromHtml('<span id="article-downloads">1,234</span>'),
    ).toBe(1234);
    expect(parseDownloadCountFromHtml("<div>No statistics</div>")).toBeNull();
    expect(parseDownloadCountFromApiValue("2,456")).toBe(2456);
    expect(parseDownloadCountFromApiValue(null)).toBeNull();
  });
});

describe("stock observation math and API failures", () => {
  const payload = {
    chart: {
      result: [
        {
          meta: { currency: "USD" },
          timestamp: [100, 200, 300],
          indicators: { quote: [{ close: [100, null, 125] }] },
        },
      ],
    },
  };
  it("filters missing market closes and keeps the original baseline on updates", async () => {
    fetch.mockResolvedValue(new Response(JSON.stringify(payload)));
    expect((await fetchDailyRows(0)).rows).toEqual([
      { timestamp: 100, close: 100 },
      { timestamp: 300, close: 125 },
    ]);
    fetch.mockResolvedValue(new Response(JSON.stringify(payload)));
    const snapshot = await updateExistingSnapshot(
      {
        initialPrice: 100,
        initialPriceDate: "2025-01-01",
        firstCommitDate: "2025-01-01",
      },
      "2025-01-01T00:00:00Z",
    );
    expect(snapshot).toMatchObject({
      initialPrice: 100,
      currentClose: 125,
      changeAmount: 25,
      changePercent: 25,
    });
    expect(
      makeSnapshot({ initialPrice: 100, currentClose: 75, currency: "USD" }),
    ).toMatchObject({ changeAmount: -25, changePercent: -25 });
  });
  it("rejects unavailable and malformed responses", async () => {
    fetch.mockResolvedValueOnce(new Response("", { status: 503 }));
    await expect(fetchDailyRows(0)).rejects.toThrow("503");
    fetch.mockResolvedValueOnce(new Response("{}"));
    await expect(fetchDailyRows(0)).rejects.toThrow("daily closing prices");
    fetch.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          chart: {
            result: [{ timestamp: [], indicators: { quote: [{ close: [] }] } }],
          },
        }),
      ),
    );
    await expect(fetchDailyRows(0)).rejects.toThrow("usable daily");
  });
});

describe("RDF update parsing", () => {
  it("parses DATA blocks and round-trips IRIs and typed/language literals", () => {
    const prefixes = parsePrefixesFromText(
      "PREFIX ex: <https://example.test/>\nPREFIX xsd: <http://www.w3.org/2001/XMLSchema#>",
    );
    const blocks = extractDataBlocks(
      "INSERT",
      'INSERT DATA {\nex:s ex:p "Text"@en .\nex:s ex:count "2"^^xsd:integer .\n}',
    );
    expect(blocks).toHaveLength(1);
    const triples = parseTriplesFromBlock(blocks[0], prefixes);
    expect(triples).toContain(
      '<https://example.test/s> <https://example.test/p> "Text"@en .',
    );
    expect(compactCanonicalTriple(triples[0], prefixes)).toContain("ex:s");
    expect(serializePrefixMap(prefixes)).toContain("@prefix ex:");
    expect(() => parseTriplesFromBlock("bad data", prefixes)).toThrow();
    expect(
      parseArgs([
        "node",
        "update",
        "--update",
        "input.ru",
        "--data",
        "data.ttl",
        "--dry-run",
      ]),
    ).toMatchObject({
      updateFile: "input.ru",
      dataFile: "data.ttl",
      dryRun: true,
    });
    expect(() => parseArgs(["node", "update", "--invalid"])).toThrow(
      "Unknown argument",
    );
  });
});

describe("slide asset helpers", () => {
  it("preserves existing filename/slug and fallback matching conventions", () => {
    expect(toSlug("Example Talk_2026")).toBe("example-talk-2026");
    expect(toTitleFromStem("Example_Talk")).toContain("Example");
    expect(parseDateInfo("Talk_091026.pdf")).toEqual({
      iso: "2026-10-09",
      label: "09/10/2026",
    });
    expect(parseDateInfo("Talk_2026.pdf").label).toBe("2026");
    expect(parseDateInfo("Talk_25.pdf").label).toBe("2025");
    expect(parseDateInfo("Undated.pdf").label).toBe("Undated");
    expect(jaccardScore(["a", "b"], ["b", "c"])).toBeCloseTo(1 / 3);
    expect(jaccardScore([], [])).toBe(0);
  });
  it("watermarks a real PDF without dropping or resizing pages", async () => {
    const directory = await mkdtemp(
      path.join(os.tmpdir(), "website-slides-test-"),
    );
    try {
      const pdf = await PDFDocument.create();
      pdf.addPage([640, 480]);
      const filename = path.join(directory, "slides.pdf");
      await writeFile(filename, await pdf.save());
      await watermarkPdfInPlace(filename);
      const rendered = await PDFDocument.load(await readFile(filename));
      expect(rendered.getPageCount()).toBe(1);
      expect(rendered.getPage(0).getSize()).toEqual({
        width: 640,
        height: 480,
      });
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });
});
