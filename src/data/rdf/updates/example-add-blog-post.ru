PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX dcterms: <http://purl.org/dc/terms/>
PREFIX schema: <https://schema.org/>
PREFIX ec: <https://eliascrum.github.io/eliascrum/vocab#>

INSERT DATA {
  <https://eliascrum.github.io/eliascrum/id/blog-post/example-2026-03-06> rdf:type ec:BlogPost .
  <https://eliascrum.github.io/eliascrum/id/blog-post/example-2026-03-06> rdf:type schema:BlogPosting .
  <https://eliascrum.github.io/eliascrum/id/blog-post/example-2026-03-06> dcterms:identifier "example-2026-03-06" .
  <https://eliascrum.github.io/eliascrum/id/blog-post/example-2026-03-06> schema:name "Example RDF update entry" .
  <https://eliascrum.github.io/eliascrum/id/blog-post/example-2026-03-06> dcterms:date "2026-03-06"^^<http://www.w3.org/2001/XMLSchema#date> .
  <https://eliascrum.github.io/eliascrum/id/blog-post/example-2026-03-06> ec:summary "Example entry inserted via SPARQL UPDATE." .
  <https://eliascrum.github.io/eliascrum/id/blog-post/example-2026-03-06> ec:linkLabel "Read blog post" .
  <https://eliascrum.github.io/eliascrum/id/blog-post/example-2026-03-06> schema:url <https://example.org/blog/example-2026-03-06> .
}
