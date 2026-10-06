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

## Publishing and custom domain

The site is built with Vue and Vite and hosted on GitHub Pages. Pushing to `master`
runs `.github/workflows/deploy-pages.yml`, which builds and uploads `dist/`.
The workflow reads the base path from GitHub Pages: `/eliascrum/` for the default
project address, or `/` when `eliascrum.info` is configured. Local builds default to `/`.

To activate the Porkbun domain after merging the domain changes:

1. In GitHub **account Settings → Pages → Add a domain**, verify `eliascrum.info`
   using the TXT record GitHub provides. Add that record in Porkbun and retain it.
2. In this repository's **Settings → Pages**, keep **Source: GitHub Actions**, set
   **Custom domain** to `eliascrum.info`, and save. This is a repository setting;
   GitHub Actions deployments do not use a `CNAME` file to configure the domain.
3. Run **Actions → Deploy To GitHub Pages → Run workflow** on `master` so the
   deployment rebuilds for the domain root.
4. In Porkbun's **DNS Records** for `eliascrum.info`, replace conflicting parking
   records for the root and `www` with these records. Leave the root Host field
   blank in Porkbun (`@` in generic DNS notation). Keep unrelated email and TXT records.

   | Type | Host | Answer |
   | --- | --- | --- |
   | A | blank (root) | `185.199.108.153` |
   | A | blank (root) | `185.199.109.153` |
   | A | blank (root) | `185.199.110.153` |
   | A | blank (root) | `185.199.111.153` |
   | CNAME | `www` | `ecrum19.github.io` |

5. Once GitHub's DNS check and certificate provisioning finish, enable
   **Enforce HTTPS**. Confirm that `https://eliascrum.info/about` and the CV
   downloads load, and that `https://www.eliascrum.info` redirects to the root domain.

See [GitHub's custom-domain instructions](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site).
DNS propagation and certificate provisioning can take up to 24 hours.

The CVs, RDF exports, vocabulary, shapes, and semantic search use
`https://eliascrum.info/` as the public website base. RDF resource identifiers now
use this domain too; consumers with queries against the old namespace should update them.

## Release

Current release: **v1.0.0**
