# Elias Crum Personal Website

Personal academic website built with Vue 3, Vite, Vuetify, and TypeScript.

## Release

Current release: **v0.1.0**


## Tech Stack

- Vue 3
- TypeScript
- Vue Router 4
- Vuetify 3
- Vite 6
- ESLint

## Local Development

### Prerequisites

- Node.js 20+
- npm 10+
- Optional: Ghostscript (`gs`) for PDF compression in `build:slides`


## Project Scripts

- `npm run dev`: start Vite dev server
- `npm run preview`: preview production build
- `npm run build`: production build (`dist/`)
- `npm run lint`: lint Vue/TypeScript source
- `npm run build:slides`: rebuild generated talks/posters data and PDF outputs
- `npm run update:scholar`: refresh Google Scholar citation counts
- `npm run rdf:export`: export all `src/data/*.ts` content to `src/data/rdf/site-data.ttl`
- `npm run rdf:update -- --update <file.ru>`: apply SPARQL `INSERT DATA`/`DELETE DATA` updates to RDF data


## RDF Data Layer

### Files

- Data graph: `src/data/rdf/site-data.ttl` (generated mirror of `src/data` modules)
- SHACL constraints: `src/data/rdf/site-shapes.ttl`
- Vocabulary: `src/data/rdf/vocab.ttl` (published as `public/vocab.ttl`)
- Transition plan: `src/data/rdf/TRANSITION_PLAN.md`
- SPARQL update example: `src/data/rdf/updates/example-add-blog-post.ru`

### Generate RDF Mirror

```bash
npm run rdf:export
```

### Apply SPARQL Updates

```bash
# Dry-run
npm run rdf:update -- --update src/data/rdf/updates/example-add-blog-post.ru --dry-run

# Apply
npm run rdf:update -- --update src/data/rdf/updates/example-add-blog-post.ru
```

### Supported SPARQL Update Subset

- `PREFIX ...`
- `INSERT DATA { ... }`
- `DELETE DATA { ... }`

Constraints for the current updater:
- one triple per line inside each DATA block
- no blank nodes
- no `WHERE` updates yet


## Automation and CI

### Build Validation

- Workflow: `.github/workflows/build-on-push.yml`
- Runs install, optional `build:slides`, lint, and build on each push.

### Scholar Citation Refresh

- Workflow: `.github/workflows/update-scholar-citations.yml`
- Scheduled weekly and available via manual dispatch.
- Updates `src/data/scholarCitations.ts` and auto-commits changes.
