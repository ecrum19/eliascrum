import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { QueryEngine } from "@comunica/query-sparql";
import { Parser, Store } from "n3";

// Exercise the published graph and the exact copyable queries in the guide.
const guide = await readFile(
  new URL("../../SPARQL_EXAMPLES.md", import.meta.url),
  "utf8",
);
const graph = await readFile(
  new URL("../../public/site-data.ttl", import.meta.url),
  "utf8",
);
const store = new Store(new Parser().parse(graph));
const engine = new QueryEngine();
const queries = [...guide.matchAll(/```sparql\n([\s\S]*?)```/g)].map(
  (match) => match[1],
);
// Each example promises the columns in its own SELECT clause, including `(… AS ?alias)`.
const projectedVariables = (query) => {
  const clause = query.match(/SELECT\s+(?:DISTINCT\s+)?([\s\S]*?)\s*WHERE/i)[1];
  return [
    ...clause.matchAll(/\([\s\S]*?\bAS\s+\?(\w+)\s*\)|\?(\w+)/gi),
  ].map((match) => match[1] ?? match[2]);
};

test("the guide contains SPARQL examples", () =>
  assert(queries.length > 0));

for (const [index, query] of queries.entries()) {
  test(`example ${index + 1} preserves its columns and returns site records`, async () => {
    const result = await engine.query(query, { sources: [store] });
    const { data } = await engine.resultToString(
      result,
      "application/sparql-results+json",
    );
    let text = "";
    for await (const chunk of data) text += chunk;
    const json = JSON.parse(text);
    assert.deepEqual(json.head.vars, projectedVariables(query));
    assert(json.results.bindings.length > 0);
    assert(json.results.bindings.length <= 20);
  });
}
