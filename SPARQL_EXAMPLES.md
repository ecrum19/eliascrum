# Example questions and SPARQL queries

These queries target the website's current RDF vocabulary and can be pasted into the existing SPARQL search. Each plain-language question describes exactly what its paired query asks. The current keyword search does not interpret these sentences as structured queries; terms such as `genomics` or `Solid` are useful keyword searches but cannot express the same joins, filters, and ordering.

All examples use SELECT and cap output at 20 rows. Topic examples match the assigned topic label exactly. Dates and links are optional where appropriate so missing metadata does not discard an otherwise matching entry. Result counts will change as content is added.

Verified on 9 October 2026 using the installed Comunica engine and N3 against the checked-in `public/site-data.ttl` (3,607 quads). The six examples returned 4, 4, 1, 9, 1, and 20 rows respectively. This verifies query execution against the exported graph; it does not verify the proposed Monaco integration.

## Publications from 2026

**Plain language:** Show publications dated in 2026, newest first, with their venues.

```sparql
PREFIX ec: <https://eliascrum.info/vocab#>
PREFIX schema: <https://schema.org/>

SELECT ?publication ?title ?venue ?date
WHERE {
  ?publication a ec:Publication ;
    schema:name ?title ;
    ec:publicationYear ?year .
  FILTER(STR(?year) = "2026")
  OPTIONAL { ?publication ec:venue ?venue }
  OPTIONAL { ?publication ec:sortDate ?date }
}
ORDER BY DESC(?date) ?title
LIMIT 20
```

This includes future-dated accepted publications recorded for that year; it does not imply they have already appeared.

## Genomics talks

**Plain language:** Show talks tagged Genomics, newest first, and include their slides links when available.

```sparql
PREFIX ec: <https://eliascrum.info/vocab#>
PREFIX schema: <https://schema.org/>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>

SELECT DISTINCT ?talk ?title ?date ?slides
WHERE {
  ?talk a ec:Talk ; schema:name ?title ; ec:hasTopicTag ?topic .
  ?topic skos:prefLabel "Genomics" .
  OPTIONAL { ?talk ec:displayDate ?date }
  OPTIONAL { ?talk schema:url ?slides }
}
ORDER BY DESC(?date) ?title
LIMIT 20
```

Replace `Genomics` with another assigned label, such as `Semantic Web` or `Solid`. `Genomics` and `Clinical Genomics` are distinct tags.

## Solid software

**Plain language:** Which software projects are tagged Solid, and where are their source repositories and websites?

```sparql
PREFIX ec: <https://eliascrum.info/vocab#>
PREFIX schema: <https://schema.org/>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>

SELECT DISTINCT ?software ?title ?repository ?website
WHERE {
  ?software a ec:Software ; schema:name ?title ; ec:hasTopicTag ?topic .
  ?topic skos:prefLabel "Solid" .
  OPTIONAL { ?software schema:codeRepository ?repository }
  OPTIONAL { ?software ec:webUrl ?website }
}
ORDER BY ?title
LIMIT 20
```

An empty website binding means the current graph does not record one, even if a repository is available.

## Software linked to publications

**Plain language:** Which software projects have explicitly linked publications, and what are those publications called?

```sparql
PREFIX ec: <https://eliascrum.info/vocab#>
PREFIX schema: <https://schema.org/>

SELECT DISTINCT ?software ?softwareTitle ?publication ?publicationTitle
WHERE {
  ?software a ec:Software ;
    schema:name ?softwareTitle ;
    ec:relatedPublication ?publication .
  ?publication a ec:Publication ; schema:name ?publicationTitle .
}
ORDER BY ?softwareTitle ?publicationTitle
LIMIT 20
```

This follows recorded relationships rather than inferring connections from matching words.

## Presentation formats

**Plain language:** Which talks have HTML slides?

```sparql
PREFIX ec: <https://eliascrum.info/vocab#>
PREFIX schema: <https://schema.org/>

SELECT ?talk ?title ?slides
WHERE {
  ?talk a ec:Talk ;
    schema:name ?title ;
    schema:encodingFormat "text/html" .
  OPTIONAL { ?talk schema:url ?slides }
}
ORDER BY ?title
LIMIT 20
```

Use `application/pdf` instead of `text/html` to find PDF slide decks.

## Topic coverage across the site

**Plain language:** How many distinct publications, software projects, talks, and posters are assigned to each topic, showing the 20 most-used topics?

```sparql
PREFIX ec: <https://eliascrum.info/vocab#>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>

SELECT ?topicLabel (COUNT(DISTINCT ?entry) AS ?count)
WHERE {
  VALUES ?kind { ec:Publication ec:Software ec:Talk ec:Poster }
  ?entry a ?kind ; ec:hasTopicTag ?topic .
  ?topic skos:prefLabel ?topicLabel .
}
GROUP BY ?topicLabel
ORDER BY DESC(?count) ?topicLabel
LIMIT 20
```

An entry can have several topics, so adding the topic counts does not give the total number of entries.

## Using these examples in the future interface

Store each question and query together in a typed examples catalog. Selecting an example should populate Monaco and display its explanation; execution remains an explicit Run action. Show tabular bindings with clickable resource links. The current interface flattens bindings into cards, so examples with several columns are easier to read after the proposed results viewer is integrated.

Vocabulary reference: [site vocabulary](https://eliascrum.info/vocab.ttl). Dataset: [site RDF graph](https://eliascrum.info/site-data.ttl).
