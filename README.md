# Elias Crum

Personal academic website for Elias D. Crum, Ph.D. candidate working at the intersection of
semantic web technologies, clinical genomics, bioinformatics, and privacy-aware data
infrastructure.

Visit the live website at [eliascrum.info](https://eliascrum.info/).

## Explore

- [About](https://eliascrum.info/about): background, research topics, affiliations,
  and CV.
- [Publications](https://eliascrum.info/publications): journal articles, conference
  papers, preprints, and linked paper materials.
- [Talks and Posters](https://eliascrum.info/talks): presentation slides and
  conference posters.
- [Software](https://eliascrum.info/software): research tools, applications,
  specifications, vocabularies, and utilities.

The site supports keyword and tag-based discovery across the underlying research, presentation,
publication, and software records.

## Search

Open search using the magnifying-glass button in the navigation bar or
**Ctrl+K / Cmd+K**.

**Keyword search** finds talks, posters, publications, software, CV entries,
blog posts, and recent updates. Type a term such as `genomics` or `Solid` to
search titles, descriptions, tags, and other metadata. Results update as you
type, with title matches ranked more highly. Search ignores case and accents;
click a result or press **Enter** to open the top result.

**SPARQL search** supports structured queries over the
[site's RDF graph](https://eliascrum.info/site-data.ttl). Select **SPARQL (Comunica)**,
enter a `SELECT` query, and click **Run SPARQL Query** to explore records and their
relationships. Comunica executes the query in the browser and displays the
returned variable bindings. The [site vocabulary](https://eliascrum.info/vocab.ttl)
describes the available classes and properties.

Keyword search remains available in Lite mode. To use SPARQL while Lite mode is
active, switch the navigation bar's performance setting to **Standard**.

## PDF CVs

The [CV page](https://eliascrum.info/about/cv) offers a complete PDF
CV and a focused, two-page medical semantic web CV, with separate view and download
buttons. Both are regenerated from the site's content on every build. Run
`npm run build:cv` to regenerate them locally and `npm run test:cv` to verify them.
See [CV generator maintenance](scripts/cv/README.md) for content selection and formatting.

## Performance

The navigation bar includes an `Auto / Standard / Lite` performance setting. Lite preserves the
site content and keyword search while using a static background and deferring optional PDF previews
and semantic search until requested. [Performance mode details](docs/PERFORMANCE_MODE.md) explain
the behavior and verification steps.

## Research Themes

The website brings together work involving:

- Semantic web and linked data
- Clinical genomics and bioinformatics
- RDF representation and knowledge graphs
- Federated SPARQL querying
- Solid Pods and decentralized data infrastructure
- Data privacy and patient-controlled data

## Public Data

Selected website content is available as machine-readable resources:

- [Recent work JSON](https://eliascrum.info/recent_work.json)
- [Recent work RDF](https://eliascrum.info/recent_work.ttl)
- [Full site RDF graph](https://eliascrum.info/site-data.ttl)
- [Site vocabulary](https://eliascrum.info/vocab.ttl)
- [SHACL shapes](https://eliascrum.info/site-shapes.ttl)

These resources are intended to make the website easier to reuse, query, and connect with other
research information systems.

## Privacy

Optional Google Analytics is disabled by default and is loaded only after explicit visitor
consent. The site provides a [Privacy & Analytics](https://eliascrum.info/privacy)
page describing the information collected and allowing visitors to change their choice.

## Release

Current release: **v1.0.0**
