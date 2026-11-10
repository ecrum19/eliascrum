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
  loadPublicationsForMatching,
} from "../../scripts/update-scholar-citations.mjs";
import {
  makeSnapshot,
  fetchDailyRows,
  updateExistingSnapshot,
} from "../../scripts/update-alphabet-stock.mjs";
import {
  describeAsset,
  formatInventory,
  planTalkAssets,
  watermarkPdfInPlace,
  watermarkText,
} from "../../scripts/build-slides.mjs";
import { loadSiteContent } from "../../scripts/lib/load-content.mjs";
import { minimalPoster, minimalTalk } from "../fixtures/minimalPresentations";

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
  it("matches the catalog's publications, never profile links", async () => {
    const publications = await loadPublicationsForMatching();
    const ids = publications.map((publication) => publication.id);
    expect(ids).toContain("real-world-federation-iswc-2026");
    expect(ids).not.toContain("google-scholar");
    expect(publications[0].normalizedTitle).toBe(normalizeTitle(publications[0].title));
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

const content = await loadSiteContent();

describe("slide asset helpers", () => {
  const withRecords = (talks, posters) => ({
    ...content,
    catalogModule: {
      ...content.catalogModule,
      talkCatalog: { entries: talks },
      posterCatalog: { entries: posters },
    },
  });
  const pdfTalk = { ...minimalTalk, date: 2024, slides: { format: "pdf", source: "Talk_v2.pdf" } };

  it("publishes each record's own source file and names nothing itself", () => {
    const sources = {
      slides: new Map([["Talk_v2.pdf", "/tmp/Talk_v2.pdf"]]),
      posters: new Map([["example_poster.pdf", "/tmp/example_poster.pdf"]]),
    };
    const { assets, errors } = planTalkAssets(withRecords([pdfTalk, minimalTalk], [minimalPoster]), sources);
    expect(errors).toEqual([]);
    expect(assets.map(({ path, source, year }) => ({ path, source, year }))).toEqual([
      { path: "/talks/posters/example_poster.pdf", source: "posters/example_poster.pdf", year: 2026 },
      { path: "/talks/slides/example-talk.pdf", source: "slides/Talk_v2.pdf", year: 2024 },
    ]);
  });
  it("reports records without a source and sources without a record", () => {
    const sources = { slides: new Map([["Stray.pdf", "/tmp/Stray.pdf"]]), posters: new Map() };
    expect(planTalkAssets(withRecords([pdfTalk], [minimalPoster]), sources).errors).toEqual([
      "talk:example-talk: slides/Talk_v2.pdf is in neither .talk-assets/slides.tar.gz nor ./slides",
      "poster:example-poster: posters/example_poster.pdf is in neither .talk-assets/posters.tar.gz nor ./posters",
      "slides/Stray.pdf has no record; add one to src/content/talks.ts",
    ]);
  });
  it("describes sources deterministically and stamps the presentation year", async () => {
    const directory = await mkdtemp(path.join(os.tmpdir(), "website-slides-test-"));
    try {
      const pdf = await PDFDocument.create();
      pdf.addPage([640, 480]);
      pdf.addPage([640, 480]);
      const file = path.join(directory, "Talk.pdf");
      await writeFile(file, await pdf.save());
      const asset = { path: "/talks/slides/example-talk.pdf", source: "slides/Talk.pdf", file };
      const described = { path: asset.path, ...(await describeAsset(asset)) };
      expect(described).toMatchObject({ source: "slides/Talk.pdf", pages: 2 });
      expect(described.sha256).toMatch(/^[0-9a-f]{64}$/);
      expect(formatInventory([described])).toBe(formatInventory([{ ...described }]));
      expect(formatInventory([described])).toContain('"/talks/slides/example-talk.pdf": {');
      expect(watermarkText(2024)).toBe("© Elias Crum 2024");
      expect(watermarkText(undefined)).toBe("© Elias Crum");
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
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
      await watermarkPdfInPlace(filename, 2024);
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
