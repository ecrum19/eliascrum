import { describe, expect, it } from "vitest";
import {
  getDefaultSearchResults,
  searchByKeyword,
  runSparqlSearch,
} from "../../src/utils/siteSearch";

describe("site discovery", () => {
  it("searches case/accent-insensitively and respects result limits", () => {
    const plain = searchByKeyword("genomics", 5);
    expect(plain.length).toBeGreaterThan(0);
    expect(plain.length).toBeLessThanOrEqual(5);
    expect(searchByKeyword("GÉNOMICS", 5)).toEqual(plain);
    expect(searchByKeyword("zzzzunmatchedzzzz")).toEqual([]);
    expect(searchByKeyword("")).toEqual([]);
  });
  it("indexes publications, software, talks, posters, CVs, and updates", () => {
    const found = getDefaultSearchResults(1000);
    for (const type of [
      "Publication",
      "Software",
      "Talk",
      "Poster",
      "CV",
      "Update",
    ]) {
      expect(found.some((entry) => entry.type === type)).toBe(true);
    }
    expect(getDefaultSearchResults(4)).toHaveLength(4);
    expect(getDefaultSearchResults().length).toBeGreaterThan(0);
  });
  it("requests a query before loading RDF or Comunica", async () => {
    expect(await runSparqlSearch("   ")).toMatchObject({
      results: [],
      notice: expect.stringContaining("SELECT"),
    });
  });
});
