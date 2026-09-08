# Elias Crum

Personal academic website for Elias D. Crum, Ph.D. candidate working at the intersection of
semantic web technologies, clinical genomics, bioinformatics, and privacy-aware data
infrastructure.

Visit the live website at [eliascrum.github.io/eliascrum](https://eliascrum.github.io/eliascrum/).

## Explore

- [About](https://eliascrum.github.io/eliascrum/about): background, research topics, affiliations,
  and CV.
- [Publications](https://eliascrum.github.io/eliascrum/publications): journal articles, conference
  papers, preprints, and linked paper materials.
- [Talks and Posters](https://eliascrum.github.io/eliascrum/talks): presentation slides and
  conference posters.
- [Software](https://eliascrum.github.io/eliascrum/software): research tools, applications,
  specifications, vocabularies, and utilities.

The site supports keyword and tag-based discovery across the underlying research, presentation,
publication, and software records.

## PDF CVs

The [CV page](https://eliascrum.github.io/eliascrum/about/cv) offers a complete PDF
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

- [Recent work JSON](https://eliascrum.github.io/eliascrum/recent_work.json)
- [Recent work RDF](https://eliascrum.github.io/eliascrum/recent_work.ttl)
- [Full site RDF graph](https://eliascrum.github.io/eliascrum/site-data.ttl)
- [Site vocabulary](https://eliascrum.github.io/eliascrum/vocab.ttl)
- [SHACL shapes](https://eliascrum.github.io/eliascrum/site-shapes.ttl)

These resources are intended to make the website easier to reuse, query, and connect with other
research information systems.

## Privacy

Optional Google Analytics is disabled by default and is loaded only after explicit visitor
consent. The site provides a [Privacy & Analytics](https://eliascrum.github.io/eliascrum/privacy)
page describing the information collected and allowing visitors to change their choice.

## Release

Current release: **v1.0.0**
