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

## Adding talks

PDF talks are generated with `npm run build:slides` from the sources in
`.talk-assets/` (or temporary `slides/` and `posters/` directories). Add HTML-only
decks to `src/data/htmlTalks.ts` with `slideFormat: "html"` and the hosted deck URL
as `slidePath`. The PDF generator preserves these entries on every rebuild.

For either format, add the title, date, summary, abstract, and audience details to
`src/data/talkMetadata.ts` using the same slug. Set `slideEmbedUrl` when the deck
needs a specific presentation URL, such as Shower's `?full#title`. HTML slides
use an iframe preview and an HTML link without requiring a PDF.

Run `npm run lint`, `npm run build`, and `npm run test:cv` before opening a pull
request. The build refreshes recent work, RDF, and both CVs; merging into `master`
deploys the website through the existing GitHub Pages workflow.

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
