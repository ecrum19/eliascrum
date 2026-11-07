import { beforeEach, expect, it, vi } from "vitest";
const queryBindings = vi.hoisted(() => vi.fn());
vi.mock("@comunica/query-sparql", () => ({
  QueryEngine: class {
    queryBindings = queryBindings;
  },
}));

beforeEach(() => {
  vi.resetModules();
  queryBindings.mockReset();
});

it("loads the local graph once and maps RDF terms and known routes", async () => {
  vi.mocked(fetch).mockResolvedValue(
    new Response('<https://example.test/s> <https://example.test/p> "value" .'),
  );
  const values = [
    "talk/example",
    "publication/example",
    "blog-post/example",
    "cv-item/example",
  ];
  const rows = values.map(
    (value) =>
      new Map([
        [{ value: "s" }, { value: `https://eliascrum.info/id/${value}` }],
        [{ value: "?label" }, { value: "Readable label" }],
      ]),
  );
  rows.push(new Map());
  queryBindings.mockResolvedValue({ toArray: async () => rows });
  const { runSparqlSearch } = await import("../../src/utils/siteSearch");
  const result = await runSparqlSearch("SELECT * WHERE { ?s ?p ?o }", 5);
  expect(result.results.map((row) => row.route)).toEqual([
    "/talks/example",
    "/publications",
    "/blogs",
    "/about/cv",
    undefined,
  ]);
  expect(result.results[0].snippet).toBe("label: Readable label");
  expect(result.results[4].title).toBe("SPARQL Result 5");
  expect(queryBindings).toHaveBeenCalledWith(expect.any(String), {
    sources: [expect.any(Object)],
  });
  expect(
    (await runSparqlSearch("SELECT * WHERE { ?s ?p ?o }", 1)).results,
  ).toHaveLength(1);
  expect(fetch).toHaveBeenCalledTimes(1);
});

it("explains an RDF fetch failure and permits retry", async () => {
  vi.mocked(fetch)
    .mockResolvedValueOnce(new Response("", { status: 503 }))
    .mockResolvedValueOnce(new Response(""));
  queryBindings.mockResolvedValue({ toArray: async () => [] });
  const { runSparqlSearch } = await import("../../src/utils/siteSearch");
  const failed = await runSparqlSearch("SELECT * WHERE { ?s ?p ?o }");
  expect(failed.error).toContain("503");
  expect(
    (await runSparqlSearch("SELECT * WHERE { ?s ?p ?o }")).error,
  ).toBeUndefined();
});

it("reports execution failure and preserves the keyword fallback", async () => {
  vi.mocked(fetch).mockResolvedValue(new Response(""));
  queryBindings.mockRejectedValue(new Error("Malformed query"));
  const { runSparqlSearch } = await import("../../src/utils/siteSearch");
  const result = await runSparqlSearch("Solid Cockpit");
  expect(result.error).toBe("Malformed query");
  expect(result.results.length).toBeGreaterThan(0);
});
